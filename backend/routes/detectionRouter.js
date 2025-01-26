import express from "express";
import upload from "../middleware/upload.js";
import { uploadDetection } from "../controllers/detectionController.js";

const detectionRouter = express.Router();

detectionRouter.post("/upload", upload.single("file"), uploadDetection);

export default detectionRouter;