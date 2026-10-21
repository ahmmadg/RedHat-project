import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET;

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