const requireRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }
    next();
  };
};

const requireRoles = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access: Insufficient role",
      });
    }
    next();
  };
};

module.exports = { requireRole, requireRoles };
