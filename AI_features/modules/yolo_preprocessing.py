import modules.img_preprocessing as imgp
import cv2
import numpy as np
import boto3
import os
import tempfile
from dotenv import load_dotenv
import random
import string

CLASSES = ["SCTLD", "Coral"]
def call(): 
    print("yolo_preprocessing module called!")

def getPredictionInfo(model, image_array, conf_threshold=0.0, tracking=False):
    if image_array is None:
        raise ValueError("Could not load the image. Check the path.")

    if tracking == True:
        results = model.track(image_array, show=False, persist=True, tracker='bytetrack.yaml')
        if results is not None:
            boxes = results[0].boxes.xyxy.cpu().numpy()
            confs = results[0].boxes.conf.cpu().numpy()
            ids =  results[0].boxes.id

        if ids is not None:
            valid_indices = confs >= 0.6
            boxes = boxes[valid_indices]
            confs = confs[valid_indices]
            ids = ids[valid_indices]
        return results, boxes, confs, ids, image_array

    else:
        results = model.predict(image_array)

        boxes = results[0].boxes.xyxy.cpu().numpy()
        confidences = results[0].boxes.conf.cpu().numpy()
        class_ids = results[0].boxes.cls.cpu().numpy()

        valid_indices = confidences >= conf_threshold
        boxes = boxes[valid_indices]
        confidences = confidences[valid_indices]
        class_ids = class_ids[valid_indices]

        return results, boxes, confidences, class_ids, image_array


def draw_prediction_yolo(model_yolo, image_array, color=(4, 225, 239), thickness=2, font_scale=0.5, font_thickness=2, conf_threshold=0.0):
    results, boxes, confidences, class_ids, image_array = getPredictionInfo(model=model_yolo, image_array=image_array, conf_threshold=conf_threshold)
    if boxes is None or len(boxes) == 0:
      return imgp.convert_color_type(image_array)
    for xyxy, conf, class_id in zip(boxes, confidences, class_ids):
        xy1 = (int(xyxy[0]), int(xyxy[1]))
        xy2 = (int(xyxy[2]), int(xyxy[3]))

        cv2.rectangle(image_array, xy1, xy2, color, thickness)

        label = f"Class Coral: {conf:.2f}"

        # Get text size for background rectangle
        (text_width, text_height), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, font_scale, font_thickness)
        label_bg_xy1 = xy1
        label_bg_xy2 = (xy1[0] + text_width + 4, xy1[1] - text_height - 4)

        # Draw the class and confidence score in the bounding box
        cv2.rectangle(image_array, label_bg_xy1, label_bg_xy2, color, -1)
        cv2.putText(image_array, label, (xy1[0] + 2, xy1[1] - 2), cv2.FONT_HERSHEY_SIMPLEX, font_scale, (255, 255, 255), font_thickness)

    return imgp.convert_color_type(image_array)

def crop_prediction(image_array, model, conf_threshold=0.0):
    result, boxes, confidences, class_ids, image_array = getPredictionInfo(model=model, image_array=image_array, conf_threshold=conf_threshold)
    if len(boxes) != 0:
      cropped_image_arrays = []
      for i, xyxy in enumerate(boxes):
          x1, y1, x2, y2 = map(int, xyxy)
          cropped_region = image_array[y1:y2, x1:x2]
          cropped_image_arrays.append(cropped_region)
      return cropped_image_arrays, boxes, image_array
    
def getPredictionInfo_sctldcnnxyolo(model_yolo, model_sctldcnn, image_array, conf_threshold_yolo=0.0,  conf_threshold_scltdcnn=0.0):
    SCTLD_CLASSES = ['sctld_coral', 'unaffected_coral']
    result = crop_prediction(model=model_yolo, image_array=image_array, conf_threshold=conf_threshold_yolo)
    if result is not None:
        images, boxes, image_array = result

        # Initialize the lists to avoid UnboundLocalError
        filtered_images = []
        filtered_predictions = []
        filtered_labels = []
        filtered_confidences = []
        filtered_boxes = []

        for i in range(len(images)):
            images[i] = imgp.preprocess_image(images[i])
        batch_of_images = np.stack(images, axis=0)
        predictions = model_sctldcnn.predict(batch_of_images)

        for i, prediction in enumerate(predictions):
            confidence_score = max(prediction)
            if confidence_score >= conf_threshold_scltdcnn:  # Only keep high-confidence predictions
                filtered_images.append(images[i])
                filtered_predictions.append(prediction)
                filtered_labels.append(np.argmax(prediction))
                filtered_confidences.append(confidence_score)
                filtered_boxes.append(boxes[i])

        # Check if any valid predictions were made, if none return empty lists
        if not filtered_images:
            return [], [], [], [], [], image_array

        return filtered_images, filtered_predictions, filtered_labels, filtered_confidences, filtered_boxes, image_array
    else:
        return [], [], [], [], [], image_array
    
def draw_prediction_sctldcnnxyolo(model_yolo, model_sctldcnn, image_array, color=(4, 225, 239), thickness=2, font_scale=0.5, font_thickness=2, conf_threshold_yolo=0.0,  conf_threshold_scltdcnn=0.0):
  images_sctld = []
  confidence_scores_sctld = []
  boxes_sctld = []
  images, predictions, prediction_labels, confidence_scores, boxes, image_array = getPredictionInfo_sctldcnnxyolo(model_sctldcnn=model_sctldcnn, model_yolo=model_yolo, image_array=image_array, conf_threshold_yolo=conf_threshold_yolo, conf_threshold_scltdcnn=conf_threshold_scltdcnn)
  image_array = imgp.convert_color_type(image_array)
  if len(images) == 0:
    return imgp.convert_color_type(image_array)
  for i in range(len(images)):
    if prediction_labels[i] == 0:
      images_sctld.append(images[i])
      confidence_scores_sctld.append(confidence_scores[i])
      boxes_sctld.append(boxes[i])
  for xyxy, conf, image in zip(boxes_sctld, confidence_scores_sctld, images_sctld):
    xy1 = (int(xyxy[0]), int(xyxy[1]))
    xy2 = (int(xyxy[2]), int(xyxy[3]))
    cv2.rectangle(image_array, xy1, xy2, color, thickness)

    label = f"SCTLD {conf:.2f}"

    # Get text size for background rectangle
    (text_width, text_height), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, font_scale, font_thickness)
    label_bg_xy1 = xy1
    label_bg_xy2 = (xy1[0] + text_width + 4, xy1[1] - text_height - 4)

    # Draw the class and confidence score in the bounding box
    cv2.rectangle(image_array, label_bg_xy1, label_bg_xy2, color, -1)
    cv2.putText(image_array, label, (xy1[0] + 2, xy1[1] - 2), cv2.FONT_HERSHEY_SIMPLEX, font_scale, (255, 255, 255), font_thickness)
    return imgp.convert_color_type(image_array)

def draw_prediction_yolotrack(unique_ids, model, image_array, color=(4, 225, 239), thickness=2, font_scale=0.5, font_thickness=2, conf_threshold=0.5, tracker_config="bytetrack.yaml"):
    results = model.track(image_array, show=False, persist=True, tracker='bytetrack.yaml')
    if results is not None:
        boxes = results[0].boxes.xyxy.cpu()
        # boxes = results[0].boxes.xywh.cpu()
        confs = results[0].boxes.conf.cpu()
        ids = results[0].boxes.id
    if ids is not None:
        print(ids)
        valid_indices = confs >= conf_threshold
        boxes = boxes[valid_indices]
        confs = confs[valid_indices]
        ids = ids[valid_indices]
        print(ids)

        unique_ids.update(ids.tolist())

        print(f"Total unique tracked objects so far: {len(unique_ids)}")

        for box, conf, track_id in zip(boxes, confs, ids):
            x1, y1, x2, y2 = map(int, box.tolist())
            cv2.rectangle(image_array, (x1, y1), (x2, y2), (4, 225, 239), 2)

            # Create label text
            label = f'ID:{int(track_id)} {conf:.2f}'

            # Get text size for background rectangle
            (text_width, text_height), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 2)
            label_bg_xy1 = (x1, y1 - text_height - 4)
            label_bg_xy2 = (x1 + text_width + 4, y1)

            cv2.rectangle(image_array, label_bg_xy1, label_bg_xy2, (4, 225, 239), -1)
            cv2.putText(image_array, label, (x1 + 2, y1 - 2), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)

    return imgp.convert_color_type(image_array), len(unique_ids) 


def draw_prediction_sctldcnn_track(unique_ids, model_yolo, model_sctldcnn, image_array, color=(4, 225, 239), thickness=2, font_scale=0.5, font_thickness=2, conf_threshold_yolo=0.5, conf_threshold_scltd=0.7, tracker_config="bytetrack.yaml"):
    CLASSES = ["SCTLD", "Coral"]
    results = model_yolo.track(image_array, show=False, persist=True, tracker=tracker_config)

    if results is None or results[0].boxes.id is None:
        return image_array
    
    
    boxes_xyxy = results[0].boxes.xyxy.cpu()
    confs = results[0].boxes.conf.cpu()
    ids = results[0].boxes.id.cpu()


    valid_indices = confs >= conf_threshold_yolo
    boxes_xyxy = boxes_xyxy[valid_indices]
    confs = confs[valid_indices]
    ids = ids[valid_indices]

    unique_ids.update(ids.tolist())
    print(f"Total unique tracked objects so far: {len(unique_ids)}")


    cropped_image_arrays = {}
    track_ids = []

    for box, track_id in zip(boxes_xyxy, ids):
        x1, y1, x2, y2 = map(int, box.tolist())
        cropped_region = image_array[y1:y2, x1:x2]

        if cropped_region.size > 0:
            cropped_image_arrays[int(track_id)] = cropped_region
            track_ids.append(int(track_id))

    # Preprocess and predict
    images = []
    track_id_order = []

    for track_id, cropped_img in cropped_image_arrays.items():
        preprocessed_img = imgp.preprocess_image(cropped_img)
        images.append(preprocessed_img)
        track_id_order.append(track_id)

    if not images:
        return image_array

    batch_of_images = np.stack(images, axis=0)
    predictions = model_sctldcnn.predict(batch_of_images)

    for i, prediction in enumerate(predictions):
        confidence_score = float(np.max(prediction))
        predicted_class = int(np.argmax(prediction))
        track_id = track_id_order[i]

        if confidence_score >= conf_threshold_scltd and predicted_class == 0:
            # Draw results back on the original image
            box_idx = track_ids.index(track_id)
            x1, y1, x2, y2 = map(int, boxes_xyxy[box_idx].tolist())

            label = f"ID {track_id} | SCTLD: ({round(confidence_score * 100, 2)}%)"
            cv2.rectangle(image_array, (x1, y1), (x2, y2), color, thickness)
            cv2.putText(image_array, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX,
                        font_scale, color, font_thickness)
    return image_array
def generate_random_string(length=12):
    """Generate a random alphanumeric string of specified length."""
    characters = string.ascii_letters + string.digits  # Letters + digits
    random_string = ''.join(random.choice(characters) for _ in range(length))
    return random_string
  
def upload_video_and_generate_presigned_url(temp_file_path, s3_ID, s3_key, s3_REGION, BUCKET_NAME):
    try:
        # Initialize the S3 client
        s3_client = boto3.client(
            's3',
            aws_access_key_id=s3_ID,
            aws_secret_access_key=s3_key,
            region_name=s3_REGION
        )

        # Generate a random filename for the video
        s3_filename = generate_random_string(16) + ".mp4"

        # Upload the video to S3
        with open(temp_file_path, 'rb') as data:
            s3_client.upload_fileobj(data, BUCKET_NAME, s3_filename)

        # Generate the presigned URL for the uploaded video (valid for 1 hour)
        presigned_url = s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': BUCKET_NAME, 'Key': s3_filename, 'ResponseContentDisposition': 'inline'},
            ExpiresIn=3600  # URL will be valid for 1 hour
        )

        return presigned_url

    except Exception as e:
        print(f"Error uploading video to S3: {e}")
        return None

def draw_videoprediction_sctldcnnxyolo_download(model_yolo, model_sctldcnn, video_path, s3_ID, s3_key, s3_REGION, color=(4, 225, 239), thickness=2, font_scale=0.5, font_thickness=2, conf_threshold_yolo=0.0, conf_threshold_scltdcnn=0.0, frame_skip=5):
    load_dotenv()

    # Check if .env variables are loaded
    if not all([os.getenv("ID"), os.getenv("KEY"), os.getenv("REGION")]):
        raise ValueError("Missing AWS credentials or region in .env file")

    cap = cv2.VideoCapture(video_path)
    frame_skip = frame_skip 
    frame_count = 0

    temp_output_path = tempfile.mktemp(suffix=".mp4")
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(temp_output_path, fourcc, 20.0, (int(cap.get(3)), int(cap.get(4))))

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        if frame_count % frame_skip == 0:
            processed_frame = draw_prediction_sctldcnnxyolo(model_yolo=model_yolo, model_sctldcnn=model_sctldcnn, image_array=frame, conf_threshold_yolo=conf_threshold_yolo, conf_threshold_scltdcnn=conf_threshold_scltdcnn, color=color, thickness=font_thickness, font_scale=font_scale)
            out.write(processed_frame)
        frame_count += 1

    cap.release()
    out.release()
    cv2.destroyAllWindows()


    BUCKET_NAME = "yolo-sctld-bucket"
    presigned_url = upload_video_and_generate_presigned_url(temp_output_path, s3_ID, s3_key, s3_REGION, BUCKET_NAME)
    os.remove(temp_output_path)

    return presigned_url