const express = require("express");
const schoolRoutes = require("./school.route.js");
const studentRoutes = require("./student.route.js");
const homepageRoutes = require("./homepage.route.js");

const router = express.Router();

// Public Routes
router.use("/school", schoolRoutes);
router.use("/", homepageRoutes);
router.use("/student", studentRoutes);

module.exports = router;
