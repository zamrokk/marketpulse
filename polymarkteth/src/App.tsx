import { useEffect, useState } from "react";
import {
  Client,
  createPublicClient,
  createWalletClient,
  custom,
  http,
  formatEther,
  parseEther,
  PublicClient,
  WalletClient,
  Account,
} from "viem";

import { privateKeyToAccount } from "viem/accounts";
import { etherlinkTestnet } from "viem/chains";

const CONTRACT_ADDRESS = "0x77A3b44a7e10eA1AcFc4b048392fc1E8e5Ed8E3C" as const;

export default function App() {
  const [abi, setAbi] = useState<any[]>([]);

  const [walletClient, setWalletClient] = useState<WalletClient | null>(null);
  const [publicClient, setPublicClient] = useState<PublicClient | null>(null);
  const [address, setAddress] = useState<`0x${string}` | null>(null);

  const [balance, setBalance] = useState<bigint>(BigInt(0));

  useEffect(() => {
    (async () => {
      if (address) {
        setBalance(
          await publicClient!.getBalance({
            address,
          })
        );

        const abi = await (await fetch("Polymarkteth.json")).json();
        console.log("abi", abi.abi);
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

  //ping
  async function ping() {
    try {

      if (!walletClient?.account) {
        console.error("No account",walletClient?.account);
        return}

      const { request } = await publicClient!.simulateContract({
        account:walletClient?.account!,
        address: CONTRACT_ADDRESS,
        abi,
        functionName: "ping",
        args: [],
      });

      const result = await walletClient!.writeContract(request);
      console.log("result", result);
    } catch (error) {
      console.log("error", error);
    }
  }

  // Transaction handling
  /*
  async function handleTransfer() {
    try {
      const { request } = await publicClient.simulateContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: "transfer",
        args: ["0x...", parseEther("0.1")],
        account: `0x`,
      });

      const hash = await walletClient.writeContract(request);
      console.log("Transaction hash:", hash);
    } catch (err) {
      console.error("Transfer failed:", err);
    }
  }
*/
  return (
    <div>
      <h1>Web3 App with Viem</h1>

      {!address ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <>
          {" "}
          <div>Address : {address}</div>
          <div>Balance : {formatEther(balance)}</div>
          <div>
            <button onClick={disconnectWallet}>Disconnect Wallet</button>
          </div>
          <div>
            <button onClick={ping}>ping</button>
          </div>
        </>
      )}
    </div>
  );
}
