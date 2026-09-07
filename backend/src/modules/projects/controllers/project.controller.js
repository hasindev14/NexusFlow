import asyncHandler from "../../../core/asyncHandler.js";
import ApiResponse from "../../../core/ApiResponse.js";
import projectService from "../services/project.service.js";

const createProject = asyncHandler(async (req, res) => {
    const { organizationId } = req.params;

    const project = await projectService.createProject(
        organizationId,
        req.user._id,
        req.body
    );

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                project,
                "Project created successfully"
            )
        );
});
const getOrganizationProjects = asyncHandler(async (req, res) => {
    const { organizationId } = req.params;

    const result = await projectService.getOrganizationProjects(
        organizationId,
        req.user._id,
        req.query
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            result,
            "Projects fetched successfully"
        )
    );
});

const getProjectById = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    const project = await projectService.getProjectById(
        projectId,
        req.user._id
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            project,
            "Project fetched successfully"
        )
    );
});
export default {
    createProject, getOrganizationProjects, getProjectById
};