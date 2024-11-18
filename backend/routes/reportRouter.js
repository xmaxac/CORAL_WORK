import express from "express";
import { createReport } from "../controllers/reportController.js";

const reportRouter = express.Router();

reportRouter.post('/create', createReport)

export default reportRouter;