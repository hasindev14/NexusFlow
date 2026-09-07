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
const updateProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    const project = await projectService.updateProject(
        projectId,
        req.user._id,
        req.body
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            project,
            "Project updated successfully"
        )
    );
});

const archiveProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    const project = await projectService.archiveProject(
        projectId,
        req.user._id
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            project,
            "Project archived successfully"
        )
    );
});
const addProjectMember = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { userId, role } = req.body;

    const project = await projectService.addProjectMember(
        projectId,
        req.user._id,
        userId,
        role
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            project,
            "Project member added successfully"
        )
    );
});
const getProjectMembers = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    const members = await projectService.getProjectMembers(
        projectId,
        req.user._id
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            members,
            "Project members fetched successfully"
        )
    );
});

const updateProjectMemberRole = asyncHandler(async (req, res) => {
    const { projectId, userId } = req.params;
    const { role } = req.body;

    const project = await projectService.updateProjectMemberRole(
        projectId,
        req.user._id,
        userId,
        role
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            project,
            "Project member role updated successfully"
        )
    );
});

const removeProjectMember = asyncHandler(async (req, res) => {
    const { projectId, userId: memberUserId } = req.params;
    const userId = req.user._id;

    const project = await projectService.removeProjectMember(
        projectId,
        userId,
        memberUserId
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            project,
            "Project member removed successfully"
        )
    );
});
export default {
    createProject, getOrganizationProjects, getProjectById, updateProject,
    archiveProject, addProjectMember ,getProjectMembers, updateProjectMemberRole,
    removeProjectMember
};