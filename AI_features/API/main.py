import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
from fastapi import FastAPI, File, UploadFile
import uvicorn
import logging
import numpy as np
from io import BytesIO
from PIL import Image
import tensorflow as tf
import requests


CLASSES = ["Unaffected Coral", "SCTLD Coral"]
endpoint = "http://3.23.104.34:8605/v1/models/1:predict"

app = FastAPI()


@app.get("/")
async def hi(): 
    return {"message": "Hello, World!"}

logging.basicConfig(level=logging.INFO)

def read_file_as_image(data) -> np.ndarray: 
    image = np.array(Image.open(BytesIO(data)))
    return image

@app.post("/predict")
async def predict(
    file: UploadFile = File(...)
):  
    image = read_file_as_image(await file.read())
    img_batch = np.expand_dims(image, 0)
    json_data = {
        "instances": img_batch.tolist()
    }

    response = requests.post(endpoint, json=json_data)
    prediction = np.array(response.json()["predictions"][0])

    # Get the predicted class and confidence
    predicted_class = CLASSES[np.argmax(prediction)]  # Fix this line
    confidence = np.max(prediction)
    return { 
        "predicted_class": str(predicted_class),
        "confidence": str(confidence)
        
    }



if __name__ == "__main__": 
    uvicorn.run(app, host='localhost', port=8000, reload=True) 
