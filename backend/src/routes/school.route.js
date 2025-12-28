const express = require("express");
const schoolRouter = express.Router();

const schoolController = require("../controllers/school.controller");
// const { authenticateToken } = require("../middlewares/auth.middleware");

// GET /school/list/trending/stamps
schoolRouter.get("/", schoolController.getCollectionById);
// GET /school/degrees/:issuerAddress - Get degrees issued by a school
schoolRouter.get("/degrees/:issuerAddress", schoolController.getDegreesByIssuer);
// POST /school/degree - Mint degree
schoolRouter.post("/degree", schoolController.mintDegree);
// DELETE /school/degree/:tokenId - Revoke degree
schoolRouter.delete("/degree/:tokenId", schoolController.revokeDegree);
module.exports = schoolRouter;
