import express from "express";
import auth from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import { sendMessage, getMessages, readMessages, getConversations, getAllUsers } from "../controllers/chatController.js";

const chatRouter = express.Router();

chatRouter.post("/", auth, sendMessage);

chatRouter.get("/conversations", auth, getConversations);

chatRouter.get("/users", auth, getAllUsers);

chatRouter.get("/:userId", auth, getMessages);

chatRouter.put("/read/:userId", auth, readMessages);

export default chatRouter;