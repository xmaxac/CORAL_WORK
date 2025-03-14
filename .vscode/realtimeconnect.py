import cv2 as cv
from ultralytics import YOLOv8

# log of 3/13/24 (Today I will set up the ability to capture real time camera info)
# log 2 3/13/24 (I added basic cv2 code for the configuration of the camera. Will attempt to add AI tmmr)

# initalize Camera
camera = cv.VideoCapture(0)

# Get the default frame width and height of camera
frame_width = int(camera.get(cv.CAP_PROP_FRAME_WIDTH))
frame_height = int(camera.get(cv.CAP_PROP_FRAME_HEIGHT))

# Define the codec and create VideoWriter object
fourcc = cv.VideoWriter_fourcc(*"mp4v")
out = cv.VideoWriter("output.mp4", fourcc, 20.0, (frame_width, frame_height))

# initalize model
model = YOLOv8("yolov8s.pt")

while True:
    ret, frame = camera.read()

    # Write the frame to the output file
    out.write(frame)

    # Display the captured frame
    cv.imshow("Camera", frame)

    # Press 'q' to exit the loop
    if cv.waitKey(1) == ord("q"):
        break

# Release the capture and writer objects
camera.release()
out.release()
cv.destroyAllWindows()
