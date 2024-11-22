class GameUI {



    constructor() {



        const $ = id => document.getElementById(id);



        this.menuScreen = $('menu-screen');



        this.gameContainer = $('game-container');



        this.gameArea = $('game-area');



        this.startButton = $('start-button');



        this.backgroundMusic = $('background-music');



        this.scoreElement = $('score-value');



        this.healthBar = $('health-bar');



        this.healthDamageOverlay = $('health-damage-overlay');



        this.overdoseBar = $('overdose-bar');







        this.cursorX = 0;



        this.movement = {



            left: false,



            right: false



        };







        this.engine = new GameEngine(this);



        this.setupMenu();



        this.setupHealthBars();



        const loadingNote = document.createElement('p');



        loadingNote.id = 'loading-note';



        loadingNote.textContent = 'Please wait 5–10 seconds after press ENTER for resources to load.';



        this.menuScreen.appendChild(loadingNote);



        this.EFFECTS_FADE_DELAY = 420;







        // Добавляем надпись "LIVE ON PUMPFUN"



        const pumpfunNote = document.createElement('p');



        pumpfunNote.id = 'pumpfun-note';



        pumpfunNote.textContent = 'LIVE ON PUMPFUN';



        this.menuScreen.appendChild(pumpfunNote);







        // Добавляем надпись "DEV WALLET: ..."



        const devWalletNote = document.createElement('p');



        devWalletNote.id = 'dev-wallet';



        devWalletNote.textContent = 'DEV WALLET: 8y8T1toxmVE4DzrpwWpSZ15fTJ43xSJZSzehx9Gf5kPF';



        this.menuScreen.appendChild(devWalletNote);



    }







    setupHealthBars() {



        // Create health container if it doesn't exist



        if (!document.getElementById('health-container')) {



            const healthContainer = document.createElement('div');



            healthContainer.id = 'health-container';



            document.getElementById('hud').appendChild(healthContainer);







            // Create health bar container



            const healthBarContainer = document.createElement('div');



            healthBarContainer.className = 'bar-container';



            healthContainer.appendChild(healthBarContainer);







            // Create health bar and damage overlay



            this.healthBar = document.createElement('div');



            this.healthBar.id = 'health-bar';



            this.healthDamageOverlay = document.createElement('div');



            this.healthDamageOverlay.id = 'health-damage-overlay';



            this.healthDamageOverlay.style.width = '100%';



            healthBarContainer.appendChild(this.healthBar);



            healthBarContainer.appendChild(this.healthDamageOverlay);







            // Create overdose bar container



            const overdoseBarContainer = document.createElement('div');



            overdoseBarContainer.className = 'bar-container';



            healthContainer.appendChild(overdoseBarContainer);







            // Create overdose bar



            this.overdoseBar = document.createElement('div');



            this.overdoseBar.id = 'overdose-bar';



            overdoseBarContainer.appendChild(this.overdoseBar);



        }



    }







    createFloatingText(text, type, x, y) {



        const floatingText = document.createElement('div');



        floatingText.className = `floating-text ${type}`;



        floatingText.textContent = text;



        floatingText.style.left = `${x}px`;



        floatingText.style.top = `${y}px`;



        this.gameContainer.appendChild(floatingText);







        floatingText.addEventListener('animationend', () => {



            floatingText.remove();



        });



    }







    async loadCursor() {



        const img = await this.engine.loadImage(gameConfig.cursor.assets.default);



        this.engine.assets.cursor = img;



    }







    setupMenu() {



        this.startButton.onclick = () => this.startGame();



        document.addEventListener('keydown', (e) => {



            if (e.key === 'Enter' && !this.engine.gameActive) {



                this.startGame();



            }



        });



    }







    async startGame() {



        const pumpfunNote = document.getElementById('pumpfun-note');



        const devWalletNote = document.getElementById('dev-wallet');



        Object.assign(pumpfunNote.style, {



            position: 'absolute',



            bottom: `${gameConfig.cursor.position.bottom + 40}px`,



            width: '100%',



            textAlign: 'center'



        });



        Object.assign(devWalletNote.style, {



            position: 'absolute',



            bottom: `${gameConfig.cursor.position.bottom - 70}px`,



            width: '100%',



            textAlign: 'center'



        });



        this.gameContainer.insertBefore(pumpfunNote, this.gameContainer.firstChild);



        this.gameContainer.insertBefore(devWalletNote, this.gameContainer.firstChild);



        this.menuScreen.style.display = 'none';



        this.gameContainer.style.display = 'block';



        this.backgroundMusic.volume = 0.3;



        try { await this.backgroundMusic.play(); } catch (e) { console.error(e); }



        



        await this.loadCursor();



        this.customCursor = this.createCustomCursor();



        this.setupEventListeners();



        



        await this.engine.loadAssets();



        this.engine.gameActive = true;







        this.cursorX = this.engine.GAME_WIDTH / 2;



        this.updateCursorPosition();



        this.updateScore(this.engine.score, this.engine.level);







        this.engine.gameLoop();



    }







    createCustomCursor() {



        const cursor = document.createElement('div');



        cursor.id = 'custom-cursor';



        const scaledWidth = this.engine.assets.cursor.width * gameConfig.cursor.scale;



        const scaledHeight = this.engine.assets.cursor.height * gameConfig.cursor.scale;







        Object.assign(cursor.style, {



            width: `${scaledWidth}px`,



            height: `${scaledHeight}px`,



            backgroundImage: `url(${this.engine.assets.cursor.src})`,



            backgroundSize: '100% 100%',



            backgroundRepeat: 'no-repeat',



            position: 'absolute',



            pointerEvents: 'none',



            zIndex: '9999',



            transform: 'translate(-50%, -50%)'



        });



        this.gameContainer.appendChild(cursor);



        return cursor;



    }







    setupEventListeners() {



        if (gameConfig.controls.type === 'keyboard') {



            document.addEventListener('keydown', (e) => {



                if (!this.engine.gameActive) return;







                if (e.key === gameConfig.controls.keyboard.left) {



                    this.movement.left = true;



                } else if (e.key === gameConfig.controls.keyboard.right) {



                    this.movement.right = true;



                }



            });







            document.addEventListener('keyup', (e) => {



                if (!this.engine.gameActive) return;







                if (e.key === gameConfig.controls.keyboard.left) {



                    this.movement.left = false;



                } else if (e.key === gameConfig.controls.keyboard.right) {



                    this.movement.right = false;



                }



            });



        }



    }







    updateMovement() {



        if (!this.engine.gameActive) return;







        const moveSpeed = gameConfig.controls.keyboard.moveSpeed;



        let moved = false;







        if (this.movement.left) {



            this.cursorX = Math.max(0, this.cursorX - moveSpeed);



            moved = true;



        }



        if (this.movement.right) {



            this.cursorX = Math.min(this.engine.GAME_WIDTH, this.cursorX + moveSpeed);



            moved = true;



        }







        if (moved) {



            this.updateCursorPosition();



        }



    }







    updateCursorPosition() {



        const originalBottom = gameConfig.cursor.position.bottom;



        const adjustedBottom = originalBottom ;



        const bottom = this.engine.GAME_HEIGHT - adjustedBottom;



        this.customCursor.style.left = `${this.cursorX}px`;



        this.customCursor.style.top = `${bottom}px`;



    }







    async changeCursor(reactionImage, reactionScale) {



        const scaledWidth = reactionImage.width * reactionScale;



        const scaledHeight = reactionImage.height * reactionScale;







        this.customCursor.style.width = `${scaledWidth}px`;



        this.customCursor.style.height = `${scaledHeight}px`;



        this.customCursor.style.backgroundImage = `url(${reactionImage.src})`;



        this.customCursor.style.backgroundSize = '100% 100%';







        await new Promise(res => setTimeout(res, this.engine.COOLDOWN_DURATION));







        const originalWidth = this.engine.assets.cursor.width * gameConfig.cursor.scale;



        const originalHeight = this.engine.assets.cursor.height * gameConfig.cursor.scale;







        this.customCursor.style.width = `${originalWidth}px`;



        this.customCursor.style.height = `${originalHeight}px`;



        this.customCursor.style.backgroundImage = `url(${this.engine.assets.cursor.src})`;



        this.customCursor.style.backgroundSize = '100% 100%';







        this.engine.inCooldown = false;



    }







    updateScore(score, level) {



        const pointsForCurrentLevel = level * gameConfig.scoring.pointsPerLevel;



        const pointsForPreviousLevel = (level - 1) * gameConfig.scoring.pointsPerLevel;



        const currentLevelProgress = score - pointsForPreviousLevel;



        this.scoreElement.textContent = `lvl${level}: ${currentLevelProgress}/${gameConfig.scoring.pointsPerLevel}`;



    }







    updateHealthBar(health, isDamage = false) {



        const width = Math.max(0, Math.min(100, health));



        // Убираем margin-left и просто меняем width для корректного уменьшения справа налево



        this.healthDamageOverlay.style.width = `${width}%`;



    }







    updateOverdoseBar(value) {



        this.overdoseBar.style.width = `${value}%`;



    }







    showGameOver(score, level) {



        this.engine.gameActive = false;



        this.backgroundMusic.pause();



        this.backgroundMusic.currentTime = 0;







        const gameOverScreen = document.createElement('div');



        Object.assign(gameOverScreen.style, {



            position: 'absolute',



            top: '50%',



            left: '50%',



            transform: 'translate(-50%, -50%)',



            textAlign: 'center',



            color: 'white',



            zIndex: '10000',



            backgroundColor: 'rgba(0, 0, 0, 0.8)',



            padding: '20px',



            borderRadius: '10px',



            boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)'



        });







        const gameOverImage = document.createElement('img');



        gameOverImage.src = 'assets/game_over/image.png';



        Object.assign(gameOverImage.style, {



            width: '300px',



            marginBottom: '20px',



            display: 'block',



            margin: '0 auto'



        });



        gameOverScreen.appendChild(gameOverImage);







        const gameOverText = document.createElement('h1');



        gameOverText.textContent = 'GAME OVER';



        Object.assign(gameOverText.style, {



            fontSize: '48px',



            margin: '20px 0',



            fontFamily: "'Kenvector Future', sans-serif",



            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'



        });



        gameOverScreen.appendChild(gameOverText);







        const scoreText = document.createElement('h2');



        scoreText.textContent = `Level ${level} - Points: ${score}`;



        Object.assign(scoreText.style, {



            fontSize: '32px',



            margin: '10px 0',



            fontFamily: "'Kenvector Future', sans-serif",



            color: '#FFD700'



        });



        gameOverScreen.appendChild(scoreText);







        // Add restart text



        const restartText = document.createElement('p');



        restartText.textContent = 'Press ENTER to restart';



        Object.assign(restartText.style, {



            fontSize: '24px',



            margin: '20px 0',



            fontFamily: "'Kenvector Future', sans-serif",



            color: '#ffffff',



            animation: 'pulse 1.5s infinite'



        });



        gameOverScreen.appendChild(restartText);







        this.gameContainer.appendChild(gameOverScreen);







        const gameOverSound = new Audio('assets/game_over/sound.mp3');



        gameOverSound.volume = 0.5;



        gameOverSound.play().catch(e => console.error(e));







        // Add enter key listener for restart



        const restartHandler = (e) => {



            if (e.key === 'Enter') {



                document.removeEventListener('keydown', restartHandler);



                location.reload();



            }



        };



        document.addEventListener('keydown', restartHandler);







        // Add CSS animation for the pulsing effect



        const style = document.createElement('style');



        style.textContent = `



            @keyframes pulse {



                0% { opacity: 1; }



                50% { opacity: 0.5; }



                100% { opacity: 1; }



            }



        `;



        document.head.appendChild(style);



    }



}







window.onload = () => new GameUI();






