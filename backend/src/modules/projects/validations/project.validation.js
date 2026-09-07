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