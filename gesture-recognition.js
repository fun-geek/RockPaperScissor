import {
  GestureRecognizer,
  FilesetResolver,
  DrawingUtils
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";

export class GestureManager {
  constructor() {
    this.gestureRecognizer = null;
    this.runningMode = "VIDEO";
    this.webcamRunning = false;
    this.videoElement = document.getElementById("webcam");
    this.canvasElement = document.getElementById("output_canvas");
    this.canvasCtx = this.canvasElement.getContext("2d");
    this.lastVideoTime = -1;
    this.results = undefined;
    this.currentGesture = "None";
    this.classifier = new KNNClassifier();
  }

  async initialize() {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
    );

    this.gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
        delegate: "GPU"
      },
      runningMode: this.runningMode
    });

    console.log("GestureRecognizer initialized");
  }

  async startCamera() {
    if (!this.gestureRecognizer) {
      console.warn("GestureRecognizer not initialized");
      return;
    }

    const constraints = {
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.videoElement.srcObject = stream;
      this.videoElement.addEventListener("loadeddata", () => {
        this.webcamRunning = true;
        this.predictWebcam();
      });
    } catch (err) {
      console.error("Error accessing webcam:", err);
      alert("Camera access is required for this game.");
    }
  }

  async predictWebcam() {
    if (this.runningMode === "IMAGE") {
      this.runningMode = "VIDEO";
      await this.gestureRecognizer.setOptions({ runningMode: "VIDEO" });
    }

    if (this.videoElement.currentTime !== this.lastVideoTime) {
      this.lastVideoTime = this.videoElement.currentTime;
      this.results = this.gestureRecognizer.recognizeForVideo(this.videoElement, Date.now());
    }

    this.canvasCtx.save();
    this.canvasCtx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);

    // Resize canvas to match video
    this.canvasElement.width = this.videoElement.videoWidth;
    this.canvasElement.height = this.videoElement.videoHeight;

    if (this.results.landmarks) {
      for (const landmarks of this.results.landmarks) {
        this.drawLandmarks(landmarks);
      }
    }

    if (this.results.gestures.length > 0 || this.results.landmarks) {
      let knnResult = null;

      // Try KNN first if we have landmarks
      if (this.results.landmarks && this.results.landmarks.length > 0) {
        knnResult = this.classifier.predict(this.results.landmarks[0]);
      }

      if (knnResult) {
        console.log(`KNN Detected: ${knnResult}`);
        this.currentGesture = knnResult;
      } else if (this.results.gestures.length > 0) {
        const categoryName = this.results.gestures[0][0].categoryName;
        const score = this.results.gestures[0][0].score;

        // Lower threshold and debug log
        if (score > 0.4) {
          console.log(`MediaPipe Detected: ${categoryName} (${score.toFixed(2)})`);
          this.currentGesture = this.mapGesture(categoryName);
        } else {
          this.currentGesture = "None";
        }
      } else {
        this.currentGesture = "None";
      }
    } else {
      this.currentGesture = "None";
    }

    this.canvasCtx.restore();

    if (this.webcamRunning) {
      window.requestAnimationFrame(() => this.predictWebcam());
    }
  }

  drawLandmarks(landmarks) {
    this.canvasCtx.fillStyle = "#6366f1";
    this.canvasCtx.strokeStyle = "#ffffff";
    this.canvasCtx.lineWidth = 2;

    for (const point of landmarks) {
      const x = point.x * this.canvasElement.width;
      const y = point.y * this.canvasElement.height;

      this.canvasCtx.beginPath();
      this.canvasCtx.arc(x, y, 4, 0, 2 * Math.PI);
      this.canvasCtx.fill();
      this.canvasCtx.stroke();
    }
  }

  mapGesture(mediapipeGesture) {
    switch (mediapipeGesture) {
      case "Closed_Fist":
      case "Thumb_Up":
      case "Thumb_Down":
        return "Rock";
      case "Open_Palm":
        return "Paper";
      case "Victory":
      case "Pointing_Up":
        return "Scissors";
      default:
        return "None";
    }
  }

  getCurrentGesture() {
    return this.currentGesture;
  }

  // Training Methods
  addExample(label) {
    if (this.results && this.results.landmarks && this.results.landmarks.length > 0) {
      // Use the first detected hand
      const landmarks = this.results.landmarks[0];
      this.classifier.addExample(landmarks, label);
      return true;
    }
    return false;
  }

  resetTraining() {
    this.classifier.reset();
  }

  getExampleCounts() {
    return this.classifier.getCounts();
  }
}

class KNNClassifier {
  constructor() {
    this.examples = [];
    this.k = 3;
  }

  addExample(landmarks, label) {
    // Pre-process: Normalize to be translation invariant
    const features = this.preprocessLandmarks(landmarks);
    this.examples.push({ features, label });
  }

  predict(landmarks) {
    if (this.examples.length === 0) return null;

    const features = this.preprocessLandmarks(landmarks);

    // Calculate distances to all examples
    const distances = this.examples.map(example => {
      const dist = this.euclideanDistance(features, example.features);
      return { dist, label: example.label };
    });

    // Sort by distance
    distances.sort((a, b) => a.dist - b.dist);

    // Get top K
    const kNearest = distances.slice(0, this.k);

    // Vote
    const counts = {};
    kNearest.forEach(item => {
      counts[item.label] = (counts[item.label] || 0) + 1;
    });

    // Find winner
    let maxCount = -1;
    let winner = null;
    for (const label in counts) {
      if (counts[label] > maxCount) {
        maxCount = counts[label];
        winner = label;
      }
    }

    return winner;
  }

  preprocessLandmarks(landmarks) {
    // 1. Find wrist (point 0)
    const wrist = landmarks[0];

    // 2. Subtract wrist from all points to center at (0,0,0)
    let centered = landmarks.map(p => ({
      x: p.x - wrist.x,
      y: p.y - wrist.y,
      z: p.z - wrist.z
    }));

    // 3. Scale Normalization
    // Find max distance from wrist
    let maxDist = 0;
    for (const p of centered) {
      const dist = Math.sqrt(p.x ** 2 + p.y ** 2 + p.z ** 2);
      if (dist > maxDist) maxDist = dist;
    }

    // Normalize to unit scale
    if (maxDist > 0) {
      centered = centered.map(p => ({
        x: p.x / maxDist,
        y: p.y / maxDist,
        z: p.z / maxDist
      }));
    }

    // 4. Flatten
    return centered.flatMap(p => [p.x, p.y, p.z]);
  }

  euclideanDistance(a, b) {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      sum += (a[i] - b[i]) ** 2;
    }
    return Math.sqrt(sum);
  }

  reset() {
    this.examples = [];
  }

  getCounts() {
    const counts = { Rock: 0, Paper: 0, Scissors: 0 };
    this.examples.forEach(ex => {
      if (counts[ex.label] !== undefined) counts[ex.label]++;
    });
    return counts;
  }
}
