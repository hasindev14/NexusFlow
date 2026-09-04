import express from "express";

import authenticateUser from "../../../middlewares/auth.middleware.js";
import validate from "../../../middlewares/validate.middleware.js";

import {
    createOrganizationSchema,
    updateOrganizationSchema, addMemberSchema,
} from "../validations/organization.validation.js";

import organizationController from "../controllers/organization.controller.js";

const router = express.Router();

router.get(
    "/",
    authenticateUser,
    organizationController.getMyOrganizations
);

router.post(
    "/",
    authenticateUser,
    validate(createOrganizationSchema),
    organizationController.createOrganization
);

router.get(
    "/:organizationId",
    authenticateUser,
    organizationController.getOrganizationById
);

router.patch(
    "/:organizationId",
    authenticateUser,
    validate(updateOrganizationSchema),
    organizationController.updateOrganization
);
router.delete(
    "/:organizationId",
    authenticateUser,
    organizationController.deactivateOrganization
);

router.post(
    "/:organizationId/members",
    authenticateUser,
    validate(addMemberSchema),
    organizationController.addMember
);

router.get(
    "/:organizationId/members",
    authenticateUser,
    organizationController.getOrganizationMembers
);
export default router;