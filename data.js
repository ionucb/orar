/* =========================================================
   ORAR TI 232
========================================================= */

const SCHEDULE = [

  /* =======================================================
     LUNI
  ======================================================= */

  {
    day: 1,
    start: "09:45",
    end: "11:15",
    subject: "IoT",
    type: "Lab",
    teacher: "Litra D.",
    room: "A01",
    parity: "all"
  },

  {
    day: 1,
    start: "11:30",
    end: "13:00",
    subject: "IoT",
    type: "Lab",
    teacher: "Litra D.",
    room: "A01",
    parity: "all"
  },

  {
    day: 1,
    start: "13:30",
    end: "15:00",
    subject: "PECPIT",
    type: "Curs",
    teacher: "Chirev P.",
    room: "6-2",
    parity: "odd"
  },

  {
    day: 1,
    start: "13:30",
    end: "15:00",
    subject: "PECPIT",
    type: "Curs",
    teacher: "Duca L.",
    room: "630",
    parity: "even"
  },

  {
    day: 1,
    start: "15:15",
    end: "16:45",
    subject: "ASCS",
    type: "Curs",
    teacher: "Catruc M.",
    room: "6-2",
    parity: "all"
  },


  /* =======================================================
     MARȚI
  ======================================================= */

  {
    day: 2,
    start: "09:45",
    end: "11:15",
    subject: "ASCS",
    type: "Seminar",
    teacher: "Catruc M.",
    room: "513",
    parity: "all"
  },

  {
    day: 2,
    start: "11:30",
    end: "13:00",
    subject: "PSI",
    type: "Seminar",
    teacher: "Duca L.",
    room: "512",
    parity: "all"
  },

  {
    day: 2,
    start: "13:30",
    end: "15:00",
    subject: "ARC",
    type: "Seminar",
    teacher: "Bodoga C.",
    room: "512",
    parity: "all"
  },


  /* =======================================================
     MIERCURI
  ======================================================= */

  {
    day: 3,
    start: "13:30",
    end: "15:00",
    subject: "PSI",
    type: "Curs",
    teacher: "Secrieru A.",
    room: "624",
    parity: "odd"
  },

  {
    day: 3,
    start: "13:30",
    end: "15:00",
    subject: "ASCS",
    type: "Curs",
    teacher: "Plămădeală C.",
    room: "624",
    parity: "even"
  },

  {
    day: 3,
    start: "15:15",
    end: "16:45",
    subject: "PSI",
    type: "Curs",
    teacher: "Chirev P.",
    room: "6-2",
    parity: "all"
  },

  {
    day: 3,
    start: "17:00",
    end: "18:30",
    subject: "PAM",
    type: "Curs",
    teacher: "Barbaroș V.",
    room: "6-2",
    parity: "all"
  },


  /* =======================================================
     JOI
  ======================================================= */

  {
    day: 4,
    start: "13:30",
    end: "15:00",
    subject: "PAD",
    type: "Curs",
    teacher: "Ciorbă D.",
    room: "3-3",
    parity: "all"
  },

  {
    day: 4,
    start: "15:15",
    end: "16:45",
    subject: "PAD",
    type: "Curs",
    teacher: "Ciorbă D.",
    room: "3-3",
    parity: "odd"
  },

  {
    day: 4,
    start: "15:15",
    end: "16:45",
    subject: "PSI",
    type: "Curs",
    teacher: "Chirev P.",
    room: "3-3",
    parity: "even"
  },

  {
    day: 4,
    start: "17:00",
    end: "18:30",
    subject: "PAD",
    type: "Seminar",
    teacher: "Bîtcă E.",
    room: "513",
    parity: "all"
  },


  /* =======================================================
     VINERI
  ======================================================= */

  {
    day: 5,
    start: "11:30",
    end: "13:00",
    subject: "PAM",
    type: "Seminar",
    teacher: "Buza D.",
    room: "513",
    parity: "all"
  },

  {
    day: 5,
    start: "13:30",
    end: "15:00",
    subject: "ARC",
    type: "Curs",
    teacher: "Bolun I.",
    room: "6-2",
    parity: "all"
  },

  {
    day: 5,
    start: "15:15",
    end: "16:45",
    subject: "IoT",
    type: "Curs",
    teacher: "Bragarenco A.",
    room: "6-2",
    parity: "all"
  }

];


/* =========================================================
   INTERVALE ORARE
========================================================= */

const TIME_SLOTS = [

  [
    "08:00",
    "09:30"
  ],

  [
    "09:45",
    "11:15"
  ],

  [
    "11:30",
    "13:00"
  ],

  [
    "13:30",
    "15:00"
  ],

  [
    "15:15",
    "16:45"
  ],

  [
    "17:00",
    "18:30"
  ],

  [
    "18:45",
    "20:15"
  ]

];


/* =========================================================
   ZILE
========================================================= */

const DAY_NAMES = [
  "",
  "Luni",
  "Marți",
  "Miercuri",
  "Joi",
  "Vineri"
];