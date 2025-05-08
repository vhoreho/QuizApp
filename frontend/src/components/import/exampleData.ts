export interface ExampleData {
  json: string;
  csv: string;
}

// Example quiz data for import demonstrations
export const exampleData: ExampleData = {
  json: `{
  "title": "Пример теста для импорта",
  "description": "Этот тест демонстрирует формат JSON для импорта с разными типами вопросов",
  "questions": [
    {
      "text": "Какой язык программирования используется для разработки фронтенда?",
      "type": "SINGLE_CHOICE",
      "options": ["JavaScript", "Python", "Java", "C++"],
      "correctAnswers": ["JavaScript"],
      "points": 1
    },
    {
      "text": "Выберите все фреймворки для JavaScript:",
      "type": "MULTIPLE_CHOICE",
      "options": ["React", "Angular", "Django", "Vue", "Flask"],
      "correctAnswers": ["React", "Angular", "Vue"],
      "points": 2
    },
    {
      "text": "HTML - это язык программирования.",
      "type": "TRUE_FALSE",
      "options": ["Верно", "Неверно"],
      "correctAnswers": ["Неверно"],
      "points": 1
    },
    {
      "text": "Сопоставьте языки программирования и их создателей:",
      "type": "MATCHING",
      "options": ["JavaScript:Брендан Эйх", "Python:Гвидо ван Россум", "C++:Бьёрн Страуструп", "Java:Джеймс Гослинг"],
      "correctAnswers": ["JavaScript:Брендан Эйх", "Python:Гвидо ван Россум", "C++:Бьёрн Страуструп", "Java:Джеймс Гослинг"],
      "points": 4
    }
  ]
}`,
  csv: `"text","type","options","correctAnswers","points"
"Какой язык программирования используется для разработки фронтенда?","SINGLE_CHOICE","JavaScript,Python,Java,C++","JavaScript",1
"Выберите все фреймворки для JavaScript:","MULTIPLE_CHOICE","React,Angular,Django,Vue,Flask","React,Angular,Vue",2
"HTML - это язык программирования.","TRUE_FALSE","Верно,Неверно","Неверно",1
"Сопоставьте языки программирования и их создателей:","MATCHING","JavaScript:Брендан Эйх,Python:Гвидо ван Россум,C++:Бьёрн Страуструп,Java:Джеймс Гослинг","JavaScript:Брендан Эйх,Python:Гвидо ван Россум,C++:Бьёрн Страуструп,Java:Джеймс Гослинг",4`
};

// Sample quiz for easy import demonstration
export const infosecQuiz = {
  title: "Основы информационной безопасности",
  description: "Тест на базовые знания информационной безопасности",
  questions: [
    {
      text: "Что такое фишинг?",
      type: "SINGLE_CHOICE",
      options: [
        "Метод атаки, направленный на получение конфиденциальной информации путем обмана",
        "Программа для защиты от вирусов",
        "Метод шифрования данных",
        "Технология для безопасной передачи данных",
      ],
      correctAnswers: [
        "Метод атаки, направленный на получение конфиденциальной информации путем обмана",
      ],
      points: 1,
      order: 1,
    },
    {
      text: "Какой из следующих протоколов обеспечивает защищенное соединение в веб-браузере?",
      type: "SINGLE_CHOICE",
      options: ["HTTP", "HTTPS", "FTP", "SMTP"],
      correctAnswers: ["HTTPS"],
      points: 1,
      order: 2,
    },
    {
      text: "Что такое брандмауэр (файрвол)?",
      type: "SINGLE_CHOICE",
      options: [
        "Программа для блокировки нежелательных рекламных сообщений",
        "Устройство или ПО, которое контролирует сетевой трафик в соответствии с правилами безопасности",
        "Система для обнаружения вредоносных программ",
        "Протокол передачи данных",
      ],
      correctAnswers: [
        "Устройство или ПО, которое контролирует сетевой трафик в соответствии с правилами безопасности",
      ],
      points: 1,
      order: 3,
    },
    {
      text: "Что такое двухфакторная аутентификация?",
      type: "SINGLE_CHOICE",
      options: [
        "Способ защиты, требующий два пароля",
        "Способ защиты, требующий подтверждение личности по двум разным категориям данных",
        "Метод шифрования, использующий два ключа",
        "Система с двумя разными антивирусами",
      ],
      correctAnswers: [
        "Способ защиты, требующий подтверждение личности по двум разным категориям данных",
      ],
      points: 1,
      order: 4,
    },
    {
      text: "Какой тип вредоносного ПО шифрует файлы пользователя и требует выкуп за их расшифровку?",
      type: "SINGLE_CHOICE",
      options: ["Spyware", "Вирус", "Ransomware", "Червь"],
      correctAnswers: ["Ransomware"],
      points: 1,
      order: 5,
    },
  ],
}; 