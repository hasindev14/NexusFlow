import express from "express";

import authenticateUser from "../../../middlewares/auth.middleware.js";
import validate from "../../../middlewares/validate.middleware.js";

import {
    createProjectSchema,
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
export default router;