const { ethers } = require("ethers");
const pinataSDK = require("@pinata/sdk");
const mongoose = require("mongoose");

// Load Models
const Degree = require("../models/Degree.schema.js");
const Snapshot = require("../models/Snapshot.schema.js");
const SyncStatus = require("../models/SyncStatus.schema.js");

// Configuration
const RPC_URL = process.env.RPC_URL;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_API_SECRET = process.env.PINATA_API_SECRET;

// Pinata Setup
const pinata = new pinataSDK(PINATA_API_KEY, PINATA_API_SECRET);

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
        
        if (!RPC_URL || !CONTRACT_ADDRESS) {
            console.error("❌ Missing RPC_URL or CONTRACT_ADDRESS in .env");
            return;
        }

        provider = new ethers.JsonRpcProvider(RPC_URL);
        contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

        console.log(`📡 Connected to blockchain: ${RPC_URL}`);
        console.log(`📄 Contract: ${CONTRACT_ADDRESS}`);

        // TODO: Sync historical events here if needed (omitted for brevity in basic version)
        
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
        // 1. Fetch data from blockchain
        // Note: _degreeData is internal in your contract, you might need a getter if it's not public.
        // Assuming there's a getter or using the tuple access:
        // If _degreeData is private, you need a public getter in contract like getDegree(id).
        // For now, let's assume we can get it via the custom getter you checked before or tokenURI.
        
        // Using tokenURI as primary source for metadata
        const metadataURI = await contract.tokenURI(tokenId);
        
        // Fetch IPFS content
        let metadataJson = {};
        if (metadataURI.startsWith("ipfs://")) {
            const cid = metadataURI.replace("ipfs://", "");
            try {
                const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`);
                metadataJson = await response.json();
            } catch (err) {
                console.warn(`⚠️ Failed to fetch IPFS metadata for ${cid}`);
            }
        }

        // Get on-chain details (simulating call if contract helper exists)
        // const degreeData = await contract.getDegree(tokenId); 
        // For this example, we'll placeholders or minimal data from event
        // In production: You definitely need a contract function 'getDegree(uint256)' returning the struct
        
        // Create/Update Degree
        const degree = {
            tokenId: Number(tokenId),
            studentAddress: student,
            issuerAddress: issuer,
            metadataURI: metadataURI,
            metadataJson: metadataJson,
            // These would come from contract call
            universityName: metadataJson.university || "Unknown", 
            degreeName: metadataJson.degree || "Unknown",
            fieldOfStudy: metadataJson.major || "Unknown",
            issuedAt: new Date(), // Should come from contract block time
            blockNumber: event.toJSON().blockNumber,
            transactionHash: event.toJSON().transactionHash
        };

        await Degree.findOneAndUpdate({ tokenId: Number(tokenId) }, degree, { upsert: true });
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
                revokerAddress: revoker
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
            totalDegrees: activeDegrees.length,
            snapshotTimestamp: new Date(Number(timestamp) * 1000),
            ipfsCid: result.IpfsHash
        });

    } catch (err) {
        console.error(`❌ Error handling StateSnapshot:`, err);
    }
}

module.exports = { startIndexer };
