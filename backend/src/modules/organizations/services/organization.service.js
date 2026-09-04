import User from "../../auth/models/user.model.js";
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

const getMyOrganizations = async (userId) => {
    const organizations = await Organization.find({
        "members.user": userId,
        isActive: true,
    })
        .populate("owner", "firstName lastName email")
        .populate("members.user", "firstName lastName email")
        .sort({ createdAt: -1 });

    return organizations;
};

const getOrganizationById = async (userId, organizationId) => {
    const organization = await Organization.findOne({
        _id: organizationId,
        "members.user": userId,
        isActive: true,
    })
        .populate("owner", "firstName lastName email")
        .populate("members.user", "firstName lastName email");

    if (!organization) {
        throw new ApiError(
            404,
            "Organization not found or you are not a member"
        );
    }

    return organization;
};

const updateOrganization = async (
    userId,
    organizationId,
    data
) => {
    const organization = await Organization.findById(
        organizationId
    );

    if (!organization || !organization.isActive) {
        throw new ApiError(404, "Organization not found");
    }

    const member = organization.members.find(
        (member) => member.user.toString() === userId.toString()
    );

    if (!member) {
        throw new ApiError(
            403,
            "You are not a member of this organization"
        );
    }

    if (!["OWNER", "ADMIN"].includes(member.role)) {
        throw new ApiError(
            403,
            "You do not have permission to update this organization"
        );
    }

    if (data.name !== undefined) {
        const slug = data.name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

        const existingOrganization = await Organization.findOne({
            slug,
            _id: { $ne: organizationId },
        });

        if (existingOrganization) {
            throw new ApiError(
                409,
                "An organization with this name already exists"
            );
        }

        organization.name = data.name;
        organization.slug = slug;
    }

    if (data.description !== undefined) {
        organization.description = data.description;
    }

    await organization.save();

    return organization;
};
const deactivateOrganization = async (userId, organizationId) => {
    const organization = await Organization.findById(organizationId);

    if (!organization || !organization.isActive) {
        throw new ApiError(404, "Organization not found");
    }

    if (organization.owner.toString() !== userId.toString()) {
        throw new ApiError(
            403,
            "Only the organization owner can deactivate it"
        );
    }

    organization.isActive = false;

    await organization.save();

    return {
        organizationId: organization._id,
        isActive: organization.isActive,
    };
};

const addMember = async (
    requesterId,
    organizationId,
    userId,
    role
) => {
    const organization = await Organization.findById(organizationId);

    if (!organization || !organization.isActive) {
        throw new ApiError(404, "Organization not found");
    }

    const requester = organization.members.find(
        (member) =>
            member.user.toString() === requesterId.toString()
    );

    if (!requester) {
        throw new ApiError(
            403,
            "You are not a member of this organization"
        );
    }

    if (!["OWNER", "ADMIN"].includes(requester.role)) {
        throw new ApiError(
            403,
            "You do not have permission to add members"
        );
    }

    const existingMember = organization.members.find(
        (member) =>
            member.user.toString() === userId.toString()
    );

    if (existingMember) {
        throw new ApiError(
            409,
            "User is already a member of this organization"
        );
    }

    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    organization.members.push({
        user: userId,
        role,
    });

    await organization.save();

    await organization.populate(
        "members.user",
        "firstName lastName email"
    );

    return organization.members[
        organization.members.length - 1
    ];
};

const getOrganizationMembers = async (userId, organizationId) => {
    const organization = await Organization.findOne({
        _id: organizationId,
        isActive: true,
    }).populate(
        "members.user",
        "firstName lastName email avatar"
    );

    if (!organization) {
        throw new ApiError(404, "Organization not found");
    }

    const isMember = organization.members.some(
        (member) =>
            member.user._id.toString() === userId.toString()
    );

    if (!isMember) {
        throw new ApiError(
            403,
            "You are not a member of this organization"
        );
    }

    return organization.members;
};
export default {
    createOrganization, getMyOrganizations, getOrganizationById,
     updateOrganization, deactivateOrganization ,addMember ,getOrganizationMembers
};