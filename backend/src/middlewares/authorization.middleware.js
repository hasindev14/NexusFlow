import ApiError from "../core/ApiError.js";

const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            throw new ApiError(401, "Authentication required");
        }

        if (!allowedRoles.includes(req.user.role)) {
            throw new ApiError(
                403,
                "You do not have permission to perform this action"
            );
        }

        next();
    };
};

export default authorizeRoles;