import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("UniversityDegreesSBTModule", (m) => {
  const UniversityDegreesSBT = m.contract("UniversityDegreesSBT");

  return { UniversityDegreesSBT };
});
