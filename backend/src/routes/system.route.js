const express = require("express");
const systemController = require("../controllers/system.controller");

const router = express.Router();

router.get("/snapshots", systemController.getSnapshots);
router.post("/restore", systemController.restoreFromSnapshot);

module.exports = router;
