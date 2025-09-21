// backend/middleware/authorize.js
const authorize = (requiredPermissions) => {
  return (req, res, next) => {
    const user = req.user; // must be set by your auth middleware (like JWT/session)

    if (!user || !user.permissions) {
      return res.status(403).json({ message: "Access denied" });
    }

    for (const key of Object.keys(requiredPermissions)) {
      if (requiredPermissions[key] && !user.permissions[key]) {
        return res.status(403).json({ message: "Permission denied: " + key });
      }
    }

    next();
  };
};

module.exports = authorize;
