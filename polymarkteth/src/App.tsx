import { Polymarkteth, Polymarkteth__factory } from "./typechain-types";

import BigNumber from "bignumber.js";
import { useEffect, useState } from "react";
import "./App.css";

import {
  defineChain,
  getContract,
  prepareContractCall,
  readContract,
  resolveMethod,
  sendAndConfirmTransaction,
  sendTransaction,
  simulateTransaction,
  ThirdwebClient,
  waitForReceipt,
} from "thirdweb";
import {
  ConnectButton,
  useActiveAccount,
  useActiveWallet,
  useDisconnect,
} from "thirdweb/react";
import { createWallet, inAppWallet } from "thirdweb/wallets";
import { etherlinkTestnet } from "viem/chains";
import { BaseError, parseEther } from "viem";
import { extractErrorDetails } from "./DecodeEvmTransactionLogsArgs";

const CONTRACT_ADDRESS = "0xe2F903f3eBd77b7EC347932Ce5E53AD1961Eb002" as const;

const wallets = [
  inAppWallet({
    auth: {
      options: ["google", "email", "passkey", "phone"],
    },
  }),
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
  createWallet("io.rabby"),
  createWallet("io.zerion.wallet"),
  createWallet("com.trustwallet.app"),
];

//crap copy pasta from Solidity code
enum BET_RESULT {
  WIN = 0,
  DRAW = 1,
  PENDING = 2,
}

interface AppProps {
  thirdwebClient: ThirdwebClient;
}

export default function App({ thirdwebClient }: AppProps) {
  console.log("*************App");

  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const { disconnect } = useDisconnect();

  const [options, setOptions] = useState<Map<string, bigint>>(new Map());

  const [error, setError] = useState<string>("");

  const [status, setStatus] = useState<BET_RESULT>(BET_RESULT.PENDING);
  const [winner, setWinner] = useState<string | undefined>(undefined);
  const [fees, setFees] = useState<number>(0);
  const [betKeys, setBetKeys] = useState<bigint[]>([]);
  const [bets, setBets] = useState<Polymarkteth.BetStruct[]>([]);

  const reload = async () => {
    if (!account?.address) {
      console.log("No address...");
    } else {
      const dataStatus = await readContract({
        contract: getContract({
          abi: Polymarkteth__factory.abi,
          client: thirdwebClient,
          chain: defineChain(etherlinkTestnet.id),
          address: CONTRACT_ADDRESS,
        }),
        method: "status",
        params: [],
      });

      const dataWinner = await readContract({
        contract: getContract({
          abi: Polymarkteth__factory.abi,
          client: thirdwebClient,
          chain: defineChain(etherlinkTestnet.id),
          address: CONTRACT_ADDRESS,
        }),
        method: "winner",
        params: [],
      });

      const dataFEES = await readContract({
        contract: getContract({
          abi: Polymarkteth__factory.abi,
          client: thirdwebClient,
          chain: defineChain(etherlinkTestnet.id),
          address: CONTRACT_ADDRESS,
        }),
        method: "FEES",
        params: [],
      });

      const dataBetKeys = await readContract({
        contract: getContract({
          abi: Polymarkteth__factory.abi,
          client: thirdwebClient,
          chain: defineChain(etherlinkTestnet.id),
          address: CONTRACT_ADDRESS,
        }),
        method: "getBetKeys",
        params: [],
      });

      setStatus(dataStatus as unknown as BET_RESULT);
      setWinner(dataWinner as unknown as string);
      setFees(Number(dataFEES as unknown as bigint) / 100);
      setBetKeys(dataBetKeys as unknown as bigint[]);

      console.log(
        "**********status, winner, fees, betKeys",
        status,
        winner,
        fees,
        betKeys
      );
    }
  };

  //first call to load data
  useEffect(() => {
    (() => reload())();
  }, [account?.address]);

  //fetch bets

  useEffect(() => {
    (async () => {
      if (!betKeys || betKeys.length === 0) {
        console.log("no dataBetKeys");
        setBets([]);
      } else {
        const bets = await Promise.all(
          betKeys.map(
            async (betKey) =>
              (await readContract({
                contract: getContract({
                  abi: Polymarkteth__factory.abi,
                  client: thirdwebClient,
                  chain: defineChain(etherlinkTestnet.id),
                  address: CONTRACT_ADDRESS,
                }),
                method: "getBets",
                params: [betKey],
              })) as unknown as Polymarkteth.BetStruct
          )
        );
        setBets(bets);

        //fetch options
        let newOptions = new Map();
        setOptions(newOptions);
        bets.forEach((bet) => {
          if (newOptions.has(bet!.option)) {
            newOptions.set(
              bet!.option,
              newOptions.get(bet!.option)! + bet!.amount
            ); //acc
          } else {
            newOptions.set(bet!.option, bet!.amount);
          }
        });
        setOptions(newOptions);
        console.log("options", newOptions);
      }
    })();
  }, [betKeys]);

  const Ping = () => {
    // Comprehensive error handling
    const handlePing = async () => {
      try {
        const preparedContractCall = await prepareContractCall({
          contract: getContract({
            abi: Polymarkteth__factory.abi,
            client: thirdwebClient,
            chain: defineChain(etherlinkTestnet.id),
            address: CONTRACT_ADDRESS,
          }),
          method: "ping",
          params: [],
        });

        console.log("preparedContractCall", preparedContractCall);

        const transaction = await sendTransaction({
          transaction: preparedContractCall,
          account: account!,
        });

        //wait for tx to be included on a block
        const receipt = await waitForReceipt({
          client: thirdwebClient,
          chain: defineChain(etherlinkTestnet.id),
          transactionHash: transaction.transactionHash,
        });

        console.log("receipt :", receipt);

        setError("");
      } catch (error) {
        const errorParsed = extractErrorDetails(
          error,
          Polymarkteth__factory.abi
        );
        setError(errorParsed.message);
      }
    };

    return (
      <span style={{ alignContent: "center", paddingLeft: 100 }}>
        <button onClick={handlePing}>Ping</button>
        {!error || error === "" ? <>&#128994;</> : <>&#128308;</>}
      </span>
    );
  };

  const BetFunction = () => {
    const [amount, setAmount] = useState<BigNumber>(BigNumber(0)); //in Ether decimals
    const [option, setOption] = useState("trump");

    const runFunction = async () => {
      try {
        const contract = getContract({
          abi: Polymarkteth__factory.abi,
          client: thirdwebClient,
          chain: defineChain(etherlinkTestnet.id),
          address: CONTRACT_ADDRESS,
        });

        const preparedContractCall = await prepareContractCall({
          contract,
          method: "bet",
          params: [option, parseEther(amount.toString(10))],
          value: parseEther(amount.toString(10)),
        });

        const transaction = await sendTransaction({
          transaction: preparedContractCall,
          account: account!,
        });

        //wait for tx to be included on a block
        const receipt = await waitForReceipt({
          client: thirdwebClient,
          chain: defineChain(etherlinkTestnet.id),
          transactionHash: transaction.transactionHash,
        });

        console.log("receipt :", receipt);

        await reload();

        setError("");
      } catch (error) {
        const errorParsed = extractErrorDetails(
          error,
          Polymarkteth__factory.abi
        );
        setError(errorParsed.message);
      }
    };

    const calculateOdds = (option: string, amount?: bigint): BigNumber => {
      //check option exists
      if (!options.has(option)) return new BigNumber(0);

      console.log(
        "actuel",
        options && options.size > 0
          ? new BigNumber(options.get(option)!.toString()).toString()
          : 0,
        "total",
        new BigNumber(
          [...options.values()]
            .reduce((acc, newValue) => acc + newValue, amount ? amount : 0n)
            .toString()
        ).toString()
      );

      return options && options.size > 0
        ? new BigNumber(options.get(option)!.toString(10))
            .plus(
              amount ? new BigNumber(amount.toString(10)) : new BigNumber(0)
            )
            .div(
              new BigNumber(
                [...options.values()]
                  .reduce(
                    (acc, newValue) => acc + newValue,
                    amount ? amount : 0n
                  )
                  .toString(10)
              )
            )
            .plus(1)
            .minus(fees)
        : new BigNumber(0);
    };

    return (
      <span style={{ alignContent: "center", width: "100%" }}>
        {status && status === BET_RESULT.PENDING ? (
          <>
            <h3>Choose candidate</h3>

            <select
              name="options"
              onChange={(e) => setOption(e.target.value)}
              value={option}
            >
              <option value="trump">Donald Trump</option>
              <option value="harris">Kamala Harris</option>
            </select>
            <h3>Amount</h3>
            <input
              type="number"
              id="amount"
              name="amount"
              required
              onChange={(e) => {
                if (e.target.value && !isNaN(Number(e.target.value))) {
                  //console.log("e.target.value",e.target.value)
                  setAmount(new BigNumber(e.target.value));
                }
              }}
            />

            <hr />
            {account?.address ? <button onClick={runFunction}>Bet</button> : ""}

            <table style={{ fontWeight: "normal", width: "100%" }}>
              <tbody>
                <tr>
                  <td style={{ textAlign: "left" }}>Avg price (decimal)</td>
                  <td style={{ textAlign: "right" }}>
                    {options && options.size > 0
                      ? calculateOdds(option, parseEther(amount.toString(10)))
                          .toFixed(3)
                          .toString()
                      : 0}
                  </td>
                </tr>

                <tr>
                  <td style={{ textAlign: "left" }}>Potential return</td>
                  <td style={{ textAlign: "right" }}>
                    XTZ{" "}
                    {amount
                      ? calculateOdds(option, parseEther(amount.toString(10)))
                          .multipliedBy(amount)
                          .toFixed(6)
                          .toString()
                      : 0}{" "}
                    (
                    {options && options.size > 0
                      ? calculateOdds(option, parseEther(amount.toString(10)))
                          .minus(new BigNumber(1))
                          .multipliedBy(100)
                          .toFixed(2)
                          .toString()
                      : 0}
                    %)
                  </td>
                </tr>
              </tbody>
            </table>
          </>
        ) : (
          <>
            <span style={{ color: "#2D9CDB", fontSize: "1.125rem" }}>
              Outcome: {BET_RESULT[status]}
            </span>
            {winner ? <div style={{ color: "#858D92" }}>{winner}</div> : ""}
          </>
        )}
      </span>
    );
  };

  const resolve = async (option: string) => {
    try {
      const preparedContractCall = await prepareContractCall({
        contract: getContract({
          abi: Polymarkteth__factory.abi,
          client: thirdwebClient,
          chain: defineChain(etherlinkTestnet.id),
          address: CONTRACT_ADDRESS,
        }),
        method: "resolveResult",
        params: [option, BET_RESULT.WIN],
      });

      console.log("preparedContractCall", preparedContractCall);

      const transaction = await sendTransaction({
        transaction: preparedContractCall,
        account: account!,
      });

      //wait for tx to be included on a block
      const receipt = await waitForReceipt({
        client: thirdwebClient,
        chain: defineChain(etherlinkTestnet.id),
        transactionHash: transaction.transactionHash,
      });

      console.log("receipt :", receipt);

      await reload();

      setError("");
    } catch (error) {
      const errorParsed = extractErrorDetails(error, Polymarkteth__factory.abi);
      setError(errorParsed.message);
    }
  };

  return (
    <>
      <header>
        <span style={{ display: "flex" }}>
          <h1>Polymarktez </h1>

          <div className="flex items-center gap-4">
            <ConnectButton
              client={thirdwebClient}
              wallets={wallets}
              connectModal={{ size: "compact" }}
            />
          </div>
        </span>
      </header>

      <div id="content" style={{ display: "flex", paddingTop: 10 }}>
        <div style={{ width: "calc(66vw - 4rem)" }}>
          <span style={{ display: "flex" }}>
            <img
              style={{ width: "72px", paddingRight: 15 }}
              src="https://polymarket.com/_next/image?url=https%3A%2F%2Fpolymarket-upload.s3.us-east-2.amazonaws.com%2Fpresidential-election-winner-2024-afdda358-219d-448a-abb5-ba4d14118d71.png&w=1018&q=100"
            ></img>
            <h2>Presidential Election Winner 2024</h2>
          </span>
          <img style={{ width: "inherit" }} src="./graph.png"></img>

          <hr />

          <table style={{ width: "inherit" }}>
            <thead>
              <tr>
                <th>Outcome</th>
                <th>% chance</th>
                <th>action</th>
              </tr>
            </thead>
            <tbody>
              {options && options.size > 0 ? (
                [...options.entries()].map(([option, amount]) => (
                  <tr key={option}>
                    <td className="tdTable">
                      <div className="picDiv">
                        <img
                          style={{ objectFit: "cover", height: "inherit" }}
                          src={"./" + option + ".webp"}
                        ></img>
                      </div>
                      {option}
                    </td>
                    <td>
                      {new BigNumber(amount.toString())
                        .div(
                          new BigNumber(
                            [...options.values()]
                              .reduce((acc, newValue) => acc + newValue, 0n)
                              .toString()
                          )
                        )
                        .multipliedBy(100)
                        .toFixed(2)}
                      %
                    </td>

                    <td>
                      {status && status === BET_RESULT.PENDING ? (
                        <button onClick={() => resolve(option)}>Winner</button>
                      ) : (
                        ""
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <></>
              )}
            </tbody>
          </table>
        </div>

        <div
          style={{
            width: "calc(33vw - 4rem)",
            boxShadow: "",
            margin: "1rem",
            borderRadius: "12px",
            border: "1px solid #344452",
            padding: "1rem",
          }}
        >
          <span className="tdTable">{<BetFunction />}</span>
        </div>
      </div>

      <footer>
        <h3>Errors</h3>

        <textarea
          readOnly
          rows={10}
          style={{ width: "100%" }}
          value={error}
        ></textarea>

        {account?.address ? <Ping /> : ""}
      </footer>
    </>
  );
}
