import express from "express";
import auth from "../middleware/auth.js";
import { getUserProfile } from "../controllers/userController.js";
import { followUnfollowUser } from "../controllers/userController.js";
import { getSuggestedUsers } from "../controllers/userController.js";
import { updateUser } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.get("/profile/:username", auth, getUserProfile);
userRouter.get("/suggested", auth, getSuggestedUsers);
userRouter.post("/follow/:id", auth, followUnfollowUser);
userRouter.post("/update", auth, updateUser);

export default userRouter;