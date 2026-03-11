// ===== FLASHCARD.JS - Spaced Repetition System =====

/**
 * Tính thời gian ôn tập tiếp theo dựa trên mức độ nhớ (SM-2 Algorithm đơn giản hóa)
 * @param {number} level - 1: quên, 2: khó, 3: được, 4: dễ
 * @param {number} interval - interval hiện tại (ngày)
 * @param {number} easeFactor - hệ số dễ (mặc định 2.5)
 * @returns {object} { nextInterval, easeFactor, nextReviewDate }
 */
function calculateNextReview(level, interval = 1, easeFactor = 2.5) {
    let newInterval;
    let newEaseFactor = easeFactor;

    switch (level) {
        case 1: // Quên - reset
            newInterval = 1;
            newEaseFactor = Math.max(1.3, easeFactor - 0.2);
            break;
        case 2: // Khó
            newInterval = Math.max(1, Math.round(interval * 1.2));
            newEaseFactor = Math.max(1.3, easeFactor - 0.15);
            break;
        case 3: // Được
            if (interval === 1) newInterval = 3;
            else if (interval === 3) newInterval = 7;
            else newInterval = Math.round(interval * newEaseFactor);
            break;
        case 4: // Dễ
            if (interval === 1) newInterval = 4;
            else newInterval = Math.round(interval * newEaseFactor * 1.3);
            newEaseFactor = Math.min(3.0, easeFactor + 0.1);
            break;
        default:
            newInterval = 1;
    }

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

    return {
        nextInterval: newInterval,
        easeFactor: newEaseFactor,
        nextReviewDate: nextReviewDate.toISOString(),
        intervalLabel: formatInterval(newInterval)
    };
}

function formatInterval(days) {
    if (days < 1) return '< 1 phút';
    if (days === 1) return '1 ngày';
    if (days < 7) return `${days} ngày`;
    if (days < 30) return `${Math.round(days / 7)} tuần`;
    return `${Math.round(days / 30)} tháng`;
}

/**
 * Lưu tiến trình flashcard vào localStorage
 */
function saveCardProgress(cardId, level, deckId = 'default') {
    const key = `aimhigh_fc_${deckId}`;
    const progress = JSON.parse(localStorage.getItem(key) || '{}');

    const current = progress[cardId] || { interval: 1, easeFactor: 2.5, reviewCount: 0 };
    const { nextInterval, easeFactor, nextReviewDate } = calculateNextReview(
        level, current.interval, current.easeFactor
    );

    progress[cardId] = {
        interval: nextInterval,
        easeFactor,
        nextReviewDate,
        lastReviewed: new Date().toISOString(),
        reviewCount: (current.reviewCount || 0) + 1,
        lastLevel: level
    };

    localStorage.setItem(key, JSON.stringify(progress));
    return progress[cardId];
}

/**
 * Lấy danh sách thẻ cần ôn tập hôm nay
 */
function getDueCards(cards, deckId = 'default') {
    const key = `aimhigh_fc_${deckId}`;
    const progress = JSON.parse(localStorage.getItem(key) || '{}');
    const today = new Date().toDateString();

    return cards.filter(card => {
        const cardProgress = progress[card.id || card.word];
        if (!cardProgress) return true; // Chưa học → cần học
        return new Date(cardProgress.nextReviewDate).toDateString() <= today;
    });
}

/**
 * Lấy thống kê bộ thẻ
 */
function getDeckStats(cards, deckId = 'default') {
    const key = `aimhigh_fc_${deckId}`;
    const progress = JSON.parse(localStorage.getItem(key) || '{}');
    const today = new Date().toDateString();

    let mastered = 0, due = 0, learning = 0;

    cards.forEach(card => {
        const cardProgress = progress[card.id || card.word];
        if (!cardProgress) {
            due++;
        } else if (cardProgress.interval >= 21) {
            mastered++;
        } else if (new Date(cardProgress.nextReviewDate).toDateString() <= today) {
            due++;
        } else {
            learning++;
        }
    });

    return { total: cards.length, mastered, due, learning };
}

/**
 * Phát âm từ bằng Web Speech API
 * @param {string} word - từ cần phát âm
 * @param {string} lang - ngôn ngữ (mặc định en-US)
 */
function playPronunciation(word, lang = 'en-US') {
    if (!('speechSynthesis' in window)) {
        console.warn('Trình duyệt không hỗ trợ Text-to-Speech');
        return;
    }

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = lang;
    utterance.rate = 0.85;
    utterance.pitch = 1;

    // Try to use a natural English voice
    const voices = speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google'))
        || voices.find(v => v.lang.startsWith('en'));
    if (englishVoice) utterance.voice = englishVoice;

    speechSynthesis.speak(utterance);
}

/**
 * Cập nhật thống kê trên UI
 */
function updateStats(deckId, cards) {
    const stats = getDeckStats(cards, deckId);

    const totalEl = document.getElementById('totalDue');
    const learnedEl = document.getElementById('learned');

    if (totalEl) totalEl.textContent = stats.due;
    if (learnedEl) learnedEl.textContent = stats.mastered;
}

/**
 * Tạo Deck mới và lưu vào localStorage
 */
function createNewDeck(name) {
    const decks = JSON.parse(localStorage.getItem('aimhigh_decks') || '[]');
    const newDeck = {
        id: Date.now().toString(),
        name,
        cards: [],
        createdAt: new Date().toISOString()
    };
    decks.push(newDeck);
    localStorage.setItem('aimhigh_decks', JSON.stringify(decks));
    return newDeck;
}

/**
 * Thêm từ vào deck
 */
function addCardToDeck(deckId, card) {
    const decks = JSON.parse(localStorage.getItem('aimhigh_decks') || '[]');
    const deck = decks.find(d => d.id === deckId);
    if (!deck) return false;

    deck.cards.push({ ...card, id: Date.now().toString() });
    localStorage.setItem('aimhigh_decks', JSON.stringify(decks));
    return true;
}

/**
 * Lấy danh sách tất cả decks
 */
function getAllDecks() {
    return JSON.parse(localStorage.getItem('aimhigh_decks') || '[]');
}

/**
 * Shuffle array (Fisher-Yates)
 */
function shuffleCards(cards) {
    const arr = [...cards];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Load voices when available
if ('speechSynthesis' in window) {
    speechSynthesis.onvoiceschanged = () => {
        speechSynthesis.getVoices(); // Pre-load voices
    };
}
