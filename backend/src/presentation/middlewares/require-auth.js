import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authentication required. Provide a Bearer token.",
    });
  }

  const token = authHeader.slice("Bearer ".length).trim();

  if (!token) {
    return res.status(401).json({
      message: "Authentication token is missing.",
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });

    // Validate the claims our application expects.
    if (
      typeof payload === "string" ||
      typeof payload.sub !== "string" ||
      !["USER", "COURIER", "ADMIN"].includes(payload.role)
    ) {
      return res.status(401).json({
        message: "Invalid authentication token.",
      });
    }

    // Make the authenticated user's identity available to later middleware
    // and controllers.
    req.user = {
      id: payload.sub,
      role: payload.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired authentication token.",
    });
  }
}