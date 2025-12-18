const { ethers } = require("ethers");
const pinataSDK = require("@pinata/sdk");
const mongoose = require("mongoose");

// Load Models
const Degree = require("../models/Degree.schema.js");
const Snapshot = require("../models/StateSnapshot.schema.js");
const SyncStatus = require("../models/SyncStatus.schema.js");

// Configuration
// Pinata setup needs to be delayed or lazy as well if we want to mock keys
// But pinata usage is inside handlers.
// Let's keep pinata instance global but check keys inside handlers if valid? 
// Or just move all config inside.

// Pinata Setup
const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_API_SECRET);



// Contract ABI (Events only)
const ABI = [
    "event DegreeIssued(uint256 indexed tokenId, address indexed to, address indexed issuer)",
    "event DegreeRevoked(uint256 indexed tokenId, address indexed student, address indexed revoker, uint256 revokedAt)",
    "event StateSnapshot(uint256 indexed snapshotId, uint256 totalDegrees, uint256 timestamp)",
    "function tokenURI(uint256 tokenId) view returns (string)",
    "function _degreeData(uint256 tokenId) view returns (tuple(string universityName, string degreeName, string fieldOfStudy, string metadataURI, uint256 issuedAt, address issuer))"
];

let provider;
let contract;

async function startIndexer() {
    try {
        console.log("🚀 Starting Indexer Service...");
        
        const RPC_URL = process.env.RPC_URL;
        const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

        if (!RPC_URL || !CONTRACT_ADDRESS) {
            console.error("❌ Missing RPC_URL or CONTRACT_ADDRESS in .env");
            return;
        }

        provider = new ethers.JsonRpcProvider(RPC_URL);
        contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

        console.log(`📡 Connected to blockchain: ${RPC_URL}`);
        console.log(`📄 Contract: ${CONTRACT_ADDRESS}`);

        // Sync missing blocks logic would go here
        
        // Listen for live events
        contract.on("DegreeIssued", handleDegreeIssued);
        contract.on("DegreeRevoked", handleDegreeRevoked);
        contract.on("StateSnapshot", handleStateSnapshot);

        console.log("👂 Listening for blockchain events...");

    } catch (error) {
        console.error("❌ Indexer Startup Error:", error);
    }
}

// Event Handler: DegreeIssued
async function handleDegreeIssued(tokenId, student, issuer, event) {
    console.log(`📖 Event: DegreeIssued (Token ID: ${tokenId})`);
    
    try {
        // 1. Fetch metadata URI from contract
        const metadataURI = await contract.tokenURI(tokenId);
        
        // 2. Fetch detailed struct data using the getter
        // Note: We need a public getter for the struct in the contract.
        // Assuming your contract has getDegreesOf or similar. Since we don't have a single-degree getter yet,
        // we will rely on metadataURI for now or fetch the student's list to find this specific one (inefficient but works).
        // OPTIMIZATION: Ideally, add `function getDegree(uint256 tokenId) external view returns (Degree memory)` to contract.
        // For now, let's proceed with metadata and basic info.
        
        // Fetch IPFS content
        let metadataJson = {};
        if (metadataURI && metadataURI.startsWith("ipfs://")) {
            const cid = metadataURI.replace("ipfs://", "");
            try {
                const response = await fetch(`${process.env.IPFS_GATEWAY_URL}/${cid}`);
                metadataJson = await response.json();
            } catch (err) {
                console.warn(`⚠️ Failed to fetch IPFS metadata for ${cid}`);
            }
        }

        // Create/Update Degree
        // We use upsert to handle cases where we might re-index or process out of order
        await Degree.findOneAndUpdate(
            { tokenId: Number(tokenId) }, 
            {
                tokenId: Number(tokenId),
                studentAddress: student.toLowerCase(),
                issuerAddress: issuer.toLowerCase(),
                metadataURI: metadataURI,
                metadataJson: metadataJson,
                // Fallback values if metadata is missing
                universityName: metadataJson.universityName || "Unknown", 
                degreeName: metadataJson.degreeName || "Unknown",
                fieldOfStudy: metadataJson.fieldOfStudy || "Unknown",
                issuedAt: new Date(), 
                blockNumber: event.log.blockNumber,
                transactionHash: event.log.transactionHash,
                revoked: false
            }, 
            { upsert: true, new: true }
        );
        console.log(`✅ Indexed Degree #${tokenId}`);

    } catch (err) {
        console.error(`❌ Error indexing DegreeIssued:`, err);
    }
}

// Event Handler: DegreeRevoked
async function handleDegreeRevoked(tokenId, student, revoker, revokedAt, event) {
    console.log(`🗑️  Event: DegreeRevoked (Token ID: ${tokenId})`);
    try {
        await Degree.findOneAndUpdate(
            { tokenId: Number(tokenId) },
            { 
                revoked: true,
                revokedAt: new Date(Number(revokedAt) * 1000),
                revokerAddress: revoker.toLowerCase()
            }
        );
        console.log(`✅ Marked Degree #${tokenId} as revoked`);
    } catch (err) {
        console.error(`❌ Error indexing DegreeRevoked:`, err);
    }
}

// Event Handler: StateSnapshot
async function handleStateSnapshot(snapshotId, totalDegrees, timestamp, event) {
    console.log(`📸 Event: StateSnapshot #${snapshotId}`);
    try {
        // 1. Get all active degrees
        const activeDegrees = await Degree.find({ revoked: false });
        
        // 2. Prepare Snapshot JSON
        const snapshotData = {
            snapshotId: Number(snapshotId),
            timestamp: Number(timestamp),
            totalDegrees: activeDegrees.length,
            degrees: activeDegrees
        };

        // 3. Upload to Pinata
        const options = {
            pinataMetadata: {
                name: `EduCheck_Snapshot_${snapshotId}`,
                keyvalues: {
                    timestamp: timestamp.toString()
                }
            }
        };

        const result = await pinata.pinJSONToIPFS(snapshotData, options);
        console.log(`☁️  Snapshot uploaded to IPFS: ${result.IpfsHash}`);

        // 4. Save Record
        await Snapshot.create({
            snapshotId: Number(snapshotId),
            totalDegrees: Number(totalDegrees),
            snapshotTimestamp: new Date(Number(timestamp) * 1000),
            ipfsCid: result.IpfsHash
        });

    } catch (err) {
        console.error(`❌ Error handling StateSnapshot:`, err);
    }
}

module.exports = { 
    startIndexer,
    handleDegreeIssued,
    handleDegreeRevoked,
    handleStateSnapshot
};
