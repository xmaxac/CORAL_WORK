import express from "express";
import { createReport } from "../controllers/reportController.js";
import { deleteReport } from "../controllers/reportController.js";
import { commentOnReport } from "../controllers/reportController.js";
import { likeUnlikeReport } from "../controllers/reportController.js";
import { getAllReports } from "../controllers/reportController.js";
import { getUserReports } from "../controllers/reportController.js";
import auth from "../middleware/auth.js";

const reportRouter = express.Router();

reportRouter.get('/all', auth, getAllReports)
reportRouter.get('/user/:username', auth, getUserReports)
reportRouter.post('/create', auth, createReport)
reportRouter.delete('/:id', auth, deleteReport)
reportRouter.post('/like/:id', auth, likeUnlikeReport)
reportRouter.post('/comment/:id', auth, commentOnReport)

export default reportRouter;