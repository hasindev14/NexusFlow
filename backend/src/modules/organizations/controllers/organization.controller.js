import asyncHandler from "../../../core/asyncHandler.js";
import ApiResponse from "../../../core/ApiResponse.js";
import organizationService from "../services/organization.service.js";

const createOrganization = asyncHandler(async (req, res) => {
    const organization = await organizationService.createOrganization(
        req.user._id,
        req.body
    );

    return res.status(201).json(
        new ApiResponse(
            201,
            "Organization created successfully",
            organization
        )
    );
});

export default {
    createOrganization,
};