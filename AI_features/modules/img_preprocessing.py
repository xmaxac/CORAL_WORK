from PIL import Image
import os
import cv2

def call():
    print("This is the img_preprocessing module!")
def resize(input_dir, output_dir, width, height):
    n = 0
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    for filename in os.listdir(input_dir):
        input_path = os.path.join(input_dir, filename)
        try:
            with Image.open(input_path) as img:
                base_name = str(n)
                file_extension = os.path.splitext(filename)[1]  # Preserve original extension
                output_path = os.path.join(output_dir, f"{base_name}{file_extension}")
                resized_img = img.resize((width, height))
                resized_img.save(output_path)
                print(f"Resized {filename} and saved as {output_path}")
                n += 1  
        except Exception as e:
            print(f"Failed to resize {filename} due to {e}")
    
    print("All images resized with numerical filenames!")

def reformat(input_dir, output_dir, new_format):
    n = 0
    new_format = new_format.lower()
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    for filename in os.listdir(input_dir):
        input_path = os.path.join(input_dir, filename)
        try:
            with Image.open(input_path) as img:
                img = img.convert('RGB')
                base_name = str(n)
                output_path = os.path.join(output_dir, f"{base_name}.{new_format}")
                img.save(output_path, format=new_format.upper())
                print(f"Converted {filename} to {new_format.upper()} as {output_path}")
                n += 1 
        except Exception as e:
            print(f"Failed to convert {filename} to {new_format.upper()} due to {e}")
    print("All images reformatted with numerical filenames!")


def reformat_overwrite(input_dir, new_format):
    n = 0
    new_format = "jpeg"
    for filename in os.listdir(input_dir): 
        input_path = os.path.join(input_dir, filename)
        try: 
            with Image.open(input_path) as img: 
                img = img.convert('RGB')
                new_filename = f"{n}.{new_format}"
                output_path = os.path.join(input_dir, new_filename)
                print(output_path)
                img.save(output_path, format=new_format.upper())
                print(f"Reformatted {filename} to {new_format.upper()} as {new_filename}")
                if filename != new_filename:
                    os.remove(input_path)
                n += 1
        except Exception as e:
            print(f"Failed to resize {filename} due to {e}")
    print("All images reformatted with numerical filenames!")


def resize_overwrite(input_dir, width, height):
    n = 0
    for filename in os.listdir(input_dir):
        input_path = os.path.join(input_dir, filename)
        try:
            with Image.open(input_path) as img:
                file_extension = os.path.splitext(filename)[1]
                new_filename = f"{n}{file_extension}"
                output_path = os.path.join(input_dir, new_filename)
                resized_img = img.resize((width, height))
                resized_img.save(output_path)
                print(f"Resized {filename} and saved as {new_filename}")
                if filename != new_filename:
                    os.remove(input_path)
                n += 1 
        except Exception as e:
            print(f"Failed to resize {filename} due to {e}")

    print("All images resized with numerical filenames!")

def check_imgsize(input_dir, size): 
    count = 0
    for filename in os.listdir(input_dir):
        input_path = os.path.join(input_dir, filename)
        with Image.open(input_path) as img: 
            if img.size != size:
                count +=1
    return count

def check_imgformat(input_dir, format): 
    count = 0
    format = format.lower()
    for filename in os.listdir(input_dir): 
        input_path = os.path.join(input_dir, filename)
        file_extension = os.path.splitext(filename)[1]
        if file_extension != f".{format}": 
            count +=1
    return count

def convert_color_type(image_array, bgr_to_rgb=True):
  if bgr_to_rgb == True:
    image_array_converted = cv2.cvtColor(image_array, cv2.COLOR_BGR2RGB)
  else:
    image_array_converted = cv2.cvtColor(image_array, cv2.COLOR_RGB2BGR)
  return image_array_converted

def preprocess_image(image_array):
    img_array_preprocessed = cv2.resize(image_array, (224, 224))
    img_array_preprocessed = convert_color_type(image_array=img_array_preprocessed)

    return img_array_preprocessed

    