/* =========================================================
   ORAR TI 232 — APP
========================================================= */


/* =========================================================
   STARE
========================================================= */

let selectedDate = new Date();

selectedDate.setHours(12, 0, 0, 0);


/* =========================================================
   CONFIGURAȚIE
========================================================= */

/*
  1 septembrie 2026 = începutul săptămânii academice 1.

  Săptămâna 1 → IMPARĂ
  Săptămâna 2 → PARĂ
  Săptămâna 3 → IMPARĂ
  etc.
*/

const SEMESTER_START = new Date(2026, 7, 31);


/* =========================================================
   DENUMIRI
========================================================= */

const SUBJECT_NAMES = {

  IoT:
    "Internet of Things",

  PECPIT:
    "Proiectarea și exploatarea componentelor pentru prelucrarea informației",

  ASCS:
    "Administrarea sistemelor și calculatoarelor",

  PSI:
    "Prelucrarea semnalelor și imaginilor",

  ARC:
    "Arhitectura calculatoarelor",

  PAM:
    "Programarea aplicațiilor mobile",

  PAD:
    "Proiectarea aplicațiilor distribuite"
};


/* =========================================================
   HELPERS
========================================================= */

function pad(value) {

  return String(value).padStart(2, "0");
}


function dateKey(date) {

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate())
  ].join("-");
}


function startOfDay(date) {

  const result = new Date(date);

  result.setHours(
    0,
    0,
    0,
    0
  );

  return result;
}


function parseTime(value) {

  const [
    hours,
    minutes
  ] = value
    .split(":")
    .map(Number);

  return (
    hours * 60 +
    minutes
  );
}


function minutesNow(date = new Date()) {

  return (
    date.getHours() * 60 +
    date.getMinutes()
  );
}


/* =========================================================
   SĂPTĂMÂNA ACADEMICĂ
========================================================= */

function getAcademicWeek(date) {

  const start =
    startOfDay(SEMESTER_START);

  const current =
    startOfDay(date);


  const days =
    Math.floor(
      (current - start) / 86400000
    );


  /*
    Înainte de începutul semestrului.
  */

  if (days < 0) {
    return null;
  }


  /*
    1–6 septembrie 2026
    = săptămâna 1

    7–13 septembrie
    = săptămâna 2

    14–20 septembrie
    = săptămâna 3
  */

  return Math.floor(
    days / 7
  ) + 1;
}


/* =========================================================
   PARITATE SĂPTĂMÂNĂ
========================================================= */

function getParity(date) {

  const week =
    getAcademicWeek(date);


  if (!week) {
    return null;
  }


  return week % 2 === 1
    ? "odd"
    : "even";
}


/* =========================================================
   ZI
========================================================= */

function getDayNumber(date) {

  const jsDay =
    date.getDay();


  /*
    JavaScript:

    0 = Duminică
    1 = Luni
    2 = Marți
    3 = Miercuri
    4 = Joi
    5 = Vineri
    6 = Sâmbătă
  */

  return jsDay === 0
    ? 7
    : jsDay;
}


/* =========================================================
   FORMATĂRI
========================================================= */

function formatDate(date) {

  return new Intl.DateTimeFormat(
    "ro-RO",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    }
  ).format(date);
}


function formatShortDate(date) {

  return new Intl.DateTimeFormat(
    "ro-RO",
    {
      day: "numeric",
      month: "long"
    }
  ).format(date);
}


function formatParity(parity) {

  if (parity === "odd") {
    return "IMPARĂ";
  }

  if (parity === "even") {
    return "PARĂ";
  }

  return "—";
}


/* =========================================================
   PARITATE LECȚIE
========================================================= */

function lessonMatchesParity(
  lesson,
  parity
) {

  /*
    "all" = apare în fiecare săptămână.

    "odd" = apare doar în săptămânile impare.

    "even" = apare doar în săptămânile pare.
  */

  return (
    lesson.parity === "all" ||
    lesson.parity === parity
  );
}


/* =========================================================
   LECȚIILE ZILEI
========================================================= */

function lessonsForDay(date) {

  const day =
    getDayNumber(date);

  const parity =
    getParity(date);


  return SCHEDULE
    .filter(
      lesson => {

        return (
          lesson.day === day &&
          lessonMatchesParity(
            lesson,
            parity
          )
        );
      }
    )
    .sort(
      (a, b) =>
        parseTime(a.start) -
        parseTime(b.start)
    );
}


/* =========================================================
   LECȚIILE UNUI SLOT
========================================================= */

function lessonsForSlot(
  date,
  start,
  end
) {

  const day =
    getDayNumber(date);

  const parity =
    getParity(date);


  const slotStart =
    parseTime(start);

  const slotEnd =
    parseTime(end);


  return SCHEDULE
    .filter(
      lesson => {

        /*
          Ziua trebuie să corespundă.
        */

        if (
          lesson.day !== day
        ) {
          return false;
        }


        /*
          Verificăm săptămâna.
        */

        if (
          !lessonMatchesParity(
            lesson,
            parity
          )
        ) {
          return false;
        }


        const lessonStart =
          parseTime(lesson.start);

        const lessonEnd =
          parseTime(lesson.end);


        /*
          Lecția trebuie să intersecteze
          intervalul afișat.
        */

        return (
          lessonStart < slotEnd &&
          lessonEnd > slotStart
        );
      }
    );
}


/* =========================================================
   LECȚIE ACTIVĂ
========================================================= */

function isCurrentLesson(
  item,
  date = new Date()
) {

  /*
    Lecția activă trebuie să fie
    pentru ziua selectată.
  */

  if (
    dateKey(date) !==
    dateKey(selectedDate)
  ) {
    return false;
  }


  /*
    Ziua săptămânii.
  */

  if (
    getDayNumber(date) !==
    item.day
  ) {
    return false;
  }


  /*
    Săptămâna.
  */

  const parity =
    getParity(date);


  if (
    !lessonMatchesParity(
      item,
      parity
    )
  ) {
    return false;
  }


  const now =
    minutesNow(date);


  return (
    now >= parseTime(item.start) &&
    now < parseTime(item.end)
  );
}


/* =========================================================
   HTML LECȚIE
========================================================= */

function lessonHTML(
  item,
  current = false
) {

  const fullName =
    SUBJECT_NAMES[item.subject];


  const titleAttr =
    fullName
      ? `title="${fullName}"`
      : "";


  const classes = [
    "lesson",
    item.parity,
    current ? "current" : ""
  ]
    .filter(Boolean)
    .join(" ");


  return `
    <article
      class="${classes}"
      ${titleAttr}
    >

      <div>

        <div class="lesson-type">
          ${item.type}
        </div>

        <h3 class="lesson-subject">
          ${item.subject}
        </h3>

        <div class="lesson-details">

          <span>
            👨‍🏫 ${item.teacher}
          </span>

          <span>
            📍 Cabinet ${item.room}
          </span>

        </div>

      </div>

    </article>
  `;
}


/* =========================================================
   SLOT LIBER
========================================================= */

function freeHTML() {

  return `
    <div class="free">
      Liber
    </div>
  `;
}


/* =========================================================
   RENDER SCHEDULE
========================================================= */

function renderSchedule() {

  const container =
    document.getElementById(
      "schedule"
    );


  if (!container) {
    return;
  }


  const day =
    getDayNumber(selectedDate);


  const parity =
    getParity(selectedDate);


  const week =
    getAcademicWeek(selectedDate);


  /* -------------------------------------------------------
     HEADER ZI
  ------------------------------------------------------- */

  const selectedDay =
    document.getElementById(
      "selectedDay"
    );


  const selectedDateElement =
    document.getElementById(
      "selectedDate"
    );


  if (selectedDay) {

    selectedDay.textContent =
      DAY_NAMES[day] || "Weekend";
  }


  if (selectedDateElement) {

    selectedDateElement.textContent =
      formatShortDate(
        selectedDate
      );
  }


  /* -------------------------------------------------------
     ÎNAINTE DE SEMESTRU
  ------------------------------------------------------- */

  if (!week) {

    container.innerHTML = "";

    return;
  }


  /* -------------------------------------------------------
     WEEKEND
  ------------------------------------------------------- */

  if (day > 5) {

    container.innerHTML = `
      <div class="weekend-card">

        Nu există ore configurate
        pentru weekend. 🌤️

      </div>
    `;

    return;
  }


  /* -------------------------------------------------------
     RÂNDURI
  ------------------------------------------------------- */

  const rows = [];


  TIME_SLOTS.forEach(
    ([start, end]) => {

      const lessons =
        lessonsForSlot(
          selectedDate,
          start,
          end
        );


      /*
        Eliminăm duplicatele.
      */

      const visibleLessons =
        lessons.filter(
          (lesson, index, array) => {

            return (
              array.findIndex(
                item =>

                  item.day === lesson.day &&
                  item.start === lesson.start &&
                  item.end === lesson.end &&
                  item.subject === lesson.subject &&
                  item.teacher === lesson.teacher &&
                  item.room === lesson.room

              ) === index
            );
          }
        );


      /* ---------------------------------------------------
         SLOT LIBER
      --------------------------------------------------- */

      if (
        visibleLessons.length === 0
      ) {

        rows.push(`
          <div class="time-row">

            <div class="time-label">
              ${start}<br>
              ↓<br>
              ${end}
            </div>

            <div class="time-track">

              ${freeHTML()}

            </div>

          </div>
        `);

        return;
      }


      /* ---------------------------------------------------
         LECȚIE
      --------------------------------------------------- */

      const lesson =
        visibleLessons[0];


      /*
        Dacă lecția începe într-un slot
        anterior, nu o afișăm din nou.
      */

      const lessonStart =
        parseTime(lesson.start);

      const slotStart =
        parseTime(start);


      if (
        lessonStart < slotStart
      ) {

        rows.push(`
          <div class="time-row">

            <div class="time-label">
              ${start}<br>
              ↓<br>
              ${end}
            </div>

            <div class="time-track">

              <div class="free lesson-continuation"></div>

            </div>

          </div>
        `);

        return;
      }


      /*
        Verificăm dacă este lecția activă.
      */

      const current =
        isCurrentLesson(
          lesson
        );


      rows.push(`
        <div class="time-row">

          <div class="time-label">
            ${start}<br>
            ↓<br>
            ${end}
          </div>

          <div class="time-track">

            ${lessonHTML(
              lesson,
              current
            )}

          </div>

        </div>
      `);
    }
  );


  container.innerHTML =
    rows.join("");
}


/* =========================================================
   HEADER
========================================================= */

function renderHeader() {

  const today =
    new Date();


  const todayLabel =
    document.getElementById(
      "todayLabel"
    );


  const weekLabel =
    document.getElementById(
      "weekLabel"
    );


  /* -------------------------------------------------------
     DATA DE AZI
  ------------------------------------------------------- */

  if (todayLabel) {

    todayLabel.textContent =
      formatDate(today);
  }


  /* -------------------------------------------------------
     SĂPTĂMÂNA SELECTATĂ
  ------------------------------------------------------- */

  const week =
    getAcademicWeek(selectedDate);


  const parity =
    getParity(selectedDate);


  if (weekLabel) {

    if (week) {

      weekLabel.textContent =
        `Săptămâna ${week} · ${formatParity(parity)}`;

    } else {

      /*
        Nu mai afișăm mesajul
        "Înainte de începutul semestrului".
      */

      weekLabel.textContent =
        "";
    }
  }
}


/* =========================================================
   NOW
========================================================= */

/* =========================================================
   NOW
========================================================= */

function renderNow() {

  const now = new Date();

  const nowCard =
    document.getElementById("nowCard");

  const status =
    document.getElementById("nowStatus");

  const content =
    document.getElementById("nowContent");

  const progress =
    document.getElementById("nowProgress");

  const fill =
    document.getElementById("nowProgressFill");


  if (!nowCard || !status || !content) {
    return;
  }


  /* -------------------------------------------------------
     SĂPTĂMÂNA
  ------------------------------------------------------- */

  const week =
    getAcademicWeek(now);

  const parity =
    getParity(now);

  const day =
    getDayNumber(now);


  /* -------------------------------------------------------
     ÎNAINTE DE SEMESTRU
     
     Nu mai afișăm deloc cardul.
  ------------------------------------------------------- */

  if (!week) {

    nowCard.style.display = "none";

    return;
  }


  /* -------------------------------------------------------
     DUPĂ ÎNCEPUTUL SEMESTRULUI
     
     Ne asigurăm că este vizibil.
  ------------------------------------------------------- */

  nowCard.style.display = "";


  /* -------------------------------------------------------
     WEEKEND
  ------------------------------------------------------- */

  if (day > 5) {

    status.textContent =
      "WEEKEND";

    content.innerHTML = `
      <div class="now-empty">
        Nu ai cursuri configurate astăzi. 🌤️
      </div>
    `;

    if (progress) {
      progress.style.display = "none";
    }

    return;
  }


  const nowMin =
    minutesNow(now);


  /* -------------------------------------------------------
     LECȚIA ACTIVĂ
  ------------------------------------------------------- */

  const active =
    SCHEDULE.find(
      lesson => {

        if (lesson.day !== day) {
          return false;
        }

        if (
          !lessonMatchesParity(
            lesson,
            parity
          )
        ) {
          return false;
        }

        return (
          nowMin >= parseTime(lesson.start) &&
          nowMin < parseTime(lesson.end)
        );
      }
    );


  /* -------------------------------------------------------
     URMĂTOAREA LECȚIE
  ------------------------------------------------------- */

  const upcoming =
    SCHEDULE
      .filter(
        lesson => {

          if (lesson.day !== day) {
            return false;
          }

          if (
            !lessonMatchesParity(
              lesson,
              parity
            )
          ) {
            return false;
          }

          return (
            parseTime(lesson.start) > nowMin
          );
        }
      )
      .sort(
        (a, b) =>
          parseTime(a.start) -
          parseTime(b.start)
      )[0];


  /* -------------------------------------------------------
     ACUM
  ------------------------------------------------------- */

  if (active) {

    const startMin =
      parseTime(active.start);

    const endMin =
      parseTime(active.end);

    const pct =
      Math.min(
        100,
        Math.max(
          0,
          (
            (nowMin - startMin) /
            (endMin - startMin)
          ) * 100
        )
      );


    status.textContent =
      "ACUM";


    content.innerHTML = `
      <div class="now-main">

        <div>

          <div class="lesson-type">
            ${active.type}
            · Săptămâna ${week}
            · ${formatParity(parity)}
          </div>

          <h2 class="now-subject">
            ${active.subject}
          </h2>

          <div class="now-meta">
            👨‍🏫 ${active.teacher}<br>
            📍
            <strong>
              Cabinet ${active.room}
            </strong>
          </div>

        </div>

        <div class="now-time">

          <strong>
            ${active.start} – ${active.end}
          </strong>

          <span>
            lecția este în desfășurare
          </span>

        </div>

      </div>
    `;


    if (progress && fill) {

      fill.style.width =
        `${pct.toFixed(1)}%`;

      progress.style.display =
        "block";
    }

    return;
  }


  /* -------------------------------------------------------
     NU MAI ESTE LECȚIE ACTIVĂ
  ------------------------------------------------------- */

  if (progress) {
    progress.style.display = "none";
  }


  /* -------------------------------------------------------
     URMEAZĂ
  ------------------------------------------------------- */

  if (upcoming) {

    status.textContent =
      "URMEAZĂ";


    content.innerHTML = `
      <div class="now-main">

        <div>

          <div class="lesson-type">
            ${upcoming.type}
            · Săptămâna ${week}
            · ${formatParity(parity)}
          </div>

          <h2 class="now-subject">
            ${upcoming.subject}
          </h2>

          <div class="now-meta">
            👨‍🏫 ${upcoming.teacher}<br>
            📍
            <strong>
              Cabinet ${upcoming.room}
            </strong>
          </div>

        </div>

        <div class="now-time">

          <strong>
            ${upcoming.start} – ${upcoming.end}
          </strong>

          <span>
            următoarea lecție
          </span>

        </div>

      </div>
    `;

    return;
  }


  /* -------------------------------------------------------
     GATA PE AZI
  ------------------------------------------------------- */

  status.textContent =
    "GATA PE AZI";


  content.innerHTML = `
    <div class="now-empty">
      Nu mai ai ore astăzi. 🎉
    </div>
  `;
}


/* =========================================================
   RENDER GENERAL
========================================================= */

function render() {

  renderHeader();

  renderSchedule();

  renderNow();
}


/* =========================================================
   NAVIGARE
========================================================= */

function stepDay(delta) {

  const next =
    new Date(selectedDate);


  next.setDate(
    next.getDate() + delta
  );


  /*
    Sărim peste weekend.
  */

  while (
    getDayNumber(next) > 5
  ) {

    next.setDate(
      next.getDate() + delta
    );
  }


  selectedDate =
    next;


  render();
}


/* =========================================================
   BUTOANE
========================================================= */

const prevButton =
  document.getElementById(
    "prevDay"
  );


if (prevButton) {

  prevButton.addEventListener(
    "click",
    () => {
      stepDay(-1);
    }
  );
}


const nextButton =
  document.getElementById(
    "nextDay"
  );


if (nextButton) {

  nextButton.addEventListener(
    "click",
    () => {
      stepDay(1);
    }
  );
}


const todayButton =
  document.getElementById(
    "todayBtn"
  );


if (todayButton) {

  todayButton.addEventListener(
    "click",
    () => {

      selectedDate =
        new Date();


      selectedDate.setHours(
        12,
        0,
        0,
        0
      );


      render();
    }
  );
}


/* =========================================================
   TASTATURĂ
========================================================= */

document.addEventListener(
  "keydown",
  event => {

    if (
      event.target.tagName ===
        "INPUT" ||

      event.target.tagName ===
        "TEXTAREA"
    ) {
      return;
    }


    if (
      event.key ===
      "ArrowLeft"
    ) {

      stepDay(-1);
    }


    if (
      event.key ===
      "ArrowRight"
    ) {

      stepDay(1);
    }
  }
);


/* =========================================================
   PORNIRE
========================================================= */

render();


/* =========================================================
   ACTUALIZARE AUTOMATĂ
========================================================= */

setInterval(
  render,
  30000
);