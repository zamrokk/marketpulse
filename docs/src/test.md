# Test the contract

With blockchain development, testing is very important because you don't have the luxury to redeploy application updates as it. Hardhat provides you smart contract helpers on `chai` Testing framework to do so.

1. Rename the default `./test/Lock.ts` test file to `./test/Marketpulse.ts`:

   ```bash
   mv ./test/Lock.ts ./test/Marketpulse.ts
   ```

1. Replace the default file with this code:

   ```TypeScript
   import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
   import { expect } from "chai";
   import hre from "hardhat";
   import { ContractFunctionExecutionError, parseEther } from "viem";

   //constants and local variables
   const ODD_DECIMALS = 10;
   let initAliceAmount = 0n;
   let initBobAmount = 0n;

   //Enum definition copy/pasta from Solidity code
   enum BET_RESULT {
     WIN = 0,
     DRAW = 1,
     PENDING = 2,
   }

   describe("Marketpulse", function () {
     // We define a fixture to reuse the same setup in every test.
     // We use loadFixture to run this setup once, snapshot that state,
     // and reset Hardhat Network to that snapshot in every test.
     async function deployContractFixture() {
       // Contracts are deployed using the first signer/account by default
       const [owner, bob] = await hre.viem.getWalletClients();

       // Set block base fee to zero because we want exact calculation checks without network fees
       await hre.network.provider.send("hardhat_setNextBlockBaseFeePerGas", [
         "0x0",
       ]);

       const marketpulseContract = await hre.viem.deployContract(
         "Marketpulse",
         []
       );

       const publicClient = await hre.viem.getPublicClient();

       initAliceAmount = await publicClient.getBalance({
         address: owner.account.address,
       });

       initBobAmount = await publicClient.getBalance({
         address: bob.account.address,
       });

       return {
         marketpulseContract,
         owner,
         bob,
         publicClient,
       };
     }

     describe("init function", function () {
       it("should be initialized", async function () {
         const { marketpulseContract, owner } = await loadFixture(
           deployContractFixture
         );

         const ownerFromStorage = await marketpulseContract.read.admin();
         console.log("ownerFromStorage", ownerFromStorage);
         expect(ownerFromStorage.toLowerCase()).to.equal(
           owner.account.address.toLowerCase()
         ); //trick to remove capital letters
       });

       it("should return Pong", async function () {
         const { marketpulseContract, publicClient } = await loadFixture(
           deployContractFixture
         );

         await marketpulseContract.write.ping({ gasPrice: 0n });

         const logs = await publicClient.getContractEvents({
           abi: marketpulseContract.abi,
           eventName: "Pong",
         });
         console.log(logs);
         expect(logs.length).to.equal(1);
       });
     });

     // BET SCENARIO

     //full scenario should be contained inside the same 'it' , otherwise the full context is reset
     describe("scenario", () => {
       let betTrump1Id: bigint = BigInt(0);
       let betKamala2Id: string = "";
       let betKeys: bigint[] = [];

       it("should run the full scenario correctly", async () => {
         console.log("Initialization should return a list of empty bets");
         const {
           marketpulseContract,
           owner: alice,
           publicClient,
           bob,
         } = await loadFixture(deployContractFixture);

         expect(await marketpulseContract.read.betKeys.length).to.equal(0);

         console.log("Trump bet for 1 ether should return a hash");

         const betTrump1IdHash = await marketpulseContract.write.bet(
           ["trump", parseEther("1")],
           { value: parseEther("1"), gasPrice: 0n }
         );
         expect(betTrump1IdHash).not.null;

         // Wait for the transaction receipt
         let receipt = await publicClient.waitForTransactionReceipt({
           hash: betTrump1IdHash,
         });

         expect(receipt.status).equals("success");

         betKeys = [...(await marketpulseContract.read.getBetKeys())];
         console.log("betKeys", betKeys);

         betTrump1Id = betKeys[0];

         console.log("Should find the Trump bet from hash");

         const betTrump1 = await marketpulseContract.read.getBets([betTrump1Id]);

         expect(betTrump1).not.null;

         expect(betTrump1.owner.toLowerCase()).equals(
           alice.account.address.toLowerCase()
         );
         expect(betTrump1.option).equals("trump");
         expect(betTrump1.amount).equals(parseEther("1"));

         console.log("Should get a correct odd of 0.9 (including fees) for Trump if we bet 1");

         let odd = await marketpulseContract.read.calculateOdds([
           "trump",
           parseEther("1"),
         ]);

         expect(odd).equals(BigInt(Math.floor(0.9 * 10 ** ODD_DECIMALS))); //rounding

         console.log("Kamala bet for 2 ethers should return a hash");

         // Set block base fee to zero
         await hre.network.provider.send("hardhat_setNextBlockBaseFeePerGas", [
           "0x0",
         ]);

         const betKamala2IdHash = await marketpulseContract.write.bet(
           ["kamala", parseEther("2")],
           { value: parseEther("2"), account: bob.account.address, gasPrice: 0n }
         );
         expect(betKamala2IdHash).not.null;

         // Wait for the transaction receipt
         receipt = await publicClient.waitForTransactionReceipt({
           hash: betKamala2IdHash,
         });

         expect(receipt.status).equals("success");

         betKeys = [...(await marketpulseContract.read.getBetKeys())];
         console.log("betKeys", betKeys);

         const betKamala2Id = betKeys[1];

         console.log("Should find the Kamala bet from hash");

         const betKamala2 = await marketpulseContract.read.getBets([
           betKamala2Id,
         ]);

         expect(betKamala2).not.null;

         expect(betKamala2.owner.toLowerCase()).equals(
           bob.account.address.toLowerCase()
         );
         expect(betKamala2.option).equals("kamala");
         expect(betKamala2.amount).equals(parseEther("2"));

         console.log("Should get a correct odd of 1.9 for Trump (including fees) if we bet 1");

         odd = await marketpulseContract.read.calculateOdds([
           "trump",
           parseEther("1"),
         ]);

         expect(odd).equals(BigInt(Math.floor(1.9 * 10 ** ODD_DECIMALS)));

         console.log(
           "Should get a correct odd of 1.23333 for kamala (including fees) if we bet 1"
         );

         odd = await marketpulseContract.read.calculateOdds([
           "kamala",
           parseEther("1"),
         ]);

         expect(odd).equals(
           BigInt(Math.floor((1 + 1 / 3 - 0.1) * 10 ** ODD_DECIMALS))
         );

         console.log("Should return all correct balances after resolving Win on Trump");

         await marketpulseContract.write.resolveResult(
           ["trump", BET_RESULT.WIN],
           { gasPrice: 0n }
         );

         expect(
           await publicClient.getBalance({
             address: marketpulseContract.address,
           })
         ).equals(parseEther("0.1"));
         expect(
           await publicClient.getBalance({ address: alice.account.address })
         ).equals(initAliceAmount + parseEther("1.9")); // -1+2.9

         expect(
           await publicClient.getBalance({ address: bob.account.address })
         ).equals(initBobAmount - parseEther("2")); //-2

         console.log("Should have state finalized after resolution");

         const result = await marketpulseContract.read.status();
         expect(result).not.null;
         expect(result).equals(BET_RESULT.WIN);

         console.log("Should return an error if we try to resolve results again");

         try {
           await marketpulseContract.write.resolveResult(
             ["trump", BET_RESULT.WIN],
             { gasPrice: 0n }
           );
         } catch (e) {
           expect((e as ContractFunctionExecutionError).details).equals(
             "VM Exception while processing transaction: reverted with reason string 'Result is already given and bets are resolved : \x00'"
           );
         }
       });
     });
   });
   ```

1. Run the tests with Hardhat:

   ```bash
   npx hardhat test
   ```

   The technical Ping test and the full end2end scenario should pass
