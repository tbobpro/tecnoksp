const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Настройка CORS для Telegram
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  const allowedOrigins = [
    'https://telegram.org',
    'https://web.telegram.org',
    'https://web.telegram.org/k/',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://91.201.40.70',
    'https://91.201.40.70',
    'https://tecnoksp.ru',
    'http://tecnoksp.ru'
  ];
  
  if (!origin || allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Парсинг JSON
app.use(express.json({ limit: '1mb' }));

// Статические файлы
app.use(express.static(__dirname));

// Путь к файлу с результатами
const RESULTS_FILE = path.join(__dirname, 'results.json');

// Инициализация файла результатов
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
    console.error('Ошибка чтения файла результатов:', error);
    initializeResultsFile();
  }
  return [];
}

// Сохранение результатов
function writeResults(results) {
  try {
    // Сортируем по дате (раньше = лучше)
    results.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Оставляем топ-10
    const topResults = results.slice(0, 10);
    
    fs.writeFileSync(RESULTS_FILE, JSON.stringify(topResults, null, 2), 'utf8');
    console.log(`Результаты сохранены. Всего записей: ${topResults.length}`);
    return true;
  } catch (error) {
    console.error('Ошибка сохранения результатов:', error);
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
         data.score === 10 &&
         !isNaN(Date.parse(data.date));
}

// API для сохранения результата
app.post('/api/save-result', (req, res) => {
  try {
    const { userId, username, score, photoUrl } = req.body; // Добавлен photoUrl
    
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
      timestamp: Date.now(),
      photoUrl: photoUrl || null // Сохраняем URL фото из Telegram
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
      console.log(`Обновление результата пользователя ${newResult.username}`);
      results.splice(userIndex, 1);
    } else {
      console.log(`Добавление нового пользователя ${newResult.username}`);
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
    console.error('Ошибка при сохранении результата:', error);
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
      userId: result.userId,
      date: new Date(result.date).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      originalDate: result.date,
      photoUrl: result.photoUrl,
      canBeLinked: result.username && 
                   result.username !== 'Аноним' && 
                   result.username !== 'Анонимный игрок' &&
                   !result.username.includes(' ') &&
                   result.username.length > 3
    }));
    
    res.json(formattedResults);
  } catch (error) {
    console.error('Ошибка при получении лидеров:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Ошибка загрузки таблицы лидеров',
      leaders: []
    });
  }
});

// API для проверки здоровья сервера
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Главная страница
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Страница таблицы лидеров
app.get('/leaders', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Обработчик ошибок
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Страница не найдена'
  });
});

// Инициализация файла результатов
initializeResultsFile();

// Запуск сервера
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✅ Сервер запущен!`);
  console.log(`📍 Порт: ${PORT}`);
  console.log(`🌐 Адрес: http://91.201.40.70:${PORT}`);
});
