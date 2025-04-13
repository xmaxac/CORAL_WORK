// Import required modules and functions
import express from "express"; // Express.js framework for handling HTTP requests
import { getme, register, login, logout, verifyEmail } from "../controllers/authController.js"; // Import controller functions for authentication routes
import auth from "../middleware/auth.js"; // Import authentication middleware

// Create a new router for handling authentication-related routes
const authRouter = express.Router();

// Route to fetch the logged-in user's data (protected by authentication middleware)
authRouter.get("/me", auth, getme); // The 'auth' middleware checks if the user is authenticated

// Route to verify email with a verification code and email address (used in registration process)
authRouter.get('/verify/:code/:email', verifyEmail);

// Route to register a new user (handles POST requests to create a new user)
authRouter.post("/register", register);

// Route to log in an existing user (handles POST requests for user authentication)
authRouter.post("/login", login);

// Route to log out the current user (handles POST requests to log the user out)
authRouter.post("/logout", logout);

// Export the router to be used in other parts of the application
export default authRouter;
