FROM python:3.12.7-slim

WORKDIR /app

# Install system dependencies first (cached separately)
RUN apt-get update && \
    apt-get install -y libgl1-mesa-glx libglib2.0-0 libsm6 libxext6 libxrender1 && \
    rm -rf /var/lib/apt/lists/* 

COPY Dockerfiles/requirements.txt /app/requirements.txt

# Upgrade pip and install dependencies without cache
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir torch && \
    pip install --no-cache-dir ultralytics --no-deps

COPY YOLO/main.py /app/YOLO/main.py
COPY modules/yolo_preprocessing.py /app/modules/yolo_preprocessing.py
COPY modules/img_preprocessing.py /app/modules/img_preprocessing.py
COPY models/CNN_models/1_ver/1.keras /app/models/CNN_models/1_ver/1.keras
COPY models/YOLO_models/2_ver/best.pt /app/models/YOLO_models/2_ver/best.pt
COPY .env /app/.env

# Expose port for API
EXPOSE 8080

# Run the FastAPI app with Uvicorn
CMD ["sh", "-c", "uvicorn YOLO.main:app --reload --host 0.0.0.0 --port 8080"]
