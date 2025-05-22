import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import modules.img_preprocessing as imgp
import modules.yolo_preprocessing as yp

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import io
import tempfile
from dotenv import load_dotenv
from fastapi.responses import JSONResponse
import cv2 
import base64
from pydantic import BaseModel

from ultralytics import YOLO
import tensorflow as tf

app = FastAPI()

# defualt models to use for inference
CDYOLO_MODEL = YOLO("models/YOLO_models/2_ver/best.pt") # coral object detection
SCTLDCNN_MODEL = tf.keras.models.load_model("models/CNN_models/1_ver/1.keras") # sctld classification

def load_models():
    global CDYOLO_MODEL, SCTLDCNN_MODEL
    CDYOLO_MODEL = YOLO(CDYOLO_MODEL)
    SCTLDCNN_MODEL = tf.keras.models.load_model(SCTLDCNN_MODEL)
    load_models()


class ModelPaths(BaseModel):
    yolo_path: str
    cnn_path: str


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

@app.get("/")
def home():
    return {"messsage": "YOLO main.py is working!"} 


# dynamic updating the models incase for any internal improvements!
@app.post("/upload-models/")
async def upload_models(
    yolo_model: UploadFile = File(...),
    cnn_model: UploadFile = File(...)
):
    import shutil

    # Save YOLO model to temp file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pt") as yolo_temp:
        shutil.copyfileobj(yolo_model.file, yolo_temp)
        yolo_temp_path = yolo_temp.name

    # Save CNN model to temp file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".keras") as cnn_temp:
        shutil.copyfileobj(cnn_model.file, cnn_temp)
        cnn_temp_path = cnn_temp.name

    try:
        new_yolo_model = YOLO(yolo_temp_path)
        new_cnn_model = tf.keras.models.load_model(cnn_temp_path)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to load models: {e}")

    global CDYOLO_MODEL, SCTLDCNN_MODEL
    CDYOLO_MODEL = new_yolo_model
    SCTLDCNN_MODEL = new_cnn_model


    import os
    os.remove(yolo_temp_path)
    os.remove(cnn_temp_path)

    return {"message": "Models uploaded and loaded successfully"}

@app.post("/coralDetection_img/{conf_threshold}")
async def coralDetection_img(
    conf_threshold: float,
    file: UploadFile = File(...),  
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

    image_array, coral_loss= yp.draw_prediction_sctldcnnxyolo(image_array=img_nparray, model_yolo=CDYOLO_MODEL, model_sctldcnn=SCTLDCNN_MODEL)
    
    _, img_encoded = cv2.imencode('.jpg', image_array)
    img_bytes = img_encoded.tobytes()
    img_base64 = base64.b64encode(img_bytes).decode('utf-8')
    print(coral_loss)
    
    return JSONResponse(content={
        "image": img_base64,
        "coral_loss": coral_loss
    })

@app.post("/sctldDetection_img_streaming/{conf_threshold_yolo}/{conf_threshold_sctldcnn}")
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

    image_array, coral_loss = yp.draw_prediction_sctldcnnxyolo(image_array=img_nparray, model_yolo=CDYOLO_MODEL, model_sctldcnn=SCTLDCNN_MODEL)

    
    _, img_encoded = cv2.imencode('.jpg', image_array)

    # Convert the encoded image to a byte stream
    img_bytes = io.BytesIO(img_encoded.tobytes())

    # Return the byte stream as a response
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



@app.post("/sctldDetection_video_track/{frame_skip}/{conf_threshold_yolo}/{conf_threshold_sctldcnn}")
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

    # Call the function to process the video and upload to S3
    url, coral_coverage_loss = yp.draw_videopredictiontracking_sctldcnnxyolo_download(
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
    return {
        "url": url, 
        "coral_coverage_loss" : coral_coverage_loss
        }