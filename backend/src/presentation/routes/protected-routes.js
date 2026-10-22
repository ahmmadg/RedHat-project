import { Router } from "express";
import { requireAuth } from "../middlewares/require-auth.js";

const router = Router();

// Dummy endpoint: requires a valid JWT
router.get("/test-auth", requireAuth, (req, res) => {
  res.status(200).json({
    message: "Token is valid. Authentication successful!",
    user: req.user,
  });
});

export default router;