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

const updateProject = async (projectId, userId, data) => {
    const project = await Project.findById(projectId);

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    if (!project.isActive) {
        throw new ApiError(400, "Project is inactive");
    }

    // Find organization
    const organization = await Organization.findById(
        project.organization
    );

    if (!organization) {
        throw new ApiError(404, "Organization not found");
    }

    if (!organization.isActive) {
        throw new ApiError(400, "Organization is inactive");
    }

    // Check organization membership
    const membership = organization.members.find(
        (member) =>
            member.user.toString() === userId.toString()
    );

    if (!membership) {
        throw new ApiError(
            403,
            "You are not a member of this organization"
        );
    }

    // Only OWNER and ADMIN can update project
    if (!["OWNER", "ADMIN"].includes(membership.role)) {
        throw new ApiError(
            403,
            "Only organization owners and admins can update projects"
        );
    }

    // Check duplicate project key
    if (data.key && data.key !== project.key) {
        const existingProject = await Project.findOne({
            organization: project.organization,
            key: data.key,
            _id: { $ne: projectId },
        });

        if (existingProject) {
            throw new ApiError(
                409,
                "A project with this key already exists in this organization"
            );
        }
    }

    // Validate dates
    const startDate =
        data.startDate !== undefined
            ? data.startDate
            : project.startDate;

    const dueDate =
        data.dueDate !== undefined
            ? data.dueDate
            : project.dueDate;

    if (startDate && dueDate && dueDate < startDate) {
        throw new ApiError(
            400,
            "Due date cannot be earlier than start date"
        );
    }

    // Update only provided fields
    const allowedFields = [
        "name",
        "key",
        "description",
        "status",
        "visibility",
        "startDate",
        "dueDate",
    ];

    allowedFields.forEach((field) => {
        if (data[field] !== undefined) {
            project[field] = data[field];
        }
    });

    await project.save();

    return await Project.findById(project._id)
        .populate("organization", "name slug")
        .populate("owner", "firstName lastName email")
        .populate("members.user", "firstName lastName email");
};

const archiveProject = async (projectId, userId) => {
    const project = await Project.findById(projectId);

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    if (!project.isActive) {
        throw new ApiError(400, "Project is already archived");
    }

    const organization = await Organization.findById(
        project.organization
    );

    if (!organization) {
        throw new ApiError(404, "Organization not found");
    }

    if (!organization.isActive) {
        throw new ApiError(400, "Organization is inactive");
    }

    const membership = organization.members.find(
        (member) =>
            member.user.toString() === userId.toString()
    );

    if (!membership) {
        throw new ApiError(
            403,
            "You are not a member of this organization"
        );
    }

    if (!["OWNER", "ADMIN"].includes(membership.role)) {
        throw new ApiError(
            403,
            "Only organization owners and admins can archive projects"
        );
    }

    project.status = "ARCHIVED";
    project.isActive = false;

    await project.save();

    return project;
};

const addProjectMember = async (
    projectId,
    userId,
    memberUserId,
    role
) => {
    const project = await Project.findById(projectId);

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    if (!project.isActive) {
        throw new ApiError(400, "Project is archived");
    }

    const organization = await Organization.findById(
        project.organization
    );

    if (!organization) {
        throw new ApiError(404, "Organization not found");
    }

    const requester = organization.members.find(
        (member) =>
            member.user.toString() === userId.toString()
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
            "Only organization owners and admins can manage project members"
        );
    }

    // Target user must belong to organization
    const organizationMember = organization.members.find(
        (member) =>
            member.user.toString() === memberUserId.toString()
    );

    if (!organizationMember) {
        throw new ApiError(
            400,
            "User must be a member of the organization first"
        );
    }

    // Prevent duplicate project membership
    const alreadyMember = project.members.some(
        (member) =>
            member.user.toString() === memberUserId.toString()
    );

    if (alreadyMember) {
        throw new ApiError(
            409,
            "User is already a member of this project"
        );
    }

    project.members.push({
        user: memberUserId,
        role,
    });

    await project.save();

    return await Project.findById(project._id)
        .populate("organization", "name slug")
        .populate("owner", "firstName lastName email")
        .populate("members.user", "firstName lastName email");
};

const getProjectMembers = async (projectId, userId) => {
    const project = await Project.findById(projectId)
        .populate(
            "members.user",
            "firstName lastName email"
        );

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    if (!project.isActive) {
        throw new ApiError(400, "Project is archived");
    }

    const organization = await Organization.findById(
        project.organization
    );

    if (!organization) {
        throw new ApiError(404, "Organization not found");
    }

    const isOrganizationMember = organization.members.some(
        (member) =>
            member.user.toString() === userId.toString()
    );

    if (!isOrganizationMember) {
        throw new ApiError(
            403,
            "You are not a member of this organization"
        );
    }

    return project.members;
};

const updateProjectMemberRole = async (
    projectId,
    userId,
    memberUserId,
    role
) => {
    const project = await Project.findById(projectId);

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    if (!project.isActive) {
        throw new ApiError(400, "Project is archived");
    }

    const organization = await Organization.findById(
        project.organization
    );

    if (!organization) {
        throw new ApiError(404, "Organization not found");
    }

    if (!organization.isActive) {
        throw new ApiError(400, "Organization is inactive");
    }

    // Find requester in organization
    const requester = organization.members.find(
        (member) =>
            member.user.toString() === userId.toString()
    );

    if (!requester) {
        throw new ApiError(
            403,
            "You are not a member of this organization"
        );
    }

    // Only organization OWNER / ADMIN can manage members
    if (!["OWNER", "ADMIN"].includes(requester.role)) {
        throw new ApiError(
            403,
            "Only organization owners and admins can manage project members"
        );
    }

    // Find project member
    const projectMember = project.members.find(
        (member) =>
            member.user.toString() === memberUserId.toString()
    );

    if (!projectMember) {
        throw new ApiError(
            404,
            "User is not a member of this project"
        );
    }

    // Project owner cannot be changed
    if (
        project.owner.toString() ===
        memberUserId.toString()
    ) {
        throw new ApiError(
            400,
            "Project owner role cannot be changed"
        );
    }

    // Organization ADMIN can only assign MEMBER
    if (
        requester.role === "ADMIN" &&
        role !== "MEMBER"
    ) {
        throw new ApiError(
            403,
            "Organization admins can only assign the MEMBER role"
        );
    }

    projectMember.role = role;

    await project.save();

    return await Project.findById(project._id)
        .populate("organization", "name slug")
        .populate("owner", "firstName lastName email")
        .populate("members.user", "firstName lastName email");
};

const removeProjectMember = async (
    projectId,
    userId,
    memberUserId
) => {
    const project = await Project.findById(projectId);

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    if (!project.isActive) {
        throw new ApiError(400, "Project is archived");
    }

    const organization = await Organization.findById(project.organization);

    if (!organization || !organization.isActive) {
        throw new ApiError(404, "Organization not found or inactive");
    }

    const requester = organization.members.find(
        (member) => member.user.toString() === userId.toString()
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
            "Only organization owner or admin can remove project members"
        );
    }

    const memberIndex = project.members.findIndex(
        (member) => member.user.toString() === memberUserId.toString()
    );

    if (memberIndex === -1) {
        throw new ApiError(404, "User is not a member of this project");
    }

    const projectMember = project.members[memberIndex];

    // Project owner cannot be removed
    if (project.owner.toString() === memberUserId.toString()) {
        throw new ApiError(400, "Project owner cannot be removed");
    }

    // Organization ADMIN cannot remove MANAGER
    if (
        requester.role === "ADMIN" &&
        projectMember.role === "MANAGER"
    ) {
        throw new ApiError(
            403,
            "Organization admin cannot remove a project manager"
        );
    }

    // Remove member
    project.members.splice(memberIndex, 1);

    await project.save();

    await project.populate([
        { path: "organization", select: "name slug" },
        { path: "owner", select: "name email" },
        { path: "members.user", select: "name email" },
    ]);

    return project;
};
export default {
    createProject, getOrganizationProjects, getProjectById, updateProject,
    archiveProject, addProjectMember, getProjectMembers, updateProjectMemberRole,
    removeProjectMember
};