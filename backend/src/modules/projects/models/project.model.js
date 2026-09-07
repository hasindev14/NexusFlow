import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
    {
        organization: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
        },

        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100,
        },

        key: {
            type: String,
            required: true,
            uppercase: true,
            trim: true,
            minlength: 2,
            maxlength: 10,
        },

        description: {
            type: String,
            trim: true,
            maxlength: 1000,
            default: "",
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        status: {
            type: String,
            enum: [
                "PLANNING",
                "ACTIVE",
                "ON_HOLD",
                "COMPLETED",
                "ARCHIVED",
            ],
            default: "PLANNING",
        },

        visibility: {
            type: String,
            enum: ["PRIVATE", "ORGANIZATION"],
            default: "ORGANIZATION",
        },

        startDate: {
            type: Date,
            default: null,
        },

        dueDate: {
            type: Date,
            default: null,
        },

        members: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true,
                },

                role: {
                    type: String,
                    enum: ["OWNER", "MANAGER", "MEMBER"],
                    default: "MEMBER",
                },

                joinedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Project key must be unique inside an organization
projectSchema.index(
    { organization: 1, key: 1 },
    { unique: true }
);

// Faster project lookup by organization and name
projectSchema.index({
    organization: 1,
    name: 1,
});

const Project = mongoose.model("Project", projectSchema);

export default Project;