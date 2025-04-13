import uvicorn
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import StreamingResponse
import cv2
from ultralytics import YOLO
import numpy as np
import tensorflow as tf
import tempfile
from fastapi.responses import  StreamingResponse
import io
import boto3
import random
import string
from io import BytesIO
from PIL import Image
import base64
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()
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

s3 = boto3.client(
    's3',
    aws_access_key_id = os.getenv("ID"),
    aws_secret_access_key = os.getenv("KEY"),
    region_name = os.getenv("REGION"),
)
BUCKET_NAME = "yolo-sctld-bucket"

model_path = "yolov8-training/coral-detector/weights/best.pt"
yolo_model = YOLO(model_path)
sctld_tfserve = 'http://18.117.114.163:8605/v1/models/1:predict'
sctld_model = tf.keras.models.load_model("1.keras")
CLASSES = ["Unaffected", "SCTLD Affected"]

def generate_random_string(length=12):
    characters = string.ascii_letters + string.digits
    random_string = ''.join(random.choice(characters) for _ in range(length))
    return random_string

def upload_video(temp_file_path):
    try:
        s3_filename = generate_random_string(16) + ".mp4"
        s3.upload_file(temp_file_path, BUCKET_NAME, s3_filename)

        presigned_url = s3.generate_presigned_url(
            'get_object',
            Params={'Bucket': BUCKET_NAME, 'Key': s3_filename},
            ExpiresIn=3600
        )

        return presigned_url

    except Exception as e:
        print(f"Error uploading file: {e}")
        return None

def read_file_as_image(data) -> np.ndarray:
    image = np.array(Image.open(BytesIO(data)))
    return image


video_storage = {}

@app.get("/")
def home():
    return {"message": "hello yolo!"}

@app.post("/sctld-yolo-img-streaming")
async def imagefile(file: UploadFile = File(...)): 
    image_data = await file.read()

    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp_file:
        temp_file.write(image_data)  
        temp_file_path = temp_file.name  

    print("Temporary file saved at:", temp_file_path)

    img = cv2.imread(temp_file_path)

    results = yolo_model(img) 

    box_object = results[0]
    boxes = box_object.boxes  

    if boxes is not None:
        high_conf_boxes = []  
        for box in boxes:
            if box.conf.item() > 0.70:  
                high_conf_boxes.append(box)
                x1, y1, x2, y2 = map(int, box.xyxy[0])  
                cropped_img = img[y1:y2, x1:x2]  
                cropped_img = np.expand_dims(cropped_img, axis=0)
                predictions = sctld_model.predict(cropped_img)
                prediction = CLASSES[predictions[0].argmax()]
                print(predictions[0])
                print(prediction) 
                confidence = (predictions[0][predictions[0].argmax()]) * 100
                prediction_confidence = round(confidence, 2)

                if predictions[0].argmax() == 1:  
                    cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)
                    cv2.putText(img, f"SCLTD Affected {prediction_confidence}%", (x1, max(y1 + 30, 30)), 
                                cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)
        box_object.boxes = high_conf_boxes  

    _, img_encoded = cv2.imencode('.jpg', img)
    img_bytes = img_encoded.tobytes()

    return StreamingResponse(io.BytesIO(img_bytes), media_type="image/jpeg")

@app.post("/sctld-yolo-img-b64")
async def imagefile(file: UploadFile = File(...)): 

    image_data = await file.read()

    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp_file:
        temp_file.write(image_data)  
        temp_file_path = temp_file.name  

    print("Temporary file saved at:", temp_file_path)

    img = cv2.imread(temp_file_path)

    results = yolo_model(img)  

    box_object = results[0]
    boxes = box_object.boxes  

    if boxes is not None:
        high_conf_boxes = []  
        for box in boxes:
            if box.conf.item() > 0.70:  
                high_conf_boxes.append(box)
                x1, y1, x2, y2 = map(int, box.xyxy[0])  
                cropped_img = img[y1:y2, x1:x2]  
                cropped_img = np.expand_dims(cropped_img, axis=0)
                predictions = sctld_model.predict(cropped_img)
                prediction = CLASSES[predictions[0].argmax()]
                print(predictions[0])
                print(prediction) 
                confidence = (predictions[0][predictions[0].argmax()]) * 100
                prediction_confidence = round(confidence, 2)

                if predictions[0].argmax() == 1:  
                    cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)
                    cv2.putText(img, f"SCLTD Affected {prediction_confidence}%", (x1, max(y1 + 30, 30)), 
                                cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)
        box_object.boxes = high_conf_boxes  

    _, img_encoded = cv2.imencode('.jpg', img)
    img_bytes = img_encoded.tobytes()
    img_base64 = base64.b64encode(img_bytes).decode('utf-8')

    return {"image_base64": img_base64}

    

@app.post("/sctld-yolo-video")
async def videofile(
    file: UploadFile = File(...)
): 
    video_data = await file.read()

    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_file:
        temp_file.write(video_data)  
        temp_file_path = temp_file.name  

    print("Temporary file saved at:", temp_file_path)

    cap = cv2.VideoCapture(temp_file_path)
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))


    output_temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".mp4")
    output_temp_file_path = output_temp_file.name
    output_temp_file.close()  

    output_temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".mp4")
    output_temp_file_path = output_temp_file.name
    output_temp_file.close()  

    fourcc = cv2.VideoWriter_fourcc(*'mp4v') 
    out = cv2.VideoWriter(output_temp_file_path, fourcc, fps, (width, height))

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        results = yolo_model(frame) 
        box_object = results[0]
        boxes = box_object.boxes  

        if boxes is not None:
            high_conf_boxes = []  
            for box in boxes:
                if box.conf.item() > 0.85:
                    high_conf_boxes.append(box)
                    x1, y1, x2, y2 = map(int, box.xyxy[0])  
                    cropped_img = frame[y1:y2, x1:x2]
                    cropped_img = np.expand_dims(cropped_img, axis=0)

                    predictions = sctld_model.predict(cropped_img)
                    prediction = CLASSES[predictions[0].argmax()]
                    print(predictions[0])
                    print(prediction) 
                    confidence = (predictions[0][predictions[0].argmax()]) * 100
                    prediction_confidence = round(confidence, 2)
                    if predictions[0].argmax() == 1:
                        cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                        cv2.putText(frame, f"SCLTD Affected {prediction_confidence}%", (x1, max(y1 + 30, 30)), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)
                

            box_object.boxes = high_conf_boxes 
        out.write(frame)

    cap.release()
    out.release()
    cv2.destroyAllWindows()
    out.release()

    output_temp_file.close()

    print(output_temp_file_path)
    s3_url = upload_video(output_temp_file_path)

    return s3_url


print(os.getenv('ACCESS'))

if __name__ == "__main__": 
    uvicorn.run(app, host='localhost', reload=True, port=8090)




