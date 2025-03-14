import cv2 as cv
from ultralytics import YOLO

# log of 3/13/24 (Today I will set up the ability to capture real time camera info)
# log 2 3/13/24 (I added basic cv2 code for the configuration of the camera. Will attempt to add AI tmmr)
# log 3 3/14/25 (Added the yolo model into the code, used w3schools algorithm to make a box)

# initalize Camera
camera = cv.VideoCapture(0)

# Get the default frame width and height of camera
frame_width = int(camera.get(cv.CAP_PROP_FRAME_WIDTH))
frame_height = int(camera.get(cv.CAP_PROP_FRAME_HEIGHT))

# Define the codec and create VideoWriter object
fourcc = cv.VideoWriter_fourcc(*"mp4v")
out = cv.VideoWriter("output.mp4", fourcc, 20.0, (frame_width, frame_height))

# initalize model
model = YOLO("yolov8s.pt")


# Function to get class colors
def getColours(cls_num):
    base_colors = [(255, 0, 0), (0, 255, 0), (0, 0, 255)]
    color_index = cls_num % len(base_colors)
    increments = [(1, -2, 1), (-2, 1, -1), (1, -1, 2)]
    color = [
        base_colors[color_index][i]
        + increments[color_index][i] * (cls_num // len(base_colors)) % 256
        for i in range(3)
    ]
    return tuple(color)


while True:
    ret, frame = camera.read()

    if not ret:
        continue
    results = model.track(frame, stream=True)

    for result in results:
        classnames = result.names

        # iterate over each box
        for box in result.boxes:
            # check if confidence is greater than 50 percent
            if box.conf[0] > 0.5:
                # get coordinates
                [x1, y1, x2, y2] = box.xyxy[0]
                # convert to int
                x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)

                # get the class
                cls = int(box.cls[0])

                # get the class name
                class_name = classnames[cls]

                # get the respective colour
                colour = getColours(cls)

                # draw the rectangle
                cv.rectangle(frame, (x1, y1), (x2, y2), colour, 2)

                # put the class name and confidence on the image
                cv.putText(
                    frame,
                    f"{classnames[int(box.cls[0])]} {box.conf[0]:.2f}",
                    (x1, y1),
                    cv.FONT_HERSHEY_SIMPLEX,
                    1,
                    colour,
                    2,
                )
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
