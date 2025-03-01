# extract video frames that has presence of SCLTD with CNN (NO YOLO)

import cv2
import numpy as np
import logging
from fastapi import FastAPI, File, UploadFile
import uvicorn
import tensorflow as tf
import base64
import time
from fastapi.middleware.cors import CORSMiddleware



app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*", 
    " https://coralbase.net", 
    "https://www.coralbase.net", 
    "https://*.coralbase.net"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


logging.basicConfig(level=logging.INFO)


@app.get("/")
async def home():
    return {"message": "hello world"}


@app.get("/testing")
async def home(): 
    return {"message": "testing"}


CLASSES = ["Healthy Coral", "SCTLD Coral"]
endpoint = "http://18.117.114.163:8605/v1/models/1:predict"

model_path = "../models/new_models/1.keras"
model = model = tf.keras.models.load_model(model_path)


def preprocess_frame(frame: np.ndarray) -> np.ndarray:
    """Preprocess frame before sending to model"""
    frame_resized = cv2.resize(frame, (224, 224))  
    frame_rgb = cv2.cvtColor(frame_resized, cv2.COLOR_BGR2RGB)
    return frame_rgb

def encode_frame_to_base64(frame: np.ndarray) -> str:
    """Encode OpenCV frame to Base64"""
    _, buffer = cv2.imencode('.jpg', frame)
    return base64.b64encode(buffer).decode('utf-8')


@app.post("/predict_video")
async def predict_video(
    file: UploadFile = File(...),
):  

    frames_batch = []
    original_frames = []
    frame_count = 0
    frame_skip = 10
    detected_frames = []

    start_time = time.time()  

    video_data = await file.read()
    print("reading video data....")
    print(f"Video data length: {len(video_data)} bytes")
    
    video_path = "temp_video.mp4" 
    with open(video_path, "wb") as f:
        f.write(video_data)
    
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        return {"error": "Could not process video"}

    while True: 
        ret, frame = cap.read()
        if not ret:
            break 
        frame_count += 1
        
        if frame_count % frame_skip == 0:
            img_batch = preprocess_frame(frame)
            frames_batch.append(img_batch)
            original_frames.append(frame)
            print(len(frames_batch))


            if len(frames_batch) == 32:
                print(f"Shape of frames_batch: {np.array(frames_batch).shape}")
                # json_data = {
                #     "instances": [frame.tolist() for frame in frames_batch]
                # }
                # response = requests.post(endpoint, json=json_data)
                # predictions = response.json().get("predictions", [])
                frames_batch_np = np.array(frames_batch)  
                predictions = model.predict(frames_batch_np)

                if len(predictions) == len(frames_batch):
                    for i, prediction in enumerate(predictions):
                        predicted_class_index = np.argmax(prediction)  
                        predicted_class = CLASSES[predicted_class_index]  
                        confidence = np.max(prediction)
                        print(f"Prediction for frame {i+1}: {predicted_class}, confidence: {confidence}")

                        if predicted_class == "SCTLD Coral" and confidence > 0.7:
                            frame_num = i + 1
                            encoded_frame = encode_frame_to_base64(original_frames[i])
                            detected_frames.append({
                                "frame_number": frame_num,
                                "frame": encoded_frame,
                                "confidence": float(confidence)
                            })
                          
                else:
                    print(f"Warning: Mismatch in predictions count. Expected {len(frames_batch)}, got {len(predictions)}.")
                frames_batch.clear()
                original_frames.clear()
       
    cap.release()
    end_time = time.time() 
    prediction_time = end_time - start_time
    return {"detected_frames": detected_frames, "prediction_time": prediction_time}


if __name__ == "__main__": 
    uvicorn.run(app, host='localhost', reload=True, port=8080)

