// Import required modules and functions
import express from 'express'; // Express.js framework for handling HTTP requests
// import { getMessages } from '../controllers/chatbotController.js'; // Import the 'getMessages' function from the chatbotController
import { chatbotHandler } from '../controllers/chatbotLCController.js';

// Create a new router for handling chatbot-related routes
const chatbotRouter = express.Router();

// Route to handle receiving a message from the user and getting a response
chatbotRouter.post('/message', chatbotHandler); // The 'getMessages' function processes the POST request to interact with the chatbot

// Export the router to be used in other parts of the application
export default chatbotRouter;
