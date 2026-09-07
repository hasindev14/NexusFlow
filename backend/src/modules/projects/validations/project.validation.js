import Joi from "joi";

export const createProjectSchema = Joi.object({
    name: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required(),

    key: Joi.string()
        .trim()
        .uppercase()
        .min(2)
        .max(10)
        .pattern(/^[A-Z0-9]+$/)
        .required(),

    description: Joi.string()
        .trim()
        .max(1000)
        .allow("")
        .default(""),

    status: Joi.string()
        .valid(
            "PLANNING",
            "ACTIVE",
            "ON_HOLD",
            "COMPLETED",
            "ARCHIVED"
        )
        .default("PLANNING"),

    visibility: Joi.string()
        .valid("PRIVATE", "ORGANIZATION")
        .default("ORGANIZATION"),

    startDate: Joi.date()
        .allow(null)
        .default(null),

    dueDate: Joi.date()
        .allow(null)
        .min(Joi.ref("startDate"))
        .default(null),
});

export const updateProjectSchema = Joi.object({
    name: Joi.string()
        .trim()
        .min(2)
        .max(100),

    key: Joi.string()
        .trim()
        .uppercase()
        .min(2)
        .max(10)
        .pattern(/^[A-Z0-9]+$/),

    description: Joi.string()
        .trim()
        .max(1000)
        .allow(""),

    status: Joi.string()
        .valid(
            "PLANNING",
            "ACTIVE",
            "ON_HOLD",
            "COMPLETED",
            "ARCHIVED"
        ),

    visibility: Joi.string()
        .valid("PRIVATE", "ORGANIZATION"),

    startDate: Joi.date()
        .allow(null),

    dueDate: Joi.date()
        .allow(null),
}).min(1);

export const addProjectMemberSchema = Joi.object({
    userId: Joi.string()
        .hex()
        .length(24)
        .required(),

    role: Joi.string()
        .valid("MANAGER", "MEMBER")
        .default("MEMBER"),
});

export const updateProjectMemberRoleSchema = Joi.object({
    role: Joi.string()
        .valid("MANAGER", "MEMBER")
        .required(),
});