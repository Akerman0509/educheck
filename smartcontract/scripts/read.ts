import fs from "fs";

const abi = JSON.parse(
  fs.readFileSync(
    "./artifacts/contracts/UniversityDegreesSBT.sol/UniversityDegreesSBT.json",
    "utf8"
  )
).abi;

console.log(abi);
