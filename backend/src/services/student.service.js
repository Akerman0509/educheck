const { ethers } = require("ethers");
const path = require("path");
const fs = require("fs");
const contractPath = path.join(__dirname, '../../../smartcontract/artifacts/contracts/UniversityDegreesSBT.sol/UniversityDegreesSBT.json');

let UniversityDegreesSBT;

try {
    if (fs.existsSync(contractPath)) {
        const fileContent = fs.readFileSync(contractPath, 'utf8');
        UniversityDegreesSBT = JSON.parse(fileContent);
        console.log("Load ABI successful");
    } else {
        console.error("ABI file not found at:", contractPath);
        UniversityDegreesSBT = { abi: [] };
    }
} catch (error) {
    console.error("Error loading ABI file:", error.message);
    UniversityDegreesSBT = { abi: [] };
}

class StudentService {
    constructor() {
            this.provider = new ethers.JsonRpcProvider(process.env.RPC_URL || "http://localhost:8545");
    
            const privateKey = process.env.PRIVATE_KEY;
            const contractAddress = process.env.CONTRACT_ADDRESS;
    
            if (privateKey && privateKey.startsWith('0x') && contractAddress) {
                this.wallet = new ethers.Wallet(privateKey, this.provider);
                this.contract = new ethers.Contract(
                    contractAddress,
                    UniversityDegreesSBT.abi,
                    this.wallet
                );
            } else {
                console.warn("Missing Private Key or Contract Address configuration.");
            }
        }
}

module.exports = new StudentService();