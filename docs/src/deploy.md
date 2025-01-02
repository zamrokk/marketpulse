# Deploy the contract

1. Deploy the contract locally with Hardbat:

   1. Prepare a module for the ignition plugin of Hardhat. The module will be use as the default script for deployment. Rename the default file first:

      ```bash
      mv ./ignition/modules/Lock.ts ./ignition/modules/Marketpulse.ts
      ```

   1. Replace the contents of the file with this code:

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

      This module deploys the contract and calls the Ping endpoint to verify that it deployed.

   1. Start a local Ethereum node:

      ```bash
      npx hardhat node
      ```

   1. In a different terminal window, deploy the contract using Hardhat ignition:

      ```bash
      npx hardhat ignition deploy ignition/modules/Marketpulse.ts --reset --network localhost
      ```

      You can deploy the contract to any local Ethereum node but Etherlink is a good choice because it is persistent and free and most tools and indexers are already deployed on it.

1. Check that your contract deployed without problems and stop the Hardhat node.

1. Deploy the contract on Etherlink Testnet:

   1. In the Hardhat configuration file `hardhat.config.ts`, add Etherlink Mainnet and Testnet as custom networks:

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

   1. Set up an Etherlink Testnet account with some native tokens to deploy the contract. Follow this [guide](https://docs.etherlink.com/get-started/using-your-wallet) to create an account using a wallet. Then use the [faucet](https://docs.etherlink.com/get-started/getting-testnet-tokens) to get some XTZ tokens on Etherlink Testnet.

   1. Export your account private key from your wallet app.

   1. Set the private key as the value of the `DEPLOYER_PRIVATE_KEY` environment variable by running this command:

      ```bash
      npx hardhat vars set DEPLOYER_PRIVATE_KEY
      ```

      On the prompt, enter or paste the value of your exported private key.

   1. Deploy the contract to Etherlink Testnet network:

      ```bash
      npx hardhat ignition deploy ignition/modules/Marketpulse.ts --network etherlinkTestnet
      ```

      A successful output should look like this:

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

1. Run this command to verify the contract, using the contract address as the value of `<CONTRACT_ADDRESS>`:

   ```bash
   npx hardhat verify --network etherlinkTestnet <CONTRACT_ADDRESS>
   ```

   You can also pass the `--verify` switch to the deployment command to verify the contract as part of the deployment process.

The next step is to create the frontend application.
