const fs = require("fs");
const path = require("path");

// Topics for remaining tests
const topics = [
  {
    title: "Кибербезопасность в облаке",
    description: "Тест на знание принципов безопасности облачных технологий",
  },
  {
    title: "Безопасность мобильных устройств",
    description: "Тест на знание методов защиты мобильных устройств",
  },
  {
    title: "Вредоносное ПО и защита",
    description: "Тест на знание типов вредоносного ПО и методов защиты",
  },
  {
    title: "Аутентификация и контроль доступа",
    description: "Тест на знание методов аутентификации и управления доступом",
  },
  {
    title: "Социальная инженерия",
    description:
      "Тест на знание принципов социальной инженерии и методов защиты",
  },
  {
    title: "Защита персональных данных",
    description: "Тест на знание принципов защиты персональных данных",
  },
  {
    title: "Защита от угроз и уязвимостей",
    description: "Тест на знание методов защиты от угроз и уязвимостей",
  },
  {
    title: "Компьютерная криминалистика",
    description: "Тест на знание принципов компьютерной криминалистики",
  },
  {
    title: "Веб-безопасность",
    description: "Тест на знание принципов безопасности веб-приложений",
  },
  {
    title: "IoT безопасность",
    description: "Тест на знание методов защиты устройств Интернета вещей",
  },
  {
    title: "Безопасность корпоративных сетей",
    description: "Тест на знание методов защиты корпоративных сетей",
  },
  {
    title: "Управление инцидентами безопасности",
    description: "Тест на знание процессов управления инцидентами",
  },
  {
    title: "Стандарты и соответствие требованиям",
    description: "Тест на знание стандартов информационной безопасности",
  },
  {
    title: "Безопасность баз данных",
    description: "Тест на знание методов защиты баз данных",
  },
  {
    title: "Безопасность DevOps",
    description: "Тест на знание практик безопасной разработки",
  },
  {
    title: "Безопасность операционных систем",
    description: "Тест на знание методов защиты операционных систем",
  },
  {
    title: "Риск-менеджмент в кибербезопасности",
    description: "Тест на знание принципов управления рисками",
  },
];

// Sample question templates
const questionTemplates = [
  {
    template:
      "Какой из следующих является {category} в контексте информационной безопасности?",
    options: [
      "правильный ответ",
      "неправильный ответ 1",
      "неправильный ответ 2",
      "неправильный ответ 3",
    ],
    correctIndex: 0,
  },
  {
    template: "Что такое {term}?",
    options: [
      "правильный ответ",
      "неправильный ответ 1",
      "неправильный ответ 2",
      "неправильный ответ 3",
    ],
    correctIndex: 0,
  },
  {
    template: "Какое из следующих утверждений о {topic} является верным?",
    options: [
      "правильный ответ",
      "неправильный ответ 1",
      "неправильный ответ 2",
      "неправильный ответ 3",
    ],
    correctIndex: 0,
  },
  {
    template: "Какая технология используется для {purpose}?",
    options: [
      "правильный ответ",
      "неправильный ответ 1",
      "неправильный ответ 2",
      "неправильный ответ 3",
    ],
    correctIndex: 0,
  },
];

// Questions data for each topic
const questionsData = {
  "Кибербезопасность в облаке": [
    {
      text: "Что такое SaaS?",
      options: [
        "Программное обеспечение как услуга",
        "Безопасность как услуга",
        "Сервер как услуга",
        "Система как услуга",
      ],
      correctAnswers: ["Программное обеспечение как услуга"],
    },
    {
      text: "Какой метод шифрования рекомендуется использовать для защиты данных в облаке?",
      options: [
        "Шифрование на стороне клиента",
        "Отсутствие шифрования",
        "Базовое шифрование паролем",
        "Шифрование только метаданных",
      ],
      correctAnswers: ["Шифрование на стороне клиента"],
    },
    // Add more questions for each topic...
  ],
  // Other topics' questions would follow
};

// Function to generate random questions
function generateRandomQuestions(topic, count) {
  const questions = [];

  // First use pre-defined questions if available
  if (questionsData[topic] && questionsData[topic].length > 0) {
    questions.push(...questionsData[topic]);
  }

  // Fill the rest with generated questions
  const terms = [
    "многофакторная аутентификация",
    "брандмауэр",
    "CASB",
    "CSPM",
    "контейнеризация",
    "виртуализация",
    "микросегментация",
    "сканирование уязвимостей",
    "шифрование данных",
    "управление идентификацией",
    "обнаружение аномалий",
    "IAM",
    "SIEM",
    "WAF",
    "DLP",
    "управление привилегированным доступом",
    "резервное копирование",
    "аудит безопасности",
    "защита от DDoS",
    "сетевая сегментация",
    "песочница",
    "анализ поведения",
    "SAST",
    "DAST",
  ];

  const categories = [
    "лучшая практика",
    "метод защиты",
    "метод атаки",
    "протокол безопасности",
    "стандарт безопасности",
    "угроза",
    "уязвимость",
    "средство защиты",
  ];

  const purposes = [
    "защиты от несанкционированного доступа",
    "обнаружения вторжений",
    "шифрования данных",
    "аутентификации пользователей",
    "защиты от вредоносного ПО",
    "обеспечения целостности данных",
    "анализа уязвимостей",
    "мониторинга безопасности",
    "управления доступом",
    "защиты от утечек данных",
  ];

  while (questions.length < count) {
    const templateIndex = Math.floor(Math.random() * questionTemplates.length);
    const template = questionTemplates[templateIndex];

    let questionText = template.template;

    // Replace placeholders
    if (questionText.includes("{term}")) {
      const term = terms[Math.floor(Math.random() * terms.length)];
      questionText = questionText.replace("{term}", term);
    }

    if (questionText.includes("{category}")) {
      const category =
        categories[Math.floor(Math.random() * categories.length)];
      questionText = questionText.replace("{category}", category);
    }

    if (questionText.includes("{topic}")) {
      questionText = questionText.replace("{topic}", topic);
    }

    if (questionText.includes("{purpose}")) {
      const purpose = purposes[Math.floor(Math.random() * purposes.length)];
      questionText = questionText.replace("{purpose}", purpose);
    }

    // Check if this question is already in the list
    if (questions.some((q) => q.text === questionText)) {
      continue;
    }

    // Generate options
    const options = [
      `${topic} - Правильный ответ ${questions.length + 1}`,
      `${topic} - Неправильный ответ ${questions.length + 1}.1`,
      `${topic} - Неправильный ответ ${questions.length + 1}.2`,
      `${topic} - Неправильный ответ ${questions.length + 1}.3`,
    ];

    questions.push({
      text: questionText,
      type: "MULTIPLE_CHOICE",
      options: options,
      correctAnswers: [options[0]],
      points: 1,
    });
  }

  return questions;
}

// Generate and save test files
async function generateTests() {
  const outputDir = path.join(__dirname, "infosec-tests");

  // Create directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // We already created test-1.json, test-2.json, and test-3.json
  // Now generate the remaining 17 tests (from index 3 to 19)
  for (let i = 3; i < topics.length + 3; i++) {
    const topic = topics[i - 3];

    const testData = {
      title: topic.title,
      description: topic.description,
      questions: generateRandomQuestions(topic.title, 20),
    };

    const testFile = path.join(outputDir, `test-${i + 1}.json`);
    fs.writeFileSync(testFile, JSON.stringify(testData, null, 2), "utf8");
    console.log(`Generated ${testFile}`);
  }

  console.log("All test files generated successfully!");
}

// Run the generator
generateTests().catch(console.error);
