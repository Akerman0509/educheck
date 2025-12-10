import { ethers } from "ethers";
import { readFileSync } from "fs";

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // deployed contract
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const adminPrivateKey =
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // private key of the admin
const targetAddress = "0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199"; // address to grant uni role

const abiPath =
    "./smartcontract/ignition/deployments/chain-31337/artifacts/UniversityDegreesSBTModule#UniversityDegreesSBT.json";
const contractJSON = JSON.parse(readFileSync(abiPath, "utf8"));
const contractABI = contractJSON.abi;

async function grantUniversityRole() {
    const adminWallet = new ethers.Wallet(adminPrivateKey, provider);
    const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        adminWallet
    );

    const UNIVERSITY_ROLE = await contract.UNIVERSITY_ROLE();
    const tx = await contract.grantRole(UNIVERSITY_ROLE, targetAddress);
    await tx.wait();

    console.log(`Granted UNIVERSITY_ROLE to ${targetAddress}`);
    console.log(`Tx Hash: ${tx.hash}`);
}

grantUniversityRole().catch(console.error);
