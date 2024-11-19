// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { parseEther } from "viem";

const JAN_1ST_2030 = 1893456000;
const ONE_GWEI: bigint = parseEther("0.001");

const PolymarktethModule = buildModule("PolymarktethModule", (m) => {
  const unlockTime = m.getParameter("unlockTime", JAN_1ST_2030);
  const lockedAmount = m.getParameter("lockedAmount", ONE_GWEI);

  const PolymarktethContract = m.contract("Polymarkteth", [unlockTime], {
    value: lockedAmount,
  });

  return { PolymarktethContract };
});

export default PolymarktethModule;
