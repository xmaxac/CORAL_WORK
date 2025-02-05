import express from "express";
import upload from "../middleware/upload.js";
import { createReport, getLatestReports, getLikeStatus, getTopCountries } from "../controllers/reportController.js";
import { deleteReport } from "../controllers/reportController.js";
import { commentOnReport } from "../controllers/reportController.js";
import { likeUnlikeReport } from "../controllers/reportController.js";
import { getAllReports } from "../controllers/reportController.js";
import { getUserReports } from "../controllers/reportController.js";
import auth from "../middleware/auth.js";

const reportRouter = express.Router();

reportRouter.get('/all', getAllReports)
reportRouter.get('/user/:username', auth, getUserReports)
reportRouter.post('/create', auth, upload.fields([
  {name: 'images', maxCount:10}
]), createReport)
reportRouter.delete('/:id', auth, deleteReport)
reportRouter.get('/like/:id', auth, likeUnlikeReport)
reportRouter.get('/like-status/:id', auth, getLikeStatus)
reportRouter.post('/comment/:id', auth, commentOnReport)
reportRouter.get('/country', auth, getTopCountries)
reportRouter.get('/latest-reports', auth, getLatestReports)

export default reportRouter;