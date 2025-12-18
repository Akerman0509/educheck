
const { ethers } = require("ethers");
const path = require("path");
const fs = require("fs");
const contractPath = path.join(__dirname, '../../../smartcontract/artifacts/contracts/UniversityDegreesSBT.sol/UniversityDegreesSBT.json');
const mongoose = require("mongoose");
const DegreeModel = require("../models/Degree.schema.js");

let UniversityDegreesSBT;

const dotenv = require("dotenv");
// Load .env
dotenv.config();

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

class HomepageService {
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

    async getDegree(str) {
        if (!this.contract) {
            throw new Error("Contract is not initialized.");
        }
        if (str.startsWith('0x') && str.length === 42) {
            try {
                // const degrees = await this.contract.getDegreesByStudentAddress(str);

                // query from mongodb database (always lowercase for address)
                const degrees = await DegreeModel.find({ studentAddress: str.toLowerCase() });
                const result = degrees.length > 0 ? degrees : [];
                return result;
            } catch (error) {
                console.error("Error fetching degrees by student address:", error);
                throw error;
            }
        } else {
            try {
                const degreeId = parseInt(str, 10);
                // const degree = await this.contract.getDegreeById(degreeId);
                const degree = await DegreeModel.find({ tokenId: degreeId });
                const result = degree.length > 0 ? degree[0] : null;
                return result;
            } catch (error) {
                console.error("Error fetching degree by ID:", error);
                throw error;
            }
        }
    }
}


module.exports = new HomepageService();



