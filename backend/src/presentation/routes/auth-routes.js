import { Router } from "express";
import { register, login } from "../controllers/auth-controller.js";
import { validateBody } from "../middlewares/validate-body.js";
import { registerSchema } from "../validators/register-schema.js";
import { loginSchema } from "../validators/login-schema.js";


const router = Router();

router.post("/register", validateBody(registerSchema), register);

router.post("/login", validateBody(loginSchema), login);


export default router;