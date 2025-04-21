# Введение в JavaScript
## Конспект занятия (3 часа)

## Час 1: Основы JavaScript

### Что такое JavaScript?
- **Определение**: JavaScript — это мультипарадигменный язык программирования, который используется для создания интерактивных веб-страниц
- **История**: Создан в 1995 году Бренданом Эйхом за 10 дней
- **Назначение**: Изначально для валидации форм на стороне клиента, сейчас — для полноценных веб-приложений, мобильных приложений, игр, серверной разработки

### Где используется JavaScript?
- **Веб-браузеры**: Работа с DOM, обработка событий, валидация форм
- **Серверная сторона**: Node.js
- **Мобильная разработка**: React Native, Ionic
- **Настольные приложения**: Electron
- **Игровая разработка**: Phaser, Three.js

### Инструменты разработчика
- **Браузерные инструменты** (F12 или Ctrl+Shift+I):
  - Консоль для выполнения JavaScript
  - Отладчик для поиска ошибок
  - Сетевая вкладка для анализа запросов
- **Редакторы кода**: VSCode, WebStorm, Sublime Text

### Подключение JavaScript к HTML
```html
<!-- Внутренний скрипт -->
<script>
  console.log("Привет, мир!");
</script>

<!-- Внешний скрипт -->
<script src="script.js"></script>
```

### Переменные и типы данных
- **Объявление переменных**:
  ```javascript
  var oldWay = "Устаревший способ"; // Устаревший способ
  let changeable = "Можно изменить"; // Современный способ
  const constant = "Нельзя изменить"; // Константа
  ```

- **Примитивные типы данных**:
  ```javascript
  let number = 42;            // Число
  let string = "Текст";       // Строка
  let boolean = true;         // Логический тип
  let nothing = null;         // Пустое значение
  let undefined_var;          // Неопределенное значение
  let bigInt = 9007199254740991n; // Большое целое число
  let symbol = Symbol("id");  // Уникальный идентификатор
  ```

- **Вывод в консоль**:
  ```javascript
  console.log("Это текст");
  console.log(42);
  console.log(boolean);
  console.log(typeof string); // узнать тип: "string"
  ```

### Операторы
- **Арифметические операторы**:
  ```javascript
  let sum = 5 + 3;         // 8
  let difference = 10 - 5; // 5
  let product = 4 * 2;     // 8
  let quotient = 8 / 2;    // 4
  let remainder = 9 % 2;   // 1
  let power = 2 ** 3;      // 8 (2 в степени 3)
  ```

- **Операторы сравнения**:
  ```javascript
  5 > 3;              // true
  10 < 5;             // false
  5 >= 5;             // true
  5 <= 4;             // false
  5 == "5";           // true (нестрогое сравнение, преобразует типы)
  5 === "5";          // false (строгое сравнение, без преобразования типов)
  5 != "5";           // false
  5 !== "5";          // true
  ```

- **Логические операторы**:
  ```javascript
  true && false;      // false (И)
  true || false;      // true (ИЛИ)
  !true;              // false (НЕ)
  ```

## Час 2: Управление потоком и функции

### Условные операторы
- **if...else**:
  ```javascript
  let age = 18;
  
  if (age >= 18) {
    console.log("Вы совершеннолетний");
  } else {
    console.log("Вы несовершеннолетний");
  }
  ```

- **else if**:
  ```javascript
  let score = 85;
  
  if (score >= 90) {
    console.log("Отлично");
  } else if (score >= 70) {
    console.log("Хорошо");
  } else if (score >= 50) {
    console.log("Удовлетворительно");
  } else {
    console.log("Неудовлетворительно");
  }
  ```

- **Тернарный оператор**:
  ```javascript
  let age = 20;
  let message = (age >= 18) ? "Совершеннолетний" : "Несовершеннолетний";
  console.log(message); // "Совершеннолетний"
  ```

- **switch**:
  ```javascript
  let day = 2;
  let dayName;
  
  switch (day) {
    case 1:
      dayName = "Понедельник";
      break;
    case 2:
      dayName = "Вторник";
      break;
    case 3:
      dayName = "Среда";
      break;
    // ... другие дни
    default:
      dayName = "Неизвестный день";
  }
  console.log(dayName); // "Вторник"
  ```

### Циклы
- **for**:
  ```javascript
  for (let i = 0; i < 5; i++) {
    console.log(`Итерация ${i}`);
  }
  ```

- **while**:
  ```javascript
  let i = 0;
  while (i < 5) {
    console.log(`Итерация ${i}`);
    i++;
  }
  ```

- **do...while**:
  ```javascript
  let i = 0;
  do {
    console.log(`Итерация ${i}`);
    i++;
  } while (i < 5);
  ```

- **for...of** (для массивов и других итерируемых объектов):
  ```javascript
  let fruits = ["яблоко", "банан", "груша"];
  for (let fruit of fruits) {
    console.log(fruit);
  }
  ```

### Функции
- **Объявление функции**:
  ```javascript
  // Именованная функция
  function sayHello(name) {
    return `Привет, ${name}!`;
  }
  
  // Вызов функции
  console.log(sayHello("Иван")); // "Привет, Иван!"
  ```

- **Функциональные выражения**:
  ```javascript
  // Функциональное выражение
  const sayHello = function(name) {
    return `Привет, ${name}!`;
  };
  
  // Вызов функции
  console.log(sayHello("Иван")); // "Привет, Иван!"
  ```

- **Стрелочные функции (ES6+)**:
  ```javascript
  // Стрелочная функция
  const sayHello = (name) => `Привет, ${name}!`;
  
  // Вызов функции
  console.log(sayHello("Иван")); // "Привет, Иван!"
  
  // Многострочная стрелочная функция
  const calculate = (a, b) => {
    const sum = a + b;
    return sum * 2;
  };
  ```

- **Параметры по умолчанию**:
  ```javascript
  function greet(name = "Гость") {
    return `Привет, ${name}!`;
  }
  
  console.log(greet()); // "Привет, Гость!"
  console.log(greet("Иван")); // "Привет, Иван!"
  ```

## Час 3: Структуры данных и DOM

### Массивы
- **Создание массива**:
  ```javascript
  let fruits = ["яблоко", "банан", "груша"];
  let numbers = [1, 2, 3, 4, 5];
  let mixed = [1, "два", true, null, {name: "Объект"}];
  ```

- **Доступ к элементам**:
  ```javascript
  console.log(fruits[0]); // "яблоко"
  console.log(fruits[1]); // "банан"
  console.log(fruits.length); // 3
  ```

- **Методы массивов**:
  ```javascript
  // Добавление и удаление элементов
  fruits.push("апельсин");       // Добавляет в конец
  let lastFruit = fruits.pop();  // Удаляет последний элемент
  fruits.unshift("киви");        // Добавляет в начало
  let firstFruit = fruits.shift(); // Удаляет первый элемент
  
  // Другие полезные методы
  let newArray = fruits.slice(1, 3); // Копирует часть массива
  fruits.splice(1, 1, "виноград"); // Удаляет/заменяет элементы
  let fruitsString = fruits.join(", "); // Объединяет в строку
  let hasApple = fruits.includes("яблоко"); // Проверяет наличие
  ```

- **Перебор массивов**:
  ```javascript
  // forEach
  fruits.forEach((fruit, index) => {
    console.log(`${index + 1}: ${fruit}`);
  });
  
  // map - создаёт новый массив с результатами вызова функции
  let upperFruits = fruits.map(fruit => fruit.toUpperCase());
  
  // filter - создаёт новый массив с элементами, прошедшими проверку
  let longFruits = fruits.filter(fruit => fruit.length > 5);
  
  // find - возвращает первый элемент, прошедший проверку
  let apple = fruits.find(fruit => fruit === "яблоко");
  ```

### Объекты
- **Создание объекта**:
  ```javascript
  let person = {
    firstName: "Иван",
    lastName: "Иванов",
    age: 30,
    isStudent: false,
    contacts: {
      email: "ivan@example.com",
      phone: "+7 900 123-45-67"
    },
    greet: function() {
      return `Привет, меня зовут ${this.firstName}!`;
    }
  };
  ```

- **Доступ к свойствам**:
  ```javascript
  console.log(person.firstName); // "Иван"
  console.log(person["lastName"]); // "Иванов"
  console.log(person.contacts.email); // "ivan@example.com"
  console.log(person.greet()); // "Привет, меня зовут Иван!"
  ```

- **Добавление и изменение свойств**:
  ```javascript
  person.job = "Разработчик";
  person.age = 31;
  delete person.isStudent;
  ```

- **Перебор свойств объекта**:
  ```javascript
  // Object.keys() - получает массив ключей
  let keys = Object.keys(person);
  
  // Object.values() - получает массив значений
  let values = Object.values(person);
  
  // Object.entries() - получает массив пар [ключ, значение]
  let entries = Object.entries(person);
  
  // for...in - перебирает все перечисляемые свойства
  for (let key in person) {
    if (typeof person[key] !== "function") {
      console.log(`${key}: ${person[key]}`);
    }
  }
  ```

### Основы работы с DOM
- **Что такое DOM**:
  - DOM (Document Object Model) - представление HTML-документа в виде дерева объектов
  - Позволяет JavaScript взаимодействовать с HTML-элементами

- **Доступ к элементам**:
  ```javascript
  // По ID
  let header = document.getElementById("header");
  
  // По селектору CSS (первый найденный)
  let paragraph = document.querySelector("p.intro");
  
  // По селектору CSS (все найденные)
  let buttons = document.querySelectorAll("button.action");
  
  // По имени тега
  let divs = document.getElementsByTagName("div");
  
  // По имени класса
  let highlights = document.getElementsByClassName("highlight");
  ```

- **Изменение содержимого**:
  ```javascript
  // Изменение текстового содержимого
  header.textContent = "Новый заголовок";
  
  // Изменение HTML-содержимого
  paragraph.innerHTML = "Это <strong>новый</strong> текст";
  ```

- **Работа с атрибутами**:
  ```javascript
  // Получение значения атрибута
  let link = document.querySelector("a");
  let href = link.getAttribute("href");
  
  // Установка значения атрибута
  link.setAttribute("href", "https://example.com");
  
  // Проверка наличия атрибута
  let hasTarget = link.hasAttribute("target");
  
  // Удаление атрибута
  link.removeAttribute("target");
  ```

- **Изменение стилей**:
  ```javascript
  // Прямое изменение стиля
  header.style.color = "blue";
  header.style.fontSize = "24px";
  header.style.backgroundColor = "yellow";
  
  // Добавление/удаление класса
  header.classList.add("active");
  header.classList.remove("hidden");
  header.classList.toggle("highlight");
  header.classList.contains("active"); // true
  ```

- **События**:
  ```javascript
  // Добавление обработчика события
  let button = document.querySelector("button");
  button.addEventListener("click", function(event) {
    console.log("Кнопка была нажата!");
    console.log(event); // объект события
  });
  
  // Удаление обработчика события
  function handleClick() {
    console.log("Клик!");
  }
  button.addEventListener("click", handleClick);
  button.removeEventListener("click", handleClick);
  ```

### Практическое задание: Счетчик кликов
```html
<!DOCTYPE html>
<html>
<head>
  <title>Счетчик кликов</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      text-align: center;
      margin-top: 50px;
    }
    #counter {
      font-size: 48px;
      margin: 20px;
    }
    button {
      padding: 10px 20px;
      font-size: 16px;
      margin: 0 10px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <h1>Счетчик кликов</h1>
  <div id="counter">0</div>
  <button id="decrease">-</button>
  <button id="reset">Сброс</button>
  <button id="increase">+</button>

  <script>
    // Получаем элементы DOM
    const counterElement = document.getElementById("counter");
    const decreaseButton = document.getElementById("decrease");
    const resetButton = document.getElementById("reset");
    const increaseButton = document.getElementById("increase");
    
    // Начальное значение счетчика
    let count = 0;
    
    // Функция для обновления отображаемого значения
    function updateCounter() {
      counterElement.textContent = count;
      
      // Дополнительно: изменяем цвет в зависимости от значения
      if (count < 0) {
        counterElement.style.color = "red";
      } else if (count > 0) {
        counterElement.style.color = "green";
      } else {
        counterElement.style.color = "black";
      }
    }
    
    // Обработчики событий для кнопок
    decreaseButton.addEventListener("click", function() {
      count--;
      updateCounter();
    });
    
    resetButton.addEventListener("click", function() {
      count = 0;
      updateCounter();
    });
    
    increaseButton.addEventListener("click", function() {
      count++;
      updateCounter();
    });
  </script>
</body>
</html>
```

### Дополнительные ресурсы для самостоятельного изучения
- [MDN Web Docs](https://developer.mozilla.org/ru/docs/Web/JavaScript) - лучшая документация по JavaScript
- [JavaScript.info](https://javascript.info/ru) - современный учебник по JavaScript
- [Codecademy](https://www.codecademy.com/learn/introduction-to-javascript) - интерактивные курсы
- [freeCodeCamp](https://www.freecodecamp.org/) - практические задания и проекты

### Заключение
- JavaScript - мощный и универсальный язык программирования
- Мы рассмотрели основы синтаксиса, типы данных, функции, объекты и работу с DOM
- Для закрепления знаний важно практиковаться и создавать собственные проекты
- Следующие шаги: изучение современных возможностей ES6+, асинхронного JavaScript, фреймворков и библиотек 