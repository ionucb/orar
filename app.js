/* =========================================================
   CONFIGURAȚIE SEMESTRU
========================================================= */

/*
  1 septembrie 2026 = săptămâna 1.

  Săptămâna 1 → IMPARĂ
  Săptămâna 2 → PARĂ
  Săptămâna 3 → IMPARĂ
  etc.
*/

const SEMESTER_START = new Date(2026, 8, 1);

const FIRST_WEEK_PARITY = "odd";


/* =========================================================
   DENUMIRI COMPLETE
========================================================= */

const SUBJECT_NAMES = {
  IoT: "Internet of Things",
  PECPIT: "Proiectarea și exploatarea componentelor pentru prelucrarea informației",
  ASCS: "Administrarea sistemelor și calculatoarelor",
  PSI: "Prelucrarea semnalelor și imaginilor",
  ARC: "Arhitectura calculatoarelor",
  PAM: "Programarea aplicațiilor mobile",
  PAD: "Proiectarea aplicațiilor distribuite"
};


/* =========================================================
   STARE
========================================================= */

let selectedDate = new Date();

selectedDate.setHours(
  12,
  0,
  0,
  0
);


/* =========================================================
   HELPERS
========================================================= */

const pad = value =>
  String(value).padStart(2, "0");


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


function diffDays(a, b) {

  return Math.floor(
    (
      startOfDay(a) -
      startOfDay(b)
    ) / 86400000
  );
}


/* =========================================================
   SĂPTĂMÂNĂ ACADEMICĂ
========================================================= */

function getAcademicWeek(date) {

  const days =
    diffDays(
      date,
      SEMESTER_START
    );

  if (days < 0) {
    return null;
  }

  return Math.floor(
    days / 7
  ) + 1;
}


/* =========================================================
   PARITATE
========================================================= */

function getParity(date) {

  const week =
    getAcademicWeek(date);

  if (!week) {
    return null;
  }

  /*
    Dacă prima săptămână este impară:

    1 → odd
    2 → even
    3 → odd
    4 → even
  */

  const firstIsOdd =
    FIRST_WEEK_PARITY === "odd";

  const isOdd =
    firstIsOdd
      ? week % 2 === 1
      : week % 2 === 0;

  return isOdd
    ? "odd"
    : "even";
}


/* =========================================================
   ZIUA SĂPTĂMÂNII
========================================================= */

function getDayNumber(date) {

  const day =
    date.getDay();

  /*
    JavaScript:
    0 = Duminică
    1 = Luni
    ...
    6 = Sâmbătă

    Noi vrem:
    1 = Luni
    ...
    7 = Duminică
  */

  return day === 0
    ? 7
    : day;
}


/* =========================================================
   TIMP
========================================================= */

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

  return "TOATE";
}


/* =========================================================
   LECȚIILE UNEI ZILE
========================================================= */

function lessonsForDay(date) {

  const day =
    getDayNumber(date);

  const parity =
    getParity(date);

  return SCHEDULE.filter(
    item =>
      item.day === day &&
      (
        item.parity === "all" ||
        item.parity === parity
      )
  );
}


/* =========================================================
   LECȚIILE DINTR-UN INTERVAL
========================================================= */

function allLessonsForSlot(
  day,
  start,
  end
) {

  return SCHEDULE.filter(
    item =>
      item.day === day &&
      item.start === start &&
      item.end === end
  );
}


/* =========================================================
   ESTE LECȚIA ACTIVĂ?
========================================================= */

function isCurrentLesson(
  item,
  date = new Date()
) {

  if (
    dateKey(date) !==
    dateKey(selectedDate)
  ) {
    return false;
  }

  if (
    getDayNumber(date) !==
    item.day
  ) {
    return false;
  }

  const parity =
    getParity(date);

  if (
    item.parity !== "all" &&
    item.parity !== parity
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
   HTML PENTRU O LECȚIE
========================================================= */

function lessonHTML(
  item,
  current = false,
  inactive = false
) {

  const parityLabel =
    item.parity === "odd"
      ? "Impară"
      : item.parity === "even"
        ? "Pară"
        : "Toate săptămânile";


  const fullName =
    SUBJECT_NAMES[item.subject];


  const titleAttr =
    fullName
      ? ` title="${fullName}"`
      : "";


  const classes = [
    "lesson",
    item.parity,
    current ? "current" : "",
    inactive ? "inactive" : ""
  ]
    .filter(Boolean)
    .join(" ");


  return `
    <article class="${classes}">
      
      <span class="lesson-parity">
        ${parityLabel}
      </span>

      <div>

        <div class="lesson-type">
          ${item.type}
        </div>

        <h3
          class="lesson-subject"
          ${titleAttr}
        >
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
   RENDER SCHEDULE
========================================================= */

function renderSchedule() {

  const container =
    document.getElementById("schedule");

  const day =
    getDayNumber(selectedDate);

  const selectedParity =
    getParity(selectedDate);


  /*
    Header zi
  */

  document.getElementById(
    "selectedDay"
  ).textContent =
    DAY_NAMES[day] || "Weekend";


  document.getElementById(
    "selectedDate"
  ).textContent =
    formatShortDate(selectedDate);


  /*
    Weekend
  */

  if (day > 5) {

    container.innerHTML = `
      <div class="weekend-card">
        Nu există ore configurate pentru weekend. 🌤️
      </div>
    `;

    return;
  }


  /*
    Construim fiecare interval orar
  */

  container.innerHTML =
    TIME_SLOTS
      .map(
        ([start, end]) => {

          const lessons =
            allLessonsForSlot(
              day,
              start,
              end
            );


          const odd =
            lessons.find(
              item =>
                item.parity === "odd"
            );


          const even =
            lessons.find(
              item =>
                item.parity === "even"
            );


          const all =
            lessons.find(
              item =>
                item.parity === "all"
            );


          /*
            Lecția care este activă
          */

          const current =
            lessonsForDay(
              selectedDate
            ).find(
              item =>
                item.start === start &&
                isCurrentLesson(item)
            );


          /*
            Dacă avem o lecție "all",
            ea ocupă întreg intervalul.
          */

          if (all) {

            return `
              <div class="time-row">

                <div class="time-label">
                  ${start}<br>
                  ↓<br>
                  ${end}
                </div>

                <div class="time-track">

                  ${lessonHTML(
                    all,
                    current?.parity === "all"
                  )}

                </div>

              </div>
            `;
          }


          /*
            Lecția impară:

            - întotdeauna sus
            - dacă suntem în săptămână pară,
              este estompată
          */

          const oddHTML =
            odd
              ? lessonHTML(
                  odd,
                  current?.parity === "odd",
                  selectedParity !== "odd"
                )
              : `
                  <div class="free">
                    Liber
                  </div>
                `;


          /*
            Lecția pară:

            - întotdeauna jos
            - dacă suntem în săptămână impară,
              este estompată
          */

          const evenHTML =
            even
              ? lessonHTML(
                  even,
                  current?.parity === "even",
                  selectedParity !== "even"
                )
              : `
                  <div class="free">
                    Liber
                  </div>
                `;


          return `
            <div class="time-row">

              <div class="time-label">
                ${start}<br>
                ↓<br>
                ${end}
              </div>

              <div class="time-track">

                ${oddHTML}

                <div class="parity-line"></div>

                ${evenHTML}

              </div>

            </div>
          `;
        }
      )
      .join("");
}


/* =========================================================
   HEADER
========================================================= */

function renderHeader() {

  const today =
    new Date();


  document.getElementById(
    "todayLabel"
  ).textContent =
    formatDate(today);


  const week =
    getAcademicWeek(today);


  const parity =
    getParity(today);


  document.getElementById(
    "weekLabel"
  ).textContent =
    week
      ? `Săptămâna ${week} · ${formatParity(parity)}`
      : "Semestrul începe la 1 septembrie 2026";
}


/* =========================================================
   NOW
========================================================= */

function renderNow() {

  const now =
    new Date();


  const status =
    document.getElementById(
      "nowStatus"
    );


  const content =
    document.getElementById(
      "nowContent"
    );


  const progress =
    document.getElementById(
      "nowProgress"
    );


  const fill =
    document.getElementById(
      "nowProgressFill"
    );


  const week =
    getAcademicWeek(now);


  const parity =
    getParity(now);


  /*
    Înainte de semestru
  */

  if (!week) {

    status.textContent =
      "ÎNAINTE DE SEMESTRU";


    content.innerHTML = `
      <div class="now-empty">

        Semestrul începe pe
        <strong>
          1 septembrie 2026
        </strong>.

      </div>
    `;


    progress.style.display =
      "none";

    return;
  }


  const day =
    getDayNumber(now);


  /*
    Weekend
  */

  if (day > 5) {

    status.textContent =
      "WEEKEND";


    content.innerHTML = `
      <div class="now-empty">
        Nu ai cursuri configurate astăzi. 🌤️
      </div>
    `;


    progress.style.display =
      "none";

    return;
  }


  const nowMin =
    minutesNow(now);


  /*
    Lecția activă
  */

  const active =
    SCHEDULE.find(item => {

      if (item.day !== day) {
        return false;
      }


      if (
        item.parity !== "all" &&
        item.parity !== parity
      ) {
        return false;
      }


      return (
        nowMin >=
          parseTime(item.start) &&
        nowMin <
          parseTime(item.end)
      );
    });


  /*
    Următoarea lecție
  */

  const upcoming =
    SCHEDULE
      .filter(item => {

        if (item.day !== day) {
          return false;
        }


        if (
          item.parity !== "all" &&
          item.parity !== parity
        ) {
          return false;
        }


        return (
          parseTime(item.start) >
          nowMin
        );
      })
      .sort(
        (a, b) =>
          parseTime(a.start) -
          parseTime(b.start)
      )[0];


  /*
    ACTIVĂ
  */

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
            (
              nowMin -
              startMin
            ) /
            (
              endMin -
              startMin
            )
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


    fill.style.width =
      `${pct.toFixed(1)}%`;


    progress.style.display =
      "block";


    return;
  }


  /*
    NU MAI AVEM ORE
  */

  progress.style.display =
    "none";


  /*
    URMEAZĂ
  */

  if (upcoming) {

    status.textContent =
      "URMEAZĂ";


    content.innerHTML = `
      <div class="now-main">

        <div>

          <div class="lesson-type">
            ${upcoming.type}
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


  /*
    GATA
  */

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

  selectedDate.setDate(
    selectedDate.getDate() + delta
  );


  /*
    Sărim peste weekend.

    Dacă mergem înainte:
    Vineri → Luni

    Dacă mergem înapoi:
    Luni → Vineri
  */

  while (
    getDayNumber(selectedDate) > 5
  ) {

    selectedDate.setDate(
      selectedDate.getDate() + delta
    );
  }


  render();
}


/* =========================================================
   BUTTONS
========================================================= */

document
  .getElementById("prevDay")
  .addEventListener(
    "click",
    () => stepDay(-1)
  );


document
  .getElementById("nextDay")
  .addEventListener(
    "click",
    () => stepDay(1)
  );


document
  .getElementById("todayBtn")
  .addEventListener(
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


/* =========================================================
   KEYBOARD
========================================================= */

document.addEventListener(
  "keydown",
  event => {

    /*
      Nu interceptăm săgețile dacă
      utilizatorul scrie într-un input.
    */

    if (
      event.target.tagName === "INPUT" ||
      event.target.tagName === "TEXTAREA"
    ) {
      return;
    }


    if (
      event.key === "ArrowLeft"
    ) {

      stepDay(-1);
    }


    if (
      event.key === "ArrowRight"
    ) {

      stepDay(1);
    }
  }
);


/* =========================================================
   START
========================================================= */

render();


/*
  Reîmprospătăm starea "ACUM"
  la fiecare 30 secunde.
*/

setInterval(
  render,
  30000
);