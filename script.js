class KeyAdvantagesGame {
    constructor() {
        this.currentRound = 0;
        this.score = 0;
        this.roundsOrder = [];
        this.userAnswers = [];
        this.isDragging = false;
        
        // ОБНОВЛЕННЫЕ ДАННЫЕ С ОПИСАНИЕМ РАУНДОВ
        this.roundsData = [
            // Раунд 1
            {
                description: "Укажите 3 главных преимущества Tecno Spark 40",
                correct: [0, 2, 4],
                options: [
                    "Тонкий и легкий корпус", "Стеклянный корпус", "Плавный экран120Гц / 144Гц",
                    "NFC", "Искусственный интеллект", "Водозащита"
                ]
            },
            // Раунд 2
            {
                description: "Выберите 3 ключевых ключевых преимущества смартфонов Tecno Camon 40",
                correct: [1, 3, 4],
                options: [
                    "Поддержка 5G", "TECNO AI", "Техпроцесс 12 нм",
                    "Flashsnap", "КАМЕРА SONY 50 МП", "OLED-дисплей"
                ]
            },
            // Раунд 3
            {
                description: "Основные преимущества Tecno Spark Slim",
                correct: [0, 1, 2],
                options: [
                    "Тонкий и лёгкий корпус", "Подсветка с настроением", "Экран 1.5К/144Гц",
                    "IP64", "Аккумулятор 5160мАч", "Основная камера 50 Мп"
                ]
            },
            // Раунд 4
            {
                description: "Основные преимущества Tecno Megabook S14",
                correct: [3, 4, 5],
                options: [
                    "Алюминиевый корпус", "Поддержка Thunderbolt 4", "2.5K OLED Дисплей",
                    "2.8K OLED Дисплей", "Тонкий и лёгкий корпус", "Tecno AI"
                ]
            },
            // Раунд 5
            {
                description: "Ключевые преимущества Tecno POVA 7",
                correct: [0, 3, 5],
                options: [
                    "Большая батарея", "Google Services", "Фирменный лаунчер",
                    "Надёжный сигнал", "Режим игрофикации", "Улучшенная навигация"
                ]
            },
            // Раунд 6
            {
                description: "Ключевые преимущества Tecno Megabook T14 Air",
                correct: [1, 2, 4],
                options: [
                    "Частота 90 Гц", "Лёгкий и компактный", "Цельнометаллический корпус",
                    "Яркость 400 нит", "Быстрый интернет с Wi-Fi 6E", "HDR"
                ]
            },
            // Раунд 7
            {
                description: "Ключевые преимущества Tecno MEGAPAD PRO",
                correct: [0, 4, 5],
                options: [
                    "2K IPS экран 12” 90 Гц", "2K OLED экран 12'' 120 Гц", "Bluetooth 5.2",
                    "Wi-Fi 5 ГГц", "LTE-связь", "TECNO AI"
                ]
            },
            // Раунд 8
            {
                description: "Ключевые преимущества Tecno MEGAPAD 11",
                correct: [1, 3, 4],
                options: [
                    "Вес 200г", "Экран 11 дюймов с частотой 90 Гц", "Металлический корпус",
                    "Большой объём памяти 256 Гб + 8 Гб", "Емкий аккумулятор 8000 мАч", "Ёмкий аккумулятор 8800 мАч"
                ]
            },
            // Раунд 9
            {
                description: "Ключевые преимущества монитора Tecno Megaview GT",
                correct: [2, 3, 5],
                options: [
                    "Стереодинамики", "ИК-порт", "Соотношение сторон 21:9",
                    "Частота кадров 180 Гц", "Частота кадров 144 Гц", "Изогнутый экран диагональю 34”"
                ]
            },
            // Раунд 10
            {
                description: "Ключевые преимущества Tecno Camon 30S",
                correct: [0, 1, 5],
                options: [
                    "Камера Sony 50 Мп", "Изогнутый AMOLED экран", "Игровой режим",
                    "Автояркость", "Высокая автономность", "Защита глаз"
                ]
            }
        ];

        this.init();
    }

    init() {
        this.initializeTelegram();
        this.generateRoundsOrder();
        this.setupEventListeners();
        this.startRound(0);
    }

    initializeTelegram() {
        try {
            this.tg = window.Telegram.WebApp;
            this.tg.expand();
            this.tg.enableClosingConfirmation();
            this.user = this.tg.initDataUnsafe?.user;
            console.log('Telegram Web App инициализирован');
        } catch (error) {
            console.log('Telegram Web App не доступен, работаем в браузере');
            this.tg = null;
            this.user = { id: 'test', username: 'Тестовый пользователь' };
        }
    }

    generateRoundsOrder() {
        this.roundsOrder = [...Array(10).keys()].sort(() => Math.random() - 0.5);
        console.log('Порядок раундов:', this.roundsOrder);
    }

    setupEventListeners() {
        document.getElementById('next-btn').addEventListener('click', () => this.nextRound());
        document.getElementById('ok-btn').addEventListener('click', () => this.showLeaders());
        document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());
        document.getElementById('close-btn').addEventListener('click', () => {
            if (this.tg) {
                this.tg.close();
            } else {
                alert('Игра завершена!');
            }
        });
        
        this.setupDragAndDrop();
    }

    setupDragAndDrop() {
        const optionsContainer = document.getElementById('options');
        const emptyCells = document.querySelectorAll('.empty-cell');

        optionsContainer.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('option') && !e.target.classList.contains('used')) {
                e.target.classList.add('dragging');
                this.isDragging = true;
                e.dataTransfer.setData('text/plain', e.target.getAttribute('data-option'));
            }
        });

        optionsContainer.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('option')) {
                e.target.classList.remove('dragging');
                this.isDragging = false;
            }
        });

        emptyCells.forEach(cell => {
            cell.addEventListener('dragover', (e) => {
                e.preventDefault();
                cell.classList.add('hovered');
            });

            cell.addEventListener('dragleave', () => {
                cell.classList.remove('hovered');
            });

            cell.addEventListener('drop', (e) => {
                e.preventDefault();
                cell.classList.remove('hovered');
                
                const optionIndex = e.dataTransfer.getData('text/plain');
                const option = document.querySelector(`.option[data-option="${optionIndex}"]`);
                
                if (option && !cell.hasChildNodes() && !option.classList.contains('used')) {
                    const optionClone = option.cloneNode(true);
                    optionClone.classList.remove('dragging');
                    optionClone.draggable = false;
                    optionClone.style.cursor = 'default';
                    cell.appendChild(optionClone);
                    cell.classList.add('filled');
                    
                    option.classList.add('used');
                    option.draggable = false;
                }
            });
        });
    }

    startRound(roundIndex) {
        this.currentRound = roundIndex;
        const actualRound = this.roundsOrder[roundIndex];
        const roundData = this.roundsData[actualRound];
        
        document.getElementById('current-round').textContent = roundIndex + 1;
        
        // ОБНОВЛЕНИЕ: Добавляем отображение описания раунда
        document.getElementById('round-description').textContent = roundData.description;
        
        this.updateOptions(roundData.options);
        this.clearEmptyCells();
        
        const nextBtn = document.getElementById('next-btn');
        if (roundIndex === 9) {
            nextBtn.textContent = 'Завершить';
        } else {
            nextBtn.textContent = 'Следующий раунд';
        }
    }

    updateOptions(options) {
        const optionsContainer = document.getElementById('options');
        optionsContainer.innerHTML = '';
        
        options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            optionElement.draggable = true;
            optionElement.textContent = option;
            optionElement.setAttribute('data-option', index);
            optionsContainer.appendChild(optionElement);
        });
    }

    clearEmptyCells() {
        const emptyCells = document.querySelectorAll('.empty-cell');
        emptyCells.forEach(cell => {
            cell.classList.remove('filled');
            cell.innerHTML = '';
        });

        // Сбрасываем все варианты
        const options = document.querySelectorAll('.option');
        options.forEach(option => {
            option.classList.remove('used');
            option.draggable = true;
        });
    }

    nextRound() {
        this.saveRoundAnswers();
        
        if (this.currentRound === 9) {
            this.finishGame();
        } else {
            this.startRound(this.currentRound + 1);
        }
    }

    saveRoundAnswers() {
        const emptyCells = document.querySelectorAll('.empty-cell');
        const currentAnswers = [];
        
        emptyCells.forEach(cell => {
            const option = cell.querySelector('.option');
            if (option) {
                currentAnswers.push(parseInt(option.getAttribute('data-option')));
            }
        });
        
        this.userAnswers[this.currentRound] = currentAnswers;
        console.log(`Ответы раунда ${this.currentRound}:`, currentAnswers);
    }

    calculateScore() {
        let score = 0;
        
        this.userAnswers.forEach((answer, roundIndex) => {
            if (!answer) return;
            
            const actualRound = this.roundsOrder[roundIndex];
            const correctAnswers = this.roundsData[actualRound].correct;
            
            // Сортируем для сравнения
            const sortedAnswer = [...answer].sort();
            const sortedCorrect = [...correctAnswers].sort();
            
            // Проверяем совпадение массивов
            if (sortedAnswer.length === sortedCorrect.length && 
                sortedAnswer.every((val, idx) => val === sortedCorrect[idx])) {
                score++;
            }
        });
        
        return score;
    }

    async finishGame() {
        this.score = this.calculateScore();
        
        document.getElementById('results-text').textContent = 
            `Правильно отвечено: ${this.score} из 10`;
        document.getElementById('results-modal').style.display = 'block';
        
        // Сохраняем результат на сервер
        await this.saveResult();
    }

    async saveResult() {
        try {
            const response = await fetch('/api/save-result', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: this.user?.id || 'anonymous',
                    username: this.user?.username || 'Анонимный игрок',
                    score: this.score,
                    date: new Date().toISOString()
                })
            });
            
            const result = await response.json();
            console.log('Результат сохранен:', result);
        } catch (error) {
            console.error('Ошибка сохранения результата:', error);
        }
    }

    async showLeaders() {
        document.getElementById('results-modal').style.display = 'none';
        
        try {
            const leaders = await this.getLeaders();
            this.displayLeaders(leaders);
            document.getElementById('leaders-modal').style.display = 'block';
            
            // Показываем кнопку "Пройти заново" если не все ответы правильные
            if (this.score < 10) {
                document.getElementById('restart-btn').style.display = 'inline-block';
            } else {
                document.getElementById('restart-btn').style.display = 'none';
            }
        } catch (error) {
            console.error('Ошибка загрузки таблицы лидеров:', error);
            // Показываем пустую таблицу при ошибке
            this.displayLeaders([]);
            document.getElementById('leaders-modal').style.display = 'block';
            document.getElementById('restart-btn').style.display = 'inline-block';
        }
    }

    async getLeaders() {
        const response = await fetch('/api/leaders');
        return await response.json();
    }

    displayLeaders(leaders) {
        const leadersTable = document.getElementById('leaders-table');
        
        if (leaders.length === 0) {
            leadersTable.innerHTML = '<p>Пока нет лидеров. Будьте первым!</p>';
            return;
        }
        
        leadersTable.innerHTML = '';
        
        leaders.forEach((leader, index) => {
            const row = document.createElement('div');
            row.className = `leader-row ${index < 5 ? 'top-5' : ''}`;
            
            const date = new Date(leader.date);
            const formattedDate = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
            
            row.innerHTML = `
                <span>${index + 1}. ${leader.username}</span>
                <span>${formattedDate}</span>
            `;
            
            leadersTable.appendChild(row);
        });
    }

    restartGame() {
        this.currentRound = 0;
        this.score = 0;
        this.userAnswers = [];
        this.generateRoundsOrder();
        
        document.getElementById('leaders-modal').style.display = 'none';
        document.getElementById('restart-btn').style.display = 'none';
        
        this.startRound(0);
    }
}

// Инициализация игры когда DOM загружен
document.addEventListener('DOMContentLoaded', () => {
    new KeyAdvantagesGame();
});
