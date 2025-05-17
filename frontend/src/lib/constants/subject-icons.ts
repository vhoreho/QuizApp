export const SUBJECT_ICONS: Record<string, string> = {
  // Программирование и IT
  'programming': '💻',
  'computer-science': '🖥️',
  'web-development': '🌐',
  'databases': '🗄️',
  'algorithms': '⚡',
  'artificial-intelligence': '🤖',

  // Математика
  'mathematics': '📐',
  'algebra': '🔢',
  'geometry': '📏',
  'calculus': '📊',
  'statistics': '📈',

  // Естественные науки
  'physics': '⚛️',
  'chemistry': '🧪',
  'biology': '🧬',
  'astronomy': '🌌',
  'geography': '🌍',

  // Языки
  'english': '🇬🇧',
  'russian': '🇷🇺',
  'german': '🇩🇪',
  'french': '🇫🇷',
  'spanish': '🇪🇸',
  'chinese': '🇨🇳',

  // Гуманитарные науки
  'history': '📜',
  'literature': '📚',
  'philosophy': '🤔',
  'psychology': '🧠',
  'sociology': '👥',

  // Искусство
  'music': '🎵',
  'art': '🎨',
  'dance': '💃',
  'theater': '🎭',
  'cinema': '🎬',

  // Бизнес и экономика
  'economics': '💰',
  'business': '💼',
  'marketing': '📢',
  'management': '📋',
  'finance': '💳',

  // Другие
  'other': '📌',
  'general': '📝',
  'test': '📋',
  'quiz': '❓',
  'exam': '📝',
};

// Функция для получения иконки по ключу предмета
export const getSubjectIcon = (subjectKey: string): string => {
  return SUBJECT_ICONS[subjectKey.toLowerCase()] || '📚';
};

// Функция для получения всех доступных иконок
export const getAllSubjectIcons = (): string[] => {
  return Object.values(SUBJECT_ICONS);
}; 