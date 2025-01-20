import express from "express";
import auth from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import { getUserProfile } from "../controllers/userController.js";
import { followUnfollowUser } from "../controllers/userController.js";
import { getSuggestedUsers } from "../controllers/userController.js";
import { updateUser } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.get("/profile/:username", auth, getUserProfile);
userRouter.get("/suggested", auth, getSuggestedUsers);
userRouter.post("/follow/:id", auth, followUnfollowUser);
userRouter.post("/update", auth, upload.fields([
  { name: 'profileImg', maxCount: 1 },
  { name: 'coverImg', maxCount: 1 }
]), 
  updateUser
);

export default userRouter;