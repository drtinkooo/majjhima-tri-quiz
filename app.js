// Main Application Logic for Majjhima-Tri Quiz
// Covers both Vīthisaṅgaha (Chapter 4) and Vīthimuttasaṅgaha (Chapter 5)

// Global State
let allQuestions = [];
let allChapters = [];
let selectedChapters = new Set();
let currentQuiz = {
    questions: [],
    currentIndex: 0,
    score: 0,
    answers: [],
    mode: 'all'
};

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    // Load questions
    if (typeof questionsData !== 'undefined') {
        allQuestions = questionsData;
    }
    
    // Extract unique chapters from questions
    allChapters = [...new Set(allQuestions.map(q => q.chapter))].sort();
    
    // Initialize all chapters as selected by default
    allChapters.forEach(ch => selectedChapters.add(ch));
    
    // Initialize UI
    initializeChapterSelection();
    initializeBrowseFilter();
    updateTotalCount();
    updateSelectedCount();
});

// Initialize Chapter Checkboxes grouped by topic
function initializeChapterSelection() {
    const container = document.getElementById('chapter-checkboxes');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Group chapters by main topic
    const vithisangahaChapters = allChapters.filter(c => 
        c.includes('Vīthisaṅgaha') && !c.includes('Vīthimuttasaṅgaha'));
    const bhumiChapters = allChapters.filter(c => c.includes('Bhūmicatukka'));
    const patisandhiChapters = allChapters.filter(c => c.includes('Paṭisandhicatukka'));
    const kammaChapters = allChapters.filter(c => c.includes('Kammacatukka'));
    const maranaChapters = allChapters.filter(c => c.includes('Maraṇuppatticatukka'));
    
    // Create section for Vīthisaṅgaha
    if (vithisangahaChapters.length > 0) {
        createTopicSection(container, 'Chapter 4: Vīthisaṅgaha', '📘', vithisangahaChapters);
    }
    
    // Create header for Chapter 5
    const ch5Header = document.createElement('div');
    ch5Header.className = 'chapter-group-header main-chapter';
    ch5Header.innerHTML = '<strong>📗 Chapter 5: Vīthimuttasaṅgaha</strong>';
    container.appendChild(ch5Header);
    
    // Create sections for each Catukka
    if (bhumiChapters.length > 0) {
        createTopicSection(container, 'Bhūmicatukka (Four Planes)', '🌍', bhumiChapters);
    }
    if (patisandhiChapters.length > 0) {
        createTopicSection(container, 'Paṭisandhicatukka (Rebirth)', '🔄', patisandhiChapters);
    }
    if (kammaChapters.length > 0) {
        createTopicSection(container, 'Kammacatukka (Kamma)', '⚖️', kammaChapters);
    }
    if (maranaChapters.length > 0) {
        createTopicSection(container, 'Maraṇuppatticatukka (Death)', '🕯️', maranaChapters);
    }
}

function createTopicSection(container, title, icon, chapters) {
    // Calculate total for this topic
    const totalForTopic = chapters.reduce((sum, ch) => 
        sum + allQuestions.filter(q => q.chapter === ch).length, 0);
    
    // Section header with topic toggle
    const header = document.createElement('div');
    header.className = 'chapter-group-header';
    header.innerHTML = `
        <label class="topic-label">
            <input type="checkbox" class="topic-toggle" data-topic="${title}" checked 
                   onchange="toggleTopic(this)">
            <span>${icon} ${title}</span>
            <span class="topic-count">(${totalForTopic})</span>
        </label>
    `;
    container.appendChild(header);
    
    // Individual chapters under this topic
    chapters.forEach(chapter => {
        const count = allQuestions.filter(q => q.chapter === chapter).length;
        const shortName = chapter
            .replace('Vīthisaṅgaha - ', '')
            .replace('Vīthimuttasaṅgaha - ', '')
            .replace('(Day 1)', 'Day 1')
            .replace('(Day 2)', 'Day 2')
            .replace('(Oral Exam)', 'Oral')
            .replace('(Additional Day 1)', 'Additional Day 1')
            .replace('(Additional Day 2)', 'Additional Day 2');
        
        const item = document.createElement('div');
        item.className = 'chapter-checkbox-item';
        item.innerHTML = `
            <label class="chapter-label">
                <input type="checkbox" class="chapter-checkbox" value="${chapter}" 
                       data-topic="${title}" checked onchange="updateChapterSelection()">
                <span class="chapter-name">${shortName}</span>
                <span class="chapter-count">${count}</span>
            </label>
        `;
        container.appendChild(item);
    });
}

function toggleAllChapters() {
    const selectAll = document.getElementById('select-all-chapters');
    const isChecked = selectAll.checked;
    
    document.querySelectorAll('.chapter-checkbox').forEach(cb => {
        cb.checked = isChecked;
        if (isChecked) {
            selectedChapters.add(cb.value);
        } else {
            selectedChapters.delete(cb.value);
        }
    });
    
    document.querySelectorAll('.topic-toggle').forEach(cb => {
        cb.checked = isChecked;
    });
    
    updateSelectedCount();
}

function toggleTopic(checkbox) {
    const topic = checkbox.dataset.topic;
    const isChecked = checkbox.checked;
    
    document.querySelectorAll(`.chapter-checkbox[data-topic="${topic}"]`).forEach(cb => {
        cb.checked = isChecked;
        if (isChecked) {
            selectedChapters.add(cb.value);
        } else {
            selectedChapters.delete(cb.value);
        }
    });
    
    updateSelectAllState();
    updateSelectedCount();
}

function updateChapterSelection() {
    selectedChapters.clear();
    
    document.querySelectorAll('.chapter-checkbox:checked').forEach(cb => {
        selectedChapters.add(cb.value);
    });
    
    // Update topic toggles
    document.querySelectorAll('.topic-toggle').forEach(topicCb => {
        const topic = topicCb.dataset.topic;
        const chapterCbs = document.querySelectorAll(`.chapter-checkbox[data-topic="${topic}"]`);
        const checkedCbs = document.querySelectorAll(`.chapter-checkbox[data-topic="${topic}"]:checked`);
        
        topicCb.checked = checkedCbs.length === chapterCbs.length;
        topicCb.indeterminate = checkedCbs.length > 0 && checkedCbs.length < chapterCbs.length;
    });
    
    updateSelectAllState();
    updateSelectedCount();
}

function updateSelectAllState() {
    const selectAll = document.getElementById('select-all-chapters');
    const totalCbs = document.querySelectorAll('.chapter-checkbox').length;
    const checkedCbs = document.querySelectorAll('.chapter-checkbox:checked').length;
    
    selectAll.checked = checkedCbs === totalCbs;
    selectAll.indeterminate = checkedCbs > 0 && checkedCbs < totalCbs;
}

function updateTotalCount() {
    const totalEl = document.getElementById('total-all-questions');
    if (totalEl) {
        totalEl.textContent = allQuestions.length;
    }
}

function updateSelectedCount() {
    const filteredQuestions = getFilteredQuestions();
    const countEl = document.getElementById('total-questions');
    if (countEl) {
        countEl.textContent = filteredQuestions.length;
    }
}

function getFilteredQuestions() {
    if (selectedChapters.size === 0) {
        return [];
    }
    return allQuestions.filter(q => selectedChapters.has(q.chapter));
}

// Initialize Browse Filter Dropdown
function initializeBrowseFilter() {
    const select = document.getElementById('chapter-filter');
    if (!select) return;
    
    select.innerHTML = '<option value="all">All Topics</option>';
    
    // Group by main topic
    const optgroups = {
        'Vīthisaṅgaha': [],
        'Bhūmicatukka': [],
        'Paṭisandhicatukka': [],
        'Kammacatukka': [],
        'Maraṇuppatticatukka': []
    };
    
    allChapters.forEach(chapter => {
        if (chapter.includes('Maraṇuppatticatukka')) {
            optgroups['Maraṇuppatticatukka'].push(chapter);
        } else if (chapter.includes('Kammacatukka')) {
            optgroups['Kammacatukka'].push(chapter);
        } else if (chapter.includes('Paṭisandhicatukka')) {
            optgroups['Paṭisandhicatukka'].push(chapter);
        } else if (chapter.includes('Bhūmicatukka')) {
            optgroups['Bhūmicatukka'].push(chapter);
        } else {
            optgroups['Vīthisaṅgaha'].push(chapter);
        }
    });
    
    // Create optgroups
    Object.keys(optgroups).forEach(groupName => {
        if (optgroups[groupName].length > 0) {
            const optgroup = document.createElement('optgroup');
            optgroup.label = groupName;
            
            optgroups[groupName].forEach(chapter => {
                const option = document.createElement('option');
                option.value = chapter;
                option.textContent = chapter.replace('Vīthisaṅgaha - ', '').replace('Vīthimuttasaṅgaha - ', '');
                optgroup.appendChild(option);
            });
            
            select.appendChild(optgroup);
        }
    });
}

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
    const filteredQuestions = getFilteredQuestions();
    
    if (filteredQuestions.length === 0) {
        alert('Please select at least one topic to start the quiz.');
        return;
    }
    
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
            currentQuiz.questions = getRandomQuestions(filteredQuestions, numQuestions);
            break;
        case 'random25':
            numQuestions = 25;
            currentQuiz.questions = getRandomQuestions(filteredQuestions, numQuestions);
            break;
        case 'random50':
            numQuestions = 50;
            currentQuiz.questions = getRandomQuestions(filteredQuestions, numQuestions);
            break;
        case 'all':
        default:
            currentQuiz.questions = [...filteredQuestions];
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

// Get random questions from filtered set
function getRandomQuestions(questions, count) {
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

// Display current question
function displayQuestion() {
    const question = currentQuiz.questions[currentQuiz.currentIndex];
    
    // Get short chapter name
    const shortChapter = question.chapter
        .replace('Vīthisaṅgaha - ', 'VS: ')
        .replace('Vīthimuttasaṅgaha - ', '');
    
    // Update question number, chapter and text
    document.getElementById('q-number').textContent = `Q${question.id}`;
    document.getElementById('q-chapter').textContent = shortChapter;
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
        message = 'Great job! You have a strong understanding of the Abhidhamma.';
    } else if (percentage >= 60) {
        icon = '👍';
        message = 'Good effort! Keep studying and you will improve.';
    } else if (percentage >= 40) {
        icon = '📚';
        message = 'Keep practicing! Review the material and try again.';
    } else {
        icon = '💪';
        message = "Don't give up! Study the Vīthisaṅgaha and Vīthimuttasaṅgaha chapters and try again.";
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
        
        const shortChapter = question.chapter
            .replace('Vīthisaṅgaha - ', 'VS: ')
            .replace('Vīthimuttasaṅgaha - ', '');
        
        const item = document.createElement('div');
        item.className = `review-item ${itemClass}`;
        item.innerHTML = `
            <div class="review-status">${statusText}</div>
            <div class="review-chapter">${shortChapter}</div>
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
let browseFilterChapter = 'all';
let browseSearchTerm = '';

function showBrowseMode() {
    browseFilterChapter = 'all';
    browseSearchTerm = '';
    document.getElementById('search-input').value = '';
    document.getElementById('chapter-filter').value = 'all';
    displayBrowseList();
    showScreen('browse-screen');
}

function filterByChapter() {
    browseFilterChapter = document.getElementById('chapter-filter').value;
    displayBrowseList();
}

function searchQuestions() {
    browseSearchTerm = document.getElementById('search-input').value.toLowerCase();
    displayBrowseList();
}

function displayBrowseList() {
    const browseList = document.getElementById('browse-list');
    browseList.innerHTML = '';
    
    let filtered = allQuestions;
    
    // Filter by chapter
    if (browseFilterChapter !== 'all') {
        filtered = filtered.filter(q => q.chapter === browseFilterChapter);
    }
    
    // Filter by search term
    if (browseSearchTerm.length > 0) {
        filtered = filtered.filter(q => 
            q.question.toLowerCase().includes(browseSearchTerm) || 
            q.answer.toLowerCase().includes(browseSearchTerm) ||
            q.id.toString() === browseSearchTerm
        );
    }
    
    // Update count
    document.getElementById('browse-count').textContent = `${filtered.length} questions`;
    
    // Limit display for performance (show first 100)
    const displayLimit = 100;
    const toDisplay = filtered.slice(0, displayLimit);
    
    toDisplay.forEach(question => {
        const shortChapter = question.chapter
            .replace('Vīthisaṅgaha - ', 'VS: ')
            .replace('Vīthimuttasaṅgaha - ', '');
        
        const item = document.createElement('div');
        item.className = 'browse-item';
        item.onclick = function() {
            this.classList.toggle('expanded');
        };
        item.innerHTML = `
            <div class="browse-question">
                <span class="browse-q-num">Q${question.id}</span>
                <span class="browse-q-chapter">${shortChapter}</span>
            </div>
            <div class="browse-q-text">${question.question}</div>
            <div class="browse-answer">
                <div class="browse-answer-label">Answer</div>
                <div class="browse-answer-text">${question.answer}</div>
            </div>
        `;
        
        browseList.appendChild(item);
    });
    
    if (filtered.length > displayLimit) {
        const moreInfo = document.createElement('div');
        moreInfo.className = 'browse-more-info';
        moreInfo.innerHTML = `<p>Showing first ${displayLimit} of ${filtered.length} questions. Use search to find specific questions.</p>`;
        browseList.appendChild(moreInfo);
    }
    
    if (filtered.length === 0) {
        browseList.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No questions found.</p>';
    }
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
                const correctBtn = document.querySelector('.assess-btn.correct');
                if (correctBtn && !correctBtn.disabled) {
                    recordAnswer(true);
                }
            }
            break;
        case '2':
        case 'x':
            if (!document.getElementById('self-assessment').classList.contains('hidden')) {
                const incorrectBtn = document.querySelector('.assess-btn.incorrect');
                if (incorrectBtn && !incorrectBtn.disabled) {
                    recordAnswer(false);
                }
            }
            break;
    }
});
