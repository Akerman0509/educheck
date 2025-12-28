const asyncHandler = require("express-async-handler");
const SchoolService = require('../services/school.service');
const { handleServiceError } = require("../utils/util1");

const getCollectionById = asyncHandler(async (req, res) => {});

const getDegreesByIssuer = asyncHandler(async (req, res) => {
    try {
        const { issuerAddress } = req.params;
        const degrees = await SchoolService.getSchoolDegrees(issuerAddress);
        res.status(200).json({
            success: true,
            data: degrees
        });
    } catch (error) {
        handleServiceError(res, error);
    }
});

const mintDegree = async (req, res) => {
    try {
        // Frontend already completed blockchain transaction
        // Backend only saves to database
        const result = await SchoolService.saveDegree(req.body);
        
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

const revokeDegree = asyncHandler(async (req, res) => {
    try {
        // Frontend already completed blockchain transaction
        // Backend only deletes from database
        const result = await SchoolService.deleteDegree(req.body.tokenId);
        res.status(200).json({
            success: true,
            data: result 
        });
    } catch (error) {
        handleServiceError(res, error);
    }
});

module.exports = { 
    getCollectionById, 
    getDegreesByIssuer,
    mintDegree,
    revokeDegree
};