/**
 * OpenAI Chatbot Handler
 * 
 * This module handles AI-generated responses for inquiries about 
 * Stony Coral Tissue Loss Disease (SCTLD). It interacts with OpenAI's API
 * to generate informative and concise responses based on user messages.
 */

import OpenAI from "openai";

// Initialize OpenAI instance with API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Handles incoming user messages and fetches a response from OpenAI.
 * 
 * - Accepts an array of messages from the request body.
 * - Adds a system message to ensure responses stay focused on SCTLD.
 * - Calls OpenAI's chat completion API with specified parameters.
 * - Returns the AI-generated message as JSON.
 * 
 * @param {Object} req - Express request object containing user messages.
 * @param {Object} res - Express response object for sending the AI response.
 */
export const getMessages = async (req, res) => {
  try {
    const { messages } = req.body;

    // System message to guide AI behavior
    const systemMessage = {
      role: 'system',
      content: `You are a helpful expert on Stony Coral Tissue Loss Disease (SCTLD). 
      Provide accurate, scientific information about SCTLD, its effects on coral reefs, 
      prevention methods, and current research. Keep responses clear and concise.`,
    };

    // Request AI completion with user messages
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [systemMessage, ...messages],
      temperature: 0.7, // Controls randomness of responses
      max_tokens: 500, // Limits response length
    });

    // Return AI-generated response
    return res.status(200).json({ message: completion.choices[0].message.content });
  } catch (e) {
    console.error('OpenAI API Error:', e);
    return res.status(500).json({ message: 'Failed to get response from OpenAI' });
  }
};
