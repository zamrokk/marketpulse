import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import {
  fromHex,
  getAddress,
  hexToBigInt,
  hexToNumber,
  hexToString,
  parseGwei,
  toHex,
} from "viem";

describe("Polymarkteth", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployContractFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await hre.viem.getWalletClients();

    const polymarktethContract = await hre.viem.deployContract("Polymarkteth", [
      owner.account.address,
    ]);

    const publicClient = await hre.viem.getPublicClient();

    return {
      polymarktethContract,
      owner,
      otherAccount,
      publicClient,
    };
  }

  describe("init function", function () {
    it("should be initialized", async function () {
      const { polymarktethContract, owner } = await loadFixture(
        deployContractFixture
      );

      const ownerFromStorage = await polymarktethContract.read.admin();
      console.log("ownerFromStorage", ownerFromStorage);
      expect(ownerFromStorage.toLowerCase()).to.equal(
        owner.account.address.toLowerCase()
      ); //trick to remove capital letters
    });

    it("should return Pong", async function () {
      const { polymarktethContract, publicClient } = await loadFixture(
        deployContractFixture
      );

      await polymarktethContract.write.ping();

      const logs = await publicClient.getContractEvents({
        abi: polymarktethContract.abi,
        eventName: "Pong",
      });
      console.log(logs);
      expect(logs.length).to.equal(1);
    });
  });

  // BET SCENARIO
  /*
const betOnRequest = (option: string, amount: number, user: Address) => new Request(
    "tezos://fake/bet"
    , {
        method: "POST",
        body: JSON.stringify({
            option,
            amount
        }),
        headers: headers(user)
    }
);


const findBetRequest = (betId: string) => new Request(
    "tezos://fake/bet/" + betId
    , {
        method: "GET",
        headers: headers(alice)
    }
);


const getOddsRequest = (option: string, betAmount: number) => new Request(
    "tezos://fake/odds?option=" + option + "&amount=" + betAmount
    , {
        method: "GET",
        headers: headers(alice)
    }
);
*/

//FIXME test suite is so crap that a full scenario should be contained inside the same 'it' , otherwise the full context is reset
  describe("scenario",  () => {
    let betTrump1Id: bigint = BigInt(0);
    let betKamala2Id: string = "";
    let betKeys: bigint[] = [];

    it("should run the full scenario", async() => {

    console.log("should return a list of empty bets") 
      const { polymarktethContract, owner : alice ,publicClient} = await loadFixture(
        deployContractFixture
      );

      expect(await polymarktethContract.read.betKeys.length).to.equal(0);
    

    console.log("should return 200")
      
      //FIXME
      console.log("Trying to force bet");
      await polymarktethContract.write.addBets([
        {
          amount: BigInt(1),
          id: BigInt(1),
          option: "trump",
          owner: alice.account.address,
        },
      ]);

      const betTrump1IdHash = await polymarktethContract.write.placeBet(
        ["trump", BigInt(1)],
        { value: BigInt(1) }
      );
      expect(betTrump1IdHash).not.null;

      // Wait for the transaction receipt
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: betTrump1IdHash,
      });

      expect(receipt.status).equals("success");

      betKeys = [...(await polymarktethContract.read.getBetKeys())];
      console.log("betKeys", betKeys);

      betTrump1Id = betKeys[1];

      console.log(
        "*********HACK 1***********",
        await polymarktethContract.read.bets([BigInt(1)])
      );
      console.log(
        "*********HACK trump***********",
        await polymarktethContract.read.bets([betTrump1Id])
      );
    

    console.log("should find the bet")
     
      console.log(
        "*********HACK 1***********",
        await polymarktethContract.read.bets([BigInt(1)])
      );
      console.log(
        "*********HACK trump***********",
        await polymarktethContract.read.bets([betTrump1Id])
      );

      console.log("*********HACK set keys***********",(await polymarktethContract.read.getBetKeys()))

      const betTrump1 = await polymarktethContract.read.bets([betTrump1Id]);

      expect(betTrump1).not.null;

      console.log(
        "*********HACK 1***********",
        await polymarktethContract.read.bets([BigInt(1)])
      );
      console.log(
        "*********HACK trump***********",
        await polymarktethContract.read.bets([betTrump1Id])
      );


    } );

      /*  expect(betTrump1.owner).toEqual(alice);
        expect(betTrump1.option).toEqual("trump");
        expect(betTrump1.amount).toEqual(1);*/
   
    /*
    it('should get a correct odd of 0.9 (including fees)', async () => {
        const res = await contract(getOddsRequest("trump", 1));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body).not.toBeNull();
        expect(body.odds).toEqual(0.9);
    });


    it('should return 200', async () => {

        //FIXME : manually send money to the contract
        balances.set(contractAddr, balances.get(contractAddr)! + 2);

        //change to bob requester
        const res = await contract(betOnRequest("kamala", 2, bob));
        expect(res.status).toBe(200);
        const body = (await res.json());
        expect(body).not.toBeNull();
        expect(body.id).not.toBeNull();
        betKamala2Id = body.id;
    });

    it('should find the bet', async () => {
        const res = await contract(findBetRequest(betKamala2Id));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body).not.toBeNull();
        expect(body.owner).toEqual(bob);
        expect(body.option).toEqual("kamala");
        expect(body.amount).toEqual(2);
    });

    it('should get a correct odd of 1.9 for trump (including fees)', async () => {
        const res = await contract(getOddsRequest("trump", 1));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body).not.toBeNull();
        expect(body.odds).toEqual(1.9);
    });

    it('should get a correct odd of 1.23333 for kamala (including fees)', async () => {
        const res = await contract(getOddsRequest("kamala", 1));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body).not.toBeNull();
        expect(body.odds).toEqual(1 + 1 / 3 - 0.1);
    });

*/
  });

  /*
const resultRequest = new Request(
    "tezos://fake/result");

const resultOnRequest = (option: string, result: BET_RESULT) => new Request(
    "tezos://fake/result"
    , {
        method: "POST",
        body: JSON.stringify({
            option,
            result
        }),
        headers: headers(alice)
    }
);


describe('result function', () => {



    it('should return 200 with all correct balances', async () => {

        const res = await contract(resultOnRequest("trump", BET_RESULT.WIN));
        expect(res.status).toBe(200);

        expect(balances.get(contractAddr)).toBeCloseTo(0.1, 5);
        expect(balances.get(alice)).toBeCloseTo(initAmount + 2.9, 5);
        expect(balances.get(bob)).toBeCloseTo(initAmount + 0, 5);

    });

    it('should have state finalized', async () => {
        const res = await contract(resultRequest);
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body).not.toBeNull();
        expect(body.result).toEqual(BET_RESULT.WIN);
    });

    it('should return 500 if we try to reapply results', async () => {

        const res = await contract(resultOnRequest("trump", BET_RESULT.WIN));
        expect(res.status).toBe(500);

    });


});
*/
});
