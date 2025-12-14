const mongoose = require('mongoose');

const DegreeSchema = new mongoose.Schema({
    tokenId: {
        type: Number,
        required: true,
        unique: true,
        index: true
    },
    studentAddress: {
        type: String,
        required: true,
        index: true,
        lowercase: true
    },
    universityName: {
        type: String,
        required: true
    },
    degreeName: {
        type: String,
        required: true
    },
    fieldOfStudy: {
        type: String,
        required: true
    },
    metadataURI: {
        type: String
    },
    // Cached IPFS data to avoid "ping/update" bottlenecks
    metadataJson: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    issuerAddress: {
        type: String,
        required: true,
        index: true,
        lowercase: true
    },
    issuedAt: {
        type: Date,
        required: true
    },
    // Revocation status
    revoked: {
        type: Boolean,
        default: false,
        index: true
    },
    revokedAt: {
        type: Date
    },
    revokerAddress: {
        type: String,
        lowercase: true
    },
    // Blockchain verification data
    blockNumber: {
        type: Number,
        required: true
    },
    transactionHash: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Degree', DegreeSchema);
