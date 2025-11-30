import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("UniversityDegreesSBTModule", (m) => {
  const sbt = m.contract("UniversityDegreesSBT", [
    "University Degrees SBT", // name
    "UDSBT", // symbol
  ]);

  return { sbt };
});
