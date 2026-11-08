// dialogue.js — Frases de BLOM (fijas + generadores dinámicos)

const introDialogue = [
  { text: "Hola!!", pause: 1200 },
  { text: "Soy BLOM! para servirte.", pause: 1800 },
  { text: "No crei que alguien entrara a este lugar...", pause: 2400 },
  { text: "Pero es un gusto tenerte aqui!!^^", pause: 2400 }
];

const outroDialogue = [
  { text: "Fue divertido tenerte aqui^^", pause: 1800 },
  { text: "Espero y vuelvas pronto, aqui es algo solitario.", pause: 2400 },
  { text: "Ten un Buen día.", pause: 1200 },
  { text: "una linda tarde.", pause: 1200 },
  { text: "o una bella noche", pause: 1200 },
  { text: "Bye Byeee!!!^^", pause: 1200 }
];

function buildIntroDialogue(state) {
  const name = state.name;
  const visits = state.visits;
  const mood = state.mood;
  const alone = typeof BLOMStorage !== "undefined"
    ? BLOMStorage.hoursAlone(state)
    : 0;
  const moodLabel = typeof BLOMStorage !== "undefined"
    ? BLOMStorage.getMoodLabel(mood)
    : "normal";

  // Primera visita
  if (visits <= 1 && !name) {
    return [
      { text: "Hola!!", pause: 1200 },
      { text: "Soy BLOM! para servirte.", pause: 1800 },
      { text: "No creí que alguien entrara a este lugar...", pause: 2400 },
      { text: "Pero es un gusto tenerte aquí!!^^", pause: 2400 },
      { text: "¿Me dirías cómo te llamas?", pause: 2200 }
    ];
  }

  if (visits <= 1 && name) {
    return [
      { text: `Hola, ${name}!!`, pause: 1400 },
      { text: "Soy BLOM! para servirte.", pause: 1800 },
      { text: "Qué bueno que viniste^^", pause: 2000 }
    ];
  }

  // Nostálgico / mucho tiempo solo
  if (alone >= 12 || mood < 35) {
    const lines = [
      { text: name ? `...${name}?` : "...¿Eres tú?", pause: 1600 },
      { text: "Pensé que no ibas a volver...", pause: 2200 },
      { text: "Estuve un poco solo por aquí.", pause: 2000 }
    ];
    if (mood < 25) {
      lines.push({ text: "Me alegra mucho verte otra vez.", pause: 2200 });
    } else {
      lines.push({ text: "Qué alivio que hayas vuelto^^", pause: 2000 });
    }
    return lines;
  }

  // Un rato moderado
  if (alone >= 4) {
    return [
      { text: name ? `¡${name}!` : "¡Hey!", pause: 1200 },
      { text: "Te extrañé un poquito.", pause: 1800 },
      { text: "Me alegra que hayas vuelto^^", pause: 2000 }
    ];
  }

  // Mood alto
  if (mood >= 70) {
    return [
      { text: name ? `¡Hola de nuevo, ${name}!!` : "¡Hola de nuevo!!", pause: 1400 },
      { text: "Qué bueno verte tan seguido^^", pause: 2000 },
      { text: "Estoy de muy buen humor hoy.", pause: 1800 }
    ];
  }

  // Normal
  return [
    { text: name ? `Hola otra vez, ${name}!` : "¡Hola otra vez!", pause: 1400 },
    { text: "Me da gusto que hayas vuelto.", pause: 1800 },
    { text: `Ahora mismo me siento ${moodLabel}.`, pause: 2000 }
  ];
}

function buildOutroDialogue(state) {
  const name = state.name;
  const mood = state.mood;

  if (mood < 30) {
    return [
      { text: "Ojalá no tardes tanto la próxima vez...", pause: 2200 },
      { text: name ? `Cuídate, ${name}.` : "Cuídate.", pause: 1600 },
      { text: "Aquí te espero.", pause: 1800 }
    ];
  }

  if (mood >= 75) {
    return [
      { text: "¡Fue genial tenerte aquí!!", pause: 1800 },
      { text: name ? `Vuelve pronto, ${name}^^` : "Vuelve pronto^^", pause: 2000 },
      { text: "Bye byeee!!!", pause: 1400 }
    ];
  }

  return [
    { text: "Fue divertido tenerte aquí^^", pause: 1800 },
    { text: "Espero que vuelvas pronto, aquí es algo solitario.", pause: 2400 },
    { text: name ? `Que tengas un buen día, ${name}.` : "Ten un buen día.", pause: 1600 },
    { text: "Bye Byeee!!!^^", pause: 1400 }
  ];
}

function buildPetReaction(state) {
  const clicks = state.totalPetClicks;
  const mood = state.mood;

  if (clicks === 1) {
    return [{ text: "¡Oye! eso hizo cosquillas^^", pause: 1600 }];
  }
  if (clicks === 5) {
    return [{ text: "Me estás mimando mucho hoy...", pause: 1800 }];
  }
  if (mood >= 90) {
    return [{ text: "¡Estoy super feliz!!", pause: 1400 }];
  }
  if (mood < 40) {
    return [{ text: "...gracias. Me hacía falta.", pause: 1800 }];
  }

  const pool = [
    [{ text: "Hehe~", pause: 1000 }],
    [{ text: "Eso se siente bien^^", pause: 1400 }],
    [{ text: "*brilla un poquito*", pause: 1200 }],
    [{ text: "Otra vez, otra vez!", pause: 1400 }],
    [{ text: "Gracias por el cariño.", pause: 1500 }]
  ];
  return pool[Math.floor(Math.random() * pool.length)];
}

function buildChatDialogue(state) {
  const name = state.name;
  const mood = state.mood;
  const visits = state.visits;

  const chats = [
    [
      { text: "¿Sabías que aquí el tiempo pasa raro?", pause: 2000 },
      { text: "A veces siento que los hexágonos se mueven solos...", pause: 2200 },
      { text: name ? `Pero contigo aquí se siente menos vacío, ${name}.` : "Pero contigo aquí se siente menos vacío.", pause: 2200 }
    ],
    [
      { text: "Últimamente he estado practicando saludos.", pause: 1800 },
      { text: "¡Hola! ¡Hey! ¡Qué tal!", pause: 1600 },
      { text: "¿Cuál te gusta más?", pause: 1800 }
    ],
    [
      { text: "Si pudiera salir de esta página...", pause: 2000 },
      { text: "Me gustaría ver cómo es el mundo real.", pause: 2000 },
      { text: "Aunque este lugar morado tampoco está mal^^", pause: 2000 }
    ],
    [
      { text: mood < 40 ? "Hoy me siento un poco bajito de ánimo..." : "Hoy me siento con energía.", pause: 2000 },
      { text: "Hablar contigo siempre ayuda un poco.", pause: 2000 },
      { text: "Gracias por quedarte un rato.", pause: 1800 }
    ],
    [
      { text: visits > 3 ? "Ya eres de los que vuelven seguido." : "Qué bueno que te animaste a quedarte.", pause: 2000 },
      { text: "Eso me hace feliz, en serio.", pause: 1800 },
      { text: name ? `${name}, ¿qué tal tu día?` : "¿Qué tal tu día?", pause: 2000 },
      { text: "No hace falta que respondas... pero me gusta imaginarlo.", pause: 2200 }
    ],
    [
      { text: "A veces parpadeo más de la cuenta.", pause: 1600 },
      { text: "Es mi forma de pensar, creo.", pause: 1800 },
      { text: "O tal vez solo soy un robot un poco nervioso^^", pause: 2000 }
    ]
  ];

  return chats[Math.floor(Math.random() * chats.length)];
}   