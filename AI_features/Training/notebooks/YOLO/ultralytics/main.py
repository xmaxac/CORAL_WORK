import ultralytics
import torch
# from ultralytics.utils.tal import TaskAlignedAssigner
# import inspect

# methods = [name for name, obj in inspect.getmembers(TaskAlignedAssigner, predicate=inspect.isfunction)]
# print(methods)

from ultralytics import YOLO

model = YOLO("F:/Qianyu JOB/TSA_2025/CORAL_WORK/AI_features/Training/notebooks/YOLO/ultralytics/ultralytics/cfg/models/v10/yolo10s_comb.yaml")                     # define architecture
model.load("yolov10s.pt", weights_only=True)         # load weights only
model.train(data="data.yaml", epochs=150, imgsz=640, batch=16)


# model = YOLO("AI_features/Training/notebooks/YOLO/ultralytics/ultralytics/cfg/models/v10/yolo10n_comb.yaml")

# dummy_input = torch.randn(1, 3, 640, 640)

# with torch.no_grad():
#     outputs = model(dummy_input) 

# print("Forward pass successful. Output shape(s):")
