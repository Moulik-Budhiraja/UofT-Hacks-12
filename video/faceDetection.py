from typing import Optional, Tuple, Union
import cv2
import numpy as np
import time
from pathlib import Path
import uuid
from collections import defaultdict

# Replace this with your actual import
from faceRecognition import FaceRecognizer


class FaceDetector:
    def __init__(self, prototxt_path: str = 'deploy.prototxt', 
                 model_path: str = 'res10_300x300_ssd_iter_140000_fp16.caffemodel',
                 confidence_threshold: float = 0.5,
                 bbox_scale: float = 1.2) -> None:
        self.net = cv2.dnn.readNetFromCaffe(prototxt_path, model_path)
        self.confidence_threshold = confidence_threshold
        self.bbox_scale = bbox_scale

        self.last_detection_time = 0
        self.last_detection_location = None
        self.last_detection_id = None
        self.last_detection_frame = None
        self.last_detection_frame_full = None

        # Callbacks
        self.on_face_mount = lambda face_id, frame, full_frame: None
        self.on_face_dismount = lambda face_id, frame, full_frame: None

    def detect_faces(self, frame: np.ndarray) -> Optional[Tuple[int, int, int, int]]:
        """Detect faces in the frame and return the largest face."""
        (h, w) = frame.shape[:2]
        blob = cv2.dnn.blobFromImage(cv2.resize(frame, (300, 300)), 
                                     1.0, (300, 300), (104.0, 177.0, 123.0))
        self.net.setInput(blob)
        detections = self.net.forward()

        largest_face = None
        max_area = 0

        for i in range(0, detections.shape[2]):
            confidence = detections[0, 0, i, 2]
            if confidence > self.confidence_threshold:
                box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
                (x, y, x2, y2) = box.astype("int")
                face_width = x2 - x
                face_height = y2 - y
                area = face_width * face_height
                if area > max_area:
                    max_area = area
                    largest_face = (x, y, face_width, face_height)

        # Save previous detection info before updating
        previous_location = self.last_detection_location
        previous_time = self.last_detection_time
        previous_frame = self.last_detection_frame

        if largest_face is not None:
            self._update_detection_info(largest_face, frame)

        # Update detection ID (face_id) based on previous detection
        self._update_detection_id_using_previous(largest_face, previous_location, previous_time, previous_frame)

        return largest_face

    def _update_detection_info(self, face_coords: Tuple[int, int, int, int], frame: np.ndarray) -> None:
        """Update the last detection time, location, and frame."""
        (x, y, w_box, h_box) = face_coords
        self.last_detection_time = time.time()
        self.last_detection_location = (x + w_box // 2, y + h_box // 2)
        
        # Store both full frame and cropped face region
        self.last_detection_frame_full = frame.copy()
        bbox = self.get_adjusted_bbox(face_coords, frame.shape)
        x1, y1, x2, y2 = bbox
        self.last_detection_frame = frame[y1:y2, x1:x2].copy()

    def _update_detection_id_using_previous(
        self, 
        face_coords: Optional[Tuple[int, int, int, int]], 
        prev_location: Optional[Tuple[int, int]], 
        prev_time: float,
        prev_frame: Optional[np.ndarray]
    ) -> Optional[str]:
        """Update detection ID using the previous detection state."""
        old_id = self.last_detection_id

        # If no face detected and more than 1 second passed since last detection
        if face_coords is None and time.time() - prev_time > 1:
            if old_id is not None:
                self.on_face_dismount(old_id, prev_frame, self.last_detection_frame_full)
            self.last_detection_id = None
            return None

        # If there's no face detected but within 1 second window, keep current ID
        if face_coords is None:
            return self.last_detection_id

        # If there's a new face but no previous ID, generate a new one
        if self.last_detection_id is None:
            new_id = str(uuid.uuid4())
            self.last_detection_id = new_id
            # Fire on_mount callback
            self.on_face_mount(new_id, self.last_detection_frame, self.last_detection_frame_full)
            return new_id

        (x, y, w_box, h_box) = face_coords
        current_center_x = x + w_box // 2
        current_center_y = y + h_box // 2

        # Compare current detection against previous state
        if (time.time() - prev_time < 1 and 
            prev_location is not None and 
            abs(prev_location[0] - current_center_x) < 50 and 
            abs(prev_location[1] - current_center_y) < 50):
            # If within 1 second and movement is small, keep same ID
            return self.last_detection_id
        else:
            # Otherwise, generate a new ID (face likely changed)
            if old_id is not None:
                self.on_face_dismount(old_id, prev_frame, self.last_detection_frame_full)
            new_id = str(uuid.uuid4())
            self.last_detection_id = new_id
            self.on_face_mount(new_id, self.last_detection_frame, self.last_detection_frame_full)
            return new_id

    def get_adjusted_bbox(self, face_coords: Tuple[int, int, int, int], 
                          frame_shape: Tuple[int, ...]) -> Tuple[int, int, int, int]:
        """Calculate the adjusted bounding box with scaling."""
        (x, y, w_box, h_box) = face_coords
        box_size = int(max(w_box, h_box) * self.bbox_scale)
        
        x1 = int(x + w_box // 2 - box_size // 2)
        y1 = int(y + h_box // 2 - box_size // 2)
        x2 = int(x + w_box // 2 + box_size // 2)
        y2 = int(y + h_box // 2 + box_size // 2)
        
        # Ensure coordinates are within frame bounds
        x1 = max(0, x1)
        y1 = max(0, y1)
        x2 = min(frame_shape[1], x2)
        y2 = min(frame_shape[0], y2)
        
        return (x1, y1, x2, y2)

    def set_callbacks(self, on_mount: callable = None, on_dismount: callable = None) -> None:
        """Set callback functions for face mounting and dismounting events."""
        if on_mount:
            self.on_face_mount = on_mount
        if on_dismount:
            self.on_face_dismount = on_dismount

class FaceRecorder:
    def __init__(self, save_interval: float = 0.2) -> None:
        self.save_interval = save_interval
        self.last_save_time = 0
        self.is_saving = False
        self.current_person = 0
        self.video_writer = None
        self.recording = False
        self.recording_enabled = True
        self.current_video_path = None  # Track current video path

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        self.stop_recording()
        return False  # Propagate exceptions

    def __del__(self):
        self.stop_recording()

    def start_recording(self, frame_shape, face_id: str, person_name: str) -> None:
        """Start recording a video for the detected face."""
        if self.recording or not self.recording_enabled:
            return

        safe_person_name = "unknown" if not person_name else person_name.strip()
        
        timestamp = int(time.time())
        interactions_dir = Path("interactions")
        person_dir = interactions_dir / "temp"  # Start in temp directory
        person_dir.mkdir(parents=True, exist_ok=True)

        video_path = str(person_dir / f"{timestamp}_{face_id[-6:]}.mov")
        self.current_video_path = video_path
        
        # Use H264 codec for MOV format
        fourcc = cv2.VideoWriter_fourcc(*'avc1')  # or 'H264'
        self.video_writer = cv2.VideoWriter(
            video_path, 
            fourcc, 
            30.0, 
            (frame_shape[1], frame_shape[0])
        )
        
        if not self.video_writer.isOpened():
            print(f"Failed to open video writer for {video_path}")
            self.video_writer = None
            self.current_video_path = None
            return
            
        self.recording = True
        print(f"Started recording to {video_path}")

    def stop_recording(self) -> None:
        if self.video_writer is not None:
            self.video_writer.release()
            self.video_writer = None
        self.recording = False
        # We leave self.current_video_path set in case we need to move/delete that file

    def record_frame(self, frame: np.ndarray) -> None:
        if self.recording and self.video_writer is not None:
            self.video_writer.write(frame)

    def save_face_image(self, frame: np.ndarray) -> None:
        """Optional: Save face still images if is_saving == True."""
        if not self.is_saving:
            return

        current_time = time.time()
        if current_time - self.last_save_time < self.save_interval:
            return

        faces_dir = Path("faces")
        person_dir = faces_dir / f"person_{self.current_person}"
        person_dir.mkdir(parents=True, exist_ok=True)

        timestamp = int(time.time() * 1000)
        image_path = person_dir / f"{timestamp}.jpg"
        cv2.imwrite(str(image_path), frame)
        print(f"Saved face image to {image_path}")
        
        self.last_save_time = current_time

# Globals for face recognition
face_recognition_enabled = True  # Toggle with 'f'

# -- Majority Voting Structures --
# face_id -> label -> number of votes
recognized_votes = dict()

# face_id -> label -> sum of raw_confidences (for computing average)
recognized_confidences = dict()

# face_id -> str (current top voted label)
recognized_person = dict()

# face_id -> float (time of last recognition poll)
last_recog_poll_time = dict()

def on_mount(face_id: str, frame: np.ndarray, full_frame: np.ndarray, recorder: FaceRecorder):
    """
    Called when a new face_id is mounted (detected as a new face).
    We do NOT immediately finalize the recognition here. Instead, we initialize
    data structures for majority voting. We also start recording with "unknown."
    """
    print(f"Face mounted: {face_id}")

    # Initialize voting structures for this face_id
    recognized_votes[face_id] = defaultdict(int)
    recognized_confidences[face_id] = defaultdict(float)
    recognized_person[face_id] = "unknown"
    last_recog_poll_time[face_id] = 0.0

    # Start recording (initially "unknown")
    recorder.start_recording(full_frame.shape, face_id, recognized_person[face_id])

def on_dismount(face_id: str, frame: np.ndarray, full_frame: np.ndarray, recorder: FaceRecorder):
    """
    Called when a face_id is dismounted (face disappears for more than 1s).
    We stop recording, and move the video to the correct person folder based on final recognition.
    Videos shorter than 5 seconds are discarded.
    """
    print(f"Face dismounted: {face_id}")

    # Get final recognition result before cleanup
    final_person = recognized_person.get(face_id, "unknown")

    # Stop recording (this will finalize the current video file)
    recorder.stop_recording()

    # Check if we have a video file to process
    if recorder.current_video_path:
        current_path = Path(recorder.current_video_path)
        if current_path.exists():
            # Check video duration
            try:
                cap = cv2.VideoCapture(str(current_path))
                if cap.isOpened():
                    fps = cap.get(cv2.CAP_PROP_FPS)
                    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
                    duration = frame_count / fps
                    cap.release()

                    if duration < 5.0:  # Less than 5 seconds
                        current_path.unlink()  # Delete the file
                        print(f"Discarded video - too short ({duration:.1f}s)")
                    else:
                        # Move to correct person folder
                        new_path = current_path.parent.parent / final_person / current_path.name
                        new_path.parent.mkdir(parents=True, exist_ok=True)
                        try:
                            current_path.rename(new_path)
                            print(f"Moved video to final location: {new_path}")
                        except Exception as e:
                            print(f"Error moving video file: {e}")
            except Exception as e:
                print(f"Error processing video file: {e}")
                # If there's an error, try to clean up the file
                try:
                    current_path.unlink()
                except:
                    pass

    # Cleanup the dictionaries
    if face_id in recognized_votes:
        del recognized_votes[face_id]
    if face_id in recognized_person:
        del recognized_person[face_id]
    if face_id in last_recog_poll_time:
        del last_recog_poll_time[face_id]

def main() -> None:
    global face_recognition_enabled

    cap = cv2.VideoCapture(1)
    if not cap.isOpened():
        print("Error: Could not open video capture device")
        return

    detector = FaceDetector()
    recognizer = FaceRecognizer()

    with FaceRecorder() as recorder:
        try:
            # Load pre-trained face model if available
            try:
                _, _, label_map = recognizer.load_images_from_folder('faces')
                recognizer.load_model('face_model.xml', label_map)
            except Exception as e:
                print(f"Error loading face model: {e}")
                print("Face recognition disabled. Press 'f' to re-enable after retraining.")
                face_recognition_enabled = False

            # Set detector callbacks (use partial or lambdas to pass recorder)
            detector.set_callbacks(
                on_mount=lambda face_id, frame, full_frame: on_mount(face_id, frame, full_frame, recorder),
                on_dismount=lambda face_id, frame, full_frame: on_dismount(face_id, frame, full_frame, recorder)
            )

            while True:
                ret, frame = cap.read()
                if not ret:
                    print("Error: Failed to grab frame")
                    break
                if frame is None:
                    print("Error: Captured frame is None")
                    break

                # Keep a clean copy for usage (saving or recording)
                clean_frame = frame.copy()

                # Detect the largest face
                largest_face = detector.detect_faces(frame)
                current_face_id = detector.last_detection_id

                # If we have a currently active face_id, attempt recognition polling
                if face_recognition_enabled and current_face_id is not None:
                    now = time.time()
                    # Poll recognition about once per second
                    if now - last_recog_poll_time[current_face_id] > 1.0:
                        last_recog_poll_time[current_face_id] = now

                        # Get the face crop
                        face_crop = detector.last_detection_frame
                        if face_crop is not None and face_crop.size > 0:
                            try:
                                pred_person, raw_confidence, norm_confidence = recognizer.predict(face_crop)

                                # Decide a label from norm_confidence (or other criteria)
                                if norm_confidence > 50:  # Adjust threshold if desired
                                    label = pred_person
                                else:
                                    label = "unknown"

                                # Record a vote
                                recognized_votes[current_face_id][label] += 1
                                # Accumulate raw confidence for computing averages
                                recognized_confidences[current_face_id][label] += raw_confidence

                                # Determine majority label so far
                                max_label = max(
                                    recognized_votes[current_face_id],
                                    key=recognized_votes[current_face_id].get
                                )
                                recognized_person[current_face_id] = max_label

                                print(
                                    f"Face {current_face_id} polled as '{label}' "
                                    f"(raw_conf={raw_confidence:.1f}, norm_conf={norm_confidence:.1f}) | "
                                    f"Current majority: {max_label}"
                                )

                            except Exception as e:
                                print(f"Recognition error for {current_face_id}: {e}")
                                face_recognition_enabled = False

                # If face detected, handle bounding box and overlay
                if largest_face is not None and current_face_id is not None:
                    bbox = detector.get_adjusted_bbox(largest_face, frame.shape)
                    face_image = clean_frame[bbox[1]:bbox[3], bbox[0]:bbox[2]]

                    # Save face image if saving is enabled
                    recorder.save_face_image(face_image)

                    # Record full frame if recording is active
                    recorder.record_frame(clean_frame)

                    # Draw bounding box
                    cv2.rectangle(frame, (bbox[0], bbox[1]), (bbox[2], bbox[3]), (0, 255, 0), 2)

                    # ID text for debugging
                    short_id_text = current_face_id[-6:]
                    cv2.putText(frame, short_id_text, (bbox[0], bbox[1] - 10), 
                                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

                    # Recognized name from majority votes
                    if current_face_id in recognized_person:
                        current_name = recognized_person[current_face_id]
                    else:
                        current_name = "unknown"

                    # Display recognized name below the bounding box
                    cv2.putText(frame, current_name, (bbox[0], bbox[3] + 20), 
                                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

                # (Optional) draw a circle around last_detection_location
                if detector.last_detection_location is not None:
                    cv2.circle(frame, 
                               (int(detector.last_detection_location[0]), 
                                int(detector.last_detection_location[1])), 
                               5, (0, 0, 255), -1)

                # Status displays
                status_text = f"Saving: {recorder.is_saving} | Person: {recorder.current_person}"
                cv2.putText(frame, status_text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                
                recording_status = "Recording: ON" if recorder.recording_enabled else "Recording: OFF"
                recognition_status = "Recognition: ON" if face_recognition_enabled else "Recognition: OFF"
                cv2.putText(frame, recording_status, (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                cv2.putText(frame, recognition_status, (10, 90), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

                cv2.imshow('Face Detection', frame)

                key = cv2.waitKey(1) & 0xFF
                if key == ord('q'):
                    break
                elif key == ord('r'):  # Toggle recording
                    recorder.recording_enabled = not recorder.recording_enabled
                    if not recorder.recording_enabled:
                        recorder.stop_recording()
                    print(f"Recording {'enabled' if recorder.recording_enabled else 'disabled'}")
                elif key == ord('f'):  # Toggle face recognition
                    face_recognition_enabled = not face_recognition_enabled
                    print(f"Face recognition {'enabled' if face_recognition_enabled else 'disabled'}")
                elif key == ord('a'):
                    recorder.current_person -= 1
                elif key == ord('s'):
                    recorder.is_saving = not recorder.is_saving
                elif key == ord('d'):
                    recorder.current_person += 1
                elif key == ord('t'):
                    # Retrain the model (if desired)
                    try:
                        recognizer.train('faces')
                        recognizer.save_model('face_model.xml')
                        print("Face model trained successfully")
                        face_recognition_enabled = True
                    except Exception as e:
                        print(f"Error training face model: {e}")
                        face_recognition_enabled = False

        except Exception as e:
            print(f"Error in main loop: {str(e)}")
            import traceback
            traceback.print_exc()
        finally:
            recorder.stop_recording()
            cap.release()
            cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
