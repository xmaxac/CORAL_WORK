import express from "express";
import auth from "../middleware/auth.js";
import { getNotifications } from "../controllers/notificationController.js";
import { deleteNotification } from "../controllers/notificationController.js";

const notificationRouter = express.Router()

notificationRouter.get("/", auth, getNotifications)
notificationRouter.delete("/", auth, deleteNotification)


export default notificationRouter;