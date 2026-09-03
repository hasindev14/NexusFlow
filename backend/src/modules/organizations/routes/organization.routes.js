import express from "express";
import authenticateUser from "../../../middlewares/auth.middleware.js";
import validate from "../../../middlewares/validate.middleware.js";
import {
    createOrganizationSchema,
} from "../validations/organization.validation.js";
import organizationController from "../controllers/organization.controller.js";

const router = express.Router();

router.post(
    "/",
    authenticateUser,
    validate(createOrganizationSchema),
    organizationController.createOrganization
);

export default router;