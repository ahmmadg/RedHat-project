import jwt from "jsonwebtoken";
import { getSecret } from "../../config/secrets.js";

const secret = getSecret("jwt_secret", "JWT_SECRET");

if (!secret) {
  throw new Error("JWT_SECRET is not configured");
}

export const tokenService = {
  generate(payload) {
    return jwt.sign(payload, secret, {
      expiresIn: "1h",
    });
  },
};