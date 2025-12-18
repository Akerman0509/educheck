const express = require("express");
const homepageRouter = express.Router();

const homepageController = require("../controllers/homepage.controller");
// const { authenticateToken } = require("../middlewares/auth.middleware");

// GET /
homepageRouter.get("/:str", homepageController.getDegree);

module.exports = homepageRouter;
