import Organization from "../models/organization.model.js";
import ApiError from "../../../core/ApiError.js";

const createOrganization = async (userId, data) => {
    const { name, description } = data;

    const slug = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    const existingOrganization = await Organization.findOne({ slug });

    if (existingOrganization) {
        throw new ApiError(
            409,
            "An organization with this name already exists"
        );
    }

    const organization = await Organization.create({
        name,
        slug,
        description,
        owner: userId,
        members: [
            {
                user: userId,
                role: "OWNER",
            },
        ],
    });

    return organization;
};

export default {
    createOrganization,
};