import express from "express";
import cors from "cors";
import authRoutes from "./presentation/routes/auth-routes.js";
import protectedRoutes from "./presentation/routes/protected-routes.js";

const app = express();
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Parcel Tracking API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api", protectedRoutes);


// Central error handler
app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.statusCode || 500).json({
    message:
      err.statusCode && err.statusCode < 500
        ? err.message
        : "Internal server error",
  });
});

export default app;