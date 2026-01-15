/* =========================
   SPØRSMÅL (kun i JS)
   ========================= */
const QUESTION_BANK = [
  {
    q: "Hva betyr IBAN?",
    options: [
      "En type bankkort",
      "Internasjonalt kontonummer for betalinger",
      "En sparekonto med høy rente",
      "En kode for minibank"
    ],
    correctIndex: 1
  },
  {
    q: "Hva er “rente” i et lån?",
    options: [
      "Pengene du får gratis",
      "Skatt du betaler til banken",
      "Prisen for å låne penger (kostnad i %)",
      "Et gebyr bare ved innskudd"
    ],
    correctIndex: 2
  },
  {
    q: "Hva betyr “saldo” på en konto?",
    options: [
      "PIN-koden til kortet",
      "Hvor mye penger som står på kontoen",
      "Hvor mye banken tjener per måned",
      "Navnet på banken"
    ],
    correctIndex: 1
  },
  {
    q: "Hva er 2-faktor autentisering (2FA)?",
    options: [
      "Et gebyr ved kortbetaling",
      "En metode for å øke renten",
      "Å logge inn med bare passord",
      "Innlogging med to bevis (passord + kode/SMS/app)"
    ],
    correctIndex: 3
  },
  {
    q: "Hva bør du gjøre ved mistanke om kortsvindel?",
    options: [
      "Dele kortnummeret med venner",
      "Ignorere det og håpe det går over",
      "Sperre kortet og kontakte banken umiddelbart",
      "Skrive PIN på kortet for sikkerhet"
    ],
    correctIndex: 2
  },
  {
    q: "Hva er en 'terminbeløp' i et annuitetslån?",
    options: [
      "Beløpet du betaler hver måned",
      "Hele lånet betalt én gang",
      "Bare rentekostnaden per år",
      "En tilfeldig sum fra banken"
    ],
    correctIndex: 0
  }
];

/* =========================
   HJELPERE (randomize)
   ========================= */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* =========================
   LYD (ekstra) WebAudio beep
   ========================= */
function beep(ok = true) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();

    o.type = "sine";
    o.frequency.value = ok ? 750 : 220; // grønn: høyere, rød: lavere
    g.gain.value = 0.07;

    o.connect(g);
    g.connect(ctx.destination);

    o.start();
    setTimeout(() => {
      o.stop();
      ctx.close();
    }, ok ? 120 : 220);
  } catch (e) {
    // если браузер блокирует звук — просто молча игнорируем
  }
}

/* =========================
   STATE
   ========================= */
let questions = [];
let currentIndex = 0;
let attempts = 0;
let correct = 0;
let answered = false;

/* =========================
   DOM
   ========================= */
const quizArea = document.getElementById("quizArea");
const feedback = document.getElementById("feedback");
const nextBtn = document.getElementById("nextBtn");
const resetBtn = document.getElementById("resetBtn");

const attemptsEl = document.getElementById("attempts");
const correctEl = document.getElementById("correct");
const progressEl = document.getElementById("progress");

/* =========================
   INIT
   ========================= */
function initQuiz() {
  // randomize spørsmål
  questions = shuffle(QUESTION_BANK).map(q => {
    // randomize alternativer + корректируем correctIndex
    const indexed = q.options.map((text, idx) => ({ text, idx }));
    const shuffled = shuffle(indexed);
    const newCorrect = shuffled.findIndex(x => x.idx === q.correctIndex);

    return {
      q: q.q,
      options: shuffled.map(x => x.text),
      correctIndex: newCorrect
    };
  });

  currentIndex = 0;
  attempts = 0;
  correct = 0;
  answered = false;

  updateScoreboard();
  renderQuestion();
  feedback.textContent = "";
  nextBtn.disabled = true;
}

function updateScoreboard() {
  attemptsEl.textContent = String(attempts);
  correctEl.textContent = String(correct);
  progressEl.textContent = `${Math.min(currentIndex + 1, questions.length)}/${questions.length}`;
}

/* =========================
   RENDER (1 spørsmål om gangen)
   ========================= */
function renderQuestion() {
  answered = false;
  nextBtn.disabled = true;
  feedback.textContent = "";
  feedback.className = "quiz-feedback"; // сброс классов

  const q = questions[currentIndex];
  updateScoreboard();

  // HTML без hardcode: строим из JS
  quizArea.innerHTML = `
    <div class="quiz-question" id="questionCard">
      <h3>${currentIndex + 1}) ${q.q}</h3>
      <div class="quiz-options" role="list">
        ${q.options.map((opt, i) => `
          <button type="button" class="quiz-option" data-index="${i}">
           <span class="opt-text">${opt}</span>
          </button>
        `).join("")}
      </div>
    </div>
  `;

  // навешиваем обработчики на варианты
  const optionBtns = quizArea.querySelectorAll(".quiz-option");
  optionBtns.forEach(btn => {
    btn.addEventListener("click", () => chooseAnswer(btn, optionBtns));
  });
}

/* =========================
   ANSWER
   ========================= */
function chooseAnswer(clickedBtn, allBtns) {
  if (answered) return;
  answered = true;
  attempts++;

  const chosen = Number(clickedBtn.dataset.index);
  const q = questions[currentIndex];
  const correctIdx = q.correctIndex;

  // отключаем все кнопки
  allBtns.forEach(b => b.disabled = true);

  const isCorrect = chosen === correctIdx;

  if (isCorrect) {
    correct++;
    feedback.textContent = "✅ Riktig!";
    feedback.classList.add("ok");
    clickedBtn.classList.add("ok");
    beep(true);
  } else {
    feedback.textContent = "❌ Feil!";
    feedback.classList.add("bad");
    clickedBtn.classList.add("bad");
    // подсветить правильный
    const rightBtn = [...allBtns].find(b => Number(b.dataset.index) === correctIdx);
    if (rightBtn) rightBtn.classList.add("ok");
    beep(false);
  }

  updateScoreboard();
  nextBtn.disabled = false;
}

/* =========================
   NEXT / RESET
   ========================= */
nextBtn.addEventListener("click", () => {
  if (currentIndex < questions.length - 1) {
    currentIndex++;
    renderQuestion();
  } else {
    // финал
    quizArea.innerHTML = `
      <div class="quiz-finish">
        <h3>Ferdig! 🎉</h3>
        <p>Du fikk <strong>${correct}</strong> av <strong>${attempts}</strong> riktig.</p>
        <p>Trykk <strong>Nullstill</strong> for å spille igjen.</p>
      </div>
    `;
    progressEl.textContent = `${questions.length}/${questions.length}`;
    nextBtn.disabled = true;
  }
});

resetBtn.addEventListener("click", initQuiz);

// запуск
initQuiz();
