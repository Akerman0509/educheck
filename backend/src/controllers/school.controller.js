const asyncHandler = require("express-async-handler");
const SchoolService = require('../services/school.service');
const { handleServiceError } = require("../utils/util1");

const getCollectionById = asyncHandler(async (req, res) => {});

const mintDegree = async (req, res) => {
    try {
        const result = await SchoolService.mintDegree(req.body);
        
        res.status(201).json({
            success: true,
            data: result 
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = { 
    getCollectionById, 
    mintDegree 
};