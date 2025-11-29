const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('.'));

// Файл для хранения результатов
const RESULTS_FILE = 'results.json';

// Функция для чтения результатов
function readResults() {
    try {
        if (fs.existsSync(RESULTS_FILE)) {
            const data = fs.readFileSync(RESULTS_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Ошибка чтения результатов:', error);
    }
    return [];
}

// Функция для записи результатов
function writeResults(results) {
    try {
        fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
        return true;
    } catch (error) {
        console.error('Ошибка записи результатов:', error);
        return false;
    }
}

// Сохранение результата
app.post('/api/save-result', (req, res) => {
    const { userId, username, score, date } = req.body;
    
    console.log('Сохранение результата:', { userId, username, score });
    
    const results = readResults();
    
    // Добавляем новый результат только если все ответы правильные
    if (score === 10) {
        const newResult = {
            userId,
            username: username || 'Аноним',
            score,
            date: date || new Date().toISOString()
        };
        
        // Проверяем, нет ли уже такого пользователя
        const existingIndex = results.findIndex(r => r.userId === userId);
        if (existingIndex !== -1) {
            results[existingIndex] = newResult;
        } else {
            results.push(newResult);
        }
        
        // Сортируем по дате (самые ранние первыми) и оставляем только 10
        results.sort((a, b) => new Date(a.date) - new Date(b.date));
        const topResults = results.slice(0, 10);
        
        if (writeResults(topResults)) {
            res.json({ success: true, message: 'Результат сохранен' });
        } else {
            res.json({ success: false, message: 'Ошибка сохранения' });
        }
    } else {
        res.json({ success: true, message: 'Результат не сохранен (не все ответы правильные)' });
    }
});

// Получение таблицы лидеров
app.get('/api/leaders', (req, res) => {
    const results = readResults();
    console.log('Запрос таблицы лидеров, найдено:', results.length);
    res.json(results);
});

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`📱 Откройте в браузере: http://localhost:${PORT}`);
});