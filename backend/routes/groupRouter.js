import express from "express";
import auth from "../middleware/auth.js";
import { createGroups, getAllGroups, getGroupById, getReports, deleteGroup } from "../controllers/groupController.js";

const groupRouter = express.Router();

groupRouter.post("/", auth, createGroups);

groupRouter.get("/all", auth, getAllGroups);

groupRouter.get("/:groupId/reports", auth, getReports)

groupRouter.get("/:groupId", auth, getGroupById);

groupRouter.delete("/:groupId", auth, deleteGroup)

export default groupRouter;