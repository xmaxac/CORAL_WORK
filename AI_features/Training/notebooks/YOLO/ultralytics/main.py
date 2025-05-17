from ultralytics import YOLO
import torch

model = YOLO("AI_features/Training/notebooks/YOLO/ultralytics/ultralytics/cfg/models/v10/yolo10s_lwn.yaml")

dummy_input = torch.randn(1, 3, 640, 640)

with torch.no_grad():
    outputs = model(dummy_input) 

print("Forward pass successful. Output shape(s):")
