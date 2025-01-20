import express from 'express';
import { getMessages } from '../controllers/chatbotController.js';

const chatbotRouter = express.Router();

chatbotRouter.post('/message', getMessages);

export default chatbotRouter;