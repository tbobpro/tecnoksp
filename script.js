class KeyAdvantagesGame {
    constructor() {
        this.currentRound = 0;
        this.score = 0;
        this.totalScore = 0;
        this.perfectRounds = 0;
        this.roundsOrder = [];
        this.userAnswers = [];
        this.isDragging = false;
        this.isMobile = this.checkMobile();
        this.showLeadersFromGame = false;
        this.originalOptionsMap = new Map();
        
        // Мотивационные фразы
        this.motivationPhrases = {
            // 3 фразы для 1-10 очков
            lowScore: [
                "Ты только начинаешь! Попробуй ещё раз! 💫",
                "Хороший старт! Продолжай тренироваться! ✨",
                "Уже что-то получается! Не сдавайся! 💪"
            ],
            // 5 фраз для 11-30 очков (включая "Ты превзошёл все ожидания!")
            highScore: [
                "Отличный результат! Ты знаешь продукцию TECNO! 👍",
                "Великолепно! Твой энтузиазм впечатляет! 🔥",
                "Ты превзошёл все ожидания! 🎯",
                "Потрясающе! Ты настоящий фанат TECNO! 🚀",
                "Браво! Такие знания достойны уважения! 👏"
            ],
            // Для идеального результата (30 очков)
            perfectScore: "🔥 Ты превзошёл все ожидания! Абсолютный чемпион TECNO! 🏆"
        };
        
        this.roundsData = [
            {
                description: "Укажите 3 главных преимущества Tecno Spark 40",
                correct: [0, 2, 4],
                options: [
                    "Тонкий и легкий корпус", "Стеклянный корпус", "Плавный экран 120Гц / 144Гц",
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
                    "2K IPS экран 12 дюймов 90 Гц", 
                    "2K OLED экран 12 дюймов 120 Гц", 
                    "Bluetooth 5.2",
                    "Wi-Fi 5 ГГц", 
                    "LTE-связь", 
                    "TECNO AI"
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
                    "Частота кадров 180 Гц", "Частота кадров 144 Гц", "Изогнутый экран диагональю 34 дюйма"
                ]
            },
            {
                description: "Ключевые преимущества Tecno MEGA MINI GAMING G1",
                correct: [0, 1, 5],
                options: [
                    "Мощный процессор Intel 13 поколения", 
                    "Видеокарта NVIDIA GeForce RTX 4060 8Гб", 
                    "Игровой режим",
                    "Видеокарта NVIDIA GeForce RTX 4060 4Гб", 
                    "Тонкий и лёгкий корпус", 
                    "Компактный корпус с RGB-подсветкой"
                ]
            }
        ];

        this.init();
    }

    checkMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               window.innerWidth <= 768;
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
        } catch (error) {
            this.tg = null;
            this.user = { id: 'test', username: 'Тестовый пользователь' };
        }
    }

    generateRoundsOrder() {
        this.roundsOrder = [...Array(10).keys()].sort(() => Math.random() - 0.5);
    }

    setupEventListeners() {
        document.getElementById('next-btn').addEventListener('click', () => this.nextRound());
        document.getElementById('ok-btn').addEventListener('click', () => {
            this.showLeadersFromGame = true;
            this.showLeaders();
        });
        document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());
        document.getElementById('close-btn').addEventListener('click', () => this.handleCloseButton());
        document.getElementById('leaders-btn').addEventListener('click', () => {
            this.showLeadersFromGame = false;
            this.showLeaders();
        });
        document.getElementById('restart-from-results').addEventListener('click', () => this.restartGame());
        
        this.setupDragAndDrop();
        this.setupTouchControls();
    }

    setupDragAndDrop() {
        const optionsContainer = document.getElementById('options');
        const emptyCells = document.querySelectorAll('.empty-cell');

        optionsContainer.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('option') && !e.target.classList.contains('used')) {
                e.target.classList.add('dragging');
                this.isDragging = true;
                e.dataTransfer.setData('text/plain', e.target.getAttribute('data-option'));
                e.dataTransfer.setData('type', 'option');
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
                if (!cell.hasChildNodes()) {
                    cell.classList.add('hovered');
                }
            });

            cell.addEventListener('dragleave', () => {
                cell.classList.remove('hovered');
            });

            cell.addEventListener('drop', (e) => {
                e.preventDefault();
                cell.classList.remove('hovered');
                
                const optionIndex = e.dataTransfer.getData('text/plain');
                const type = e.dataTransfer.getData('type');
                
                if (type === 'option') {
                    const originalOptions = document.querySelectorAll(`.option[data-option="${optionIndex}"]`);
                    let originalOption = null;
                    
                    for (let op of originalOptions) {
                        if (!op.classList.contains('used') && !op.parentElement.classList.contains('empty-cell')) {
                            originalOption = op;
                            break;
                        }
                    }
                    
                    if (originalOption && !cell.hasChildNodes()) {
                        this.addOptionToCell(originalOption, cell);
                    }
                } else if (type === 'remove') {
                    const optionInCell = cell.querySelector('.option');
                    if (optionInCell) {
                        this.removeOptionFromCell(optionInCell);
                    }
                }
            });
            
            // Перетаскивание из ячейки обратно в список (удаление)
            cell.addEventListener('dragstart', (e) => {
                if (e.target.classList.contains('option') && e.target.parentElement === cell) {
                    e.target.classList.add('dragging');
                    e.dataTransfer.setData('type', 'remove');
                    e.dataTransfer.setData('option-index', e.target.getAttribute('data-option'));
                    e.dataTransfer.effectAllowed = 'move';
                }
            });
        });
        
        // Предотвращаем стандартное поведение браузера для перетаскивания
        document.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        document.addEventListener('drop', (e) => {
            e.preventDefault();
            
            const type = e.dataTransfer.getData('type');
            const optionIndex = e.dataTransfer.getData('option-index');
            
            if (type === 'remove' && optionIndex) {
                // Если перетащили элемент за пределы ячеек, удаляем его из ячейки
                const emptyCells = document.querySelectorAll('.empty-cell');
                for (let cell of emptyCells) {
                    const optionInCell = cell.querySelector(`.option[data-option="${optionIndex}"]`);
                    if (optionInCell) {
                        this.removeOptionFromCell(optionInCell);
                        break;
                    }
                }
            }
        });
    }
    
    setupTouchControls() {
        const optionsContainer = document.getElementById('options');
        const emptyCells = document.querySelectorAll('.empty-cell');
        
        // Для мобильных: клик по варианту добавляет его в первую свободную ячейку
        optionsContainer.addEventListener('click', (e) => {
            if (this.isMobile && e.target.classList.contains('option') && 
                !e.target.classList.contains('used')) {
                this.addOptionToEmptyCell(e.target);
            }
        });
        
        // Для мобильных: клик по варианту в ячейке удаляет его
        emptyCells.forEach(cell => {
            cell.addEventListener('click', (e) => {
                if (this.isMobile && e.target.classList.contains('option')) {
                    this.removeOptionFromCell(e.target);
                }
            });
            
            // Двойное касание для удаления (дополнительный вариант)
            let tapCount = 0;
            let tapTimer;
            
            cell.addEventListener('touchstart', (e) => {
                if (e.target.classList.contains('option')) {
                    tapCount++;
                    if (tapCount === 1) {
                        tapTimer = setTimeout(() => {
                            tapCount = 0;
                        }, 300);
                    } else if (tapCount === 2) {
                        clearTimeout(tapTimer);
                        tapCount = 0;
                        this.removeOptionFromCell(e.target);
                    }
                }
            });
        });
    }
    
    addOptionToEmptyCell(option) {
        const emptyCells = document.querySelectorAll('.empty-cell');
        for (let cell of emptyCells) {
            if (cell.children.length === 0) {
                this.addOptionToCell(option, cell);
                break;
            }
        }
    }
    
    addOptionToCell(option, cell) {
        if (!cell || cell.hasChildNodes() || !option || option.classList.contains('used')) {
            return;
        }
        
        const optionIndex = option.getAttribute('data-option');
        
        // Создаем клон для ячейки
        const optionClone = option.cloneNode(true);
        optionClone.classList.remove('dragging');
        optionClone.draggable = true;
        optionClone.style.cursor = this.isMobile ? 'pointer' : 'default';
        optionClone.setAttribute('data-option', optionIndex);
        
        // Для десктопной версии фиксируем размеры
        if (!this.isMobile) {
            optionClone.style.width = '100%';
            optionClone.style.height = '100%';
            optionClone.style.maxWidth = '100%';
            optionClone.style.maxHeight = '100%';
        }
        
        // Сохраняем связь между клоном и оригиналом
        this.originalOptionsMap.set(optionClone, option);
        
        cell.appendChild(optionClone);
        cell.classList.add('filled');
        
        // Помечаем оригинальный вариант как использованный
        option.classList.add('used');
        option.style.opacity = '0.5';
        
        // Обновляем ответы
        this.saveRoundAnswers();
    }
    
    removeOptionFromCell(optionClone) {
        const cell = optionClone.parentElement;
        if (!cell || !cell.classList.contains('empty-cell')) return;
        
        let originalOption = this.originalOptionsMap.get(optionClone);
        
        if (!originalOption) {
            const optionIndex = optionClone.getAttribute('data-option');
            const options = document.querySelectorAll(`.option[data-option="${optionIndex}"]`);
            
            for (let option of options) {
                if (!option.parentElement.classList.contains('empty-cell')) {
                    originalOption = option;
                    break;
                }
            }
        }
        
        this.originalOptionsMap.delete(optionClone);
        
        if (originalOption) {
            originalOption.classList.remove('used');
            originalOption.style.opacity = '1';
            originalOption.style.cursor = this.isMobile ? 'pointer' : 'grab';
        }
        
        cell.removeChild(optionClone);
        cell.classList.remove('filled');
        
        this.saveRoundAnswers();
    }
    
    handleCloseButton() {
        const leadersModal = document.getElementById('leaders-modal');
        
        if (this.showLeadersFromGame) {
            if (this.tg) {
                this.tg.close();
            } else {
                alert('Игра завершена!');
            }
        } else {
            leadersModal.style.display = 'none';
        }
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
        nextBtn.textContent = roundIndex === 9 ? 'Завершить' : 'Следующий раунд';
        nextBtn.disabled = false;
    }

    updateOptions(options) {
        const optionsContainer = document.getElementById('options');
        optionsContainer.innerHTML = '';
        
        options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            optionElement.draggable = !this.isMobile;
            optionElement.textContent = option;
            optionElement.setAttribute('data-option', index);
            
            if (this.isMobile) {
                optionElement.style.cursor = 'pointer';
                optionElement.style.touchAction = 'manipulation';
            } else {
                optionElement.style.cursor = 'grab';
            }
            
            optionsContainer.appendChild(optionElement);
        });
        
        this.originalOptionsMap.clear();
    }

    clearEmptyCells() {
        const emptyCells = document.querySelectorAll('.empty-cell');
        emptyCells.forEach(cell => {
            cell.classList.remove('filled');
            cell.innerHTML = '';
            cell.style.backgroundColor = '';
            cell.style.borderColor = '';
            cell.style.borderWidth = '';
            cell.style.borderStyle = '';
        });

        const options = document.querySelectorAll('.option');
        options.forEach(option => {
            option.classList.remove('used');
            option.style.opacity = '1';
            option.style.backgroundColor = '';
            option.style.borderColor = '';
            option.style.color = '';
            option.style.cursor = this.isMobile ? 'pointer' : 'grab';
            option.classList.remove('correct-unselected');
        });
        
        this.originalOptionsMap.clear();
    }

    // Метод для подсветки ответов в текущем раунде
    highlightAnswers() {
        const actualRound = this.roundsOrder[this.currentRound];
        const correctAnswers = this.roundsData[actualRound].correct;
        const userAnswers = this.userAnswers[this.currentRound] || [];
        
        const emptyCells = document.querySelectorAll('.empty-cell');
        
        // Подсвечиваем варианты в ячейках
        emptyCells.forEach((cell) => {
            const option = cell.querySelector('.option');
            if (option) {
                const answerIndex = parseInt(option.getAttribute('data-option'));
                
                if (correctAnswers.includes(answerIndex)) {
                    // Правильный ответ в ячейке - зеленый
                    cell.style.backgroundColor = '#d4edda';
                    cell.style.borderColor = '#28a745';
                    cell.style.borderWidth = '2px';
                    cell.style.borderStyle = 'solid';
                    option.style.color = '#155724';
                    option.style.fontWeight = 'bold';
                } else {
                    // Неправильный ответ в ячейке - красный
                    cell.style.backgroundColor = '#f8d7da';
                    cell.style.borderColor = '#dc3545';
                    cell.style.borderWidth = '2px';
                    cell.style.borderStyle = 'solid';
                    option.style.color = '#721c24';
                    option.style.fontWeight = 'bold';
                }
            }
        });
        
        // Подсвечиваем правильные, но не выбранные варианты в списке
        const options = document.querySelectorAll('#options .option');
        options.forEach(option => {
            const optionIndex = parseInt(option.getAttribute('data-option'));
            
            // Если вариант правильный И не был выбран пользователем
            if (correctAnswers.includes(optionIndex) && !userAnswers.includes(optionIndex)) {
                // Подсвечиваем светло-зеленым (как подсказка)
                option.style.backgroundColor = '#d4edda';
                option.style.borderColor = '#28a745';
                option.style.borderWidth = '2px';
                option.classList.add('correct-unselected');
            }
        });
    }

    // Метод для очистки подсветки
    clearHighlighting() {
        const emptyCells = document.querySelectorAll('.empty-cell');
        
        emptyCells.forEach(cell => {
            cell.style.backgroundColor = '';
            cell.style.borderColor = '';
            cell.style.borderWidth = '';
            cell.style.borderStyle = '';
            const option = cell.querySelector('.option');
            if (option) {
                option.style.color = '';
                option.style.fontWeight = '';
            }
        });
        
        const options = document.querySelectorAll('.option');
        options.forEach(option => {
            option.style.backgroundColor = '';
            option.style.borderColor = '';
            option.style.borderWidth = '';
            option.classList.remove('correct-unselected');
        });
    }

    nextRound() {
        this.saveRoundAnswers();
        
        const nextBtn = document.getElementById('next-btn');
        nextBtn.disabled = true;
        
        this.highlightAnswers();
        this.calculateRoundScore();
        
        setTimeout(() => {
            if (this.currentRound === 9) {
                this.finishGame();
            } else {
                this.clearHighlighting();
                this.startRound(this.currentRound + 1);
            }
        }, 3000);
    }

    calculateRoundScore() {
        const actualRound = this.roundsOrder[this.currentRound];
        const correctAnswers = this.roundsData[actualRound].correct;
        const userAnswers = this.userAnswers[this.currentRound] || [];
        
        let roundScore = 0;
        let allCorrect = true;
        
        userAnswers.forEach(answer => {
            if (correctAnswers.includes(answer)) {
                roundScore++;
            } else {
                allCorrect = false;
            }
        });
        
        this.totalScore += roundScore;
        
        if (allCorrect && userAnswers.length === 3) {
            this.perfectRounds++;
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
    }

    calculateScore() {
        let perfectRounds = 0;
        
        this.userAnswers.forEach((answer, roundIndex) => {
            if (!answer || answer.length !== 3) return;
            
            const actualRound = this.roundsOrder[roundIndex];
            const correctAnswers = this.roundsData[actualRound].correct;
            
            const sortedAnswer = [...answer].sort();
            const sortedCorrect = [...correctAnswers].sort();
            
            if (sortedAnswer.length === sortedCorrect.length && 
                sortedAnswer.every((val, idx) => val === sortedCorrect[idx])) {
                perfectRounds++;
            }
        });
        
        return perfectRounds;
    }

    async finishGame() {
        const perfectRounds = this.calculateScore();
        
        // Выбираем мотивационную фразу
        let motivationPhrase = '';
        
        if (this.totalScore === 30) {
            // Идеальный результат (30 очков)
            motivationPhrase = this.motivationPhrases.perfectScore;
        } else if (this.totalScore >= 11) {
            // Высокий результат (11-29 очков)
            const randomIndex = Math.floor(Math.random() * this.motivationPhrases.highScore.length);
            motivationPhrase = this.motivationPhrases.highScore[randomIndex];
        } else if (this.totalScore >= 1) {
            // Низкий результат (1-10 очков)
            const randomIndex = Math.floor(Math.random() * this.motivationPhrases.lowScore.length);
            motivationPhrase = this.motivationPhrases.lowScore[randomIndex];
        } else {
            // 0 очков
            motivationPhrase = "Ничего страшного! Попробуй ещё раз! 💪";
        }
        
        // Формируем HTML для результатов (без строки о полностью пройденных раундах)
        let resultsHTML = `
            <div class="results-container">
                <div class="score-result">
                    Вы набрали: <strong>${this.totalScore} очков</strong>
                </div>
                <div class="motivation">${motivationPhrase}</div>
        `;
        
        // Если все 10 раундов пройдены полностью (30 очков)
        if (perfectRounds === 10) {
            resultsHTML += `
                <div class="success-message">
                    🎉 Поздравляем! Вы прошли все раунды идеально! 🎉<br>
                    Ваш результат добавлен в таблицу лидеров!
                </div>
            `;
            
            // Сохраняем результат только если все 10 раундов пройдены идеально
            await this.saveResult();
        }
        
        resultsHTML += `</div>`;
        
        document.getElementById('results-text').innerHTML = resultsHTML;
        document.getElementById('results-modal').style.display = 'block';
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
                    score: 10,
                    date: new Date().toISOString()
                })
            });
            
            await response.json();
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
            
            const restartBtn = document.getElementById('restart-btn');
            if (this.showLeadersFromGame) {
                restartBtn.style.display = 'inline-block';
            } else {
                restartBtn.style.display = 'none';
            }
        } catch (error) {
            console.error('Ошибка загрузки таблицы лидеров:', error);
            this.displayLeaders([]);
            document.getElementById('leaders-modal').style.display = 'block';
            
            const restartBtn = document.getElementById('restart-btn');
            if (this.showLeadersFromGame) {
                restartBtn.style.display = 'inline-block';
            } else {
                restartBtn.style.display = 'none';
            }
        }
    }

    async getLeaders() {
        const response = await fetch('/api/leaders');
        return await response.json();
    }

    displayLeaders(leaders) {
        const leadersTable = document.getElementById('leaders-table');
        
        if (leaders.length === 0) {
            leadersTable.innerHTML = '<p class="no-leaders">Пока нет лидеров. Будьте первым!</p>';
            return;
        }
        
        leadersTable.innerHTML = '';
        
        leaders.forEach((leader, index) => {
            const row = document.createElement('div');
            row.className = `leader-row ${index < 3 ? 'top-3' : ''}`;
            
            const date = new Date(leader.originalDate || leader.date);
            const formattedDate = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
            
            let medal = '';
            if (index === 0) medal = '🥇';
            else if (index === 1) medal = '🥈';
            else if (index === 2) medal = '🥉';
            
            let usernameElement = leader.username;
            if (leader.username && leader.username !== 'Анонимный игрок' && 
                (leader.username.includes('@') || !leader.username.includes(' '))) {
                
                const cleanUsername = leader.username.startsWith('@') 
                    ? leader.username.substring(1) 
                    : leader.username;
                
                usernameElement = `<a href="https://t.me/${cleanUsername}" target="_blank" class="leader-link">${leader.username}</a>`;
            }
            
            row.innerHTML = `
                <span class="leader-position">${medal} ${index + 1}. ${usernameElement}</span>
                <span class="leader-date">${formattedDate}</span>
            `;
            
            leadersTable.appendChild(row);
        });
    }

    restartGame() {
        this.currentRound = 0;
        this.score = 0;
        this.totalScore = 0;
        this.perfectRounds = 0;
        this.userAnswers = [];
        this.generateRoundsOrder();
        
        document.getElementById('leaders-modal').style.display = 'none';
        document.getElementById('results-modal').style.display = 'none';
        document.getElementById('restart-btn').style.display = 'none';
        
        this.clearHighlighting();
        this.startRound(0);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new KeyAdvantagesGame();
});
[file content end]* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    -webkit-tap-highlight-color: transparent;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: linear-gradient(135deg, #4583ed 0%, #b8c7e0 100%);
    min-height: 100vh;
    padding: 20px;
    touch-action: manipulation;
}

.container {
    max-width: 450px;
    margin: 0 auto;
}

.header {
    text-align: center;
    margin-bottom: 20px;
    color: white;
}

.header h1 {
    font-size: 26px;
    margin-bottom: 10px;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
}

.round-counter {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 10px;
    background: rgba(255, 255, 255, 0.2);
    display: inline-block;
    padding: 5px 15px;
    border-radius: 20px;
}

.round-description {
    background: #fff3cd;
    border: 2px solid #ffeaa7;
    border-radius: 12px;
    padding: 18px;
    margin-bottom: 30px; /* Увеличен отступ снизу */
    text-align: center;
    font-weight: bold;
    color: #856404;
    font-size: 17px;
    line-height: 1.5;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.game-area {
    background: white;
    border-radius: 18px;
    padding: 25px;
    margin-bottom: 25px;
    box-shadow: 0 12px 35px rgba(0,0,0,0.25);
}

.empty-cells {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 40px; /* Увеличен отступ между ячейками и вариантами */
}

.empty-cell {
    aspect-ratio: 1;
    border: 3px dashed #ccc;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8f9fa;
    transition: all 0.3s ease;
    position: relative;
    padding: 6px; /* Уменьшены внутренние отступы */
    overflow: hidden; /* Скрываем выходящий за границы текст */
}

.empty-cell.hovered {
    border-color: #667eea;
    background: #f0f4ff;
    transform: translateY(-3px);
}

.empty-cell.filled {
    border-style: solid;
    border-color: #667eea;
    background: #e8f4ff;
}

/* Стили для вариантов внутри ячеек */
.empty-cell .option {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 8px; /* Уменьшены отступы внутри ячейки */
    font-size: 13px; /* Уменьшен шрифт для ячейки */
    font-weight: 500;
    line-height: 1.2; /* Уменьшен межстрочный интервал */
    word-break: break-word;
    overflow: hidden;
    border: none;
    background: transparent;
    cursor: grab;
    border-radius: 8px;
    margin: 0;
    white-space: normal;
    overflow-wrap: break-word;
}

.options {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
}

.option {
    aspect-ratio: 1;
    border: 2px solid #e9ecef;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    cursor: grab;
    font-size: 14px;
    text-align: center;
    padding: 12px;
    transition: all 0.2s ease;
    user-select: none;
    word-break: break-word;
    line-height: 1.3;
    min-height: 0; /* Предотвращает растягивание */
    overflow: hidden;
}

.option:hover {
    border-color: #667eea;
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(102, 126, 234, 0.25);
}

.option.dragging {
    opacity: 0.8;
    cursor: grabbing;
    transform: scale(0.98);
    box-shadow: 0 8px 16px rgba(0,0,0,0.2);
    z-index: 1000;
    position: relative;
}

.option.used {
    opacity: 0.4;
    cursor: not-allowed;
    background: #f8f9fa;
    border-color: #e9ecef;
    transform: none;
    box-shadow: none;
}

.option.used:hover {
    border-color: #e9ecef;
    transform: none;
    box-shadow: none;
}

.empty-cell .option:hover {
    border-color: #ff6b6b;
    background: #fff5f5;
}

/* Стиль для правильных, но не выбранных вариантов */
.option.correct-unselected {
    background: #d4edda !important;
    border-color: #28a745 !important;
    border-width: 2px !important;
    color: #155724;
    font-weight: bold;
    animation: pulse 1.5s infinite;
}

@keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.4); }
    70% { box-shadow: 0 0 0 6px rgba(40, 167, 69, 0); }
    100% { box-shadow: 0 0 0 0 rgba(40, 167, 69, 0); }
}

.next-btn {
    width: 100%;
    padding: 18px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 18px;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-bottom: 15px;
    font-weight: bold;
    box-shadow: 0 6px 15px rgba(102, 126, 234, 0.4);
}

.next-btn:hover {
    background: linear-gradient(135deg, #5a6fd8 0%, #6a4290 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.5);
}

.next-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}

.leaders-btn {
    width: 100%;
    padding: 18px;
    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 18px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: bold;
    box-shadow: 0 6px 15px rgba(40, 167, 69, 0.4);
}

.leaders-btn:hover {
    background: linear-gradient(135deg, #218838 0%, #1ba87e 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(40, 167, 69, 0.5);
}

.modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.6);
    z-index: 1000;
    backdrop-filter: blur(8px);
}

.modal-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 35px;
    border-radius: 18px;
    text-align: center;
    min-width: 350px;
    max-width: 90%;
    max-height: 85vh;
    overflow-y: auto;
    box-shadow: 0 20px 50px rgba(0,0,0,0.4);
    animation: modalAppear 0.4s ease;
}

@keyframes modalAppear {
    from { 
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.9);
    }
    to { 
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
    }
}

.modal h2 {
    margin-bottom: 25px;
    color: #333;
    font-size: 28px;
}

#results-text {
    font-size: 19px;
    margin-bottom: 25px;
}

#leaders-table {
    margin: 25px 0;
    text-align: left;
    min-height: 250px;
    max-height: 400px;
    overflow-y: auto;
    border: 1px solid #eee;
    border-radius: 10px;
    padding: 10px;
}

.leader-row {
    padding: 12px 18px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.2s ease;
}

.leader-row:hover {
    background-color: #f8f9fa;
    transform: translateX(5px);
}

.leader-row.top-3 {
    background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
    font-weight: bold;
    border-radius: 8px;
    margin: 8px 0;
    border-left: 4px solid #ffc107;
}

.leader-position {
    font-size: 17px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.leader-date {
    color: #666;
    font-size: 14px;
    font-weight: 500;
}

.modal button {
    padding: 12px 25px;
    margin: 8px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    font-weight: bold;
    font-size: 16px;
    transition: all 0.3s ease;
    min-width: 140px;
}

.modal button:hover {
    background: linear-gradient(135deg, #5a6fd8 0%, #6a4290 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(102, 126, 234, 0.4);
}

#restart-btn {
    background: linear-gradient(135deg, #ffc107 0%, #ff9900 100%);
    color: #212529;
}

#restart-btn:hover {
    background: linear-gradient(135deg, #e0a800 0%, #e68900 100%);
}

/* Стили для результатов */
.results-container {
    text-align: center;
    padding: 30px 0;
}

.score-result {
    font-size: 36px;
    font-weight: bold;
    margin: 20px 0 30px;
    padding: 22px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 15px;
    color: white;
    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.5);
    text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
}

.motivation {
    font-size: 22px;
    margin: 30px 0;
    padding: 20px 0;
    text-align: center;
    line-height: 1.6;
    font-weight: 600;
    color: #333;
    border-top: 2px dashed #ddd;
    border-bottom: 2px dashed #ddd;
}

.success-message {
    font-size: 24px;
    color: #28a745;
    margin-top: 30px;
    padding: 22px;
    background-color: #d4edda;
    border-radius: 12px;
    border-left: 5px solid #28a745;
    font-weight: bold;
    box-shadow: 0 8px 20px rgba(40, 167, 69, 0.25);
    line-height: 1.5;
}

.no-leaders {
    text-align: center;
    color: #6c757d;
    font-style: italic;
    padding: 30px;
    font-size: 18px;
}

/* Стили для кликабельных ссылок в таблице лидеров */
.leader-link {
    color: #667eea;
    text-decoration: none;
    font-weight: bold;
    transition: all 0.2s ease;
    padding: 3px 8px;
    border-radius: 4px;
    border-bottom: 2px solid transparent;
}

.leader-link:hover {
    color: #5a6fd8;
    background-color: rgba(102, 126, 234, 0.1);
    border-bottom: 2px solid #5a6fd8;
}

.leader-link:active {
    color: #4a5fd8;
    transform: scale(0.98);
}

/* Анимации для подсветки ответов */
@keyframes highlightCorrect {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
}

@keyframes highlightIncorrect {
    0% { transform: translateX(0); }
    25% { transform: translateX(-8px); }
    75% { transform: translateX(8px); }
    100% { transform: translateX(0); }
}

.empty-cell[style*="background-color: #d4edda"] {
    animation: highlightCorrect 0.6s ease;
}

.empty-cell[style*="background-color: #f8d7da"] {
    animation: highlightIncorrect 0.6s ease;
}

@keyframes tap-feedback {
    0% { transform: scale(1); }
    50% { transform: scale(0.95); }
    100% { transform: scale(1); }
}

.option:active, .empty-cell:active, button:active {
    animation: tap-feedback 0.2s ease;
}

/* Адаптивность для мобильных устройств */
@media (max-width: 768px) {
    body {
        padding: 10px;
    }
    
    .container {
        max-width: 100%;
    }
    
    .header h1 {
        font-size: 22px;
    }
    
    .round-counter {
        font-size: 16px;
        padding: 4px 12px;
    }
    
    .round-description {
        font-size: 15px;
        padding: 15px;
        margin-bottom: 25px;
    }
    
    .game-area {
        padding: 20px;
        margin-bottom: 20px;
    }
    
    .empty-cell, .option {
        aspect-ratio: 1;
        padding: 8px;
    }
    
    .empty-cell .option {
        padding: 6px;
        font-size: 12px;
        line-height: 1.1;
    }
    
    .modal-content {
        padding: 25px;
        min-width: 300px;
        max-width: 95%;
    }
    
    .score-result {
        font-size: 28px;
        padding: 18px;
        margin: 15px 0 25px;
    }
    
    .motivation {
        font-size: 18px;
        padding: 18px 0;
        margin: 25px 0;
    }
    
    .success-message {
        font-size: 20px;
        padding: 18px;
        margin-top: 25px;
    }
    
    .leader-row {
        padding: 10px 15px;
        font-size: 15px;
    }
    
    .leader-link {
        font-size: 15px;
    }
    
    .leader-date {
        font-size: 13px;
    }
    
    .next-btn, .leaders-btn {
        padding: 16px;
        font-size: 17px;
    }
    
    .modal button {
        padding: 10px 20px;
        min-width: 120px;
        font-size: 15px;
        margin: 6px;
    }
}

@media (min-width: 769px) and (max-width: 1024px) {
    .container {
        max-width: 500px;
    }
    
    .score-result {
        font-size: 32px;
        padding: 20px;
    }
}

/* Для старых браузеров, которые не поддерживают aspect-ratio */
@supports not (aspect-ratio: 1) {
    .empty-cell {
        height: 0;
        padding-bottom: 100%;
        position: relative;
    }
    
    .empty-cell > * {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }
    
    .option {
        height: 0;
        padding-bottom: 100%;
        position: relative;
    }
    
    .option > * {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }
}

/* Полоса прокрутки для таблицы лидеров */
#leaders-table::-webkit-scrollbar {
    width: 8px;
}

#leaders-table::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
}

#leaders-table::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 10px;
}

#leaders-table::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, #5a6fd8 0%, #6a4290 100%);
}

/* Улучшения для лучшей доступности */
button:focus,
.option:focus,
.leader-link:focus {
    outline: 3px solid #667eea;
    outline-offset: 3px;
}

/* Для скринридеров */
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}
[file content end]
