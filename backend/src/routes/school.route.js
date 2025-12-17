const express = require("express");
const schoolRouter = express.Router();

const schoolController = require("../controllers/school.controller");
// const { authenticateToken } = require("../middlewares/auth.middleware");

// GET /school/list/trending/stamps
schoolRouter.get("/", schoolController.getCollectionById);
// POST /school/mint
schoolRouter.post("/mint", schoolController.mintDegree);
module.exports = schoolRouter;
