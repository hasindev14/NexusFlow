import express from "express";

import authenticateUser from "../../../middlewares/auth.middleware.js";
import validate from "../../../middlewares/validate.middleware.js";

import {
    createOrganizationSchema,
    updateOrganizationSchema,
    addMemberSchema,
    updateMemberRoleSchema,
    createInvitationSchema,
} from "../validations/organization.validation.js";

import organizationController from "../controllers/organization.controller.js";

const router = express.Router();

// Get my organizations
router.get(
    "/",
    authenticateUser,
    organizationController.getMyOrganizations
);

// Create organization
router.post(
    "/",
    authenticateUser,
    validate(createOrganizationSchema),
    organizationController.createOrganization
);

// Get my invitations
// ⚠️ Must be before /:organizationId
router.get(
    "/invitations",
    authenticateUser,
    organizationController.getMyInvitations
);

// Get organization by ID
router.get(
    "/:organizationId",
    authenticateUser,
    organizationController.getOrganizationById
);

// Update organization
router.patch(
    "/:organizationId",
    authenticateUser,
    validate(updateOrganizationSchema),
    organizationController.updateOrganization
);

// Deactivate organization
router.delete(
    "/:organizationId",
    authenticateUser,
    organizationController.deactivateOrganization
);

// Add member
router.post(
    "/:organizationId/members",
    authenticateUser,
    validate(addMemberSchema),
    organizationController.addMember
);

// Get organization members
router.get(
    "/:organizationId/members",
    authenticateUser,
    organizationController.getOrganizationMembers
);

// Update member role
router.patch(
    "/:organizationId/members/:userId",
    authenticateUser,
    validate(updateMemberRoleSchema),
    organizationController.updateMemberRole
);

// Remove member
router.delete(
    "/:organizationId/members/:userId",
    authenticateUser,
    organizationController.removeMember
);

// Leave organization
router.delete(
    "/:organizationId/leave",
    authenticateUser,
    organizationController.leaveOrganization
);

// Create invitation
router.post(
    "/:organizationId/invitations",
    authenticateUser,
    validate(createInvitationSchema),
    organizationController.createInvitation
);

export default router;