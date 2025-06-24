// Telegram Web App initialization
let tg = window.Telegram?.WebApp;

// Initialize Telegram Web App
if (tg) {
    tg.ready();
    tg.expand();
    
    // Set theme colors
    if (tg.themeParams) {
        document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#ffffff');
        document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#000000');
        document.documentElement.style.setProperty('--tg-theme-hint-color', tg.themeParams.hint_color || '#999999');
        document.documentElement.style.setProperty('--tg-theme-link-color', tg.themeParams.link_color || '#4facfe');
        document.documentElement.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color || '#4facfe');
        document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.themeParams.button_text_color || '#ffffff');
        document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', tg.themeParams.secondary_bg_color || '#f0f0f0');
        document.documentElement.style.setProperty('--tg-theme-header-bg-color', tg.themeParams.header_bg_color || '#4facfe');
    }
}

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
        this.language = 'ar'; // Default to Arabic
        this.userId = tg?.initDataUnsafe?.user?.id || null;
        this.userName = tg?.initDataUnsafe?.user?.first_name || 'مستخدم';
        this.highScore = this.loadHighScore();
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

    saveHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            if (typeof(Storage) !== "undefined") {
                localStorage.setItem(`mindshift_highscore_${this.userId || 'guest'}`, this.highScore);
            }
        }
    }

    loadHighScore() {
        if (typeof(Storage) !== "undefined") {
            return parseInt(localStorage.getItem(`mindshift_highscore_${this.userId || 'guest'}`) || '0');
        }
        return 0;
    }
}

// Challenge Database - Arabic
const challengesArabic = [
    {
        id: "level1_pattern_completion",
        type: "multiple_choice",
        level: 1,
        question: "ما هو الرقم التالي: 2، 4، 8، 16، ؟",
        options: ["24", "32", "30", "28"],
        answer: "32",
        timeLimit: 60
    },
    {
        id: "level2_memory_flash",
        type: "memory_flash",
        level: 2,
        question: "احفظ تسلسل الألوان وكرره.",
        sequenceLength: 4,
        timeLimit: 50
    },
    {
        id: "level3_logic_gate",
        type: "text_input",
        level: 3,
        question: "إذا كان أ صحيح، فإن ب خاطئ. إذا كان ب خاطئ، فإن ج صحيح. هل ج صحيح أم خاطئ؟",
        answer: "صحيح",
        timeLimit: 45
    },
    {
        id: "level4_math_trap",
        type: "multiple_choice",
        level: 4,
        question: "أوجد الرقم المفقود: 1، 4، 9، 16، 25، ؟",
        options: ["30", "36", "35", "32"],
        answer: "36",
        timeLimit: 40
    },
    {
        id: "level5_visual_rotation",
        type: "multiple_choice",
        level: 5,
        question: "إذا قمت بتدوير الرقم 6 بزاوية 180 درجة، ماذا تحصل؟",
        options: ["6", "9", "b", "d"],
        answer: "9",
        timeLimit: 35
    },
    {
        id: "level6_anagram",
        type: "text_input",
        level: 6,
        question: "رتب الحروف لتكوين كلمة: 'ب ت ا ك'",
        answer: "كتاب",
        timeLimit: 30
    },
    {
        id: "level7_deduction",
        type: "multiple_choice",
        level: 7,
        question: "أحمد أطول من فاطمة. فاطمة أطول من علي. من هو الأطول؟",
        options: ["أحمد", "فاطمة", "علي", "لا يمكن تحديد"],
        answer: "أحمد",
        timeLimit: 25
    },
    {
        id: "level8_sequence_prediction",
        type: "text_input",
        level: 8,
        question: "ما هو الرقم التالي في متتالية فيبوناتشي: 0، 1، 1، 2، 3، 5، 8، ؟",
        answer: "13",
        timeLimit: 20
    },
    {
        id: "level9_spatial_reasoning",
        type: "multiple_choice",
        level: 9,
        question: "كم عدد أوجه المكعب؟",
        options: ["4", "6", "8", "12"],
        answer: "6",
        timeLimit: 15
    },
    {
        id: "level10_cryptic_clues",
        type: "text_input",
        level: 10,
        question: "أتكلم بلا فم وأسمع بلا أذن. ليس لي جسد، لكنني أحيا بالريح. ما أنا؟",
        answer: "صدى",
        timeLimit: 10
    }
];

// Challenge Database - English
const challengesEnglish = [
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

// UI Text translations
const uiText = {
    ar: {
        gameTitle: "تحدي العقول",
        welcome: "مرحباً بك في تحدي العقول",
        description: "اختبر ذكاءك مع تحديات متزايدة الصعوبة!",
        startChallenge: "ابدأ التحدي",
        level: "المستوى",
        score: "النقاط",
        lives: "الأرواح",
        time: "الوقت",
        challenge: "التحدي",
        submit: "إرسال",
        enterAnswer: "أدخل إجابتك",
        gameOver: "انتهت اللعبة",
        finalScore: "النقاط النهائية:",
        levelsCompleted: "المستويات المكتملة:",
        playAgain: "العب مرة أخرى",
        congratulations: "تهانينا!",
        allChallengesComplete: "لقد أكملت جميع التحديات!",
        copyright: "© 2025 تحدي العقول - تحدى عقلك",
        shareScore: "شارك النتيجة",
        inviteFriends: "ادع الأصدقاء",
        challengeFriends: "تحدى الأصدقاء",
        shareAchievement: "شارك الإنجاز"
    },
    en: {
        gameTitle: "MindShift",
        welcome: "Welcome to MindShift",
        description: "Test your intelligence with increasingly difficult challenges!",
        startChallenge: "Start Challenge",
        level: "Level",
        score: "Score",
        lives: "Lives",
        time: "Time",
        challenge: "Challenge",
        submit: "Submit",
        enterAnswer: "Enter your answer",
        gameOver: "Game Over",
        finalScore: "Final Score:",
        levelsCompleted: "Levels Completed:",
        playAgain: "Play Again",
        congratulations: "Congratulations!",
        allChallengesComplete: "You've completed all challenges!",
        copyright: "© 2025 MindShift - Challenge Your Mind",
        shareScore: "Share Score",
        inviteFriends: "Invite Friends",
        challengeFriends: "Challenge Friends",
        shareAchievement: "Share Achievement"
    }
};

// Game instance
const game = new GameState();

// DOM Elements
const elements = {
    startScreen: document.getElementById('start-screen'),
    gameScreen: document.getElementById('game-screen'),
    gameOverScreen: document.getElementById('game-over-screen'),
    victoryScreen: document.getElementById('victory-screen'),
    
    userInfo: document.getElementById('user-info'),
    userName: document.getElementById('user-name'),
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
    playAgainBtn: document.getElementById('play-again-btn'),
    toggleLanguageBtn: document.getElementById('toggle-language'),
    
    // Telegram specific buttons
    shareScoreBtn: document.getElementById('share-score-btn'),
    inviteFriendsBtn: document.getElementById('invite-friends-btn'),
    shareFinalScoreBtn: document.getElementById('share-final-score-btn'),
    shareVictoryBtn: document.getElementById('share-victory-btn'),
    challengeFriendsBtn: document.getElementById('challenge-friends-btn')
};

// Event Listeners
elements.startGameBtn.addEventListener('click', startGame);
elements.restartGameBtn.addEventListener('click', restartGame);
elements.playAgainBtn.addEventListener('click', restartGame);
elements.submitAnswerBtn.addEventListener('click', submitTextAnswer);
elements.toggleLanguageBtn.addEventListener('click', toggleLanguage);
elements.answerInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        submitTextAnswer();
    }
});

// Telegram specific event listeners
if (elements.shareScoreBtn) {
    elements.shareScoreBtn.addEventListener('click', () => shareScore(false));
}
if (elements.inviteFriendsBtn) {
    elements.inviteFriendsBtn.addEventListener('click', inviteFriends);
}
if (elements.shareFinalScoreBtn) {
    elements.shareFinalScoreBtn.addEventListener('click', () => shareScore(true));
}
if (elements.shareVictoryBtn) {
    elements.shareVictoryBtn.addEventListener('click', () => shareVictory());
}
if (elements.challengeFriendsBtn) {
    elements.challengeFriendsBtn.addEventListener('click', challengeFriends);
}

// Telegram Web App Functions
function shareScore(isFinal = false) {
    if (!tg) return;
    
    const text = game.language === 'ar' 
        ? `🧠 لقد حصلت على ${game.score} نقطة في تحدي العقول! هل يمكنك التفوق علي؟`
        : `🧠 I scored ${game.score} points in MindShift! Can you beat my score?`;
    
    tg.switchInlineQuery(text, ['users', 'groups']);
}

function shareVictory() {
    if (!tg) return;
    
    const text = game.language === 'ar' 
        ? `🏆 لقد أكملت جميع تحديات "تحدي العقول" بنقاط ${game.score}! تحداني الآن!`
        : `🏆 I completed all MindShift challenges with ${game.score} points! Challenge me now!`;
    
    tg.switchInlineQuery(text, ['users', 'groups']);
}

function inviteFriends() {
    if (!tg) return;
    
    const text = game.language === 'ar' 
        ? `🎮 تعال العب معي "تحدي العقول" - لعبة ألغاز ممتعة لاختبار ذكائك!`
        : `🎮 Come play MindShift with me - a fun puzzle game to test your intelligence!`;
    
    tg.switchInlineQuery(text, ['users', 'groups']);
}

function challengeFriends() {
    if (!tg) return;
    
    const text = game.language === 'ar' 
        ? `🎯 تحدي: هل يمكنك الحصول على أكثر من ${game.score} نقطة في تحدي العقول؟`
        : `🎯 Challenge: Can you score more than ${game.score} points in MindShift?`;
    
    tg.switchInlineQuery(text, ['users', 'groups']);
}

function sendDataToTelegram(data) {
    if (tg && tg.sendData) {
        tg.sendData(JSON.stringify(data));
    }
}

// Language Functions
function toggleLanguage() {
    game.language = game.language === 'ar' ? 'en' : 'ar';
    updateLanguage();
}

function updateLanguage() {
    const text = uiText[game.language];
    const isArabic = game.language === 'ar';
    
    // Update document direction and language
    document.documentElement.lang = game.language;
    document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
    document.body.style.direction = isArabic ? 'rtl' : 'ltr';
    document.body.style.textAlign = isArabic ? 'right' : 'left';
    
    // Update UI text
    document.querySelector('.game-title').textContent = text.gameTitle;
    document.querySelector('.start-content h2').textContent = text.welcome;
    document.querySelector('.start-content p').textContent = text.description;
    elements.startGameBtn.textContent = text.startChallenge;
    elements.toggleLanguageBtn.textContent = game.language === 'ar' ? 'English' : 'العربية';
    
    // Update stat labels
    document.querySelectorAll('.stat-label')[0].textContent = text.level;
    document.querySelectorAll('.stat-label')[1].textContent = text.score;
    document.querySelectorAll('.stat-label')[2].textContent = text.lives;
    document.querySelectorAll('.stat-label')[3].textContent = text.time;
    
    // Update other UI elements
    elements.submitAnswerBtn.textContent = text.submit;
    elements.answerInput.placeholder = text.enterAnswer;
    elements.restartGameBtn.textContent = text.playAgain;
    elements.playAgainBtn.textContent = text.playAgain;
    
    // Update Telegram buttons
    if (elements.shareScoreBtn) elements.shareScoreBtn.textContent = text.shareScore;
    if (elements.inviteFriendsBtn) elements.inviteFriendsBtn.textContent = text.inviteFriends;
    if (elements.shareFinalScoreBtn) elements.shareFinalScoreBtn.textContent = text.shareScore;
    if (elements.shareVictoryBtn) elements.shareVictoryBtn.textContent = text.shareAchievement;
    if (elements.challengeFriendsBtn) elements.challengeFriendsBtn.textContent = text.challengeFriends;
    
    document.querySelector('.game-footer p').textContent = text.copyright;
    
    // Update user name
    if (elements.userName) {
        elements.userName.textContent = `${isArabic ? 'مرحباً' : 'Hello'} ${game.userName}!`;
    }
}

// Game Functions
function startGame() {
    game.reset();
    showScreen('game-screen');
    loadChallenge(game.currentLevel);
    updateUI();
    
    // Send game start event to Telegram
    sendDataToTelegram({
        action: 'game_started',
        userId: game.userId,
        timestamp: Date.now()
    });
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

function getCurrentChallenges() {
    return game.language === 'ar' ? challengesArabic : challengesEnglish;
}

function loadChallenge(level) {
    const challenges = getCurrentChallenges();
    
    if (level > challenges.length) {
        endGame(true); // Victory
        return;
    }

    game.currentChallenge = challenges[level - 1];
    game.timeRemaining = game.currentChallenge.timeLimit;
    
    const text = uiText[game.language];
    elements.challengeTitle.textContent = `${text.challenge} ${level}`;
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
    
    // Send answer data to Telegram
    sendDataToTelegram({
        action: 'answer_submitted',
        level: game.currentLevel,
        isCorrect: isCorrect,
        timeRemaining: game.timeRemaining,
        score: game.score,
        userId: game.userId
    });
    
    if (isCorrect) {
        handleCorrectAnswer();
    } else {
        handleIncorrectAnswer();
    }
}

function checkMemoryAnswer() {
    game.clearTimer();
    const isCorrect = JSON.stringify(game.playerSequence) === JSON.stringify(game.memorySequence);
    
    // Send answer data to Telegram
    sendDataToTelegram({
        action: 'memory_answer_submitted',
        level: game.currentLevel,
        isCorrect: isCorrect,
        timeRemaining: game.timeRemaining,
        score: game.score,
        userId: game.userId
    });
    
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
        
        // Haptic feedback for Telegram
        if (tg && tg.HapticFeedback) {
            tg.HapticFeedback.notificationOccurred('success');
        }
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
        
        // Haptic feedback for Telegram
        if (tg && tg.HapticFeedback) {
            tg.HapticFeedback.notificationOccurred('error');
        }
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
    game.saveHighScore();
    
    const text = uiText[game.language];
    
    // Send game end data to Telegram
    sendDataToTelegram({
        action: 'game_ended',
        isVictory: isVictory,
        finalScore: game.score,
        levelsCompleted: game.currentLevel - 1,
        highScore: game.highScore,
        userId: game.userId
    });
    
    if (isVictory) {
        document.querySelector('.victory-content h2').textContent = text.congratulations;
        document.querySelector('.victory-content p').textContent = text.allChallengesComplete;
        elements.victoryScore.textContent = `${text.finalScore} ${game.score.toLocaleString()}`;
        showScreen('victory-screen');
        
        // Haptic feedback for victory
        if (tg && tg.HapticFeedback) {
            tg.HapticFeedback.notificationOccurred('success');
        }
    } else {
        document.querySelector('#game-over-title').textContent = text.gameOver;
        elements.finalScore.textContent = `${text.finalScore} ${game.score.toLocaleString()}`;
        elements.finalLevel.textContent = `${text.levelsCompleted} ${game.currentLevel - 1}`;
        showScreen('game-over-screen');
        
        // Haptic feedback for game over
        if (tg && tg.HapticFeedback) {
            tg.HapticFeedback.impactOccurred('heavy');
        }
    }
}

// Initialize the game
updateLanguage();
updateUI();

// Initialize user info if available
if (game.userName && elements.userName) {
    elements.userName.textContent = `${game.language === 'ar' ? 'مرحباً' : 'Hello'} ${game.userName}!`;
}

