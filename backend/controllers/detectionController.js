import sharp from "sharp";
import fetch from "node-fetch";
import pkg from 'form-data';
// import { spawn } from 'child_process';
// import path from 'path';
// import fs from 'fs';
// import os from 'os';
// import { v4 as uuidv4 } from 'uuid';

const CLASSES = ["Healthy Coral", "SCTLD Coral"]
// const endpoint = "http://3.23.104.34:8605/v1/models/1:predict"
const endpoint = "http://18.117.114.163:8605/v1/models/1:predict"

export const uploadDetection = async (req, res) => {
  const fileBuffer = req.file.buffer;
  const { data, info } = await sharp(fileBuffer)
    .raw()
    .resize(224, 224)
    .toBuffer({ resolveWithObject: true });
  const pixelArray = [];
  for (let i = 0; i < info.height; i++) {
    const row = [];
    for (let j = 0; j < info.width; j++) {
      const idx = (i * info.width + j) * info.channels;
      row.push([data[idx], data[idx + 1], data[idx + 2]]);
    }
    pixelArray.push(row);
  }
  const inputTensor = {
    instances: [pixelArray],
  };
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(inputTensor),
  });
  const result = await response.json();
  const predictions = result.predictions[0];
  const predictedClass = CLASSES[predictions.indexOf(Math.max(...predictions))];
  const confidence = Math.max(...predictions);
  res.json({
    confidence,
    predictedClass
  });
}

// export const videoDetection = async (req, res) => {
//   // console.log("Request Body:", req.body);
//   // console.log("Received File:", req.file);

//   if (!req.file) {
//     return res.status(400).json({ error: "No video file provided" });
//   }

//   console.log('Processing video:', req.file.originalname);

//   console.log(req.file);

//   const formData = new FormData();
//   const videoBlob = new Blob([req.file.buffer], { type: req.file.mimetype });

//   formData.append("file", videoBlob, req.file.originalname);
//   try {
//     const response = await fetch("http://18.216.127.127:8080/predict_video", {
//       method: "POST",
//       body: formData
//     });

//     const data = await response.json();

//     console.log("Response:", data);

//     res.json(data);
//   } catch (e) {
//     console.error("Error processing video:", e);
//     res.status(500).json({ error: "Error processing video" });
//   }
// }

// export const pythonCall = async (req, res) => {
//   let tempFilePath = null

//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: 'No video file provided' });
//     }

//     const tempDir = os.tmpdir();
//     const uniqueFilename = `${uuidv4()}.mp4`;
//     const tempFilePath = path.join(tempDir, uniqueFilename);

//     fs.writeFileSync(tempFilePath, req.file.buffer);

//     const pythonProcess = spawn('python', [
//       path.join(process.cwd(), 'scripts/cv3.py'),
//       tempFilePath
//     ]);

//     let result = '';
//     pythonProcess.stdout.on('data', (data) => {
//       result += data.toString();
//     });

//     pythonProcess.stderr.on('data', (data) => {
//       console.error(`Python script error: ${data}`);
//     });

//     await new Promise((resolve, reject) => {
//       pythonProcess.on('close', async (code) => {
//         try {
//           if (tempFilePath) {
//             fs.unlink(tempFilePath);
//           }
//           if (code !== 0) {
//             return res.status(500).json({ error: 'Failed to process video' });
//           }
//           try {
//             const predictions = JSON.parse(result);
//             resolve(predictions);
//           } catch (parseError) {
//             reject(new Error(`Failed to parse predictions: ${result}`));
//           }
//         } catch (e) {
//           console.error('Error during cleanup:', e);
//           reject(e);
//         }
//       });
//       pythonProcess.on('error', (err) => {
//         reject(new Error(`Failed to start Python process: ${err.message}`));
//       });
//     })
//       .then(predictions => {
//         res.json(predictions);
//       })
//       .catch(error => {
//         throw error;
//       });

//   } catch (error) {
//     console.error('Error processing video:', error);

//     // Cleanup on error
//     if (tempFilePath) {
//       try {
//         await fs.unlink(tempFilePath);
//       } catch (cleanupError) {
//         console.error('Error cleaning up temporary file:', cleanupError);
//       }
//     }

//     res.status(500).json({
//       error: 'Failed to process video',
//       details: error.message
//     });
//   }
// };