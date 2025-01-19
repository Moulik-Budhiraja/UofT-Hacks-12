import cv2
import os
import numpy as np
from typing import List, Tuple, Dict, Union


class FaceRecognizer:
    def __init__(self):
        """Initialize the FaceRecognizer with a FisherFaceRecognizer."""
        self.model = cv2.face.LBPHFaceRecognizer_create()
        self.label_map: Dict[int, str] = {}
        self.target_size = (300, 300)  # Add standard size for all images

    def load_images_from_folder(self, folder: str) -> Tuple[List[np.ndarray], np.ndarray, Dict[int, str]]:
        """
        Load images and labels from a given folder.

        Args:
            folder (str): Path to the dataset folder.

        Returns:
            Tuple[List[np.ndarray], np.ndarray, Dict[int, str]]: List of images, corresponding labels, and label map.
        """
        images, labels = [], []
        current_label = 0

        for person_name in os.listdir(folder):
            person_path = os.path.join(folder, person_name)
            if not os.path.isdir(person_path):
                continue

            self.label_map[current_label] = person_name
            for image_name in os.listdir(person_path):
                image_path = os.path.join(person_path, image_name)
                img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
                if img is not None:
                    # Resize image to standard size
                    img = cv2.resize(img, self.target_size)
                    images.append(self.preprocess_face(img))
                    labels.append(current_label)

            current_label += 1

        return images, np.array(labels), self.label_map

    def preprocess_face(self, img_gray):
        face = cv2.equalizeHist(img_gray)  # or CLAHE
        face = cv2.resize(face, self.target_size)
        return face


    def train(self, dataset_path: str) -> None:
        """
        Train the FisherFaceRecognizer model on a dataset.

        Args:
            dataset_path (str): Path to the dataset folder.
        """
        images, labels, label_map = self.load_images_from_folder(dataset_path)
        self.model.train(images, labels)
        self.label_map = label_map
        print("Model trained successfully!")

    def save_model(self, file_path: str) -> None:
        """
        Save the trained model to a file.

        Args:
            file_path (str): Path to save the model file.
        """
        self.model.save(file_path)
        print(f"Model saved to {file_path}")

    def load_model(self, file_path: str, label_map: Dict[int, str]) -> None:
        """
        Load a previously saved model.

        Args:
            file_path (str): Path to the saved model file.
            label_map (Dict[int, str]): Label map to associate labels with person names.
        """
        self.model.read(file_path)
        self.label_map = label_map
        print(f"Model loaded from {file_path}")

    def predict(self, image: Union[str, np.ndarray]) -> Union[Tuple[str, float, float], None]:
        """
        Predict the label of a given image.

        Args:
            image (Union[str, np.ndarray]): Path to the test image or OpenCV frame in grayscale.

        Returns:
            Union[Tuple[str, float, float], None]: Predicted person name, raw confidence, and normalized confidence (0-100%).
        """
        if isinstance(image, str):
            test_img = cv2.imread(image, cv2.IMREAD_GRAYSCALE)
            if test_img is None:
                print("Test image not found.")
                return None
        else:
            test_img = image if len(image.shape) == 2 else cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Resize test image to match training image size
        test_img = cv2.resize(test_img, self.target_size)
        test_img = self.preprocess_face(test_img)

        predicted_label, raw_confidence = self.model.predict(test_img)
        predicted_person = self.label_map[predicted_label]
        
        # Convert raw confidence to percentage (0-100%)
        # LBPH typically gives lower scores for better matches
        # Using a sigmoid-like function for better scaling
        normalized_confidence = 100 * (1 / (1 + np.exp(raw_confidence/50 - 4)))
        
        print(f"Predicted: {predicted_person} with confidence {normalized_confidence:.1f}%")
        return predicted_person, raw_confidence, normalized_confidence


# Example usage
if __name__ == "__main__":
    recognizer = FaceRecognizer()

    # Train the model
    dataset_path = "faces"
    recognizer.train(dataset_path)

    # Save the model
    recognizer.save_model("face_model.xml")

    # Load the model
    recognizer.load_model("face_model.xml", recognizer.label_map)

    # Predict a test image
    test_image = "person_7/1737179617930.jpg"
    recognizer.predict(test_image)
