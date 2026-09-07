import Project from "../models/project.model.js";
import Organization from "../../organizations/models/organization.model.js";
import ApiError from "../../../core/ApiError.js";

const createProject = async (organizationId, userId, data) => {
    const organization = await Organization.findById(organizationId);

    if (!organization) {
        throw new ApiError(404, "Organization not found");
    }

    if (!organization.isActive) {
        throw new ApiError(400, "Organization is inactive");
    }

    // Find requesting user's organization membership
    const membership = organization.members.find(
        (member) => member.user.toString() === userId.toString()
    );

    if (!membership) {
        throw new ApiError(
            403,
            "You are not a member of this organization"
        );
    }

    // Only OWNER and ADMIN can create projects
    if (!["OWNER", "ADMIN"].includes(membership.role)) {
        throw new ApiError(
            403,
            "Only organization owners and admins can create projects"
        );
    }

    // Check duplicate project key inside organization
    const existingProject = await Project.findOne({
        organization: organizationId,
        key: data.key,
    });

    if (existingProject) {
        throw new ApiError(
            409,
            "A project with this key already exists in this organization"
        );
    }

    const project = await Project.create({
        organization: organizationId,
        name: data.name,
        key: data.key,
        description: data.description,
        owner: userId,
        status: data.status,
        visibility: data.visibility,
        startDate: data.startDate,
        dueDate: data.dueDate,
        members: [
            {
                user: userId,
                role: "OWNER",
            },
        ],
    });

    return await Project.findById(project._id)
        .populate("organization", "name slug")
        .populate("owner", "firstName lastName email")
        .populate("members.user", "firstName lastName email");
};

const getOrganizationProjects = async (
    organizationId,
    userId,
    query
) => {
    const organization = await Organization.findById(organizationId);

    if (!organization) {
        throw new ApiError(404, "Organization not found");
    }

    if (!organization.isActive) {
        throw new ApiError(400, "Organization is inactive");
    }

    // Check whether user is a member
    const membership = organization.members.find(
        (member) => member.user.toString() === userId.toString()
    );

    if (!membership) {
        throw new ApiError(
            403,
            "You are not a member of this organization"
        );
    }

    const page = Math.max(parseInt(query.page) || 1, 1);
    const limit = Math.min(
        Math.max(parseInt(query.limit) || 10, 1),
        100
    );

    const skip = (page - 1) * limit;

    const filter = {
        organization: organizationId,
        isActive: true,
    };

    const [projects, totalProjects] = await Promise.all([
        Project.find(filter)
            .populate("owner", "firstName lastName email")
            .populate("members.user", "firstName lastName email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),

        Project.countDocuments(filter),
    ]);

    return {
        projects,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalProjects / limit),
            totalProjects,
            limit,
        },
    };
};

const getProjectById = async (projectId, userId) => {
    const project = await Project.findById(projectId)
        .populate("organization", "name slug")
        .populate("owner", "firstName lastName email")
        .populate("members.user", "firstName lastName email");

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    if (!project.isActive) {
        throw new ApiError(400, "Project is inactive");
    }

    const organization = await Organization.findById(
        project.organization._id
    );

    if (!organization) {
        throw new ApiError(404, "Organization not found");
    }

    const isMember = organization.members.some(
        (member) => member.user.toString() === userId.toString()
    );

    if (!isMember) {
        throw new ApiError(
            403,
            "You are not a member of this organization"
        );
    }

    return project;
};
export default {
    createProject, getOrganizationProjects, getProjectById,
};