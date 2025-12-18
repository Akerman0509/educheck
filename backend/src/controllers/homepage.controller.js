const asyncHandler = require("express-async-handler");
const HomepageService = require('../services/homepage.service');
const { handleServiceError } = require("../utils/util1");

const getDegree = asyncHandler(async (req, res) => {
    const { str } = req.params;
    try {
        const degrees = await HomepageService.getDegree(str);
        res.status(200).json({
            success: true,
            data: degrees
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = { 
    getDegree 
};