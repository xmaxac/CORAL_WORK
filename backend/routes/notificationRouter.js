import express from "express";
import auth from "../middleware/auth";
import { getNotifications } from "../controllers/notificationController";
import { deleteNotification } from "../controllers/notificationController";

notificationRouter = express.Router()

notificationRouter.get("/", auth, getNotifications)
notificationRouter.delete("/", auth, deleteNotification)


export default notificationRouter;