const asyncHandler = require("express-async-handler");
const systemService = require("../services/system.service");

class SystemController {
    /**
     * Get list of all snapshots
     */
    getSnapshots = asyncHandler(async (req, res) => {
        const snapshots = await systemService.getSnapshots();
        res.status(200).json({
            success: true,
            data: snapshots
        });
    });

    /**
     * Restore database from a specific IPFS CID
     */
    restoreFromSnapshot = asyncHandler(async (req, res) => {
        const { ipfsCid } = req.body;
        
        if (!ipfsCid) {
            return res.status(400).json({
                success: false,
                message: "IPFS CID is required"
            });
        }

        const result = await systemService.restoreFromSnapshot(ipfsCid);
        res.status(200).json({
            success: true,
            data: result
        });
    });
}

module.exports = new SystemController();
