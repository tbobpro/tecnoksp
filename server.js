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
           data.score === 10 &&
           !isNaN(Date.parse(data.date));
    // photoUrl может быть null или строкой, поэтому не проверяем строго
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
            photoUrl: photoUrl || null, // Сохраняем URL аватарки
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
            photoUrl: result.photoUrl, // Добавляем photoUrl
            date: new Date(result.date).toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }),
            originalDate: result.date,
            // Добавляем признак, можно ли сделать ссылку
            canBeLinked: result.username && 
                       result.username !== 'Аноним' && 
                       result.username !== 'Анонимный игрок' &&
                       !result.username.includes(' ') &&
                       result.username.length > 3
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
      firstPlayer: results.length > 0 ? results[0] : null,
      lastUpdated: new Date().toISOString()
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
    memory: process.memoryUsage(),
    nodeVersion: process.version
  });
});

// API для очистки таблицы лидеров (только для админа в разработке)
app.delete('/api/clear-leaders', (req, res) => {
  try {
    // Проверяем секретный ключ (в продакшене нужно использовать нормальную аутентификацию)
    const { secret } = req.query;
    if (secret !== 'admin123') {
      return res.status(403).json({ 
        success: false, 
        error: 'Доступ запрещен' 
      });
    }
    
    fs.writeFileSync(RESULTS_FILE, JSON.stringify([], null, 2), 'utf8');
    console.log('🗑️ Таблица лидеров очищена администратором');
    
    res.json({ 
      success: true, 
      message: 'Таблица лидеров очищена' 
    });
  } catch (error) {
    console.error('❌ Ошибка при очистке таблицы лидеров:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Ошибка очистки таблицы лидеров'
    });
  }
});

// Главная страница
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Страница таблицы лидеров (альтернативный вид)
app.get('/leaders', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Таблица лидеров - Ключевые преимущества</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body {
          font-family: Arial, sans-serif;
          background: linear-gradient(135deg, #4583ed 0%, #b8c7e0 100%);
          min-height: 100vh;
          padding: 20px;
          text-align: center;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border-radius: 15px;
          padding: 30px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        h1 {
          color: #333;
          margin-bottom: 30px;
        }
        .leaderboard {
          text-align: left;
          margin: 20px 0;
        }
        .leader-row {
          padding: 12px 15px;
          border-bottom: 1px solid #eee;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .leader-row.top-3 {
          background: #fff3cd;
          font-weight: bold;
        }
        .leader-position {
          font-size: 18px;
        }
        .leader-date {
          color: #666;
          font-size: 14px;
        }
        a {
          color: #667eea;
          text-decoration: none;
        }
        a:hover {
          text-decoration: underline;
        }
        .back-btn {
          display: inline-block;
          margin-top: 20px;
          padding: 10px 20px;
          background: #667eea;
          color: white;
          border-radius: 5px;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🏆 Таблица лидеров</h1>
        <div id="leaders-table"></div>
        <a href="/" class="back-btn">Вернуться к игре</a>
      </div>
      <script>
        fetch('/api/leaders')
          .then(response => response.json())
          .then(leaders => {
            const leadersTable = document.getElementById('leaders-table');
            if (leaders.length === 0) {
              leadersTable.innerHTML = '<p>Пока нет лидеров. Будьте первым!</p>';
              return;
            }
            
            leaders.forEach((leader, index) => {
              const row = document.createElement('div');
              row.className = \`leader-row \${index < 3 ? 'top-3' : ''}\`;
              
              let medal = '';
              if (index === 0) medal = '🥇';
              else if (index === 1) medal = '🥈';
              else if (index === 2) medal = '🥉';
              
              let usernameElement = leader.username;
              if (leader.canBeLinked) {
                const cleanUsername = leader.username.startsWith('@') 
                  ? leader.username.substring(1) 
                  : leader.username;
                usernameElement = \`<a href="https://t.me/\${cleanUsername}" target="_blank">\${leader.username}</a>\`;
              }
              
              row.innerHTML = \`
                <span class="leader-position">\${medal} \${index + 1}. \${usernameElement}</span>
                <span class="leader-date">\${leader.date}</span>
              \`;
              leadersTable.appendChild(row);
            });
          })
          .catch(error => {
            console.error('Ошибка:', error);
            document.getElementById('leaders-table').innerHTML = 
              '<p>Ошибка загрузки таблицы лидеров</p>';
          });
      </script>
    </body>
    </html>
  `);
});

// Страница 404 для неизвестных маршрутов
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Страница не найдена',
    availableEndpoints: [
      'GET /',
      'GET /leaders',
      'POST /api/save-result',
      'GET /api/leaders',
      'GET /api/stats',
      'GET /api/health'
    ]
  });
});

// Обработчик ошибок
app.use((err, req, res, next) => {
  console.error('❌ Необработанная ошибка:', err);
  res.status(500).json({
    success: false,
    error: 'Внутренняя ошибка сервера',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
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
  console.log(`🏆 Страница лидеров: http://91.201.40.70:${PORT}/leaders`);
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
