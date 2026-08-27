const SEMESTER_START = new Date(2026, 8, 1); // 1 septembrie 2026
const FIRST_WEEK_PARITY = "odd";

// Completează aici denumirile complete ale disciplinelor, dacă vrei să
// apară ca tooltip la trecerea cu mouse-ul peste numele scurt.
// Ex: IoT: "Internet of Things"
const SUBJECT_NAMES = {};

let selectedDate = new Date();
selectedDate.setHours(12, 0, 0, 0);

const pad = n => String(n).padStart(2, "0");

function dateKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function diffDays(a, b) {
  return Math.floor((startOfDay(a) - startOfDay(b)) / 86400000);
}

function getAcademicWeek(date) {
  const days = diffDays(date, SEMESTER_START);
  if (days < 0) return null;
  return Math.floor(days / 7) + 1;
}

function getParity(date) {
  const week = getAcademicWeek(date);
  if (!week) return null;

  const firstIsOdd = FIRST_WEEK_PARITY === "odd";
  const isOdd = firstIsOdd ? week % 2 === 1 : week % 2 === 0;
  return isOdd ? "odd" : "even";
}

function getDayNumber(date) {
  const day = date.getDay();
  return day === 0 ? 7 : day;
}

function parseTime(value) {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}

function minutesNow(date = new Date()) {
  return date.getHours() * 60 + date.getMinutes();
}

function formatDate(date) {
  return new Intl.DateTimeFormat("ro-RO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);
}

function formatShortDate(date) {
  return new Intl.DateTimeFormat("ro-RO", {
    day: "numeric",
    month: "long"
  }).format(date);
}

function formatParity(parity) {
  return parity === "odd" ? "IMPARĂ" : "PARĂ";
}

function lessonsForDay(date) {
  const day = getDayNumber(date);
  const parity = getParity(date);

  return SCHEDULE.filter(item =>
    item.day === day &&
    (item.parity === "all" || item.parity === parity)
  );
}

function allLessonsForSlot(day, start, end) {
  return SCHEDULE.filter(item =>
    item.day === day && item.start === start && item.end === end
  );
}

function isCurrentLesson(item, date = new Date()) {
  if (dateKey(date) !== dateKey(selectedDate)) return false;
  if (getDayNumber(date) !== item.day) return false;
  if (item.parity !== "all" && item.parity !== getParity(date)) return false;

  const now = minutesNow(date);
  return now >= parseTime(item.start) && now < parseTime(item.end);
}

function lessonHTML(item, current = false) {
  const parityLabel =
    item.parity === "odd" ? "Impară" :
    item.parity === "even" ? "Pară" : "Toate săptămânile";

  const fullName = SUBJECT_NAMES[item.subject];
  const titleAttr = fullName ? ` title="${fullName}"` : "";

  return `
    <article class="lesson ${item.parity} ${current ? "current" : ""}">
      <span class="lesson-parity">${parityLabel}</span>
      <div>
        <div class="lesson-type">${item.type}</div>
        <h3 class="lesson-subject"${titleAttr}>${item.subject}</h3>
        <div class="lesson-details">
          <span>👨‍🏫 ${item.teacher}</span>
          <span>📍 Cabinet ${item.room}</span>
        </div>
      </div>
    </article>
  `;
}

function renderSchedule() {
  const container = document.getElementById("schedule");
  const day = getDayNumber(selectedDate);

  document.getElementById("selectedDay").textContent =
    DAY_NAMES[day] || "Weekend";
  document.getElementById("selectedDate").textContent =
    formatShortDate(selectedDate);

  if (day > 5) {
    container.innerHTML = `
      <div class="now-card">
        <div class="now-content">
          <div class="now-empty">Nu există ore configurate pentru weekend.</div>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = TIME_SLOTS.map(([start, end]) => {
    const lessons = allLessonsForSlot(day, start, end);
    const odd = lessons.find(x => x.parity === "odd");
    const even = lessons.find(x => x.parity === "even");
    const all = lessons.find(x => x.parity === "all");

    const current = lessonsForDay(selectedDate).find(x =>
      x.start === start && isCurrentLesson(x)
    );

    let top = odd ? lessonHTML(odd, current?.parity === "odd") : "";
    let bottom = even ? lessonHTML(even, current?.parity === "even") : "";

    if (all) {
      top = lessonHTML(all, current?.parity === "all");
    }

    if (!top && !all) top = `<div class="free">Liber</div>`;
    if (!bottom && !all) bottom = `<div class="free">Liber</div>`;

    return `
      <div class="time-row">
        <div class="time-label">${start}<br>↓<br>${end}</div>
        <div class="time-track">
          ${top}
          <div class="parity-line"></div>
          ${all ? "" : bottom}
        </div>
      </div>
    `;
  }).join("");
}

function renderHeader() {
  const today = new Date();
  document.getElementById("todayLabel").textContent = formatDate(today);

  const week = getAcademicWeek(today);
  const parity = getParity(today);

  document.getElementById("weekLabel").textContent = week
    ? `Săptămâna ${week} · ${formatParity(parity)}`
    : "Semestrul începe la 1 septembrie 2026";
}

function renderNow() {
  const now = new Date();
  const status = document.getElementById("nowStatus");
  const content = document.getElementById("nowContent");
  const week = getAcademicWeek(now);
  const parity = getParity(now);

  if (!week) {
    status.textContent = "ÎNAINTE DE SEMESTRU";
    content.innerHTML = `
      <div class="now-empty">
        Semestrul începe pe <strong>1 septembrie 2026</strong>.
        Până atunci, orarul este pregătit pentru tine.
      </div>
    `;
    document.getElementById("nowProgress").style.display = "none";
    return;
  }

  const day = getDayNumber(now);
  if (day > 5) {
    status.textContent = "WEEKEND";
    content.innerHTML = `<div class="now-empty">Nu ai cursuri configurate astăzi. 🌤️</div>`;
    document.getElementById("nowProgress").style.display = "none";
    return;
  }

  const active = SCHEDULE.find(item => {
    if (item.day !== day) return false;
    if (item.parity !== "all" && item.parity !== parity) return false;
    const nowMin = minutesNow(now);
    return nowMin >= parseTime(item.start) && nowMin < parseTime(item.end);
  });

  const upcoming = SCHEDULE
    .filter(item => {
      if (item.day !== day) return false;
      if (item.parity !== "all" && item.parity !== parity) return false;
      return parseTime(item.start) > minutesNow(now);
    })
    .sort((a, b) => parseTime(a.start) - parseTime(b.start))[0];

  if (active) {
    const startMin = parseTime(active.start);
    const endMin = parseTime(active.end);
    const pct = Math.min(100, Math.max(0,
      ((minutesNow(now) - startMin) / (endMin - startMin)) * 100
    ));

    status.textContent = "ACUM";
    content.innerHTML = `
      <div class="now-main">
        <div>
          <div class="lesson-type">${active.type} · Săptămâna ${week} · ${formatParity(parity)}</div>
          <h2 class="now-subject">${active.subject}</h2>
          <div class="now-meta">
            👨‍🏫 ${active.teacher}<br>
            📍 <strong>Cabinet ${active.room}</strong>
          </div>
        </div>
        <div class="now-time">
          <strong>${active.start} – ${active.end}</strong>
          <span>lecția este în desfășurare</span>
        </div>
      </div>
    `;
    const fill = document.getElementById("nowProgressFill");
    if (fill) fill.style.width = `${pct.toFixed(1)}%`;
    document.getElementById("nowProgress").style.display = "block";
    return;
  }

  document.getElementById("nowProgress").style.display = "none";

  if (upcoming) {
    status.textContent = "URMEAZĂ";
    content.innerHTML = `
      <div class="now-main">
        <div>
          <div class="lesson-type">${upcoming.type} · ${formatParity(parity)}</div>
          <h2 class="now-subject">${upcoming.subject}</h2>
          <div class="now-meta">
            👨‍🏫 ${upcoming.teacher}<br>
            📍 <strong>Cabinet ${upcoming.room}</strong>
          </div>
        </div>
        <div class="now-time">
          <strong>${upcoming.start} – ${upcoming.end}</strong>
          <span>următoarea lecție</span>
        </div>
      </div>
    `;
    return;
  }

  status.textContent = "GATA PE AZI";
  content.innerHTML = `<div class="now-empty">Nu mai ai ore astăzi. 🎉</div>`;
}

function render() {
  renderHeader();
  renderSchedule();
  renderNow();
}

function stepDay(delta) {
  selectedDate.setDate(selectedDate.getDate() + delta);
  // sare peste weekend, ca navigarea zi-cu-zi să rămână utilă
  while (getDayNumber(selectedDate) > 5) {
    selectedDate.setDate(selectedDate.getDate() + delta);
  }
  render();
}

document.getElementById("prevDay").addEventListener("click", () => stepDay(-1));
document.getElementById("nextDay").addEventListener("click", () => stepDay(1));

document.getElementById("todayBtn").addEventListener("click", () => {
  selectedDate = new Date();
  selectedDate.setHours(12, 0, 0, 0);
  render();
});

// navigare cu tastatura (săgeți stânga/dreapta), doar când nu se scrie într-un câmp
document.addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
  if (e.key === "ArrowLeft") stepDay(-1);
  if (e.key === "ArrowRight") stepDay(1);
});

render();
setInterval(render, 30000);