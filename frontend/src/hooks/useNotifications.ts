import { useState, useEffect } from 'react';

// Типы уведомлений в системе
export type NotificationType = 'user' | 'quiz' | 'result' | 'system';

// Интерфейс уведомления
export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
  date: string;
  isRead: boolean;
}

// Хук для работы с уведомлениями
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка уведомлений
  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        // В реальном приложении здесь был бы API-запрос
        // Пока используем моковые данные
        const mockNotifications: Notification[] = [
          {
            id: 1,
            type: 'user',
            message: 'Новый пользователь зарегистрировался: Иван Иванов',
            date: '1 час назад',
            isRead: false
          },
          {
            id: 2,
            type: 'quiz',
            message: 'Опубликован новый тест: Основы математики',
            date: '3 часа назад',
            isRead: false
          },
          {
            id: 3,
            type: 'result',
            message: 'Новый результат теста: Петр Петров завершил тест по физике',
            date: '5 часов назад',
            isRead: false
          },
          {
            id: 4,
            type: 'system',
            message: 'Обновление системы завершено успешно',
            date: '1 день назад',
            isRead: true
          },
          {
            id: 5,
            type: 'quiz',
            message: 'Тест "Введение в биологию" был изменен',
            date: '2 дня назад',
            isRead: true
          },
        ];

        setNotifications(mockNotifications);

        // Подсчет непрочитанных уведомлений
        const unread = mockNotifications.filter(n => !n.isRead).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();

    // В реальном приложении здесь можно настроить WebSocket для получения 
    // уведомлений в реальном времени
  }, []);

  // Функция для пометки уведомления как прочитанного
  const markAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );

    // Обновляем счетчик непрочитанных
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Функция для пометки всех уведомлений как прочитанных
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );

    // Сбрасываем счетчик непрочитанных
    setUnreadCount(0);
  };

  // Функция для удаления уведомления
  const removeNotification = (id: number) => {
    const notification = notifications.find(n => n.id === id);

    setNotifications(prev => prev.filter(n => n.id !== id));

    // Если удаляем непрочитанное уведомление, уменьшаем счетчик
    if (notification && !notification.isRead) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  // Функция для фильтрации уведомлений по типу
  const filterByType = (type?: NotificationType) => {
    if (!type) return notifications;
    return notifications.filter(notification => notification.type === type);
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    removeNotification,
    filterByType
  };
}; 