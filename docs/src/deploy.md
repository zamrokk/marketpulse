# Deployment

1. Deploy the contract locally

   1. Prepare a module for the ignition plugin of Hardhat. The module will be use as the default script for deployment. Rename the default file first

      ```
      mv ./ignition/modules/Lock.ts ./ignition/modules/Marketpulse.ts
      ```

   1. The module dpeloy the contract and call the Ping endpoint just after. Edit the module file with

      ```TypeScript
      // This setup uses Hardhat Ignition to manage smart contract deployments.
      // Learn more about it at https://hardhat.org/ignition

      import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

      const MarketpulseModule = buildModule("MarketpulseModule", (m) => {
        const MarketpulseContract = m.contract("Marketpulse", []);

        m.call(MarketpulseContract, "ping", []);

        return { MarketpulseContract };
      });

      export default MarketpulseModule;
      ```

   1. Start a local Ethereum node

      ```bash
      npx hardhat node
      ```

   1. Deploy the contract using hardhat ignition

      ```bash
      npx hardhat ignition deploy ignition/modules/Marketpulse.ts --reset --network localhost
      ```

      > Note : You can choose to work with a local Ethereum node but we recommend to use Etherlink testnet as it is persistent, free and most tools, indexers, etc... are already deployed. Check that your contract can deployed without problem, stop the node and pass to the next step

1. Deploy the contract on Etherlink (testnet)

   > Note : if you local node is running, just kill the process as it is no more needed

   1. A custom network to Etherlink (and Etherlink testnet) needs to be registered. Edit the Hardhat configuration file **hardhat.config.ts**

      ```TypeScript
      import "@nomicfoundation/hardhat-toolbox-viem";
      import "@nomicfoundation/hardhat-verify";
      import type { HardhatUserConfig } from "hardhat/config";
      import { vars } from "hardhat/config";

      if (!vars.has("DEPLOYER_PRIVATE_KEY")) {
        console.error("Missing env var DEPLOYER_PRIVATE_KEY");
      }

      const deployerPrivateKey = vars.get("DEPLOYER_PRIVATE_KEY");

      const config: HardhatUserConfig = {
        solidity: "0.8.24",

        networks: {
          etherlinkMainnet: {
            url: "https://node.mainnet.etherlink.com",
            accounts: [deployerPrivateKey],
          },
          etherlinkTestnet: {
            url: "https://node.ghostnet.etherlink.com",
            accounts: [deployerPrivateKey],
          },
        },
        etherscan: {
          apiKey: {
            etherlinkMainnet: "YOU_CAN_COPY_ME",
            etherlinkTestnet: "YOU_CAN_COPY_ME",
          },
          customChains: [
            {
              network: "etherlinkMainnet",
              chainId: 42793,
              urls: {
                apiURL: "https://explorer.etherlink.com/api",
                browserURL: "https://explorer.etherlink.com",
              },
            },
            {
              network: "etherlinkTestnet",
              chainId: 128123,
              urls: {
                apiURL: "https://testnet.explorer.etherlink.com/api",
                browserURL: "https://testnet.explorer.etherlink.com",
              },
            },
          ],
        }
      };

      export default config;

      ```

   1. We need also an account with some native tokens to deploy the contract. Follow this [guide](https://docs.etherlink.com/get-started/using-your-wallet) to create an account using a wallet. And then, use a [faucet](https://docs.etherlink.com/get-started/getting-testnet-tokens) to get some coins

   1. Export your wallet account private key to use it on Hardhat deployment. Set the **DEPLOYER_PRIVATE_KEY** environment variable as follow

      ```bash
      npx hardhat vars set DEPLOYER_PRIVATE_KEY
      ```

      On the prompt, enter/paste the value of your exported private key

   1. Deploy the contract to Etherlink testnet network

      ```bash
      npx hardhat ignition deploy ignition/modules/Marketpulse.ts --network etherlinkTestnet
      ```

   1. A successful output should look like this

      ```logs
      Compiled 5 Solidity files successfully (evm target: paris).
      Hardhat Ignition 🚀

      Deploying [ MarketpulseModule ]

      Batch #1
        Executed MarketpulseModule#Marketpulse

      Batch #2
        Executed MarketpulseModule#Marketpulse.ping

      [ MarketpulseModule ] successfully deployed 🚀

      Deployed Addresses

      MarketpulseModule#Marketpulse - 0x9a8aD93E7bE3fDCA9667D457cecBE24C8ee7509f
      ```

1. Verify your contract. A best practice is to publish your source code and verify it on an explorer. Replace the **<CONTRACT_ADDRESS>** with yours. Note : you can also pass the --verify as an argument on the deployment command

   ```bash
   npx hardhat verify --network etherlinkTestnet <CONTRACT_ADDRESS>
   ```

Well done !

Next step is to create the frontend
