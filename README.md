# polymarkteth
polymarket on etherlink


# Setup

Following hardhat tutorial : https://hardhat.org/tutorial/creating-a-new-hardhat-project

```
npm init
npm install --save-dev hardhat
npx hardhat init
```

Select `Create a TypeScript project (with Viem)`

# Code

Add some libraries

```
npm i @openzeppelin/contracts
```


# Compile  

```
rm -rf artifacts
rm -rf cache
rm -rf ignition/deployments
npx hardhat compile
```

# Test

```
npx hardhat test
```


# Deploy locally

```
npx hardhat node
npx hardhat ignition deploy ignition/modules/Polymarkteth.ts --network localhost
```

# Deploy on Etherlink 0xe2F903f3eBd77b7EC347932Ce5E53AD1961Eb002

Update hardhat config file with https://docs.etherlink.com/building-on-etherlink/development-toolkits


```
npx hardhat ignition deploy ignition/modules/Polymarkteth.ts --network etherlinkTestnet
```

# Verify
Look on the RAW TRACE > VALUE of the creation contract tx to get the input data parameter

```
npx hardhat verify --network etherlinkTestnet <CONTRACT_ADDRESS> 
```

(Optional) Cannot add Soucify to check vulnerabilities => "Invalid chainIds: 128123"
```json
 sourcify: {
    // Disabled by default
    // Doesn't need an API key
    enabled: true
  }
```

# Frontend


```
deno run -A npm:create-vite@latest
npm i viem
npm i @metamask/providers
```


## viem file for etherlink

```
mkdir ./src/config
touch ./src/config/viem.ts

mkdir ./src/utils
touch ./src/utils/errors.ts
```

```TypeScript
import { createPublicClient, createWalletClient, http } from 'viem'
import { etherlinkTestnet } from 'viem/chains'

export const publicClient = createPublicClient({
  chain: etherlinkTestnet,
  transport: http()
})

export const walletClient = createWalletClient({
  chain: etherlinkTestnet,
  transport: http()
})
```

```TypeScript
export function handleViemError(error: Error) {
  if (error.message.includes('user rejected')) {
    return 'Transaction was rejected by user'
  }
  if (error.message.includes('insufficient funds')) {
    return 'Insufficient funds for transaction'
  }
  return 'Transaction failed. Please try again.'
}
```

## ABI

copy the abi on src folder

```
import abi from "./Polymarkteth.json";
```