from ultralytics import YOLO

model = YOLO("AI_features/Training/notebooks/YOLO/ultralytics/ultralytics/cfg/models/v10/yolo10s_mfb.yaml")  # load model from your YAML config
print(model)  