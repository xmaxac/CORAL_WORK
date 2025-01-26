import sharp from "sharp";
import fetch from "node-fetch";

const CLASSES = ["Healthy Coral", "SCTLD Coral"]
const endpoint = "http://3.23.104.34:8605/v1/models/1:predict"

export const uploadDetection = async (req, res) => {
  console.log(req)
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