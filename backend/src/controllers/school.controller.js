const asyncHandler = require("express-async-handler");
const schoolService = require("../services/school.service");

const { handleServiceError } = require("../utils/util1");

exports.getCollectionById = asyncHandler(async (req, res) => {
    try {
        const degrees = await schoolService.getSchoolDegrees(
            req.params.schoolId
        );

        if (!degrees) {
            return res.status(404).json({ message: "No degree found" });
        }

        res.json(degrees);
    } catch (error) {
        handleServiceError(res, error);
    }
});
