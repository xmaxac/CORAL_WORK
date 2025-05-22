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
CLOUDFRONT_DIST = "https://d7tccbolfojm.cloudfront.net/"
def call(): 
    print("yolo_preprocessing module called!")

def getPredictionInfo(model, image_array, conf_threshold=0.0):
    """
    Runs YOLO model prediction and filters boxes based on confidence threshold.
    
    Parameters:
        model: YOLO model object
        image_array (np.ndarray): Input image
        conf_threshold (float): Confidence threshold for filtering predictions
    
    Returns:
        results: Raw model output
        boxes: Filtered bounding boxes
        confidences: Confidence scores of boxes
        class_ids: Class IDs of predictions
        image_array: Original image
    """ 
    if image_array is None:
        raise ValueError("Could not load the image. Check the path.")

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
    """
    Draws YOLO predictions with bounding boxes and confidence labels.

    Returns:
        image_array with drawn predictions
    """
    results, boxes, confidences, class_ids, image_array = getPredictionInfo(model=model_yolo, image_array=image_array, conf_threshold=conf_threshold)
    if boxes is None or len(boxes) == 0:
      return imgp.convert_color_type(image_array)
    for xyxy, conf, class_id in zip(boxes, confidences, class_ids):
        xy1 = (int(xyxy[0]), int(xyxy[1]))
        xy2 = (int(xyxy[2]), int(xyxy[3]))

        cv2.rectangle(image_array, xy1, xy2, color, thickness)

        label = f"Coral ({round(conf * 100 , 2)})%"

        # Get text size for background rectangle
        (text_width, text_height), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, font_scale, font_thickness)
        label_bg_xy1 = xy1
        label_bg_xy2 = (xy1[0] + text_width + 4, xy1[1] - text_height - 4)

        # Draw the class and confidence score in the bounding box
        cv2.rectangle(image_array, label_bg_xy1, label_bg_xy2, color, -1)
        cv2.putText(image_array, label, (xy1[0] + 2, xy1[1] - 2), cv2.FONT_HERSHEY_SIMPLEX, font_scale, (255, 255, 255), font_thickness)

    return imgp.convert_color_type(image_array)

def crop_prediction(image_array, model, conf_threshold=0.0):
    """
    Crops YOLO-detected regions from the input image.

    Returns:
        cropped_image_arrays: List of cropped images
        boxes: Bounding boxes of the crops
        image_array: Original image
    """
    result, boxes, confidences, class_ids, image_array = getPredictionInfo(model=model, image_array=image_array, conf_threshold=conf_threshold)
    if len(boxes) != 0:
      cropped_image_arrays = []
      for i, xyxy in enumerate(boxes):
          x1, y1, x2, y2 = map(int, xyxy)
          cropped_region = image_array[y1:y2, x1:x2]
          cropped_image_arrays.append(cropped_region)
      return cropped_image_arrays, boxes, image_array
    
def getPredictionInfo_sctldcnnxyolo(model_yolo, model_sctldcnn, image_array, conf_threshold_yolo=0.0, conf_threshold_scltdcnn=0.0):
    """
    Combines YOLO + CNN model to detect SCTLD-affected coral regions.

    Returns:
        filtered_images, filtered_predictions, filtered_labels, 
        filtered_confidences, filtered_boxes, original image_array
    """
    SCTLD_CLASSES = ['sctld_coral', 'unaffected_coral']
    result = crop_prediction(model=model_yolo, image_array=image_array, conf_threshold=conf_threshold_yolo)
    if result is not None:
        images, boxes, image_array = result

        # Initialize the lists
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
    
def draw_prediction_sctldcnnxyolo(model_yolo, model_sctldcnn, image_array, color=(4, 225, 239), thickness=2, font_scale=0.5, font_thickness=2, conf_threshold_yolo=0.0, conf_threshold_scltdcnn=0.0):
    """
    Draws bounding boxes around SCTLD-infected coral and calculates affected area percentage.

    Returns:
        image_array with drawn predictions, percentage of coral coverage loss
    """
    images_sctld = []
    confidence_scores_sctld = []
    boxes_sctld = []  
    images, predictions, prediction_labels, confidence_scores, boxes, image_array = getPredictionInfo_sctldcnnxyolo(model_sctldcnn=model_sctldcnn, model_yolo=model_yolo, image_array=image_array, conf_threshold_yolo=conf_threshold_yolo, conf_threshold_scltdcnn=conf_threshold_scltdcnn)
    
    affected_area = 0
    total_area = 0
    for box in boxes: 
        x1, y1, x2, y2 = map(int, box.tolist())
        area = (x2 - x1) * (y2 - y1)
        total_area += area

        
    image_array = imgp.convert_color_type(image_array)

    if len(images) == 0:
        return imgp.convert_color_type(image_array), 0.0
    for i in range(len(images)):
        if prediction_labels[i] == 0:
            images_sctld.append(images[i])
            confidence_scores_sctld.append(confidence_scores[i])
            boxes_sctld.append(boxes[i])

    for box in boxes_sctld: 
        x1, y1, x2, y2 = map(int, box)
        area = area = (x2 - x1) * (y2 - y1)
        affected_area += area
    if total_area > 0:
        coral_coverage_loss = (affected_area / total_area) * 100
    else:
        coral_coverage_loss = 0

    for xyxy, conf, image in zip(boxes_sctld, confidence_scores_sctld, images_sctld):
        xy1 = (int(xyxy[0]), int(xyxy[1]))
        xy2 = (int(xyxy[2]), int(xyxy[3]))
        cv2.rectangle(image_array, xy1, xy2, color, thickness)

        confidence = conf

        label = f"SCTLD ({round(confidence * 100, 2)}%)"
        print(label)

        # Get text size for background rectangle
        (text_width, text_height), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, font_scale, font_thickness)
        label_bg_xy1 = xy1
        label_bg_xy2 = (xy1[0] + text_width + 4, xy1[1] - text_height - 4)

        # Draw the class and confidence score in the bounding box
        cv2.rectangle(image_array, label_bg_xy1, label_bg_xy2, color, -1)
        cv2.putText(image_array, label, (xy1[0] + 2, xy1[1] - 2), cv2.FONT_HERSHEY_SIMPLEX, font_scale, (255, 255, 255), font_thickness)

    return imgp.convert_color_type(image_array), coral_coverage_loss

def draw_prediction_yolotrack(unique_ids, model, image_array, color=(4, 225, 239), thickness=2, font_scale=0.5, font_thickness=2, conf_threshold=0.5, tracker_config="bytetrack.yaml"):
    """
    Draws YOLO tracking predictions with object IDs.

    Returns:
        image_array with drawn bounding boxes, number of unique tracked objects
    """
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




def draw_prediction_sctldcnn_track(
    unique_ids,
    model_yolo,
    model_sctldcnn,
    image_array,
    color=(4, 225, 239),
    thickness=2,
    font_scale=0.5,
    font_thickness=2,
    conf_threshold_yolo=0.5,
    conf_threshold_scltd=0.7,
    tracker_config="bytetrack.yaml"
):
    """
    Tracks corals with YOLO model, crops each detection, runs SCTLD CNN on crops,
    draws bounding boxes with IDs and SCTLD confidence on corals detected as affected,
    and computes coral coverage loss.


    Returns:
        Annotated image,
        Percentage of coral coverage lost due to SCTLD,
        Total coral area detected,
        Total affected area detected.
    """
    total_area = 0 
    affected_area = 0
    results = model_yolo.track(image_array, show=False, persist=True, tracker=tracker_config)

    if results is None or results[0].boxes.id is None:
        return image_array, 0, 0, 0
    
    
    boxes_xyxy = results[0].boxes.xyxy.cpu()
    confs = results[0].boxes.conf.cpu()
    ids = results[0].boxes.id.cpu()

    valid_indices = confs >= conf_threshold_yolo
    boxes_xyxy = boxes_xyxy[valid_indices]
    confs = confs[valid_indices]
    ids = ids[valid_indices]

    unique_ids.update(ids.tolist())


    cropped_image_arrays = {}
    track_ids = []

    for box, track_id in zip(boxes_xyxy, ids):
        x1, y1, x2, y2 = map(int, box.tolist())
        cropped_region = image_array[y1:y2, x1:x2]
        box_area = (x2 - x1) * (y2 - y1)

        if cropped_region.size > 0:
            total_area += box_area
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
        return image_array, 0, 0, 0

    batch_of_images = np.stack(images, axis=0)
    predictions = model_sctldcnn.predict(batch_of_images)

    for i, prediction in enumerate(predictions):
        confidence_score = float(np.max(prediction))
        predicted_class = int(np.argmax(prediction))
        track_id = track_id_order[i]

        if confidence_score >= conf_threshold_scltd and predicted_class == 0:
            affected_area += box_area
            # Draw results back on the original image
            box_idx = track_ids.index(track_id)
            x1, y1, x2, y2 = map(int, boxes_xyxy[box_idx].tolist())
            label = f"ID {track_id} | SCTLD: ({round(confidence_score * 100, 2)}%)"
            cv2.rectangle(image_array, (x1, y1), (x2, y2), color, thickness)
            cv2.putText(image_array, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX,
                        font_scale, color, font_thickness)
            
    # final coverage loss calculation 
    if total_area > 0: 
        coral_coverage_loss = (affected_area / total_area) * 100
    else:
        coral_coverage_loss = 0
    return image_array, coral_coverage_loss, total_area, affected_area



def generate_random_string(length=12):
    """Generate a random alphanumeric string of specified length."""
    characters = string.ascii_letters + string.digits  # Letters + digits
    random_string = ''.join(random.choice(characters) for _ in range(length))
    return random_string
  
def upload_video_and_generate_presigned_url(temp_file_path, s3_ID, s3_key, s3_REGION, BUCKET_NAME):
    """Upload video file to S3 and generate a public URL via CloudFront."""
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
        s3_client.upload_file(
        Filename=temp_file_path,  
        Bucket=BUCKET_NAME,       
        Key=s3_filename,          
        ExtraArgs={'ContentType': 'video/mp4'}

        )
        print("uploaded to s3...")

        # Generate the presigned URL for the uploaded video (valid for 1 hour)
        public_url = f"{CLOUDFRONT_DIST}{s3_filename}"

        return public_url

    except Exception as e:
        print(f"Error uploading video to S3: {e}")
        return None
    
load_dotenv()


def draw_videopredictiontracking_sctldcnnxyolo_download(
    model_yolo,
    model_sctldcnn,
    video_path,
    s3_ID,
    s3_key,
    s3_REGION,
    color=(4, 225, 239),
    thickness=2,
    font_scale=0.5,
    font_thickness=2,
    conf_threshold_yolo=0.0,
    conf_threshold_scltdcnn=0.0,
    frame_skip=5
):
    """
    Processes a video frame-by-frame, detects & tracks corals, classifies SCTLD, draws bounding boxes,
    writes output to a video file, uploads to S3, and returns the CloudFront URL and coverage loss..

    Returns:
        presigned URL string for the uploaded video for streaming,
        total coral coverage loss percentage.
    """
    load_dotenv()

    # Check if .env variables are loaded
    if not all([os.getenv("ID"), os.getenv("KEY"), os.getenv("REGION")]):
        raise ValueError("Missing AWS credentials or region in .env file")

    cap = cv2.VideoCapture(video_path)
    frame_skip = frame_skip 
    frame_count = 0

    with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as tmpfile:
        temp_output_path = tmpfile.name
    fourcc = cv2.VideoWriter_fourcc(*'VP80')
    out = cv2.VideoWriter(temp_output_path, fourcc, 20.0, (int(cap.get(3)), int(cap.get(4))))

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        if frame_count % frame_skip == 0:
            processed_frame, coral_loss = draw_prediction_sctldcnnxyolo(model_yolo=model_yolo, model_sctldcnn=model_sctldcnn, image_array=frame, conf_threshold_yolo=conf_threshold_yolo, conf_threshold_scltdcnn=conf_threshold_scltdcnn, color=color, thickness=font_thickness, font_scale=font_scale)
            print(type(processed_frame))
            out.write(processed_frame)
        frame_count += 1

    cap.release()
    out.release()

    if not os.path.exists(temp_output_path) or os.path.getsize(temp_output_path) == 0:
        raise ValueError("Generated video file is empty or not found")

    BUCKET_NAME = "coralbasevidsbucket"
    presigned_url = upload_video_and_generate_presigned_url(temp_output_path, s3_ID, s3_key, s3_REGION, BUCKET_NAME)
    os.remove(temp_output_path)

    return presigned_url

def draw_videopredictiontracking_sctldcnnxyolo_download(
    model_yolo,
    model_sctldcnn,
    video_path,
    s3_ID,
    s3_key,
    s3_REGION,
    color=(4, 225, 239),
    thickness=2,
    font_scale=0.5,
    font_thickness=2,
    conf_threshold_yolo=0.0,
    conf_threshold_scltdcnn=0.0,
    frame_skip=5
):
    """
    Processes a video to track coral and SCTLD (Stony Coral Tissue Loss Disease) lesions,
    annotates the frames with YOLO and CNN-based predictions, computes the total coral
    coverage loss, and uploads the result to an AWS S3 bucket.

    Returns:
            -  A temporary URL to stream the annotated video from S3.
            - : Estimated percentage of coral area affected by SCTLD.
    """
    load_dotenv()
    unique_ids = set()
    # Check if .env variables are loaded
    if not all([os.getenv("ID"), os.getenv("KEY"), os.getenv("REGION")]):
        raise ValueError("Missing AWS credentials or region in .env file")

    cap = cv2.VideoCapture(video_path)
    frame_skip = frame_skip 
    frame_count = 0

    with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as tmpfile:
        temp_output_path = tmpfile.name
    fourcc = cv2.VideoWriter_fourcc(*'VP80')

    out = cv2.VideoWriter(temp_output_path, fourcc, 20.0, (int(cap.get(3)), int(cap.get(4))))
    total_coral_area = 0 
    total_affected_area = 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        if frame_count % frame_skip == 0:
            processed_frame, coral_coverage_loss, total_area, affected_area = draw_prediction_sctldcnn_track(unique_ids=unique_ids, model_yolo=model_yolo, model_sctldcnn=model_sctldcnn, image_array=frame, conf_threshold_yolo=conf_threshold_yolo, conf_threshold_scltd=conf_threshold_scltdcnn, color=color, thickness=font_thickness, font_scale=font_scale)
            out.write(processed_frame)
            total_coral_area +=total_area
            total_affected_area+=affected_area
        frame_count += 1


    cap.release()
    out.release()
    coral_coverage_loss_total = (total_affected_area / total_coral_area ) * 100


    BUCKET_NAME = "coralbasevidsbucket"
    presigned_url = upload_video_and_generate_presigned_url(temp_output_path, s3_ID, s3_key, s3_REGION, BUCKET_NAME)


    os.remove(temp_output_path)

    return presigned_url, coral_coverage_loss_total