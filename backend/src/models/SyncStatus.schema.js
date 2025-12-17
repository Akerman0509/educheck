const mongoose = require('mongoose');

const SyncStatusSchema = new mongoose.Schema({
    lastBlockProcessed: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('SyncStatus', SyncStatusSchema);
