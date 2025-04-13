
# DEPRECATED FILE!!! THIS WAS THE CODE BEFORE DEBUGGING!! DOES NOT SUPPORT BATCH PROCESSING AND HAS THE WRONG PROCESSES!! 

import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from modules import img_preprocessing as imgp
from modules import yolo_processing as yp

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import io
import tempfile
from dotenv import load_dotenv


import cv2 
import base64

from ultralytics import YOLO
import tensorflow as tf



app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*", 
    " https://coralbase.net", 
    "https://www.coralbase.net", 
    "https://*.coralbase.net", 
    "https://api.coralbase.net"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CDYOLO_MODEL = YOLO("models/yolo_models/CD_yolo.pt")
SCTLDCNN_MODEL = tf.keras.models.load_model("models/1_ver/1.keras")

@app.get("/")
def home(): 
    return {"messsage": "YOLO main.py is working!"} 

@app.post("/coralDetection_img/{conf_threshold}")
async def coralDetection_img(
    conf_threshold: float, 
    file: UploadFile = File(...)
                             ):
    image_data = await file.read()
    print(f"Received file with size: {len(image_data)} bytes")
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp_file:
        temp_file.write(image_data)
        temp_file_path = temp_file.name
    print("Temporary file saved at:", temp_file_path)
    img_nparray = cv2.imread(temp_file_path)

    image_array = imgp.convert_color_type(yp.draw_prediction_yolo(model_yolo=CDYOLO_MODEL, image_array=img_nparray, conf_threshold=conf_threshold))

    _, img_encoded = cv2.imencode('.jpg', image_array)
    img_bytes = img_encoded.tobytes()
    img_base64 = base64.b64encode(img_bytes).decode('utf-8')

    return img_base64

@app.post("/coralDetection_imgstreaming/{conf_threshold}")
async def coralDetection_imgstreaming(
    conf_threshold: float, 
    file: UploadFile = File(...)
    ):
    image_data = await file.read()
    print(f"Received file with size: {len(image_data)} bytes")
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp_file:
        temp_file.write(image_data)
        temp_file_path = temp_file.name
    print("Temporary file saved at:", temp_file_path)
    img_nparray = cv2.imread(temp_file_path)

    image_array = imgp.convert_color_type(yp.draw_prediction_yolo(model_yolo=CDYOLO_MODEL, image_array=img_nparray, conf_threshold=0.5))

    _, img_encoded = cv2.imencode('.jpg', image_array)

    # Convert the encoded image to a byte stream
    img_bytes = io.BytesIO(img_encoded.tobytes())

    # Return the byte stream as a response
    return StreamingResponse(img_bytes, media_type="image/jpeg")


@app.post("/sctldDetection_img/{conf_threshold_yolo}/{conf_threshold_sctldcnn}")
async def sctldDetection_img(
    conf_threshold_yolo: float, 
    conf_threshold_sctldcnn: float,
    file: UploadFile = File(...)
    ):
    image_data = await file.read()
    print(f"Received file with size: {len(image_data)} bytes")
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp_file:
        temp_file.write(image_data)
        temp_file_path = temp_file.name
    print("Temporary file saved at:", temp_file_path)
    img_nparray = cv2.imread(temp_file_path)

    image_array = yp.draw_prediction_sctldcnnxyolo(image_array=img_nparray, model_yolo=CDYOLO_MODEL, model_sctldcnn=SCTLDCNN_MODEL)
    
    _, img_encoded = cv2.imencode('.jpg', image_array)
    img_bytes = img_encoded.tobytes()
    img_base64 = base64.b64encode(img_bytes).decode('utf-8')
    
    return img_base64



@app.post("/sctldDetection_imgstreaming/{conf_threshold_yolo}/{conf_threshold_sctldcnn}")
async def sctldDetection_imgstreaming(
    conf_threshold_yolo: float, 
    conf_threshold_sctldcnn: float,
    file: UploadFile = File(...)
    ):
    image_data = await file.read()
    print(f"Received file with size: {len(image_data)} bytes")
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp_file:
        temp_file.write(image_data)
        temp_file_path = temp_file.name
    print("Temporary file saved at:", temp_file_path)
    img_nparray = cv2.imread(temp_file_path)

    image_array = yp.draw_prediction_sctldcnnxyolo(image_array=img_nparray, model_yolo=CDYOLO_MODEL, model_sctldcnn=SCTLDCNN_MODEL, conf_threshold_scltdcnn=conf_threshold_sctldcnn, conf_threshold_yolo=conf_threshold_yolo)
    
       # Encode the image as JPEG
    _, img_encoded = cv2.imencode('.jpg', image_array)

    # Convert the encoded image to a byte stream
    img_bytes = io.BytesIO(img_encoded.tobytes())

    return StreamingResponse(img_bytes, media_type="image/jpeg")


@app.post("/sctldDetection_video/{frame_skip}/{conf_threshold_yolo}/{conf_threshold_sctldcnn}")
async def sctldDetection_video(
    frame_skip: int,
    conf_threshold_yolo: float,
    conf_threshold_sctldcnn: float,
    file: UploadFile = File(...)
):
    load_dotenv()
    video_data = await file.read()

    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_file:
        temp_file.write(video_data)
        temp_file_path = temp_file.name  

    print("Temporary file saved at:", temp_file_path)

    # Define the S3 key for storing the video
    s3_key = f"processed_videos/{file.filename}"

    print(os.getenv("REGION"))

    # Call the function to process the video and upload to S3
    url = yp.draw_videoprediction_sctldcnnxyolo_download(
        model_yolo=CDYOLO_MODEL,  
        model_sctldcnn=SCTLDCNN_MODEL,  
        video_path=temp_file_path,
        s3_ID=os.getenv("ID"),
        s3_key=os.getenv("KEY"),
        s3_REGION=os.getenv("REGION"),
        frame_skip=frame_skip,  
        conf_threshold_yolo=conf_threshold_yolo,  
        conf_threshold_scltdcnn=conf_threshold_sctldcnn 
    )

    return {"url": url}



