// ===== READING TEST JAVASCRIPT =====

// Timer
let timeLeft = 60 * 60; // 60 minutes
let timerInterval;
let selectedMode = 'practice';
let selectedExerciseTitle = '[YouPass Collect] - A Mechanical Friend for Children';
let modeModal;

function initReadingHomeFilters() {
    const cards = document.querySelectorAll('#readingCardGrid .exercise-card');
    if (!cards.length) return;

    const subjects = [
        { key: 'reading', typeName: 'readingType', partName: 'readingPassage', partWrapId: 'readingPassageWrap' },
        { key: 'listening', typeName: 'listeningType', partName: 'listeningPart', partWrapId: 'listeningPartWrap' },
        { key: 'writing', typeName: 'writingType', partName: 'writingPart', partWrapId: 'writingPartWrap' },
        { key: 'speaking', typeName: 'speakingType', partName: 'speakingPart', partWrapId: 'speakingPartWrap' }
    ];

    let activeSubject = 'reading';

    const setActiveSubjectBox = () => {
        document.querySelectorAll('[data-subject-box]').forEach((box) => {
            box.classList.toggle('active', box.dataset.subjectBox === activeSubject);
        });
    };

    const applyFilter = () => {
        setActiveSubjectBox();

        subjects.forEach((subject) => {
            const wrap = document.getElementById(subject.partWrapId);
            const type = document.querySelector(`input[name="${subject.typeName}"]:checked`)?.value || 'single';
            if (wrap) wrap.style.display = type === 'single' ? '' : 'none';
        });

        const activeConfig = subjects.find((s) => s.key === activeSubject) || subjects[0];
        const selectedType = document.querySelector(`input[name="${activeConfig.typeName}"]:checked`)?.value || 'single';
        const selectedPart = document.querySelector(`input[name="${activeConfig.partName}"]:checked`)?.value || '1';

        cards.forEach((card) => {
            const subject = card.dataset.subject;
            const type = card.dataset.type;
            const part = card.dataset.part;
            let visible = false;

            if (subject === activeSubject) {
                if (selectedType === 'full') {
                    visible = type === 'full';
                } else {
                    visible = type === 'single' && part === selectedPart;
                }
            }

            card.style.display = visible ? '' : 'none';
        });
    };

    subjects.forEach((subject) => {
        document.querySelectorAll(`input[name="${subject.typeName}"]`).forEach((radio) => {
            radio.addEventListener('change', () => {
                activeSubject = subject.key;
                applyFilter();
            });
        });
        document.querySelectorAll(`input[name="${subject.partName}"]`).forEach((radio) => {
            radio.addEventListener('change', () => {
                activeSubject = subject.key;
                applyFilter();
            });
        });
    });

    document.querySelectorAll('[data-subject-box]').forEach((box) => {
        box.addEventListener('click', () => {
            activeSubject = box.dataset.subjectBox;
            applyFilter();
        });
    });

    applyFilter();
}

function startTimer() {
    clearInterval(timerInterval);
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
    document.getElementById('timer').textContent =
        minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
    if (timeLeft <= 300) {
        const timerBox = document.querySelector('.test-timer');
        if (timerBox) timerBox.style.background = 'rgba(239, 68, 68, 0.2)';
    }
}

function openModeModal(title) {
    selectedExerciseTitle = title || selectedExerciseTitle;
    const titleEl = document.getElementById('modeModalTitle');
    if (titleEl) titleEl.textContent = selectedExerciseTitle;
    if (!modeModal) modeModal = new bootstrap.Modal(document.getElementById('modeSelectModal'));
    modeModal.show();
}

function selectModeOption(mode) {
    selectedMode = mode;
    document.querySelectorAll('.mode-option').forEach((el) => {
        el.classList.toggle('active', el.dataset.mode === mode);
    });
}

function startSelectedExercise() {
    const home = document.getElementById('readingHome');
    const exam = document.getElementById('readingExamScreen');
    const examTopActions = document.getElementById('examTopActions');
    const timerBox = document.getElementById('testTimerBox');
    const submitBtn = document.getElementById('submitTopBtn');
    const pageTitle = document.querySelector('.test-title');

    if (home) home.classList.add('hidden-screen');
    if (exam) exam.classList.remove('hidden-screen');
    if (examTopActions) examTopActions.classList.remove('hidden-screen');
    if (timerBox) timerBox.classList.remove('hidden-screen');
    if (submitBtn) submitBtn.classList.remove('hidden-screen');
    if (pageTitle) pageTitle.textContent = selectedExerciseTitle;

    document.body.classList.toggle('exam-mode-real', selectedMode === 'real');
    document.body.classList.toggle('exam-mode-practice', selectedMode !== 'real');

    if (!modeModal) modeModal = new bootstrap.Modal(document.getElementById('modeSelectModal'));
    modeModal.hide();

    timeLeft = 60 * 60;
    updateTimerDisplay();
    startTimer();
}

// ===== ANSWER HANDLING =====
const TOTAL_QUESTIONS = 13;
const answers = {};

function updateAnswer(questionNum, value) {
    answers[questionNum] = value;
    const answerCell = document.querySelector('.answer-cell[data-question="' + questionNum + '"]');
    const answerDisplay = document.getElementById('answer' + questionNum);

    if (value) {
        answerCell.classList.add('answered');
        answerDisplay.textContent = value.length > 8 ? value.substring(0, 8) + '…' : value;
    } else {
        answerCell.classList.remove('answered');
        answerDisplay.textContent = '-';
    }

    const questionItem = document.querySelector('.question-item[data-question="' + questionNum + '"]');
    if (questionItem) {
        questionItem.classList.toggle('answered', !!value);
    }
    updateAnsweredCount();
}

function updateAnsweredCount() {
    const count = Object.values(answers).filter(a => a && a.trim() !== '').length;
    document.getElementById('answeredCount').textContent = count;
}

function scrollToQuestion(num) {
    const el = document.querySelector('.question-item[data-question="' + num + '"]');
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.style.animation = 'highlight 1s ease';
        setTimeout(() => { el.style.animation = ''; }, 1000);
    }
}

function submitTest() {
    const modal = new bootstrap.Modal(document.getElementById('submitModal'));
    const c = Object.values(answers).filter(a => a && a.trim() !== '').length;
    document.getElementById('modalAnswered').textContent = c;
    document.getElementById('modalUnanswered').textContent = TOTAL_QUESTIONS - c;
    document.getElementById('modalTime').textContent = document.getElementById('timer').textContent;
    modal.show();
}

function confirmSubmit() {
    clearInterval(timerInterval);
    alert('Bài thi đã được nộp! Đang chấm điểm...');
}

function reviewAnswers() {
    for (let i = 1; i <= TOTAL_QUESTIONS; i++) {
        const cell = document.querySelector('.answer-cell[data-question="' + i + '"]');
        if (!answers[i] || answers[i].trim() === '') {
            cell.style.animation = 'pulse 0.5s ease 3';
            setTimeout(() => { cell.style.animation = ''; }, 1500);
        }
    }
}

// ===== VOCABULARY HIGHLIGHT SYSTEM =====
const VOCAB_STORAGE_KEY = 'aimhigh_vocab';
const VOCAB_GROUPS_KEY = 'aimhigh_vocab_groups';

function getVocabData() {
    return JSON.parse(localStorage.getItem(VOCAB_STORAGE_KEY) || '[]');
}
function saveVocabData(data) {
    localStorage.setItem(VOCAB_STORAGE_KEY, JSON.stringify(data));
}
function getVocabGroups() {
    const groups = JSON.parse(localStorage.getItem(VOCAB_GROUPS_KEY) || '[]');
    if (groups.length === 0) {
        const defaults = ['IELTS Reading', 'Academic Words', 'Collocations'];
        localStorage.setItem(VOCAB_GROUPS_KEY, JSON.stringify(defaults));
        return defaults;
    }
    return groups;
}
function saveVocabGroups(groups) {
    localStorage.setItem(VOCAB_GROUPS_KEY, JSON.stringify(groups));
}

// Record vocab activity for heatmap
function recordVocabActivity() {
    const key = 'aimhigh_vocab_activity';
    const activity = JSON.parse(localStorage.getItem(key) || '{}');
    const today = new Date().toISOString().slice(0, 10);
    activity[today] = (activity[today] || 0) + 1;
    localStorage.setItem(key, JSON.stringify(activity));
}

// Popup logic
let selectedWord = '';

function showVocabPopup(x, y, word) {
    selectedWord = word;
    const popup = document.getElementById('vocabPopup');
    document.getElementById('vocabSelectedWord').textContent = word;

    // Position popup
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let px = x, py = y + 10;
    if (px + 300 > vw) px = vw - 320;
    if (py + 300 > vh) py = y - 310;
    if (px < 10) px = 10;
    if (py < 10) py = 10;

    popup.style.left = px + 'px';
    popup.style.top = py + 'px';
    popup.classList.add('show');

    // Populate group dropdown
    populateGroupSelect();
}

function closeVocabPopup() {
    document.getElementById('vocabPopup').classList.remove('show');
    selectedWord = '';
}

function populateGroupSelect() {
    const select = document.getElementById('vocabGroupSelect');
    const groups = getVocabGroups();
    select.innerHTML = '<option value="">-- Chọn nhóm từ --</option>';
    groups.forEach(g => {
        const opt = document.createElement('option');
        opt.value = g;
        opt.textContent = g;
        select.appendChild(opt);
    });
}

function createNewGroup() {
    const input = document.getElementById('newGroupName');
    const name = input.value.trim();
    if (!name) return;
    const groups = getVocabGroups();
    if (groups.includes(name)) {
        alert('Nhóm này đã tồn tại!');
        return;
    }
    groups.push(name);
    saveVocabGroups(groups);
    input.value = '';
    populateGroupSelect();
    document.getElementById('vocabGroupSelect').value = name;
}

function saveVocab() {
    const group = document.getElementById('vocabGroupSelect').value;
    if (!selectedWord) return;
    if (!group) {
        alert('Vui lòng chọn hoặc tạo nhóm từ!');
        return;
    }

    const data = getVocabData();
    // Avoid duplicates
    const exists = data.find(v => v.word.toLowerCase() === selectedWord.toLowerCase() && v.group === group);
    if (exists) {
        alert('Từ này đã có trong nhóm "' + group + '"!');
        closeVocabPopup();
        return;
    }

    data.push({
        word: selectedWord,
        group: group,
        addedAt: new Date().toISOString(),
        source: 'reading'
    });
    saveVocabData(data);
    recordVocabActivity();
    highlightWordInPassage(selectedWord);
    renderVocabSidebar();
    closeVocabPopup();
}

function highlightWordInPassage(word) {
    // Already handled by existing highlights - just visual feedback
    const passage = document.getElementById('passageText');
    const walker = document.createTreeWalker(passage, NodeFilter.SHOW_TEXT);
    const regex = new RegExp('\\b(' + word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')\\b', 'gi');

    const nodesToReplace = [];
    while (walker.nextNode()) {
        const node = walker.currentNode;
        if (node.parentElement.classList.contains('vocab-highlight')) continue;
        if (regex.test(node.textContent)) {
            nodesToReplace.push(node);
        }
    }

    nodesToReplace.forEach(node => {
        const span = document.createElement('span');
        span.innerHTML = node.textContent.replace(regex, '<span class="vocab-highlight" title="Đã lưu: ' + word + '">$1</span>');
        node.parentElement.replaceChild(span, node);
    });
}

// Render saved vocab in sidebar
function renderVocabSidebar() {
    const data = getVocabData();
    const groups = getVocabGroups();

    // Total count
    document.getElementById('vocabTotalCount').textContent = data.length + ' từ';

    // Group tabs
    const tabsContainer = document.getElementById('vocabGroupTabs');
    const activeGroup = tabsContainer.querySelector('.active')?.dataset.group || 'all';
    tabsContainer.innerHTML = '<button class="vocab-group-tab ' + (activeGroup === 'all' ? 'active' : '') +
        '" data-group="all" onclick="filterVocabSidebar(\'all\')">Tất cả</button>';
    groups.forEach(g => {
        const count = data.filter(v => v.group === g).length;
        if (count > 0) {
            tabsContainer.innerHTML += '<button class="vocab-group-tab ' +
                (activeGroup === g ? 'active' : '') +
                '" data-group="' + g + '" onclick="filterVocabSidebar(\'' + g.replace(/'/g, "\\'") + '\')">' +
                g + ' (' + count + ')</button>';
        }
    });

    filterVocabSidebar(activeGroup);
}

function filterVocabSidebar(group) {
    const data = getVocabData();
    const list = document.getElementById('vocabWordList');
    const tabs = document.querySelectorAll('.vocab-group-tab');
    tabs.forEach(t => t.classList.toggle('active', t.dataset.group === group));

    const filtered = group === 'all' ? data : data.filter(v => v.group === group);

    if (filtered.length === 0) {
        list.innerHTML = '<li style="text-align:center;color:var(--text-light);padding:16px;font-size:0.875rem;">' +
            'Bôi đen từ trong passage để thêm vào danh sách</li>';
        return;
    }

    list.innerHTML = filtered.map((v, i) =>
        '<li class="vocab-word-item">' +
        '<span class="word">' + v.word + '</span>' +
        '<span style="color:var(--text-light);font-size:0.75rem;">' + v.group + '</span>' +
        '<button class="remove-word" onclick="removeVocab(' + i + ',\'' + group + '\')" title="Xóa">' +
        '<i class="bi bi-x-lg"></i></button>' +
        '</li>'
    ).join('');
}

function removeVocab(index, currentGroup) {
    const data = getVocabData();
    const filtered = currentGroup === 'all' ? data : data.filter(v => v.group === currentGroup);
    const toRemove = filtered[index];
    if (!toRemove) return;

    const realIndex = data.findIndex(v => v.word === toRemove.word && v.group === toRemove.group);
    if (realIndex !== -1) {
        data.splice(realIndex, 1);
        saveVocabData(data);
        renderVocabSidebar();
    }
}

// Text selection handler - show popup on highlight
function setupTextSelection() {
    const passage = document.getElementById('passageText');

    passage.addEventListener('mouseup', (e) => {
        const selection = window.getSelection();
        const text = selection.toString().trim();

        if (text && text.length > 0 && text.length < 100) {
            showVocabPopup(e.clientX, e.clientY, text);
        }
    });

    // Close popup when clicking outside
    document.addEventListener('mousedown', (e) => {
        const popup = document.getElementById('vocabPopup');
        if (popup.classList.contains('show') && !popup.contains(e.target)) {
            // Small delay to allow selection to complete
            setTimeout(() => {
                if (!popup.contains(document.activeElement)) {
                    closeVocabPopup();
                }
            }, 200);
        }
    });
}

// Re-highlight saved words on load
function restoreHighlights() {
    const data = getVocabData();
    const words = [...new Set(data.map(v => v.word))];
    words.forEach(word => highlightWordInPassage(word));
}

// Setup answer listeners
function setupAnswerListeners() {
    // Text inputs
    document.querySelectorAll('.answer-input[type="text"]').forEach(input => {
        input.addEventListener('input', (e) => {
            const questionNum = e.target.id.replace('q', '');
            updateAnswer(questionNum, e.target.value);
        });
    });

    // Answer cell clicks
    document.querySelectorAll('.answer-cell').forEach(cell => {
        cell.addEventListener('click', () => {
            scrollToQuestion(cell.dataset.question);
        });
    });

    // Section buttons
    document.querySelectorAll('.section-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.section-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    modeModal = new bootstrap.Modal(document.getElementById('modeSelectModal'));
    selectModeOption('practice');
    initReadingHomeFilters();
    setupAnswerListeners();
    setupTextSelection();
    renderVocabSidebar();
    restoreHighlights();
});

// Highlight animation
const styleEl = document.createElement('style');
styleEl.textContent = '@keyframes highlight{0%,100%{box-shadow:none}50%{box-shadow:0 0 20px rgba(37,99,235,0.5)}}' +
    '@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}';
document.head.appendChild(styleEl);
