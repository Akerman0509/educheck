const express = require("express");
const studentRouter = express.Router();

const studentController = require("../controllers/student.controller");

// GET /
studentRouter.get("/:str", studentController.getMyDegree);

module.exports = studentRouter;