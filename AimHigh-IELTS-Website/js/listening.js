// ===== LISTENING TEST JAVASCRIPT =====

// Timer
let timeLeft = 30 * 60; // 30 minutes in seconds
let timerInterval;

function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            submitTest();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('timer').textContent = display;
    
    // Change color when time is low
    if (timeLeft <= 300) { // 5 minutes
        document.querySelector('.test-timer').style.background = 'rgba(239, 68, 68, 0.2)';
    }
}

// Audio Player
let isPlaying = false;
let currentTime = 0;
const duration = 225; // 3:45 in seconds

function togglePlay() {
    const playBtn = document.getElementById('playBtn');
    const playIcon = playBtn.querySelector('i');
    
    if (isPlaying) {
        isPlaying = false;
        playIcon.classList.remove('bi-pause-fill');
        playIcon.classList.add('bi-play-fill');
        playBtn.classList.remove('playing');
    } else {
        isPlaying = true;
        playIcon.classList.remove('bi-play-fill');
        playIcon.classList.add('bi-pause-fill');
        playBtn.classList.add('playing');
        playAudio();
    }
}

function playAudio() {
    if (!isPlaying) return;
    
    currentTime++;
    updateAudioProgress();
    
    if (currentTime >= duration) {
        isPlaying = false;
        document.getElementById('playBtn').querySelector('i').classList.remove('bi-pause-fill');
        document.getElementById('playBtn').querySelector('i').classList.add('bi-play-fill');
        return;
    }
    
    setTimeout(playAudio, 1000);
}

function updateAudioProgress() {
    const progress = (currentTime / duration) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
    
    const minutes = Math.floor(currentTime / 60);
    const seconds = currentTime % 60;
    document.getElementById('currentTime').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function rewind() {
    currentTime = Math.max(0, currentTime - 10);
    updateAudioProgress();
}

function forward() {
    currentTime = Math.min(duration, currentTime + 10);
    updateAudioProgress();
}

// Answer Handling
const answers = {};

function setupAnswerListeners() {
    // Text inputs
    document.querySelectorAll('.answer-input').forEach(input => {
        input.addEventListener('input', (e) => {
            const questionNum = e.target.id.replace('q', '');
            updateAnswer(questionNum, e.target.value);
        });
    });
    
    // Radio buttons
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const questionNum = e.target.name.replace('q', '');
            updateAnswer(questionNum, e.target.value);
        });
    });
    
    // Answer cell clicks
    document.querySelectorAll('.answer-cell').forEach(cell => {
        cell.addEventListener('click', () => {
            const questionNum = cell.dataset.question;
            scrollToQuestion(questionNum);
        });
    });
}

function updateAnswer(questionNum, value) {
    answers[questionNum] = value;
    
    // Update answer sheet
    const answerCell = document.querySelector(`.answer-cell[data-question="${questionNum}"]`);
    const answerDisplay = document.getElementById(`answer${questionNum}`);
    
    if (value) {
        answerCell.classList.add('answered');
        answerDisplay.textContent = value.length > 10 ? value.substring(0, 10) + '...' : value;
    } else {
        answerCell.classList.remove('answered');
        answerDisplay.textContent = '-';
    }
    
    // Update question item
    const questionItem = document.querySelector(`.question-item[data-question="${questionNum}"]`);
    if (questionItem) {
        if (value) {
            questionItem.classList.add('answered');
        } else {
            questionItem.classList.remove('answered');
        }
    }
    
    // Update count
    updateAnsweredCount();
}

function updateAnsweredCount() {
    const count = Object.values(answers).filter(a => a && a.trim() !== '').length;
    document.getElementById('answeredCount').textContent = count;
}

function scrollToQuestion(questionNum) {
    const questionItem = document.querySelector(`.question-item[data-question="${questionNum}"]`);
    if (questionItem) {
        questionItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        questionItem.style.animation = 'highlight 1s ease';
        setTimeout(() => {
            questionItem.style.animation = '';
        }, 1000);
    }
}

// Submit Test
function submitTest() {
    const modal = new bootstrap.Modal(document.getElementById('submitModal'));
    
    const answeredCount = Object.values(answers).filter(a => a && a.trim() !== '').length;
    document.getElementById('modalAnswered').textContent = answeredCount;
    document.getElementById('modalUnanswered').textContent = 10 - answeredCount;
    document.getElementById('modalTime').textContent = document.getElementById('timer').textContent;
    
    modal.show();
}

function confirmSubmit() {
    clearInterval(timerInterval);
    
    // In real app, send answers to server
    console.log('Submitting answers:', answers);
    
    // Redirect to results page
    // window.location.href = 'listening-result.html';
    
    // For demo, show alert
    alert('Bài thi đã được nộp! Đang chấm điểm...');
}

function reviewAnswers() {
    // Highlight unanswered questions
    for (let i = 1; i <= 10; i++) {
        const cell = document.querySelector(`.answer-cell[data-question="${i}"]`);
        if (!answers[i] || answers[i].trim() === '') {
            cell.style.animation = 'pulse 0.5s ease 3';
        }
    }
}

// Section Navigation
function setupSectionNav() {
    document.querySelectorAll('.section-btn').forEach((btn, index) => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.section-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            // In real app, load questions for selected section
        });
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    startTimer();
    setupAnswerListeners();
    setupSectionNav();
});

// Add highlight animation
const style = document.createElement('style');
style.textContent = `
    @keyframes highlight {
        0%, 100% { box-shadow: none; }
        50% { box-shadow: 0 0 20px rgba(37, 99, 235, 0.5); }
    }
`;
document.head.appendChild(style);
