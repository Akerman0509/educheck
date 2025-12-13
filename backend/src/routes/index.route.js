const express = require("express");
const schoolRoutes = require("./school.route.js");
// const studentRoutes = require("./school.student.js");

const router = express.Router();

// Public Routes
router.use("/school", schoolRoutes);
// router.use("/student", studentRoutes);

module.exports = router;
