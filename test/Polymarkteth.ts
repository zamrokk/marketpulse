import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { getAddress, parseGwei } from "viem";

describe("Polymarkteth", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployOneYearLockFixture() {

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await hre.viem.getWalletClients();

    const polymarktethContract = await hre.viem.deployContract("Polymarkteth", [  (await owner.getAddresses())[0] ] );

    const publicClient = await hre.viem.getPublicClient();

    return {
      polymarktethContract,
      owner,
      otherAccount,
      publicClient,
    };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { polymarktethContract , owner } = await loadFixture(deployOneYearLockFixture);

      expect(await polymarktethContract.read.owner()).to.equal( (await owner.getAddresses())[0] );
    });

    it("Should receive a Pong against a Ping", async function () {
      const { polymarktethContract ,publicClient} = await loadFixture(
        deployOneYearLockFixture
      );

      await polymarktethContract.write.ping()

      const logs = await  publicClient.getContractEvents({
        abi: polymarktethContract.abi,
        eventName: 'Pong', 
    })
    console.log(logs);
    expect(logs.length).to.equal(1);

    });

  });



});
