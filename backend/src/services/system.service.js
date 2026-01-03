const Degree = require("../models/Degree.schema.js");
const Snapshot = require("../models/StateSnapshot.schema.js");
const axios = require("axios");

class SystemService {
    /**
     * Get all available snapshots from database
     */
    async getSnapshots() {
        return await Snapshot.find().sort({ snapshotTimestamp: -1 });
    }

    /**
     * Restore system state from a specific IPFS CID
     * @param {string} ipfsCid 
     */
    async restoreFromSnapshot(ipfsCid) {
        try {
            console.log(`🔄 Restoring from snapshot: ${ipfsCid}`);
            
            // 1. Fetch snapshot from IPFS (using public gateway)
            const gatewayUrl = process.env.PINATA_GATEWAY_URL || "gateway.pinata.cloud";
            const response = await axios.get(`https://${gatewayUrl}/ipfs/${ipfsCid}`);
            const snapshotData = response.data;

            if (!snapshotData || !Array.isArray(snapshotData.degrees)) {
                throw new Error("Invalid snapshot data format");
            }

            console.log(`📦 Found ${snapshotData.degrees.length} degrees in snapshot`);

            // 2. Clear current degrees (careful!)
            // For safety, we could also use a merge strategy, 
            // but "restore" usually implies "replace with this state".
            // Let's use an upsert strategy to avoid complete data loss if it fails.
            
            const operations = snapshotData.degrees.map(degree => ({
                updateOne: {
                    filter: { tokenId: degree.tokenId },
                    update: { $set: degree },
                    upsert: true
                }
            }));

            if (operations.length > 0) {
                await Degree.bulkWrite(operations);
            }

            console.log("✅ Restore completed successfully");
            return {
                success: true,
                count: snapshotData.degrees.length,
                timestamp: snapshotData.timestamp
            };

        } catch (error) {
            console.error("❌ Restore failed:", error);
            throw error;
        }
    }
}

module.exports = new SystemService();
