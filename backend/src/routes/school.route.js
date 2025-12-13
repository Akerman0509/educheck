const express = require("express");
const schoolRouter = express.Router();

const schoolController = require("../controllers/school.controller");
// const { authenticateToken } = require("../middlewares/auth.middleware");

// GET /school/list/trending/stamps
schoolRouter.get("/", schoolController.getTrendingStamps);

module.exports = schoolRouter;
