const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Базовые настройки безопасности
app.set('trust proxy', 1);

// Простой CORS для Telegram
app.use((req, res, next) => {
  // Разрешаем доступ с Telegram
  const allowedOrigins = [
    'https://telegram.org',
    'https://web.telegram.org',
    'https://91.201.40.70', // ваш IP (если будет HTTPS)
    'http://91.201.40.70'   // ваш IP (для тестирования)
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Парсинг JSON
app.use(express.json());

// Статические файлы
app.use(express.static(__dirname));

// Путь к файлу с результатами
const RESULTS_FILE = path.join(__dirname, 'results.json');

// Чтение результатов
function readResults() {
  try {
    if (fs.existsSync(RESULTS_FILE)) {
      return JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf8'));
    }
  } catch (error) {
    console.error('Ошибка чтения:', error);
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
    
    fs.writeFileSync(RESULTS_FILE, JSON.stringify(topResults, null, 2));
    return true;
  } catch (error) {
    console.error('Ошибка сохранения:', error);
    return false;
  }
}

// API для сохранения результата
app.post('/api/save-result', (req, res) => {
  const { userId, username, score } = req.body;
  
  const results = readResults();
  
  if (score === 10) {
    const newResult = {
      userId: String(userId),
      username: username || 'Аноним',
      score: 10,
      date: new Date().toISOString()
    };
    
    // Удаляем старый результат этого пользователя, если есть
    const filtered = results.filter(r => r.userId !== String(userId));
    filtered.push(newResult);
    
    writeResults(filtered);
  }
  
  res.json({ success: true });
});

// API для получения лидеров
app.get('/api/leaders', (req, res) => {
  const results = readResults();
  res.json(results);
});

// Главная страница
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Запуск сервера
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Сервер запущен на порту ${PORT}`);
  console.log(`🌐 Доступен по адресу: http://91.201.40.70:${PORT}`);
});
