import { ROLES } from "../utils/constants.js";

// Makes a middleware that lets only one role through.
// It must be used AFTER verifyToken (verifyToken sets req.user).
const allowOnlyRole = (role, label) => {
  return (req, res, next) => {
    // No verified user means verifyToken did not run or failed
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Logged in, but the wrong role
    if (req.user.role !== role) {
      return res.status(403).json({ success: false, message: `Only ${label} can access this` });
    }

    next();
  };
};

export const verifyStudent = allowOnlyRole(ROLES.STUDENT, "students");
export const verifyReviewer = allowOnlyRole(ROLES.REVIEWER, "reviewers");
export const verifyAdmin = allowOnlyRole(ROLES.ADMIN, "admins");