import express from "express";
import { getme, register } from "../controllers/authController.js";
import { login } from "../controllers/authController.js";
import { logout } from "../controllers/authController.js";
import { verifyEmail } from "../controllers/authController.js";
import auth from "../middleware/auth.js";

const authRouter = express.Router();

authRouter.get("/me", auth, getme)
authRouter.get('/verify/:code/:email', verifyEmail)
authRouter.post("/register", register)
authRouter.post("/login", login)
authRouter.post("/logout", logout)

export default authRouter;