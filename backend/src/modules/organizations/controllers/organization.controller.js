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

const getMyOrganizations = asyncHandler(async (req, res) => {
    const organizations = await organizationService.getMyOrganizations(
        req.user._id
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Organizations fetched successfully",
            organizations
        )
    );
});

const getOrganizationById = asyncHandler(async (req, res) => {
    const organization = await organizationService.getOrganizationById(
        req.user._id,
        req.params.organizationId
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Organization fetched successfully",
            organization
        )
    );
});

const updateOrganization = asyncHandler(async (req, res) => {
    const organization = await organizationService.updateOrganization(
        req.user._id,
        req.params.organizationId,
        req.body
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Organization updated successfully",
            organization
        )
    );
});
const deactivateOrganization = asyncHandler(async (req, res) => {
    const result = await organizationService.deactivateOrganization(
        req.user._id,
        req.params.organizationId
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Organization deactivated successfully",
            result
        )
    );
});
const addMember = asyncHandler(async (req, res) => {
    const member = await organizationService.addMember(
        req.user._id,
        req.params.organizationId,
        req.body.userId,
        req.body.role
    );

    return res.status(201).json(
        new ApiResponse(
            201,
            "Member added successfully",
            member
        )
    );
});
export default {
    createOrganization, getMyOrganizations, getOrganizationById, 
    updateOrganization, deactivateOrganization , addMember
};