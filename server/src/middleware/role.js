function allowRoles(...roles) {
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role) return res.status(401).json({ message: "Unauthorized" });
    if (!roles.includes(role)) return res.status(403).json({ message: "Forbidden: insufficient role" });
    next();
  };
}

module.exports = { allowRoles };
