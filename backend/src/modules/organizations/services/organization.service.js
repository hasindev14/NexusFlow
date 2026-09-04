import crypto from "crypto";
import User from "../../auth/models/user.model.js";
import Invitation from "../models/invitation.model.js";
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
const updateMemberRole = async (
    requesterId,
    organizationId,
    userId,
    newRole
) => {
    const organization = await Organization.findById(organizationId);

    if (!organization || !organization.isActive) {
        throw new ApiError(404, "Organization not found");
    }

    // Find requester
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

    // Only OWNER or ADMIN can update roles
    if (!["OWNER", "ADMIN"].includes(requester.role)) {
        throw new ApiError(
            403,
            "You do not have permission to update member roles"
        );
    }

    // Find target member
    const targetMember = organization.members.find(
        (member) =>
            member.user.toString() === userId.toString()
    );

    if (!targetMember) {
        throw new ApiError(
            404,
            "Member not found in this organization"
        );
    }

    // OWNER role cannot be changed
    if (targetMember.role === "OWNER") {
        throw new ApiError(
            403,
            "The organization owner role cannot be changed"
        );
    }

    // ADMIN can only modify MEMBER
    if (
        requester.role === "ADMIN" &&
        targetMember.role !== "MEMBER"
    ) {
        throw new ApiError(
            403,
            "Admins can only update MEMBER roles"
        );
    }

    targetMember.role = newRole;

    await organization.save();

    await organization.populate(
        "members.user",
        "firstName lastName email"
    );

    return organization.members.find(
        (member) =>
            member.user._id.toString() === userId.toString()
    );
};
const removeMember = async (
    requesterId,
    organizationId,
    userId
) => {
    const organization = await Organization.findById(organizationId);

    if (!organization || !organization.isActive) {
        throw new ApiError(404, "Organization not found");
    }

    // Find requester
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

    // Only OWNER or ADMIN can remove members
    if (!["OWNER", "ADMIN"].includes(requester.role)) {
        throw new ApiError(
            403,
            "You do not have permission to remove members"
        );
    }

    // Prevent removing yourself
    if (requesterId.toString() === userId.toString()) {
        throw new ApiError(
            400,
            "You cannot remove yourself from the organization"
        );
    }

    // Find target member
    const targetMember = organization.members.find(
        (member) =>
            member.user.toString() === userId.toString()
    );

    if (!targetMember) {
        throw new ApiError(
            404,
            "Member not found in this organization"
        );
    }

    // Owner cannot be removed
    if (targetMember.role === "OWNER") {
        throw new ApiError(
            403,
            "The organization owner cannot be removed"
        );
    }

    // Admin can only remove MEMBER
    if (
        requester.role === "ADMIN" &&
        targetMember.role !== "MEMBER"
    ) {
        throw new ApiError(
            403,
            "Admins can only remove MEMBER users"
        );
    }

    organization.members = organization.members.filter(
        (member) =>
            member.user.toString() !== userId.toString()
    );

    await organization.save();

    return {
        userId,
        organizationId,
        removed: true,
    };
};
const leaveOrganization = async (
    userId,
    organizationId
) => {
    const organization = await Organization.findById(
        organizationId
    );

    if (!organization || !organization.isActive) {
        throw new ApiError(
            404,
            "Organization not found"
        );
    }

    const member = organization.members.find(
        (member) =>
            member.user.toString() === userId.toString()
    );

    if (!member) {
        throw new ApiError(
            403,
            "You are not a member of this organization"
        );
    }

    // Owner cannot leave
    if (member.role === "OWNER") {
        throw new ApiError(
            400,
            "Organization owner cannot leave the organization"
        );
    }

    organization.members = organization.members.filter(
        (member) =>
            member.user.toString() !== userId.toString()
    );

    await organization.save();

    return {
        organizationId: organization._id,
        userId,
        left: true,
    };
};
const createInvitation = async (
    requesterId,
    organizationId,
    email,
    role
) => {
    const organization = await Organization.findById(
        organizationId
    );

    if (!organization || !organization.isActive) {
        throw new ApiError(
            404,
            "Organization not found"
        );
    }

    const requester = organization.members.find(
        (member) =>
            member.user.toString() ===
            requesterId.toString()
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
            "You do not have permission to invite users"
        );
    }

    // Find invited user
    const user = await User.findOne({
        email: email.toLowerCase(),
    });

    if (!user) {
        throw new ApiError(
            404,
            "No user exists with this email"
        );
    }

    // Check existing member
    const existingMember = organization.members.find(
        (member) =>
            member.user.toString() ===
            user._id.toString()
    );

    if (existingMember) {
        throw new ApiError(
            409,
            "User is already a member of this organization"
        );
    }

    // Check pending invitation
    const existingInvitation =
        await Invitation.findOne({
            organization: organizationId,
            email: email.toLowerCase(),
            status: "PENDING",
            expiresAt: { $gt: new Date() },
        });

    if (existingInvitation) {
        throw new ApiError(
            409,
            "A pending invitation already exists for this user"
        );
    }

    const token = crypto
        .randomBytes(32)
        .toString("hex");

    const expiresAt = new Date(
        Date.now() + 24 * 60 * 60 * 1000
    );

    const invitation = await Invitation.create({
        organization: organizationId,
        invitedBy: requesterId,
        email: email.toLowerCase(),
        role,
        token,
        expiresAt,
    });

    return invitation;
};
const getMyInvitations = async (userId) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const invitations = await Invitation.find({
        email: user.email.toLowerCase(),
        status: "PENDING",
        expiresAt: { $gt: new Date() },
    })
        .populate("organization", "name slug description")
        .populate("invitedBy", "firstName lastName email")
        .sort({ createdAt: -1 });

    return invitations;
};
export default {
    createOrganization, getMyOrganizations, getOrganizationById,
     updateOrganization, deactivateOrganization ,addMember ,
     getOrganizationMembers, updateMemberRole, removeMember, leaveOrganization,
     createInvitation, getMyInvitations
};