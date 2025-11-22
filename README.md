# Gesture Controlled Rock Paper Scissors

A modern, interactive web application that lets you play Rock Paper Scissors using real-time hand gestures via your webcam. Built with Vite, MediaPipe, and GSAP.

![Project Preview](https://rock-paper-scissor-ivory-iota.vercel.app/)

## 🌟 Features

-   **📷 Real-time Gesture Recognition**: Uses MediaPipe Tasks Vision to detect hand landmarks instantly.
-   **🧠 Custom Training Mode**: Teach the AI your specific hand gestures for Rock, Paper, and Scissors to improve accuracy.
    -   Includes **Scale Invariance**: Recognized gestures regardless of hand distance from the camera.
-   **✨ Modern UI**: Sleek Glassmorphism design with smooth animations powered by GSAP.
-   **⚡ Fast & Responsive**: Built on Vite for lightning-fast development and production performance.

## 🚀 Getting Started

### Prerequisites

-   Node.js (v14 or higher)
-   npm (v6 or higher)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/fun-geek/RockPaperScissor.git
    cd RockPaperScissor
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start the development server:
    ```bash
    npm run dev
    ```

4.  Open your browser and navigate to the local URL provided (usually `http://localhost:5173`).
5.  Allow camera access when prompted.

## 🎮 How to Play

1.  **Wait for the Countdown**: The game will count down "3, 2, 1, SHOOT!".
2.  **Make Your Move**: Show your hand gesture clearly to the camera when "SHOOT!" appears.
    -   ✊ **Rock**: Closed fist
    -   ✋ **Paper**: Open palm
    -   ✌️ **Scissors**: Victory sign (V)
3.  **See the Result**: The AI will compare your move with the computer's random choice and declare the winner.

## 🎓 Training Mode

If the game isn't recognizing your gestures correctly:
1.  Look at the **"Train Your Gestures"** panel.
2.  Hold your desired pose (e.g., a specific way you hold "Rock").
3.  Click the corresponding **Train** button 5-10 times.
4.  The AI will now prioritize your custom examples!
5.  Click **Reset Training** to clear custom data.

## 🛠️ Technologies Used

-   [Vite](https://vitejs.dev/) - Next Generation Frontend Tooling
-   [MediaPipe](https://developers.google.com/mediapipe) - Machine Learning solutions for live and streaming media
-   [GSAP](https://greensock.com/gsap/) - GreenSock Animation Platform
-   [Vanilla JS/CSS](http://vanilla-js.com/) - Core web technologies

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
