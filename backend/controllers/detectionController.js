/**
 * Image Detection Handler
 * 
 * This module processes uploaded images and classifies them as either
 * "Healthy Coral" or "SCTLD Coral" using a machine learning model.
 * 
 * - Resizes the image to 224x224 pixels
 * - Converts the image into a raw pixel array
 * - Sends the pixel data to a remote ML model for classification
 * - Returns the predicted class and confidence score
 */

import sharp from "sharp";
import fetch from "node-fetch";
import pkg from 'form-data';

// Class labels for model prediction
const CLASSES = ["Healthy Coral", "SCTLD Coral"];
// Remote machine learning model endpoint
const endpoint = "http://18.216.46.121:8605/v1/models/1:predict";

/**
 * Handles image uploads and processes them for SCTLD detection.
 * 
 * - Extracts the image buffer from the request
 * - Resizes and converts it into a pixel array
 * - Sends the pixel array to the ML model for classification
 * - Returns the predicted class and confidence score
 * 
 * @param {Object} req - Express request object containing the uploaded image.
 * @param {Object} res - Express response object to send classification results.
 */
export const uploadDetection = async (req, res) => {
  // Extract image buffer from request
  const fileBuffer = req.file.buffer;
  
  // Process image using Sharp (resize and extract pixel data)
  const { data, info } = await sharp(fileBuffer)
    .raw()
    .resize(224, 224)
    .toBuffer({ resolveWithObject: true });
  
  // Convert image data into a 3D pixel array (height x width x RGB channels)
  const pixelArray = [];
  for (let i = 0; i < info.height; i++) {
    const row = [];
    for (let j = 0; j < info.width; j++) {
      const idx = (i * info.width + j) * info.channels;
      row.push([data[idx], data[idx + 1], data[idx + 2]]);
    }
    pixelArray.push(row);
  }
  
  // Create input tensor for model prediction
  const inputTensor = {
    instances: [pixelArray],
  };
  
  // Send image data to the ML model endpoint
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(inputTensor),
  });
  
  // Parse model response
  const result = await response.json();
  const predictions = result.predictions[0];
  
  // Determine the class with the highest confidence
  const predictedClass = CLASSES[predictions.indexOf(Math.max(...predictions))];
  const confidence = Math.max(...predictions);
  
  // Return classification results
  res.json({
    confidence,
    predictedClass
  });
};
