// Game State
class GameState {
    constructor() {
        this.currentLevel = 1;
        this.score = 0;
        this.lives = 3;
        this.timeRemaining = 60;
        this.isGameActive = false;
        this.timer = null;
        this.streak = 0;
        this.multiplier = 1;
        this.currentChallenge = null;
        this.memorySequence = [];
        this.playerSequence = [];
    }

    reset() {
        this.currentLevel = 1;
        this.score = 0;
        this.lives = 3;
        this.timeRemaining = 60;
        this.isGameActive = false;
        this.streak = 0;
        this.multiplier = 1;
        this.currentChallenge = null;
        this.memorySequence = [];
        this.playerSequence = [];
        this.clearTimer();
    }

    clearTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
}

// Challenge Database
const challenges = [
    {
        id: "level1_pattern_completion",
        type: "multiple_choice",
        level: 1,
        question: "What comes next: 2, 4, 8, 16, ?",
        options: ["24", "32", "30", "28"],
        answer: "32",
        timeLimit: 60
    },
    {
        id: "level2_memory_flash",
        type: "memory_flash",
        level: 2,
        question: "Memorize the color sequence and repeat it.",
        sequenceLength: 4,
        timeLimit: 50
    },
    {
        id: "level3_logic_gate",
        type: "text_input",
        level: 3,
        question: "If A is true, B is false. If B is false, C is true. Is C true or false?",
        answer: "true",
        timeLimit: 45
    },
    {
        id: "level4_math_trap",
        type: "multiple_choice",
        level: 4,
        question: "Find the missing number: 1, 4, 9, 16, 25, ?",
        options: ["30", "36", "35", "32"],
        answer: "36",
        timeLimit: 40
    },
    {
        id: "level5_visual_rotation",
        type: "multiple_choice",
        level: 5,
        question: "If you rotate the number 6 by 180 degrees, what do you get?",
        options: ["6", "9", "b", "d"],
        answer: "9",
        timeLimit: 35
    },
    {
        id: "level6_anagram",
        type: "text_input",
        level: 6,
        question: "Unscramble the letters to form a word: 'TPEAL'",
        answer: "plate",
        timeLimit: 30
    },
    {
        id: "level7_deduction",
        type: "multiple_choice",
        level: 7,
        question: "John is taller than Mary. Mary is taller than Tom. Who is the tallest?",
        options: ["John", "Mary", "Tom", "Cannot determine"],
        answer: "John",
        timeLimit: 25
    },
    {
        id: "level8_sequence_prediction",
        type: "text_input",
        level: 8,
        question: "What is the next number in the Fibonacci sequence: 0, 1, 1, 2, 3, 5, 8, ?",
        answer: "13",
        timeLimit: 20
    },
    {
        id: "level9_spatial_reasoning",
        type: "multiple_choice",
        level: 9,
        question: "How many faces does a cube have?",
        options: ["4", "6", "8", "12"],
        answer: "6",
        timeLimit: 15
    },
    {
        id: "level10_cryptic_clues",
        type: "text_input",
        level: 10,
        question: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
        answer: "echo",
        timeLimit: 10
    }
];

// Game instance
const game = new GameState();

// DOM Elements
const elements = {
    startScreen: document.getElementById('start-screen'),
    gameScreen: document.getElementById('game-screen'),
    gameOverScreen: document.getElementById('game-over-screen'),
    victoryScreen: document.getElementById('victory-screen'),
    
    currentLevel: document.getElementById('current-level'),
    currentScore: document.getElementById('current-score'),
    currentLives: document.getElementById('current-lives'),
    timer: document.getElementById('timer'),
    timerFill: document.getElementById('timer-fill'),
    
    challengeTitle: document.getElementById('challenge-title'),
    questionText: document.getElementById('question-text'),
    optionsContainer: document.getElementById('options-container'),
    inputContainer: document.getElementById('input-container'),
    answerInput: document.getElementById('answer-input'),
    submitAnswerBtn: document.getElementById('submit-answer-btn'),
    memoryContainer: document.getElementById('memory-container'),
    memoryDisplay: document.getElementById('memory-display'),
    memoryInput: document.getElementById('memory-input'),
    
    finalScore: document.getElementById('final-score'),
    finalLevel: document.getElementById('final-level'),
    victoryScore: document.getElementById('victory-score'),
    
    startGameBtn: document.getElementById('start-game-btn'),
    restartGameBtn: document.getElementById('restart-game-btn'),
    playAgainBtn: document.getElementById('play-again-btn')
};

// Event Listeners
elements.startGameBtn.addEventListener('click', startGame);
elements.restartGameBtn.addEventListener('click', restartGame);
elements.playAgainBtn.addEventListener('click', restartGame);
elements.submitAnswerBtn.addEventListener('click', submitTextAnswer);
elements.answerInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        submitTextAnswer();
    }
});

// Game Functions
function startGame() {
    game.reset();
    showScreen('game-screen');
    loadChallenge(game.currentLevel);
    updateUI();
}

function restartGame() {
    game.reset();
    showScreen('start-screen');
    updateUI();
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    document.getElementById(screenId).classList.remove('hidden');
}

function loadChallenge(level) {
    if (level > challenges.length) {
        endGame(true); // Victory
        return;
    }

    game.currentChallenge = challenges[level - 1];
    game.timeRemaining = game.currentChallenge.timeLimit;
    
    elements.challengeTitle.textContent = `Challenge ${level}`;
    elements.questionText.textContent = game.currentChallenge.question;
    
    // Hide all challenge types
    elements.optionsContainer.classList.add('hidden');
    elements.inputContainer.classList.add('hidden');
    elements.memoryContainer.classList.add('hidden');
    
    // Show appropriate challenge type
    switch (game.currentChallenge.type) {
        case 'multiple_choice':
            setupMultipleChoice();
            break;
        case 'text_input':
            setupTextInput();
            break;
        case 'memory_flash':
            setupMemoryFlash();
            break;
    }
    
    startTimer();
    updateUI();
}

function setupMultipleChoice() {
    elements.optionsContainer.classList.remove('hidden');
    elements.optionsContainer.innerHTML = '';
    
    game.currentChallenge.options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = option;
        button.dataset.answer = option;
        button.addEventListener('click', () => selectOption(button));
        elements.optionsContainer.appendChild(button);
    });
}

function setupTextInput() {
    elements.inputContainer.classList.remove('hidden');
    elements.answerInput.value = '';
    elements.answerInput.focus();
}

function setupMemoryFlash() {
    elements.memoryContainer.classList.remove('hidden');
    
    // Generate random color sequence
    const colors = ['red', 'blue', 'green', 'yellow'];
    game.memorySequence = [];
    game.playerSequence = [];
    
    for (let i = 0; i < game.currentChallenge.sequenceLength; i++) {
        game.memorySequence.push(colors[Math.floor(Math.random() * colors.length)]);
    }
    
    // Setup color buttons
    const colorButtons = elements.memoryInput.querySelectorAll('.color-btn');
    colorButtons.forEach(btn => {
        btn.addEventListener('click', () => selectColor(btn.dataset.color));
    });
    
    // Flash the sequence
    flashSequence();
}

function flashSequence() {
    const colorBoxes = elements.memoryDisplay.querySelectorAll('.color-box');
    let index = 0;
    
    const flashInterval = setInterval(() => {
        if (index < game.memorySequence.length) {
            const color = game.memorySequence[index];
            const colorBox = Array.from(colorBoxes).find(box => box.dataset.color === color);
            
            // Flash the color
            colorBox.style.backgroundColor = getColorValue(color);
            colorBox.classList.add('flash');
            
            setTimeout(() => {
                colorBox.style.backgroundColor = '#f0f0f0';
                colorBox.classList.remove('flash');
            }, 500);
            
            index++;
        } else {
            clearInterval(flashInterval);
        }
    }, 800);
}

function getColorValue(color) {
    const colorMap = {
        'red': '#ff4757',
        'blue': '#3742fa',
        'green': '#2ed573',
        'yellow': '#ffa502'
    };
    return colorMap[color];
}

function selectOption(button) {
    // Remove previous selections
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Select current option
    button.classList.add('selected');
    
    // Check answer after a short delay
    setTimeout(() => {
        checkAnswer(button.dataset.answer);
    }, 300);
}

function selectColor(color) {
    game.playerSequence.push(color);
    
    // Visual feedback
    const colorBtn = document.querySelector(`[data-color="${color}"]`);
    colorBtn.classList.add('selected');
    setTimeout(() => colorBtn.classList.remove('selected'), 200);
    
    // Check if sequence is complete
    if (game.playerSequence.length === game.memorySequence.length) {
        checkMemoryAnswer();
    }
}

function submitTextAnswer() {
    const answer = elements.answerInput.value.trim().toLowerCase();
    checkAnswer(answer);
}

function checkAnswer(playerAnswer) {
    game.clearTimer();
    const correctAnswer = game.currentChallenge.answer.toLowerCase();
    const isCorrect = playerAnswer === correctAnswer;
    
    if (isCorrect) {
        handleCorrectAnswer();
    } else {
        handleIncorrectAnswer();
    }
}

function checkMemoryAnswer() {
    game.clearTimer();
    const isCorrect = JSON.stringify(game.playerSequence) === JSON.stringify(game.memorySequence);
    
    if (isCorrect) {
        handleCorrectAnswer();
    } else {
        handleIncorrectAnswer();
    }
}

function handleCorrectAnswer() {
    // Calculate score based on remaining time
    const timeBonus = Math.floor(game.timeRemaining * 10);
    const levelBonus = game.currentLevel * 50;
    const streakBonus = game.streak >= 2 ? Math.floor(timeBonus * game.multiplier) : 0;
    
    game.score += timeBonus + levelBonus + streakBonus;
    game.streak++;
    
    // Update multiplier
    if (game.streak >= 3) {
        game.multiplier = 2;
    }
    
    // Visual feedback
    showFeedback(true);
    
    // Move to next level
    setTimeout(() => {
        game.currentLevel++;
        loadChallenge(game.currentLevel);
    }, 1500);
}

function handleIncorrectAnswer() {
    game.lives--;
    game.streak = 0;
    game.multiplier = 1;
    
    // Visual feedback
    showFeedback(false);
    
    if (game.lives <= 0) {
        setTimeout(() => {
            endGame(false);
        }, 1500);
    } else {
        // Retry current level
        setTimeout(() => {
            loadChallenge(game.currentLevel);
        }, 1500);
    }
}

function showFeedback(isCorrect) {
    if (isCorrect) {
        // Highlight correct answer
        if (game.currentChallenge.type === 'multiple_choice') {
            const correctBtn = document.querySelector(`[data-answer="${game.currentChallenge.answer}"]`);
            if (correctBtn) correctBtn.classList.add('correct');
        }
        
        // Add pulse animation to score
        elements.currentScore.classList.add('pulse');
        setTimeout(() => elements.currentScore.classList.remove('pulse'), 500);
    } else {
        // Show incorrect feedback
        if (game.currentChallenge.type === 'multiple_choice') {
            const selectedBtn = document.querySelector('.option-btn.selected');
            if (selectedBtn) selectedBtn.classList.add('incorrect');
            
            const correctBtn = document.querySelector(`[data-answer="${game.currentChallenge.answer}"]`);
            if (correctBtn) correctBtn.classList.add('correct');
        }
        
        // Add shake animation to lives
        elements.currentLives.classList.add('shake');
        setTimeout(() => elements.currentLives.classList.remove('shake'), 500);
    }
    
    updateUI();
}

function startTimer() {
    game.isGameActive = true;
    
    game.timer = setInterval(() => {
        game.timeRemaining--;
        updateTimerDisplay();
        
        if (game.timeRemaining <= 0) {
            game.clearTimer();
            handleIncorrectAnswer();
        }
    }, 1000);
}

function updateTimerDisplay() {
    elements.timer.textContent = game.timeRemaining;
    
    // Update timer bar
    const percentage = (game.timeRemaining / game.currentChallenge.timeLimit) * 100;
    elements.timerFill.style.width = `${percentage}%`;
    
    // Change color based on remaining time
    if (percentage > 50) {
        elements.timerFill.style.background = '#2ed573';
    } else if (percentage > 25) {
        elements.timerFill.style.background = '#ffa502';
    } else {
        elements.timerFill.style.background = '#ff4757';
    }
}

function updateUI() {
    elements.currentLevel.textContent = game.currentLevel;
    elements.currentScore.textContent = game.score.toLocaleString();
    elements.currentLives.textContent = game.lives;
    elements.timer.textContent = game.timeRemaining;
}

function endGame(isVictory) {
    game.clearTimer();
    game.isGameActive = false;
    
    if (isVictory) {
        elements.victoryScore.textContent = `Final Score: ${game.score.toLocaleString()}`;
        showScreen('victory-screen');
    } else {
        elements.finalScore.textContent = `Final Score: ${game.score.toLocaleString()}`;
        elements.finalLevel.textContent = `Levels Completed: ${game.currentLevel - 1}`;
        showScreen('game-over-screen');
    }
}

// Initialize the game
updateUI();

