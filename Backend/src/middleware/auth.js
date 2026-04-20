export const auth = (req, res, next) => {
  const devRole = req.headers["x-dev-role"]; // "sponsor" | "admin" | "organizer"
  const role = devRole || "admin";

  req.user = {
    _id: role === "sponsor" ? "000000000000000000000002" : "000000000000000000000001",
    role,
  };

  next();
};
