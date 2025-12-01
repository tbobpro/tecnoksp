class KeyAdvantagesGame {
    constructor() {
        this.currentRound = 0;
        this.score = 0;
        this.totalScore = 0; // Общий счет за все правильные ответы
        this.perfectRounds = 0; // Количество полностью правильных раундов
        this.roundsOrder = [];
        this.userAnswers = [];
        this.isDragging = false;
        this.isMobile = this.checkMobile();
        this.showLeadersFromGame = false;
        this.originalOptionsMap = new Map(); // Карта для отслеживания оригинальных элементов
        
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
                    "Частота кадров 180 Гц", "Частота кадров 144 Гц", "Изогнутый экран диагональю 34”"
                ]
            },
            {
                description: "Ключевые преимущества Tecno MEGA MINI GAMING G1",
                correct: [0, 1, 5],
                options: [
                    "Мощный процессор Intel 13 поколения", "Видеокарта NVIDIA GeForce RTX 4060 8Гб", "Игровой режим",
                    "Видеокарта NVIDIA GeForce RTX 4060 4Гб", "Тонкий и лёгкий корпус", "Компактный корпус с RGB-подсветкой"
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
                    
                    // Находим оригинальный вариант (не использованный)
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
                    // Удаление варианта из ячейки
                    const optionInCell = cell.querySelector('.option');
                    if (optionInCell) {
                        this.removeOptionFromCell(optionInCell);
                    }
                }
            });
            
            // Настраиваем перетаскивание для удаления вариантов из ячеек
            cell.addEventListener('dragstart', (e) => {
                if (e.target.classList.contains('option') && e.target.parentElement === cell) {
                    e.target.classList.add('dragging');
                    e.dataTransfer.setData('type', 'remove');
                    e.dataTransfer.setData('option-index', e.target.getAttribute('data-option'));
                    e.dataTransfer.effectAllowed = 'move';
                }
            });
        });
        
        // Обработчик для удаления варианта перетаскиванием в любое место
        document.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        document.addEventListener('drop', (e) => {
            e.preventDefault();
            
            const type = e.dataTransfer.getData('type');
            const optionIndex = e.dataTransfer.getData('option-index');
            
            if (type === 'remove' && optionIndex) {
                // Ищем вариант в ячейках по индексу
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
        
        // Клик по варианту для добавления
        optionsContainer.addEventListener('click', (e) => {
            if (this.isMobile && e.target.classList.contains('option') && 
                !e.target.classList.contains('used')) {
                this.addOptionToEmptyCell(e.target);
            }
        });
        
        // Клик по варианту в ячейке для удаления
        emptyCells.forEach(cell => {
            cell.addEventListener('click', (e) => {
                if (this.isMobile && e.target.classList.contains('option')) {
                    this.removeOptionFromCell(e.target);
                }
            });
            
            // Двойной тап для быстрого удаления
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
        
        // Находим оригинальный вариант по карте
        let originalOption = this.originalOptionsMap.get(optionClone);
        
        // Если не нашли по карте, ищем по индексу
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
        
        // Удаляем из карты
        this.originalOptionsMap.delete(optionClone);
        
        // Возвращаем оригинальный вариант в доступное состояние
        if (originalOption) {
            originalOption.classList.remove('used');
            originalOption.style.opacity = '1';
            originalOption.style.cursor = this.isMobile ? 'pointer' : 'grab';
        }
        
        // Удаляем клон из ячейки
        cell.removeChild(optionClone);
        cell.classList.remove('filled');
        
        // Обновляем ответы
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
        nextBtn.disabled = false; // Разблокируем кнопку
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
        
        // Очищаем карту при обновлении вариантов
        this.originalOptionsMap.clear();
    }

    clearEmptyCells() {
        const emptyCells = document.querySelectorAll('.empty-cell');
        emptyCells.forEach(cell => {
            cell.classList.remove('filled');
            cell.innerHTML = '';
            // Сбрасываем стили подсветки
            cell.style.backgroundColor = '';
            cell.style.borderColor = '';
            cell.style.borderWidth = '';
            cell.style.borderStyle = '';
        });

        // Сбрасываем все варианты в исходное состояние
        const options = document.querySelectorAll('.option');
        options.forEach(option => {
            option.classList.remove('used');
            option.style.opacity = '1';
            option.style.backgroundColor = '';
            option.style.borderColor = '';
            option.style.color = '';
            option.style.cursor = this.isMobile ? 'pointer' : 'grab';
        });
        
        // Очищаем карту
        this.originalOptionsMap.clear();
    }

    // Метод для подсветки ответов в текущем раунде (ТОЛЬКО в ячейках)
    highlightAnswers() {
        const actualRound = this.roundsOrder[this.currentRound];
        const correctAnswers = this.roundsData[actualRound].correct;
        const userAnswers = this.userAnswers[this.currentRound] || [];
        
        const emptyCells = document.querySelectorAll('.empty-cell');
        
        emptyCells.forEach((cell) => {
            const option = cell.querySelector('.option');
            if (option) {
                const answerIndex = parseInt(option.getAttribute('data-option'));
                
                // Проверяем, является ли выбранный ответ правильным
                if (correctAnswers.includes(answerIndex)) {
                    // Правильный ответ - зеленый
                    cell.style.backgroundColor = '#d4edda';
                    cell.style.borderColor = '#28a745';
                    cell.style.borderWidth = '2px';
                    cell.style.borderStyle = 'solid';
                    option.style.color = '#155724';
                    option.style.fontWeight = 'bold';
                } else {
                    // Неправильный ответ - красный
                    cell.style.backgroundColor = '#f8d7da';
                    cell.style.borderColor = '#dc3545';
                    cell.style.borderWidth = '2px';
                    cell.style.borderStyle = 'solid';
                    option.style.color = '#721c24';
                    option.style.fontWeight = 'bold';
                }
            }
        });
        
        // НЕ подсвечиваем правильные ответы в списке вариантов
        // Только те, что уже выбраны в ячейках
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
    }

    nextRound() {
        this.saveRoundAnswers();
        
        // Блокируем кнопку, чтобы не нажимали несколько раз
        const nextBtn = document.getElementById('next-btn');
        nextBtn.disabled = true;
        
        // Подсвечиваем ответы текущего раунда (только в ячейках)
        this.highlightAnswers();
        
        // Вычисляем очки за текущий раунд
        this.calculateRoundScore();
        
        // Показываем сообщение о результате раунда
        this.showRoundResult();
        
        // Увеличиваем задержку до 4 секунд перед переходом
        setTimeout(() => {
            if (this.currentRound === 9) {
                this.finishGame();
            } else {
                this.clearRoundResult();
                this.clearHighlighting();
                this.startRound(this.currentRound + 1);
            }
        }, 4000); // 4 секунды задержки
    }

    // Показываем результат текущего раунда
    showRoundResult() {
        const actualRound = this.roundsOrder[this.currentRound];
        const correctAnswers = this.roundsData[actualRound].correct;
        const userAnswers = this.userAnswers[this.currentRound] || [];
        
        let correctCount = 0;
        userAnswers.forEach(answer => {
            if (correctAnswers.includes(answer)) {
                correctCount++;
            }
        });
        
        // Создаем сообщение о результате раунда
        const roundResultDiv = document.createElement('div');
        roundResultDiv.id = 'round-result';
        roundResultDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 255, 255, 0.95);
            padding: 20px 30px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 1000;
            text-align: center;
            font-size: 20px;
            font-weight: bold;
            border: 3px solid ${correctCount === 3 ? '#28a745' : '#ffc107'};
            min-width: 300px;
        `;
        
        let resultText = '';
        if (correctCount === 3) {
            resultText = `🎉 Отлично! Все 3 ответа верны!`;
            roundResultDiv.style.color = '#28a745';
        } else if (correctCount === 2) {
            resultText = `👍 Хорошо! ${correctCount} из 3 ответов верны`;
            roundResultDiv.style.color = '#17a2b8';
        } else if (correctCount === 1) {
            resultText = `👌 Неплохо! ${correctCount} из 3 ответов верен`;
            roundResultDiv.style.color = '#ffc107';
        } else {
            resultText = `😕 Пока не получилось. Попробуйте в следующем раунде!`;
            roundResultDiv.style.color = '#dc3545';
        }
        
        roundResultDiv.innerHTML = `
            <div style="margin-bottom: 10px;">Раунд ${this.currentRound + 1}</div>
            <div>${resultText}</div>
            <div style="margin-top: 10px; font-size: 18px; color: #666;">
                Переход через 4 секунды...
            </div>
        `;
        
        document.body.appendChild(roundResultDiv);
    }

    // Очищаем сообщение о результате раунда
    clearRoundResult() {
        const roundResult = document.getElementById('round-result');
        if (roundResult) {
            document.body.removeChild(roundResult);
        }
    }

    // Метод для подсчета очков за текущий раунд
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
        
        // Проверяем, полностью ли правильный раунд
        if (allCorrect && userAnswers.length === 3) {
            this.perfectRounds++;
            console.log(`Раунд ${this.currentRound + 1} пройден полностью!`);
        }
        
        console.log(`Раунд ${this.currentRound + 1}: ${roundScore} очков, всего: ${this.totalScore}`);
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
        // Считаем только полностью правильные раунды (для таблицы лидеров)
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
        
        // Определяем мотивационную фразу на основе общего счета
        let motivationPhrase = '';
        let motivationClass = '';
        
        if (this.totalScore >= 25) {
            motivationPhrase = '🔥 Великолепный результат! Вы настоящий эксперт TECNO! 🏆';
            motivationClass = 'motivation-excellent';
        } else if (this.totalScore >= 20) {
            motivationPhrase = '🎯 Отличный результат! Вы хорошо знаете продукцию TECNO! 👍';
            motivationClass = 'motivation-great';
        } else if (this.totalScore >= 15) {
            motivationPhrase = '✨ Хороший результат! Продолжайте изучать продукцию TECNO! 💪';
            motivationClass = 'motivation-good';
        } else if (this.totalScore >= 10) {
            motivationPhrase = '🌟 Неплохо! Есть куда стремиться, продолжайте тренироваться!';
            motivationClass = 'motivation-average';
        } else {
            motivationPhrase = '💫 Попробуйте ещё раз! Вы обязательно улучшите результат!';
            motivationClass = 'motivation-encourage';
        }
        
        // Формируем HTML для результатов
        let resultsHTML = `
            <div class="results-container">
                <div class="main-result">
                    Полностью пройдено раундов: <strong>${perfectRounds} из 10</strong>
                </div>
                <div class="score-result">
                    Вы набрали: <strong>${this.totalScore} очков</strong>
                </div>
                <div class="motivation ${motivationClass}">${motivationPhrase}</div>
        `;
        
        // Если все 10 раундов пройдены полностью - показываем специальное сообщение
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
                    score: 10, // Всегда 10 для таблицы лидеров
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
            
            // Добавляем медали для топ-3
            let medal = '';
            if (index === 0) medal = '🥇';
            else if (index === 1) medal = '🥈';
            else if (index === 2) medal = '🥉';
            
            row.innerHTML = `
                <span class="leader-position">${medal} ${index + 1}. ${leader.username}</span>
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
        
        this.clearRoundResult();
        this.clearHighlighting();
        this.startRound(0);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new KeyAdvantagesGame();
});
