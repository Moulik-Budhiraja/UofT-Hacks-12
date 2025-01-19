import cv2
import os
import numpy as np


def load_images_from_folder(folder):
    images, labels = [], []
    label_map = {}
    current_label = 0

    for person_name in os.listdir(folder):
        person_path = os.path.join(folder, person_name)
        if not os.path.isdir(person_path):
            continue

        # Map each person to a unique label
        label_map[current_label] = person_name
        for image_name in os.listdir(person_path):
            image_path = os.path.join(person_path, image_name)
            img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)  # Read as grayscale
            if img is not None:
                images.append(img)
                labels.append(current_label)
        
        current_label += 1

    return images, np.array(labels), label_map

# Load dataset
dataset_path = 'faces'
images, labels, label_map = load_images_from_folder(dataset_path)


# Initialize Fisherface recognizer
model = cv2.face.FisherFaceRecognizer_create()

# Train the model
model.train(images, labels)

print("Model trained successfully!")

model.save('face_model.xml')


def predict_face(test_image_path, model, label_map):
    test_img = cv2.imread(test_image_path, cv2.IMREAD_GRAYSCALE)
    if test_img is None:
        print("Test image not found.")
        return

    predicted_label, confidence = model.predict(test_img)
    predicted_person = label_map[predicted_label]
    print(f"Predicted: {predicted_person} with confidence {confidence}")
    return predicted_person, confidence

# Test the model
test_image = 'person_7/1737179617930.jpg'
predict_face(test_image, model, label_map)
