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
npx hardhat compile
```

# Test

```
npx hardhat test
```


# Deploy locally

```
npx hardhat node
npx hardhat ignition deploy ignition/modules/Polymarkteth.ts 
```

# Deploy on Etherlink

Update hardhat config file with https://docs.etherlink.com/building-on-etherlink/development-toolkits


```
npx hardhat ignition deploy ignition/modules/Polymarkteth.ts --network etherlinkTestnet
```

# Verify
Look on the RAW TRACE > VALUE of the creation contract tx to get the input data parameter

```
npx hardhat verify --network etherlinkTestnet 0xDcF36D91Db3fC189dF563a2414420d5B367757b6 0x038d7ea4c68000
```

(Optional) Cannot add Soucify to check vulnerabilities => "Invalid chainIds: 128123"
```json
 sourcify: {
    // Disabled by default
    // Doesn't need an API key
    enabled: true
  }
```