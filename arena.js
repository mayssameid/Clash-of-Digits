
const API_URL = window.location.port === '5500'
  ? 'http://localhost:3000/api'
  : window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api' 
  : '/api';

// this keeps track of everything happening in the game
let gameState = {
    player1Name: sessionStorage.getItem("player1Name") || "Player 1",
    player2Name: sessionStorage.getItem("player2Name") || "Computer",
    gameMode: sessionStorage.getItem("gameMode") || "single-player",
    difficulty: sessionStorage.getItem("difficulty") || "easy",
    currentTurn: sessionStorage.getItem("player1Name") || "Player 1",
    player1Score: 0,
    player2Score: 0,
    player1Correct: 0,
    player2Correct: 0,
    currentQuestionNumber: 1,
    totalQuestions: 10,
    timeRemaining: 10,
    timerInterval: null,
    currentCorrectAnswer: null,
    currentAnswers: [],
    isComputerThinking: false,
    player1Id: sessionStorage.getItem("player1Id") || null,
    player2Id: sessionStorage.getItem("player2Id") || null,
    sessionId: sessionStorage.getItem("sessionId") || null,
    gameStartTime: Date.now()
};

// sound effects
const soundEffects = {
    tick: new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA=='),
    timesUp: new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA=='),
    correct: new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA=='),
    wrong: new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==')
};

// when the page loads, this starts everything up
document.addEventListener('DOMContentLoaded', function() {
    console.log("Game initialized with:", gameState);
    
    loadSoundEffects();
    
    // showing the player names on screen
    document.getElementById("player1-name").textContent = `Player 1: ${gameState.player1Name}`;
    document.getElementById("player2-name").textContent = `Player 2: ${gameState.player2Name}`;
    
    updateScoreDisplay();
    updateTurnDisplay();
    displayQuestion();
    
    setupEventListeners();
});

function loadSoundEffects() {
    soundEffects.tick = createBeepSound(800, 0.1, 0.1); 
    soundEffects.timesUp = createBeepSound(400, 0.3, 0.2); 
    soundEffects.correct = createBeepSound(1200, 0.3, 0.2); 
    soundEffects.wrong = createBeepSound(300, 0.5, 0.3); 
}

function createBeepSound(frequency, duration, volume = 0.1) {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
        
        return {
            play: function() {
                const newContext = new (window.AudioContext || window.webkitAudioContext)();
                const newOscillator = newContext.createOscillator();
                const newGain = newContext.createGain();
                
                newOscillator.connect(newGain);
                newGain.connect(newContext.destination);
                
                newOscillator.frequency.value = frequency;
                newOscillator.type = 'sine';
                
                newGain.gain.setValueAtTime(0, newContext.currentTime);
                newGain.gain.linearRampToValueAtTime(volume, newContext.currentTime + 0.01);
                newGain.gain.exponentialRampToValueAtTime(0.001, newContext.currentTime + duration);
                
                newOscillator.start(newContext.currentTime);
                newOscillator.stop(newContext.currentTime + duration);
            }
        };
    } catch (error) {
        return { play: function() {} };
    }
}

function setupEventListeners() {
    const answerButtons = document.querySelectorAll(".answer-button");
    answerButtons.forEach(button => {
        button.addEventListener("click", function() {
            if (canPlayerAnswer()) {
                soundEffects.tick.play();
                handleAnswerSelection(this);
            }
        });
    });
    
    document.getElementById("next-question-btn").addEventListener("click", function() {
        soundEffects.tick.play();
        this.style.display = "none";
        gameState.currentQuestionNumber++;
        displayQuestion();
    });
}

function canPlayerAnswer() {
    if (gameState.gameMode === "single-player") {
        return gameState.currentTurn === gameState.player1Name && !gameState.isComputerThinking;
    }
    return true;
}

function updateTurnDisplay() {
    // showing whose turn it is and what question we're on
    let turnText = `It's ${gameState.currentTurn}'s Turn - Question ${gameState.currentQuestionNumber}/${gameState.totalQuestions}`;
    if (gameState.gameMode === "single-player" && gameState.currentTurn === gameState.player2Name) {
        turnText += " (Computer's Turn)";
    }
    document.getElementById("current-turn").textContent = turnText;
}

function updateScoreDisplay() {
    document.getElementById("player1-score").textContent = `${gameState.player1Name}: ${gameState.player1Score}`;
    document.getElementById("player2-score").textContent = `${gameState.player2Name}: ${gameState.player2Score}`;
}

function generateQuestion() {
    // picking a random math operation (+, -, or *)
    const operators = ['+', '-', '*'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    
    let num1, num2;
    
    // making the numbers harder or easier based on difficulty setting
    switch(gameState.difficulty) {
        case 'easy':
            num1 = Math.floor(Math.random() * 10) + 1;
            num2 = Math.floor(Math.random() * 10) + 1;
            break;
        case 'moderate':
            num1 = Math.floor(Math.random() * 20) + 1;
            num2 = Math.floor(Math.random() * 20) + 1;
            break;
        case 'hard':
            num1 = Math.floor(Math.random() * 50) + 1;
            num2 = Math.floor(Math.random() * 50) + 1;
            break;
    }
    
    let question, correctAnswer;
    
    // calculating the correct answer based on the operation
    switch(operator) {
        case '+':
            question = `${num1} + ${num2}`;
            correctAnswer = num1 + num2;
            break;
        case '-':
            // ensures positive result
            if (num1 < num2) [num1, num2] = [num2, num1];
            question = `${num1} - ${num2}`;
            correctAnswer = num1 - num2;
            break;
        case '*':
            question = `${num1} × ${num2}`;
            correctAnswer = num1 * num2;
            break;
    }
    
    return { question, correctAnswer };
}

function displayQuestion() {
    const questionData = generateQuestion();
    document.getElementById("math-question").textContent = questionData.question;
    gameState.currentCorrectAnswer = questionData.correctAnswer;
    
    // generates answers
    const answers = generateAnswers(questionData.correctAnswer);
    gameState.currentAnswers = answers;
    
    // displays answers on buttons
    const answerButtons = document.querySelectorAll(".answer-button");
    answerButtons.forEach((button, index) => {
        button.textContent = answers[index];
        button.disabled = false;
        button.style.backgroundColor = "#0fcece";
        button.classList.remove("correct", "incorrect");
    });
    
    // resets and starts timer
    gameState.timeRemaining = 10;
    startTimer();
    updateTurnDisplay();
    
    // if it's the computer's turn, make it play
    if (gameState.gameMode === "single-player" && gameState.currentTurn === gameState.player2Name) {
        setTimeout(() => {
            computerPlay();
        }, 500);
    }
}

function generateAnswers(correctAnswer) {
    const answers = [correctAnswer];
    
    // generates wrong answers
    while (answers.length < 4) {
        let wrongAnswer;
        if (gameState.difficulty === 'easy') {
            wrongAnswer = correctAnswer + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 5) + 1);
        } else if (gameState.difficulty === 'moderate') {
            wrongAnswer = correctAnswer + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 8) + 2);
        } else {
            wrongAnswer = correctAnswer + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 15) + 5);
        }
    
        if (!answers.includes(wrongAnswer) && wrongAnswer > 0 && wrongAnswer !== correctAnswer) {
            answers.push(wrongAnswer);
        }
    }
    
    return shuffleArray(answers);
}

function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function startTimer() {
    clearInterval(gameState.timerInterval);
    
    document.getElementById("timer").textContent = `Time Remaining: ${gameState.timeRemaining}`;
    
    gameState.timerInterval = setInterval(() => {
        gameState.timeRemaining--;
        document.getElementById("timer").textContent = `Time Remaining: ${gameState.timeRemaining}`;
        
        if (gameState.timeRemaining <= 5 && gameState.timeRemaining > 0) {
            soundEffects.tick.play();
        }
        
        if (gameState.timeRemaining <= 5) {
            document.getElementById("timer").style.color = "#e94560";
            document.getElementById("timer").style.fontWeight = "bold";
        } else {
            document.getElementById("timer").style.color = "#ffdd00";
            document.getElementById("timer").style.fontWeight = "normal";
        }
        
        if (gameState.timeRemaining <= 0) {
            clearInterval(gameState.timerInterval);
            soundEffects.timesUp.play(); 
            handleTimeUp();
        }
    }, 1000);
}

function computerPlay() {
    console.log("Computer is playing...");
    gameState.isComputerThinking = true;
    
    // disables buttons during computer's turn
    const answerButtons = document.querySelectorAll(".answer-button");
    answerButtons.forEach(button => {
        button.disabled = true;
    });
    
    const thinkingTime = 800 + Math.random() * 700;
    
    setTimeout(() => {
        let selectedAnswer;
        const correctIndex = gameState.currentAnswers.indexOf(gameState.currentCorrectAnswer);
        
        const random = Math.random();
        let correctChance;
        
        switch(gameState.difficulty) {
            case 'easy':
                correctChance = 0.4; // 40% chance correct
                break;
            case 'moderate':
                correctChance = 0.6; // 60% chance correct
                break;
            case 'hard':
                correctChance = 0.8; // 80% chance correct
                break;
        }
        
        if (random < correctChance) {
            selectedAnswer = gameState.currentCorrectAnswer;
        } else {
            const wrongAnswers = gameState.currentAnswers.filter((ans, idx) => idx !== correctIndex);
            selectedAnswer = wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)];
        }
        
        const answerButtons = document.querySelectorAll(".answer-button");
        let selectedButton;
        answerButtons.forEach(button => {
            if (parseInt(button.textContent) === selectedAnswer) {
                selectedButton = button;
            }
        });
        
        if (selectedButton) {
            handleAnswerSelection(selectedButton, true);
        }
        
        gameState.isComputerThinking = false;
    }, thinkingTime);
}

function handleTimeUp() {
    // disables all buttons
    const answerButtons = document.querySelectorAll(".answer-button");
    answerButtons.forEach(button => {
        button.disabled = true;
    });
    
    // shows correct answer
    highlightCorrectAnswer();
    
    // shows next question button
    document.getElementById("next-question-btn").style.display = "inline-block";
    
    // switches turn
    switchTurn();
}

function handleAnswerSelection(selectedButton, isComputer = false) {
    clearInterval(gameState.timerInterval);
    
    const answerButtons = document.querySelectorAll(".answer-button");
    answerButtons.forEach(button => {
        button.disabled = true;
        
        // highlights correct/incorrect
        if (parseInt(button.textContent) === gameState.currentCorrectAnswer) {
            button.style.backgroundColor = "#4CAF50";
            button.classList.add("correct");
        } else if (button === selectedButton) {
            button.style.backgroundColor = "#e94560";
            button.classList.add("incorrect");
        }
    });

    const isCorrect = parseInt(selectedButton.textContent) === gameState.currentCorrectAnswer;
    
    if (isCorrect) {
        if (gameState.currentTurn === gameState.player1Name) {
            gameState.player1Score++;
            gameState.player1Correct++;
        } else {
            gameState.player2Score++;
            gameState.player2Correct++;
        }
        updateScoreDisplay();

        // plays correct sound
        if (!isComputer) {
            soundEffects.correct.play();
            showFeedback("Correct! 🎉", "#4CAF50");
        }
    } else {
        // plays wrong sound
        if (!isComputer) {
            soundEffects.wrong.play();
            showFeedback("Wrong! ❌", "#e94560");
        }
    }

    // moves to next question after delay
    setTimeout(() => {
        if (gameState.currentQuestionNumber >= gameState.totalQuestions) {
            endGame();
        } else {
            document.getElementById("next-question-btn").style.display = "inline-block";
            switchTurn();
        }
    }, 1500);
}

function switchTurn() {
    if (gameState.gameMode === "single-player") {
        gameState.currentTurn = gameState.currentTurn === gameState.player1Name ? gameState.player2Name : gameState.player1Name;
    } else {
        gameState.currentTurn = gameState.currentTurn === gameState.player1Name ? gameState.player2Name : gameState.player1Name;
    }
}

function highlightCorrectAnswer() {
    const answerButtons = document.querySelectorAll(".answer-button");
    answerButtons.forEach(button => {
        if (parseInt(button.textContent) === gameState.currentCorrectAnswer) {
            button.style.backgroundColor = "#4CAF50";
            button.classList.add("correct");
        }
    });
}

function showFeedback(message, color) {
    const feedback = document.createElement('div');
    feedback.textContent = message;
    feedback.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: ${color};
        color: white;
        padding: 15px 30px;
        border-radius: 8px;
        font-size: 1.2rem;
        font-weight: bold;
        z-index: 1000;
    `;
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        document.body.removeChild(feedback);
    }, 1000);
}

// this function sends the player's score to the back-end server after the game ends
// it's called for both players when the game finishes
async function saveScoreToDatabase(userId, score, correctAnswers, totalQuestions, timeSpent) {
    if (!userId || !gameState.sessionId) {
        console.log("No user ID or session ID - skipping database save");
        return;
    }

    try {
        // this saves the score data to the scores table in the database
        const response = await fetch(`${API_URL}/scores`, {
            method: 'POST', // POST method to create a new score record
            headers: {
                'Content-Type': 'application/json', 
            },
            body: JSON.stringify({
                session_id: gameState.sessionId, // links this score to the game session
                user_id: userId, // which player earned this score
                score: score, // total points (100 per correct answer)
                correct_answers: correctAnswers, // how many questions were answered correctly
                total_questions: totalQuestions, // total number of questions in the game
                time_spent: timeSpent // how long the game took in seconds
            })
        });

        if (!response.ok) {
            throw new Error('Failed to save score');
        }

        const result = await response.json();
        console.log('Score saved successfully:', result);
        return result;
    } catch (error) {
        console.error('Error saving score to database:', error);
    }
}

async function endGame() {
    soundEffects.correct.play();
    
    document.querySelector('.question').style.display = 'none';
    document.querySelector('.answers').style.display = 'none';
    document.querySelector('.timer').style.display = 'none';
    document.getElementById('next-question-btn').style.display = 'none';
    
    const gameEndTime = Date.now();
    const timeSpentSeconds = Math.floor((gameEndTime - gameState.gameStartTime) / 1000);
    
    if (gameState.player1Id) {
        await saveScoreToDatabase(
            gameState.player1Id, // player 1's user ID from database
            gameState.player1Score * 100, // score calculation (100 points per correct answer)
            gameState.player1Correct, // number of correct answers
            gameState.totalQuestions, // total questions in the game (10)
            timeSpentSeconds // how long the game took
        );
    }
    
    if (gameState.player2Id && gameState.gameMode === 'multiplayer') {
        await saveScoreToDatabase(
            gameState.player2Id,
            gameState.player2Score * 100, // score calculation
            gameState.player2Correct,
            gameState.totalQuestions,
            timeSpentSeconds
        );
    }
    
    // shows results
    const resultsDiv = document.createElement('div');
    resultsDiv.className = 'game-results';
    resultsDiv.innerHTML = `
        <h2>Game Over! 🏆</h2>
        <div class="final-scores">
            <h3>Final Scores:</h3>
            <div class="score-item ${gameState.player1Score > gameState.player2Score ? 'winner' : ''}">
                <span class="player-name">${gameState.player1Name}:</span>
                <span class="player-score">${gameState.player1Score}/${gameState.totalQuestions}</span>
            </div>
            <div class="score-item ${gameState.player2Score > gameState.player1Score ? 'winner' : ''}">
                <span class="player-name">${gameState.player2Name}:</span>
                <span class="player-score">${gameState.player2Score}/${gameState.totalQuestions}</span>
            </div>
        </div>
        ${getWinnerMessage()}
        <div class="game-actions">
            <button class="primary-action" onclick="window.location.reload()">Play Again</button>
            <button class="secondary-action" onclick="window.location.href='home.html'">Back to Home</button>
            <button class="secondary-action" onclick="window.location.href='leaderboard.html'">View Leaderboard</button>
        </div>
    `;
    
    document.querySelector('.game-arena').appendChild(resultsDiv);
}

function getWinnerMessage() {
    if (gameState.player1Score > gameState.player2Score) {
        return `<div class="winner-message">🎉 ${gameState.player1Name} Wins! 🎉</div>`;
    } else if (gameState.player2Score > gameState.player1Score) {
        return `<div class="winner-message">🎉 ${gameState.player2Name} Wins! 🎉</div>`;
    } else {
        return `<div class="winner-message">🤝 It's a Tie! 🤝</div>`;
    }
}