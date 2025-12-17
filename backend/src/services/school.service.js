const Degree = require("../models/Degree.schema");
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

class SchoolService {
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

    async getSchoolDegrees(_schoolId) { }

    async mintDegree(rawData) {
        try {
            console.log("Raw data received:", rawData);

            const studentAddress = rawData.studentAddress;
            const universityName = rawData.universityName || "KHTN";
            const degreeName = rawData.degreeName || "Bachelor";
            const fieldOfStudy = rawData.nganhDT || rawData.fieldOfStudy;
            const metadataURI = rawData.metadataURI;

            const tx = await this.contract.mintDegree(
                studentAddress,
                universityName,
                degreeName,
                fieldOfStudy,
                metadataURI
            );

            const receipt = await tx.wait();
            const event = receipt.logs.find(log => log.fragment && log.fragment.name === 'DegreeIssued');
            const tokenId = event ? Number(event.args[0]) : null;

            const degreeDoc = new Degree({
                tokenId: tokenId,
                studentAddress: studentAddress,
                universityName: universityName,
                degreeName: degreeName,
                fieldOfStudy: fieldOfStudy,
                metadataURI: metadataURI,
                metadataJson: rawData,

                issuerAddress: this.wallet.address,
                issuedAt: new Date(),
                blockNumber: receipt.blockNumber,
                transactionHash: receipt.hash
            });

            console.log("Save DB:", degreeDoc.universityName);

            const savedDoc = await degreeDoc.save();
            return savedDoc;

        } catch (error) {
            console.error("❌ Backend error:", error);
            throw error;
        }
    }
}

module.exports = new SchoolService();