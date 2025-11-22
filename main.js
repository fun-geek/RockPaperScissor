import { GestureManager } from './gesture-recognition.js';
import gsap from 'gsap';

const gestureManager = new GestureManager();
const startBtn = document.getElementById('start-btn');
const playerGestureLabel = document.getElementById('player-gesture');
const countdownEl = document.getElementById('countdown');
const computerHandEl = document.getElementById('computer-hand');
const resultDisplay = document.getElementById('result-display');
const loadingOverlay = document.getElementById('loading-overlay');

// Training Elements
const trainRockBtn = document.getElementById('train-rock');
const trainPaperBtn = document.getElementById('train-paper');
const trainScissorsBtn = document.getElementById('train-scissors');
const resetTrainingBtn = document.getElementById('reset-training');
const countRock = document.getElementById('count-rock');
const countPaper = document.getElementById('count-paper');
const countScissors = document.getElementById('count-scissors');

let gameState = 'IDLE'; // IDLE, COUNTDOWN, RESULT

// Initialize App
async function init() {
    try {
        await gestureManager.initialize();
        await gestureManager.startCamera();
        loadingOverlay.style.display = 'none';

        // Start the continuous gesture checking loop for UI feedback
        updateGestureUI();
    } catch (error) {
        console.error("Initialization failed", error);
        loadingOverlay.innerHTML = `<p>Error: ${error.message}</p>`;
    }
}

function updateGestureUI() {
    if (gameState === 'IDLE' || gameState === 'COUNTDOWN') {
        const gesture = gestureManager.getCurrentGesture();
        playerGestureLabel.textContent = gesture === 'None' ? 'Waiting...' : gesture;

        // Visual feedback for detected gesture
        if (gesture !== 'None') {
            playerGestureLabel.style.borderColor = '#4ade80';
            playerGestureLabel.style.color = '#4ade80';
        } else {
            playerGestureLabel.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            playerGestureLabel.style.color = '#fff';
        }
    }
    requestAnimationFrame(updateGestureUI);
}

// Training Events
trainRockBtn.addEventListener('click', () => trainGesture('Rock'));
trainPaperBtn.addEventListener('click', () => trainGesture('Paper'));
trainScissorsBtn.addEventListener('click', () => trainGesture('Scissors'));
resetTrainingBtn.addEventListener('click', resetTraining);

function trainGesture(label) {
    const success = gestureManager.addExample(label);
    if (success) {
        updateTrainingCounts();
        // Visual feedback
        const btn = label === 'Rock' ? trainRockBtn : label === 'Paper' ? trainPaperBtn : trainScissorsBtn;
        const originalText = btn.innerHTML;
        btn.style.background = '#4ade80';
        setTimeout(() => {
            btn.style.background = '';
        }, 200);
    } else {
        alert("No hand detected! Please show your hand to the camera.");
    }
}

function resetTraining() {
    gestureManager.resetTraining();
    updateTrainingCounts();
    alert("Training data has been reset!");
}

function updateTrainingCounts() {
    const counts = gestureManager.getExampleCounts();
    countRock.textContent = counts.Rock;
    countPaper.textContent = counts.Paper;
    countScissors.textContent = counts.Scissors;
}

startBtn.addEventListener('click', startGame);

function startGame() {
    if (gameState === 'COUNTDOWN') return;

    gameState = 'COUNTDOWN';
    startBtn.disabled = true;
    resultDisplay.classList.add('hidden');
    resultDisplay.className = 'result-text hidden'; // Reset classes

    // Reset Computer Hand
    computerHandEl.textContent = '✊';

    // Animate Countdown
    const tl = gsap.timeline({
        onComplete: resolveGame
    });

    // Shake animation
    tl.to(computerHandEl, {
        rotation: -30,
        duration: 0.5,
        yoyo: true,
        repeat: 2,
        ease: "power1.inOut"
    }, 0);

    // Countdown text
    countdownEl.textContent = "3";
    tl.to(countdownEl, { scale: 1.5, duration: 0.5, ease: "back.out(1.7)" }, 0)
        .to(countdownEl, { scale: 1, duration: 0.5 }, 0.5)
        .call(() => countdownEl.textContent = "2", null, 1)
        .to(countdownEl, { scale: 1.5, duration: 0.5, ease: "back.out(1.7)" }, 1)
        .to(countdownEl, { scale: 1, duration: 0.5 }, 1.5)
        .call(() => countdownEl.textContent = "1", null, 2)
        .to(countdownEl, { scale: 1.5, duration: 0.5, ease: "back.out(1.7)" }, 2)
        .to(countdownEl, { scale: 1, duration: 0.5 }, 2.5)
        .call(() => countdownEl.textContent = "SHOOT!", null, 3);
}

function resolveGame() {
    gameState = 'RESULT';

    // 1. Get Player Move
    let playerMove = gestureManager.getCurrentGesture();

    // Fallback if no gesture detected or invalid
    if (playerMove === 'None') {
        playerMove = 'Rock'; // Default to Rock if nothing detected to keep game flowing, or we could show error
        playerGestureLabel.textContent = "No Gesture (Default: Rock)";
    } else {
        playerGestureLabel.textContent = playerMove;
    }

    // 2. Get Computer Move
    const moves = ['Rock', 'Paper', 'Scissors'];
    const computerMove = moves[Math.floor(Math.random() * moves.length)];

    // Update Computer UI
    const emojiMap = {
        'Rock': '✊',
        'Paper': '✋',
        'Scissors': '✌️'
    };
    computerHandEl.textContent = emojiMap[computerMove];

    // 3. Determine Winner
    let result = '';
    if (playerMove === computerMove) {
        result = 'DRAW';
    } else if (
        (playerMove === 'Rock' && computerMove === 'Scissors') ||
        (playerMove === 'Paper' && computerMove === 'Rock') ||
        (playerMove === 'Scissors' && computerMove === 'Paper')
    ) {
        result = 'YOU WIN!';
    } else {
        result = 'YOU LOSE!';
    }

    // 4. Show Result
    resultDisplay.textContent = result;
    resultDisplay.classList.remove('hidden');

    if (result === 'YOU WIN!') resultDisplay.classList.add('win');
    else if (result === 'YOU LOSE!') resultDisplay.classList.add('lose');
    else resultDisplay.classList.add('draw');

    startBtn.disabled = false;
    gameState = 'IDLE';
}

// Start
init();
