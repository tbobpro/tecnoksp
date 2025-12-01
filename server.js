const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Базовые настройки безопасности
app.set('trust proxy', 1);

// Простой CORS для Telegram и локального тестирования
app.use((req, res, next) => {
  // Разрешаем доступ с Telegram и локальных адресов
  const allowedOrigins = [
    'https://telegram.org',
    'https://web.telegram.org',
    'https://web.telegram.org/k/',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://91.201.40.70',
    'https://91.201.40.70'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  // Разрешаем необходимые методы и заголовки
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Обработка предварительных запросов OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Базовые заголовки безопасности
app.use((req, res, next) => {
  // Защита от MIME-sniffing
  res.header('X-Content-Type-Options', 'nosniff');
  // Запрет фреймов
  res.header('X-Frame-Options', 'DENY');
  // Защита от XSS
  res.header('X-XSS-Protection', '1; mode=block');
  next();
});

// Парсинг JSON
app.use(express.json({ limit: '1mb' }));

// Парсинг URL-encoded данных
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Статические файлы
app.use(express.static(__dirname, {
  setHeaders: (res, path) => {
    // Кэширование статических файлов на 1 день
    if (path.endsWith('.css') || path.endsWith('.js') || path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
  }
}));

// Путь к файлу с результатами
const RESULTS_FILE = path.join(__dirname, 'results.json');

// Инициализация файла результатов, если его нет
function initializeResultsFile() {
  if (!fs.existsSync(RESULTS_FILE)) {
    fs.writeFileSync(RESULTS_FILE, JSON.stringify([], null, 2), 'utf8');
    console.log('Файл результатов создан');
  }
}

// Чтение результатов
function readResults() {
  try {
    if (fs.existsSync(RESULTS_FILE)) {
      const data = fs.readFileSync(RESULTS_FILE, 'utf8');
      if (data.trim() === '') {
        return [];
      }
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('❌ Ошибка чтения файла результатов:', error);
    // Создаем новый файл при ошибке чтения
    initializeResultsFile();
  }
  return [];
}

// Сохранение результатов
function writeResults(results) {
  try {
    // Сортируем по дате (раньше = лучше - для таблицы лидеров по скорости)
    results.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Оставляем топ-10 самых быстрых игроков
    const topResults = results.slice(0, 10);
    
    fs.writeFileSync(RESULTS_FILE, JSON.stringify(topResults, null, 2), 'utf8');
    console.log(`✅ Результаты сохранены. Всего записей: ${topResults.length}`);
    return true;
  } catch (error) {
    console.error('❌ Ошибка сохранения результатов:', error);
    return false;
  }
}

// Проверка валидности данных результата
function isValidResult(data) {
  return data && 
         typeof data.userId === 'string' && 
         data.userId.trim() !== '' &&
         typeof data.username === 'string' &&
         data.username.trim() !== '' &&
         data.score === 10 && // Сохраняем только тех, кто набрал 10 очков (все раунды идеально)
         !isNaN(Date.parse(data.date));
}

// Middleware для логирования запросов
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// API для сохранения результата
app.post('/api/save-result', (req, res) => {
  try {
    const { userId, username, score } = req.body;
    
    // Валидация данных
    if (!userId || !username || score !== 10) {
      return res.status(400).json({ 
        success: false, 
        error: 'Некорректные данные. Сохраняются только результаты с 10 очками.' 
      });
    }
    
    const results = readResults();
    
    // Создаем новый результат
    const newResult = {
      userId: String(userId).trim(),
      username: String(username).trim(),
      score: 10,
      date: new Date().toISOString(),
      timestamp: Date.now()
    };
    
    // Проверяем валидность
    if (!isValidResult(newResult)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Некорректные данные результата' 
      });
    }
    
    // Удаляем старый результат этого пользователя, если есть
    const userIndex = results.findIndex(r => r.userId === newResult.userId);
    if (userIndex !== -1) {
      console.log(`🔄 Обновление результата пользователя ${newResult.username}`);
      results.splice(userIndex, 1);
    } else {
      console.log(`➕ Добавление нового пользователя ${newResult.username}`);
    }
    
    // Добавляем новый результат
    results.push(newResult);
    
    // Сохраняем и сортируем
    const success = writeResults(results);
    
    if (success) {
      res.json({ 
        success: true, 
        message: 'Результат сохранен в таблице лидеров!',
        position: results.findIndex(r => r.userId === newResult.userId) + 1
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: 'Ошибка сохранения результатов' 
      });
    }
  } catch (error) {
    console.error('❌ Ошибка при сохранении результата:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Внутренняя ошибка сервера' 
    });
  }
});

// API для получения лидеров
app.get('/api/leaders', (req, res) => {
  try {
    const results = readResults();
    
    // Форматируем даты для отображения
    const formattedResults = results.map((result, index) => ({
      position: index + 1,
      username: result.username,
      date: new Date(result.date).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      originalDate: result.date
    }));
    
    res.json(formattedResults);
  } catch (error) {
    console.error('❌ Ошибка при получении лидеров:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Ошибка загрузки таблицы лидеров',
      leaders: []
    });
  }
});

// API для получения статистики
app.get('/api/stats', (req, res) => {
  try {
    const results = readResults();
    const stats = {
      totalPlayers: results.length,
      latestPlayer: results.length > 0 ? results[results.length - 1] : null,
      firstPlayer: results.length > 0 ? results[0] : null
    };
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('❌ Ошибка при получении статистики:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Ошибка загрузки статистики'
    });
  }
});

// API для проверки здоровья сервера
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Главная страница
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Страница 404 для неизвестных маршрутов
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Страница не найдена'
  });
});

// Обработчик ошибок
app.use((err, req, res, next) => {
  console.error('❌ Необработанная ошибка:', err);
  res.status(500).json({
    success: false,
    error: 'Внутренняя ошибка сервера'
  });
});

// Инициализация файла результатов перед запуском
initializeResultsFile();

// Запуск сервера
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✅ Сервер запущен!`);
  console.log(`📍 Порт: ${PORT}`);
  console.log(`🌐 Локальный адрес: http://localhost:${PORT}`);
  console.log(`🌐 Внешний адрес: http://91.201.40.70:${PORT}`);
  console.log(`📊 API лидеров: http://91.201.40.70:${PORT}/api/leaders`);
  console.log(`🩺 Проверка здоровья: http://91.201.40.70:${PORT}/api/health\n`);
});

// Обработка graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Получен сигнал SIGINT. Завершение работы...');
  server.close(() => {
    console.log('✅ Сервер остановлен');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Получен сигнал SIGTERM. Завершение работы...');
  server.close(() => {
    console.log('✅ Сервер остановлен');
    process.exit(0);
  });
});

// Обработка необработанных исключений
process.on('uncaughtException', (error) => {
  console.error('❌ Необработанное исключение:', error);
  // Даем время на логирование, затем завершаем процесс
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Необработанный промис:', reason);
});
