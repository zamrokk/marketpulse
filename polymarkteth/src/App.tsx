import { useEffect, useState } from "react";
import {
  Account,
  createPublicClient,
  createWalletClient,
  custom,
  formatEther,
  http,
  PublicClient,
  WalletClient
} from "viem";
import "./App.css";

import { etherlinkTestnet } from "viem/chains";

const CONTRACT_ADDRESS = "0x9e5b3F152770319a5a0Ac82E81C0F23E58136bB1" as const;

export default function App() {
  const [abi, setAbi] = useState<any[]>([]);

  const [walletClient, setWalletClient] = useState<WalletClient | null>(null);
  const [publicClient, setPublicClient] = useState<PublicClient | null>(null);
  const [address, setAddress] = useState<`0x${string}` | null>(null);

  const [balance, setBalance] = useState<bigint>(BigInt(0));

  const [error, setError] = useState("");

  const Ping = () => {

    const ping = async () => {
      try {
        if (!walletClient?.account) {
          console.error("No account", walletClient?.account);
          return;
        }

        const { request } = await publicClient!.simulateContract({
          account: walletClient?.account!,
          address: CONTRACT_ADDRESS,
          abi,
          functionName: "ping",
          args: [],
        });

        const result = await walletClient!.writeContract(request);
        console.log("result", result);

        setError("");
      } catch (error) {
        console.error("ERROR", error);
        setError(
          typeof error === "string"
            ? error
            : (error as Error).message + "\n" + (error as Error).stack
        );
      }
    };

    return (
      <span style={{ alignContent: "center", paddingLeft: 100 }}>
        <button onClick={ping}>Ping </button>
        {error ? <>&#128994;</> : <>&#128308;</>}
      </span>
    );
  };

  useEffect(() => {
    (async () => {
      if (address) {
        setBalance(
          await publicClient!.getBalance({
            address,
          })
        );

        const abi = await (await fetch("Polymarkteth.json")).json();
       // console.log("abi", abi.abi);
        setAbi(abi.abi);
      } else {
        console.log("Address is null");
      }
    })();
  }, [address]);

  async function connectWallet() {
    // Check if ethereum object exists (browser wallet like MetaMask)
    if (window.ethereum) {
      try {
        // Request account access
        const accounts = (await window.ethereum.request({
          method: "eth_requestAccounts",
        })) as NonNullable<Account[]> | undefined;

        if (accounts && accounts.length > 0) {
          // Create wallet client
          const walletClient = createWalletClient({
            account: accounts[0],
            chain: etherlinkTestnet,
            transport: custom(window.ethereum),
          });

          // Create public client
          const publicClient = createPublicClient({
            chain: etherlinkTestnet,
            transport: http(),
          });

          // Get connected accounts
          const [address] = await walletClient.getAddresses();

          setAddress(address);
          setWalletClient(walletClient);
          setPublicClient(publicClient);
        } else {
          console.error("Cannot find accounts on the wallet");
        }
      } catch (error) {
        console.error("Wallet connection failed", error);
      }
    } else {
      console.error("No Ethereum wallet found");
    }
  }

  async function disconnectWallet() {
    setAddress(null);
  }

  const BetFunction = () => {

    const [amount, setAmount] = useState(0);
    const [option, setOption] = useState("trump");

    const runFunction = async () => {
      try {
        const body = {
          option,
          amount,
        };

        if (!walletClient?.account) {
          console.error("No account", walletClient?.account);
          return;
        }

        const { request } = await publicClient!.simulateContract({
          account: walletClient?.account!,
          address: CONTRACT_ADDRESS,
          abi,
          functionName: "bet",
          args: [option, amount],
        });

        const hash = await walletClient!.writeContract(request);

        // Check transaction receipt
        const receipt = await publicClient!.getTransactionReceipt({
          hash,
        });

        console.log("Transaction Details:", {
          hash: hash,
          isValidHash: hash && hash.startsWith("0x") && hash.length === 66,
          status: receipt.status,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed,
        });

        // Additional verification
        const blockConfirmations = await publicClient!.getBlockNumber();
        const transactionConfirmations =
          blockConfirmations - receipt.blockNumber;

          setError("");
      } catch (error) {
        console.error("ERROR", error);
        setError(
          typeof error === "string"
            ? error
            : (error as Error).message + "\n" + (error as Error).stack
        );
      }
    };

    return (
      <span style={{ alignContent: "center", width: "100%" }}>
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
          onChange={(e) => setAmount(Number(e.target.value))}
        />

        <hr />
        {address?<button onClick={runFunction}>Bet</button>:""}

        <table style={{ fontWeight: "normal", width: "100%" }}>
          <tr>
            <td style={{ textAlign: "left" }}>Avg price</td>
            <td style={{ textAlign: "right" }}>60.6¢</td>
          </tr>
          <tr>
            <td style={{ textAlign: "left" }}>Shares</td>
            <td style={{ textAlign: "right" }}>16.50</td>
          </tr>
          <tr>
            <td style={{ textAlign: "left" }}>Potential return</td>
            <td style={{ textAlign: "right" }}>$16.50 (65.01%)</td>
          </tr>
        </table>
      </span>
    );
  };

  return (
    <>
      <header>
        <span style={{ display: "flex" }}>
          <h1>Polymarktez </h1>

          {!address ? (
            <button onClick={connectWallet}>Connect Wallet</button>
          ) : (
            
              <div style={{ alignContent: "flex-end", marginLeft: "auto" }}>
                Cash : XTZ {formatEther(balance)}
               
                
                <div className="chip">
                  <img
                    src="https://cdn.britannica.com/66/226766-138-235EFD92/who-is-President-Joe-Biden.jpg?w=800&h=450&c=crop"
                    alt="Person"
                    width="96"
                    height="96"
                  />
                   {address}


                </div>
                <button onClick={disconnectWallet}>Disconnect Wallet</button>

              </div>
           
          )}
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
            <tr>
              <th>Outcome</th>
              <th>% chance</th>
            </tr>

            <tr>
              <td className="tdTable">
                <div className="picDiv">
                  <img
                    style={{ objectFit: "cover", height: "inherit" }}
                    src="https://polymarket.com/_next/image?url=https%3A%2F%2Fpolymarket-upload.s3.us-east-2.amazonaws.com%2Fwill-donald-trump-win-the-2024-us-presidential-election-c83f01bb-5089-4222-9347-3f12673b6a48.png&w=1018&q=100"
                  ></img>
                </div>
                Donald Trump
              </td>
              <td>59.5%</td>
            </tr>
            <tr>
              <td className="tdTable">
                <div className="picDiv">
                  <img
                    style={{ objectFit: "cover", height: "inherit" }}
                    src="https://polymarket.com/_next/image?url=https%3A%2F%2Fpolymarket-upload.s3.us-east-2.amazonaws.com%2Fwill-kamala-harris-win-the-2024-us-presidential-election-21483ac3-94a5-4efd-b89e-05cdca69753f.png&w=1018&q=100"
                  ></img>
                </div>
                Kamala Harris
              </td>
              <td>40.3%</td>
            </tr>
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
          <span className="tdTable">
            <BetFunction />
          </span>
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

        {address?<Ping />:""}
      </footer>
    </>
  );
}
