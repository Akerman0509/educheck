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
        // Read-only provider (no wallet needed - transactions done in frontend)
        this.provider = new ethers.JsonRpcProvider(process.env.RPC_URL || "http://localhost:8545");
        const contractAddress = process.env.CONTRACT_ADDRESS;

        if (contractAddress) {
            // Read-only contract instance for querying
            this.contract = new ethers.Contract(
                contractAddress,
                UniversityDegreesSBT.abi,
                this.provider
            );
        } else {
            console.warn("Missing Contract Address configuration.");
        }
    }

    async getSchoolDegrees(issuerAddress) {
        try {
            const degrees = await Degree.find({ 
                issuerAddress: issuerAddress.toLowerCase(),
                revoked: false 
            }).sort({ issuedAt: -1 });
            
            return degrees;
        } catch (error) {
            console.error("Error fetching school degrees:", error);
            throw error;
        }
    }

    async saveDegree(degreeData) {
        try {
            console.log("Saving degree to database:", degreeData);
            
            // Save degree to database after frontend completes blockchain transaction
            const degree = new Degree({
                tokenId: degreeData.tokenId,
                studentAddress: degreeData.studentAddress.toLowerCase(),
                universityName: degreeData.universityName || '',
                degreeName: degreeData.degreeName,
                fieldOfStudy: degreeData.fieldOfStudy || degreeData.graduationYear || '',
                metadataURI: degreeData.ipfsHash,
                metadataJson: {
                    studentName: degreeData.studentName,
                    certificateNumber: degreeData.certificateNumber,
                    dateOfBirth: degreeData.dateOfBirth,
                    graduationYear: degreeData.graduationYear,
                    degreeFileCID: degreeData.degreeFileCID
                },
                issuerAddress: degreeData.issuer?.toLowerCase() || degreeData.issuerAddress?.toLowerCase(),
                issuedAt: degreeData.issuedAt || new Date(),
                blockNumber: degreeData.blockNumber || 0,
                transactionHash: degreeData.transactionHash
            });

            await degree.save();
            
            return {
                success: true,
                message: "Degree saved to database"
            };
        } catch (error) {
            console.error("Backend error saving degree:", error);
            throw error;
        }
    }
    async deleteDegree(tokenId) {
        try {
            // Delete degree from database after frontend completes blockchain transaction
            const result = await Degree.deleteOne({ tokenId: tokenId });

            if (result.deletedCount === 0) {
                return {
                    success: false,
                    message: "Degree not found in database"
                };
            }

            return {
                success: true,
                message: "Degree deleted from database"
            };
        } catch (error) {
            console.error("Backend error deleting degree:", error);
            throw error;
        }
    } 
}

module.exports = new SchoolService();