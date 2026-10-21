import {
  registerUser,
  loginUser,
} from "../../config/dependencies.js";

export async function register(req, res, next) {
  try {
    const user = await registerUser(req.validatedBody);

    return res.status(201).json({
      message: "User registered successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const result = await loginUser(req.validatedBody);

    return res.status(200).json({
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}