const mongoose = require('mongoose');

const StateSnapshotSchema = new mongoose.Schema({
    snapshotId: {
        type: Number,
        required: true,
        unique: true,
        index: true
    },
    totalDegrees: {
        type: Number,
        required: true
    },
    snapshotTimestamp: {
        type: Date,
        required: true
    },
    // CID of the JSON backup on IPFS
    ipfsCid: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('StateSnapshot', StateSnapshotSchema);
