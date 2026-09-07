import express from "express";

import authenticateUser from "../../../middlewares/auth.middleware.js";
import validate from "../../../middlewares/validate.middleware.js";

import {
    createProjectSchema, updateProjectSchema , addProjectMemberSchema, updateProjectMemberRoleSchema
} from "../validations/project.validation.js";

import projectController from "../controllers/project.controller.js";

const router = express.Router();

// Create project
router.post(
    "/organizations/:organizationId/projects",
    authenticateUser,
    validate(createProjectSchema),
    projectController.createProject
);

// Get organization projects
router.get(
    "/organizations/:organizationId/projects",
    authenticateUser,
    projectController.getOrganizationProjects
);

// Get project by ID
router.get(
    "/projects/:projectId",
    authenticateUser,
    projectController.getProjectById
);

// Update project
router.patch(
    "/projects/:projectId",
    authenticateUser,
    validate(updateProjectSchema),
    projectController.updateProject
);

// Archive project
router.patch(
    "/projects/:projectId/archive",
    authenticateUser,
    projectController.archiveProject
);

// Add project member
router.post(
    "/projects/:projectId/members",
    authenticateUser,
    validate(addProjectMemberSchema),
    projectController.addProjectMember
);

// Get project members
router.get(
    "/projects/:projectId/members",
    authenticateUser,
    projectController.getProjectMembers
);

// Update project member role
router.patch(
    "/projects/:projectId/members/:userId",
    authenticateUser,
    validate(updateProjectMemberRoleSchema),
    projectController.updateProjectMemberRole
);

// Remove project member
router.delete(
    "/projects/:projectId/members/:userId",
    authenticateUser,
    projectController.removeProjectMember
);
export default router;