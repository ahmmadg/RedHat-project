import { UserRole, VALID_ROLES } from "../../domain/enums/user-role.js";

export function authorizeRoles(...allowedRoles) {
  const invalidRoles = allowedRoles.filter(
    (role) => !VALID_ROLES.includes(role)
  );

  if (invalidRoles.length > 0) {
    throw new Error(
      `Invalid authorization role: ${invalidRoles.join(", ")}`
    );
  }

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "You do not have permission to access this resource.",
      });
    }

    next();
  };
}