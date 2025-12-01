class KeyAdvantagesGame {
    constructor() {
        this.currentRound = 0;
        this.score = 0;
        this.roundsOrder = [];
        this.userAnswers = [];
        this.isDragging = false;
        this.touchStartTime = 0;
        this.touchStartElement = null;
        this.longPressTimer = null;
        this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        // ОБНОВЛЕННЫЕ ДАННЫЕ С ОПИСАНИЕМ РАУНДОВ
        this.roundsData = [
            {
                description: "Укажите 3 главных преимущества Tecno Spark 40",
                correct: [0, 2, 4],
                options: [
                    "Тонкий и легкий корпус", "Стеклянный корпус", "Плавный экран120Гц / 144Гц",
                    "NFC", "Искусственный интеллект", "Водозащита"
                ]
            },
            {
                description: "Выберите 3 ключевых ключевых преимущества смартфонов Tecno Camon 40",
                correct: [1, 3, 4],
                options: [
                    "Поддержка 5G", "TECNO AI", "Техпроцесс 12 нм",
                    "Flashsnap", "КАМЕРА SONY 50 МП", "OLED-дисплей"
                ]
            },
            {
                description: "Основные преимущества Tecno Spark Slim",
                correct: [0, 1, 2],
                options: [
                    "Тонкий и лёгкий корпус", "Подсветка с настроением", "Экран 1.5К/144Гц",
                    "IP64", "Аккумулятор 5160мАч", "Основная камера 50 Мп"
                ]
            },
            {
                description: "Основные преимущества Tecno Megabook S14",
                correct: [3, 4, 5],
                options: [
                    "Алюминиевый корпус", "Поддержка Thunderbolt 4", "2.5K OLED Дисплей",
                    "2.8K OLED Дисплей", "Тонкий и лёгкий корпус", "Tecno AI"
                ]
            },
            {
                description: "Ключевые преимущества Tecno POVA 7",
                correct: [0, 3, 5],
                options: [
                    "Большая батарея", "Google Services", "Фирменный лаунчер",
                    "Надёжный сигнал", "Режим игрофикации", "Улучшенная навигация"
                ]
            },
            {
                description: "Ключевые преимущества Tecno Megabook T14 Air",
                correct: [1, 2, 4],
                options: [
                    "Частота 90 Гц", "Лёгкий и компактный", "Цельнометаллический корпус",
                    "Яркость 400 нит", "Быстрый интернет с Wi-Fi 6E", "HDR"
                ]
            },
            {
                description: "Ключевые преимущества Tecno MEGAPAD PRO",
                correct: [0, 4, 5],
                options: [
                    "2K IPS экран 12” 90 Гц", "2K OLED экран 12'' 120 Гц", "Bluetooth 5.2",
                    "Wi-Fi 5 ГГц", "LTE-связь", "TECNO AI"
                ]
            },
            {
                description: "Ключевые преимущества Tecno MEGAPAD 11",
                correct: [1, 3, 4],
                options: [
                    "Вес 200г", "Экран 11 дюймов с частотой 90 Гц", "Металлический корпус",
                    "Большой объём памяти 256 Гб + 8 Гб", "Емкий аккумулятор 8000 мАч", "Ёмкий аккумулятор 8800 мАч"
                ]
            },
            {
                description: "Ключевые преимущества монитора Tecno Megaview GT",
                correct: [2, 3, 5],
                options: [
                    "Стереодинамики", "ИК-порт", "Соотношение сторон 21:9",
                    "Частота кадров 180 Гц", "Частота кадров 144 Гц", "Изогнутый экран диагональю 34""
                ]
            },
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
        
        // ДОБАВЛЕНО: Обработчик для кнопки таблицы лидеров
        document.getElementById('leaders-btn').addEventListener('click', () => {
            this.showLeaders();
        });
        
        this.setupDragAndDrop();
    }

    setupDragAndDrop() {
        const optionsContainer = document.getElementById('options');
        const emptyCells = document.querySelectorAll('.empty-cell');

        // Десктоп: drag and drop
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
                
                this.placeOptionInCell(option, cell);
            });
        });

        // Мобильные устройства: touch события
        if (this.isMobile) {
            this.setupTouchEvents(optionsContainer, emptyCells);
        }

        // Двойной клик для возврата опции
        this.setupDoubleClickReturn();
    }

    setupTouchEvents(optionsContainer, emptyCells) {
        let touchStartElement = null;
        let touchStartTime = 0;
        let touchStartPos = { x: 0, y: 0 };
        const TOUCH_MOVE_THRESHOLD = 10;

        optionsContainer.addEventListener('touchstart', (e) => {
            const option = e.target.closest('.option');
            if (!option || option.classList.contains('used')) return;

            e.preventDefault();
            touchStartElement = option;
            touchStartTime = Date.now();
            touchStartPos = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };

            option.classList.add('touch-active');

            // Обработка долгого нажатия для возврата (если элемент уже в ячейке)
            if (option.parentElement.classList.contains('empty-cell')) {
                this.longPressTimer = setTimeout(() => {
                    this.returnOptionToPlace(option);
                }, 500);
            }
        });

        optionsContainer.addEventListener('touchmove', (e) => {
            if (!touchStartElement) return;
            
            clearTimeout(this.longPressTimer);

            const touch = e.touches[0];
            const deltaX = Math.abs(touch.clientX - touchStartPos.x);
            const deltaY = Math.abs(touch.clientY - touchStartPos.y);

            if (deltaX > TOUCH_MOVE_THRESHOLD || deltaY > TOUCH_MOVE_THRESHOLD) {
                touchStartElement.classList.remove('touch-active');
            }
        });

        optionsContainer.addEventListener('touchend', (e) => {
            clearTimeout(this.longPressTimer);

            if (!touchStartElement) return;

            const touch = e.changedTouches[0];
            const deltaX = Math.abs(touch.clientX - touchStartPos.x);
            const deltaY = Math.abs(touch.clientY - touchStartPos.y);
            const touchDuration = Date.now() - touchStartTime;

            touchStartElement.classList.remove('touch-active');

            // Быстрое касание для перетаскивания
            if (touchDuration < 300 && deltaX < TOUCH_MOVE_THRESHOLD && deltaY < TOUCH_MOVE_THRESHOLD) {
                if (touchStartElement.parentElement.classList.contains('options')) {
                    // Находим первую свободную ячейку
                    const emptyCell = this.findEmptyCell();
                    if (emptyCell) {
                        this.placeOptionInCell(touchStartElement, emptyCell);
                    }
                } else if (touchStartElement.parentElement.classList.contains('empty-cell')) {
                    // Двойное нажатие для возврата
                    if (this.lastTappedElement === touchStartElement && Date.now() - this.lastTapTime < 300) {
                        this.returnOptionToPlace(touchStartElement);
                    } else {
                        this.lastTappedElement = touchStartElement;
                        this.lastTapTime = Date.now();
                    }
                }
            }

            touchStartElement = null;
        });

        // Обработка пустых ячеек для touch
        emptyCells.forEach(cell => {
            cell.addEventListener('touchstart', (e) => {
                const option = cell.querySelector('.option');
                if (option) {
                    touchStartElement = option;
                    touchStartTime = Date.now();
                    touchStartPos = {
                        x: e.touches[0].clientX,
                        y: e.touches[0].clientY
                    };

                    // Обработка долгого нажатия для возврата
                    this.longPressTimer = setTimeout(() => {
                        this.returnOptionToPlace(option);
                    }, 500);
                }
            });

            cell.addEventListener('touchend', () => {
                clearTimeout(this.longPressTimer);
                touchStartElement = null;
            });
        });
    }

    setupDoubleClickReturn() {
        const emptyCells = document.getElementById('empty-cells');
        emptyCells.addEventListener('dblclick', (e) => {
            const option = e.target.closest('.option');
            if (option && option.parentElement.classList.contains('empty-cell')) {
                this.returnOptionToPlace(option);
            }
        });
    }

    placeOptionInCell(option, cell) {
        if (!option || !cell || cell.hasChildNodes() || option.classList.contains('used')) return;

        const optionClone = option.cloneNode(true);
        optionClone.classList.remove('dragging', 'touch-active');
        optionClone.draggable = false;
        optionClone.style.cursor = 'default';
        cell.appendChild(optionClone);
        cell.classList.add('filled');

        // Добавляем кнопку удаления
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.innerHTML = '×';
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.returnOptionToPlace(optionClone);
        });
        cell.appendChild(removeBtn);

        option.classList.add('used');
        option.draggable = false;

        // Показываем кнопку удаления при наведении на десктопе
        if (!this.isMobile) {
            cell.addEventListener('mouseenter', () => {
                removeBtn.style.display = 'block';
            });
            cell.addEventListener('mouseleave', () => {
                removeBtn.style.display = 'none';
            });
        }
    }

    returnOptionToPlace(option) {
        const cell = option.parentElement;
        if (!cell || !cell.classList.contains('empty-cell')) return;

        const optionIndex = option.getAttribute('data-option');
        const originalOption = document.querySelector(`.option[data-option="${optionIndex}"]`);
        
        if (originalOption) {
            originalOption.classList.remove('used');
            originalOption.classList.add('removing');
            originalOption.draggable = true;
            
            // Анимация возврата
            setTimeout(() => {
                originalOption.classList.remove('removing');
            }, 300);
        }

        // Удаляем кнопку удаления
        const removeBtn = cell.querySelector('.remove-btn');
        if (removeBtn) {
            removeBtn.remove();
        }

        option.remove();
        cell.classList.remove('filled');
    }

    findEmptyCell() {
        const emptyCells = document.querySelectorAll('.empty-cell:not(.filled)');
        return emptyCells[0] || null;
    }

    startRound(roundIndex) {
        this.currentRound = roundIndex;
        const actualRound = this.roundsOrder[roundIndex];
        const roundData = this.roundsData[actualRound];
        
        document.getElementById('current-round').textContent = roundIndex + 1;
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
        
        // Переустанавливаем обработчики для новых элементов
        this.reinitializeEventListeners();
    }

    clearEmptyCells() {
        const emptyCells = document.querySelectorAll('.empty-cell');
        emptyCells.forEach(cell => {
            cell.classList.remove('filled', 'hovered');
            cell.innerHTML = '';
        });

        // Сбрасываем все варианты
        const options = document.querySelectorAll('.option');
        options.forEach(option => {
            option.classList.remove('used', 'dragging', 'touch-active');
            option.draggable = true;
        });
    }

    reinitializeEventListeners() {
        // Переустанавливаем обработчики для новых элементов options
        const optionsContainer = document.getElementById('options');
        const emptyCells = document.querySelectorAll('.empty-cell');
        
        // Удаляем старые обработчики
        const newOptionsContainer = optionsContainer.cloneNode(true);
        optionsContainer.parentNode.replaceChild(newOptionsContainer, optionsContainer);
        
        // Устанавливаем обработчики заново
        this.setupDragAndDrop();
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
            if (!answer || answer.length === 0) return;
            
            const actualRound = this.roundsOrder[roundIndex];
            const correctAnswers = this.roundsData[actualRound].correct;
            
            const sortedAnswer = [...answer].sort();
            const sortedCorrect = [...correctAnswers].sort();
            
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
        try {
            const leaders = await this.getLeaders();
            this.displayLeaders(leaders);
            document.getElementById('leaders-modal').style.display = 'block';
            
            if (this.score < 10) {
                document.getElementById('restart-btn').style.display = 'inline-block';
            } else {
                document.getElementById('restart-btn').style.display = 'none';
            }
        } catch (error) {
            console.error('Ошибка загрузки таблицы лидеров:', error);
            this.displayLeaders([]);
            document.getElementById('leaders-modal').style.display = 'block';
            document.getElementById('restart-btn').style.display = 'inline-block';
        }
    }

    async getLeaders() {
        try {
            const response = await fetch('/api/leaders');
            return await response.json();
        } catch (error) {
            console.error('Ошибка получения лидеров:', error);
            return [];
        }
    }

    displayLeaders(leaders) {
        const leadersTable = document.getElementById('leaders-table');
        
        if (!leaders || leaders.length === 0) {
            leadersTable.innerHTML = '<p style="text-align: center; padding: 20px; color: #666;">Пока нет лидеров. Будьте первым!</p>';
            return;
        }
        
        leadersTable.innerHTML = '';
        
        leaders.forEach((leader, index) => {
            const row = document.createElement('div');
            row.className = `leader-row ${index < 5 ? 'top-5' : ''}`;
            
            const date = new Date(leader.date);
            const formattedDate = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
            
            row.innerHTML = `
                <div>
                    <strong>${index + 1}. ${leader.username}</strong>
                </div>
                <div>
                    <span>${formattedDate}</span>
                </div>
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

// Инициализация игры
document.addEventListener('DOMContentLoaded', () => {
    // Предотвращаем стандартное поведение касания
    document.addEventListener('touchstart', (e) => {
        if (e.target.classList.contains('option') || e.target.classList.contains('empty-cell')) {
            e.preventDefault();
        }
    }, { passive: false });

    // Убираем выделение при касании
    document.addEventListener('touchmove', (e) => {
        if (e.target.classList.contains('option')) {
            e.preventDefault();
        }
    }, { passive: false });

    // Инициализируем игру
    new KeyAdvantagesGame();
});
