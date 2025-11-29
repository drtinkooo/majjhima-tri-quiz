// Main Application Logic for Majjhima-Tri Quiz

// Global State
let allQuestions = [];
let currentQuiz = {
    questions: [],
    currentIndex: 0,
    score: 0,
    answers: [], // { questionId, correct }
    mode: 'all'
};

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    // Load questions
    if (typeof questionsData !== 'undefined') {
        allQuestions = questionsData;
        document.getElementById('total-questions').textContent = allQuestions.length;
    }
});

// Screen Navigation
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function goHome() {
    showScreen('welcome-screen');
}

// Start Quiz with different modes
function startQuiz(mode) {
    currentQuiz = {
        questions: [],
        currentIndex: 0,
        score: 0,
        answers: [],
        mode: mode
    };
    
    let numQuestions;
    switch(mode) {
        case 'random10':
            numQuestions = 10;
            currentQuiz.questions = getRandomQuestions(numQuestions);
            break;
        case 'random25':
            numQuestions = 25;
            currentQuiz.questions = getRandomQuestions(numQuestions);
            break;
        case 'random50':
            numQuestions = 50;
            currentQuiz.questions = getRandomQuestions(numQuestions);
            break;
        case 'all':
        default:
            currentQuiz.questions = [...allQuestions];
            break;
    }
    
    // Initialize answers array
    currentQuiz.answers = currentQuiz.questions.map(q => ({
        questionId: q.id,
        correct: null
    }));
    
    showScreen('quiz-screen');
    displayQuestion();
}

// Get random questions
function getRandomQuestions(count) {
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

// Display current question
function displayQuestion() {
    const question = currentQuiz.questions[currentQuiz.currentIndex];
    
    // Update question number and text
    document.getElementById('q-number').textContent = `Q${question.id}`;
    document.getElementById('question-text').textContent = question.question;
    document.getElementById('answer-text').textContent = question.answer;
    
    // Update progress
    document.getElementById('current-num').textContent = currentQuiz.currentIndex + 1;
    document.getElementById('total-num').textContent = currentQuiz.questions.length;
    document.getElementById('current-score').textContent = currentQuiz.score;
    
    const progress = ((currentQuiz.currentIndex + 1) / currentQuiz.questions.length) * 100;
    document.getElementById('progress-fill').style.width = `${progress}%`;
    
    // Reset answer visibility
    document.getElementById('answer-box').classList.add('hidden');
    document.getElementById('show-answer-btn').classList.remove('hidden');
    document.getElementById('self-assessment').classList.add('hidden');
    
    // Update navigation buttons
    updateNavigation();
}

// Show answer
function showAnswer() {
    document.getElementById('show-answer-btn').classList.add('hidden');
    document.getElementById('answer-box').classList.remove('hidden');
    document.getElementById('self-assessment').classList.remove('hidden');
}

// Record self-assessment answer
function recordAnswer(isCorrect) {
    currentQuiz.answers[currentQuiz.currentIndex].correct = isCorrect;
    
    if (isCorrect) {
        currentQuiz.score++;
        document.getElementById('current-score').textContent = currentQuiz.score;
    }
    
    // Disable assessment buttons after selection
    document.querySelectorAll('.assess-btn').forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.6';
    });
    
    // Highlight selected button
    const buttons = document.querySelectorAll('.assess-btn');
    buttons.forEach(btn => {
        if (isCorrect && btn.classList.contains('correct')) {
            btn.style.background = '#28a745';
            btn.style.color = 'white';
        } else if (!isCorrect && btn.classList.contains('incorrect')) {
            btn.style.background = '#dc3545';
            btn.style.color = 'white';
        }
    });
    
    // Check if this is the last question
    if (currentQuiz.currentIndex === currentQuiz.questions.length - 1) {
        document.getElementById('next-btn').classList.add('hidden');
        document.getElementById('finish-btn').classList.remove('hidden');
    }
}

// Navigation
function updateNavigation() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const finishBtn = document.getElementById('finish-btn');
    
    prevBtn.disabled = currentQuiz.currentIndex === 0;
    
    // Reset assessment buttons
    document.querySelectorAll('.assess-btn').forEach(btn => {
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.style.background = 'white';
        if (btn.classList.contains('correct')) {
            btn.style.color = '#28a745';
        } else {
            btn.style.color = '#dc3545';
        }
    });
    
    // Check if current question was already answered
    const currentAnswer = currentQuiz.answers[currentQuiz.currentIndex];
    if (currentAnswer && currentAnswer.correct !== null) {
        document.getElementById('show-answer-btn').classList.add('hidden');
        document.getElementById('answer-box').classList.remove('hidden');
        document.getElementById('self-assessment').classList.remove('hidden');
        
        // Show previous answer state
        document.querySelectorAll('.assess-btn').forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.6';
        });
        
        const buttons = document.querySelectorAll('.assess-btn');
        buttons.forEach(btn => {
            if (currentAnswer.correct && btn.classList.contains('correct')) {
                btn.style.background = '#28a745';
                btn.style.color = 'white';
            } else if (!currentAnswer.correct && btn.classList.contains('incorrect')) {
                btn.style.background = '#dc3545';
                btn.style.color = 'white';
            }
        });
    }
    
    // Show/hide finish button
    if (currentQuiz.currentIndex === currentQuiz.questions.length - 1 && 
        currentAnswer && currentAnswer.correct !== null) {
        nextBtn.classList.add('hidden');
        finishBtn.classList.remove('hidden');
    } else {
        nextBtn.classList.remove('hidden');
        finishBtn.classList.add('hidden');
    }
}

function nextQuestion() {
    if (currentQuiz.currentIndex < currentQuiz.questions.length - 1) {
        currentQuiz.currentIndex++;
        displayQuestion();
    }
}

function previousQuestion() {
    if (currentQuiz.currentIndex > 0) {
        currentQuiz.currentIndex--;
        displayQuestion();
    }
}

// Finish Quiz
function finishQuiz() {
    showResults();
}

function showResults() {
    const totalAnswered = currentQuiz.answers.filter(a => a.correct !== null).length;
    const percentage = totalAnswered > 0 ? Math.round((currentQuiz.score / totalAnswered) * 100) : 0;
    
    document.getElementById('final-score').textContent = currentQuiz.score;
    document.getElementById('total-answered').textContent = totalAnswered;
    document.getElementById('percentage').textContent = percentage + '%';
    
    // Set appropriate icon and message
    let icon, message;
    if (percentage >= 90) {
        icon = '🏆';
        message = 'Excellent! You have mastered this material. Sādhu! Sādhu! Sādhu!';
    } else if (percentage >= 75) {
        icon = '🎉';
        message = 'Great job! You have a strong understanding of Vīthisaṅgaha.';
    } else if (percentage >= 60) {
        icon = '👍';
        message = 'Good effort! Keep studying and you will improve.';
    } else if (percentage >= 40) {
        icon = '📚';
        message = 'Keep practicing! Review the material and try again.';
    } else {
        icon = '💪';
        message = 'Don\'t give up! Study the Vīthisaṅgaha chapter and try again.';
    }
    
    document.getElementById('results-icon').textContent = icon;
    document.getElementById('results-message').textContent = message;
    
    showScreen('results-screen');
}

function restartQuiz() {
    startQuiz(currentQuiz.mode);
}

// Review Quiz
function reviewQuiz() {
    displayReviewList('all');
    showScreen('review-screen');
}

function filterReview(filter) {
    // Update button states
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    displayReviewList(filter);
}

function displayReviewList(filter) {
    const reviewList = document.getElementById('review-list');
    reviewList.innerHTML = '';
    
    currentQuiz.questions.forEach((question, index) => {
        const answer = currentQuiz.answers[index];
        if (answer.correct === null) return;
        
        if (filter === 'correct' && !answer.correct) return;
        if (filter === 'incorrect' && answer.correct) return;
        
        const itemClass = answer.correct ? 'correct' : 'incorrect';
        const statusText = answer.correct ? '✓ Correct' : '✗ Incorrect';
        
        const item = document.createElement('div');
        item.className = `review-item ${itemClass}`;
        item.innerHTML = `
            <div class="review-status">${statusText}</div>
            <div class="review-question"><strong>Q${question.id}:</strong> ${question.question}</div>
            <div class="review-answer">
                <div class="review-answer-label">Answer</div>
                <div class="review-answer-text">${question.answer}</div>
            </div>
        `;
        
        reviewList.appendChild(item);
    });
    
    if (reviewList.children.length === 0) {
        reviewList.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No questions match this filter.</p>';
    }
}

// Browse Mode
function showBrowseMode() {
    displayBrowseList(allQuestions);
    showScreen('browse-screen');
}

function displayBrowseList(questions) {
    const browseList = document.getElementById('browse-list');
    browseList.innerHTML = '';
    
    questions.forEach(question => {
        const item = document.createElement('div');
        item.className = 'browse-item';
        item.onclick = function() {
            this.classList.toggle('expanded');
        };
        item.innerHTML = `
            <div class="browse-question">
                <span class="browse-q-num">Q${question.id}</span>
                <span class="browse-q-text">${question.question}</span>
            </div>
            <div class="browse-answer">
                <div class="browse-answer-label">Answer</div>
                <div class="browse-answer-text">${question.answer}</div>
            </div>
        `;
        
        browseList.appendChild(item);
    });
}

function searchQuestions() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    
    if (searchTerm.length === 0) {
        displayBrowseList(allQuestions);
        return;
    }
    
    const filtered = allQuestions.filter(q => 
        q.question.toLowerCase().includes(searchTerm) || 
        q.answer.toLowerCase().includes(searchTerm) ||
        q.id.toString() === searchTerm
    );
    
    displayBrowseList(filtered);
}

// Keyboard Navigation
document.addEventListener('keydown', function(e) {
    const quizScreen = document.getElementById('quiz-screen');
    if (!quizScreen.classList.contains('active')) return;
    
    switch(e.key) {
        case 'ArrowRight':
        case 'n':
            if (!document.getElementById('next-btn').classList.contains('hidden')) {
                nextQuestion();
            }
            break;
        case 'ArrowLeft':
        case 'p':
            previousQuestion();
            break;
        case ' ':
        case 'Enter':
            e.preventDefault();
            if (!document.getElementById('show-answer-btn').classList.contains('hidden')) {
                showAnswer();
            }
            break;
        case '1':
        case 'y':
            if (!document.getElementById('self-assessment').classList.contains('hidden')) {
                recordAnswer(true);
            }
            break;
        case '2':
        case 'x':
            if (!document.getElementById('self-assessment').classList.contains('hidden')) {
                recordAnswer(false);
            }
            break;
    }
});
