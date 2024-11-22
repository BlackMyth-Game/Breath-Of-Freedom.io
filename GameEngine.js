class GameEngine {
    constructor(ui) {
        this.ui = ui;
        this.GAME_WIDTH = 800;
        this.GAME_HEIGHT = 600;
        this.score = 0;
        this.level = 1;
        this.health = 100;
        this.overdose = 0;
        this.objects = [];
        this.assets = { dodge: {}, catch: {}, cursor: null };
        this.lastSpawn = 0;
        this.spawnInterval = gameConfig.spawn.initialInterval;
        this.gameActive = false;
        this.inCooldown = false;
        this.COOLDOWN_DURATION = 400;
        this.screenEffects = new ScreenEffects();
        this.lastEffectUpdate = 0;
        this.EFFECT_UPDATE_INTERVAL = 100; // Update effects every 100ms

        // Performance optimizations
        this.lastFrame = 0;
        this.FPS = 60;
        this.frameInterval = 1000 / this.FPS;
        this.MAX_OBJECTS = 8;
        this.MIN_OBJECTS = 3;

        // Collision check optimizations
        this.lastCollisionCheck = 0;
        this.COLLISION_CHECK_INTERVAL = 250;

        // Overdose decrease interval
        this.lastOverdoseDecrease = 0;
    }

    calculateEffectIntensity() {
        const overdosePercent = this.overdose;
        if (overdosePercent <= gameConfig.health.overdose.minEffectThreshold) {
            return 0;
        }

        // Calculate intensity with multiplier, capped at 100%
        const intensity = Math.min(
            (overdosePercent - gameConfig.health.overdose.minEffectThreshold) * 
            gameConfig.reacthion.intensityMultiplier / 
            (100 - gameConfig.health.overdose.minEffectThreshold),
            1
        );
        return intensity;
    }

    updateEffects() {
        const now = Date.now();
        if (now - this.lastEffectUpdate >= this.EFFECT_UPDATE_INTERVAL) {
            const intensity = this.calculateEffectIntensity();
            
            // Update music speed
            const backgroundMusic = document.getElementById('background-music');
            if (backgroundMusic) {
                const musicSpeed = 1 - (intensity * (1 - gameConfig.reacthion.maxMusicSlowdown));
                backgroundMusic.playbackRate = musicSpeed;
            }

            // Update screen effects
            if (intensity > 0) {
                this.screenEffects.updateIntensity(intensity);
            } else {
                this.screenEffects.removeEffects();
            }

            // Update object speeds
            this.updateObjectSpeeds();

            this.lastEffectUpdate = now;
        }
    }

    async loadAssets() {
        for (const type in gameConfig.objects) {
            for (const name in gameConfig.objects[type]) {
                const config = gameConfig.objects[type][name];
                const image = await this.loadImage(config.assets.image).catch(e => console.error(e));
                const sound = await this.loadSound(config.assets.sound).catch(e => console.error(e));
                const reaction = await this.loadImage(config.assets.reaction).catch(e => console.error(e));

                this.assets[type][name] = { image, sound, reaction };
            }
        }
    }

    loadImage(src) {
        return new Promise((res, rej) => {
            const img = new Image();
            img.onload = () => res(img);
            img.onerror = e => rej(e);
            img.src = src;
        });
    }

    loadSound(src) {
        return new Promise((res, rej) => {
            const audio = new Audio(src);
            audio.oncanplaythrough = () => res(audio);
            audio.onerror = e => rej(e);
            audio.load();
        });
    }

    spawnObject() {
        const now = Date.now();
        if (this.objects.length < this.MIN_OBJECTS || 
            (now - this.lastSpawn >= this.spawnInterval && this.objects.length < this.MAX_OBJECTS)) {
            
            const type = Math.random() < 0.5 ? 'dodge' : 'catch';
            const keys = Object.keys(gameConfig.objects[type]);
            if (!keys.length) return;

            const key = keys[Math.floor(Math.random() * keys.length)];
            const asset = this.assets[type][key];
            const config = gameConfig.objects[type][key];

            const obj = document.createElement('div');
            obj.className = 'game-object';
            obj.dataset.type = type;
            obj.dataset.key = key;

            const scaledWidth = asset.image.width * config.scale;
            const scaledHeight = asset.image.height * config.scale;
            const x = Math.random() * (this.GAME_WIDTH - scaledWidth);

            Object.assign(obj.style, {
                left: `${x}px`,
                top: '-50px',
                width: `${scaledWidth}px`,
                height: `${scaledHeight}px`,
                backgroundImage: `url(${asset.image.src})`,
                backgroundSize: '100% 100%',
                backgroundRepeat: 'no-repeat',
                position: 'absolute'
            });

            this.ui.gameArea.appendChild(obj);

            const speedMultiplier = 1 + (this.level - 1) * gameConfig.scoring.speedIncreasePerLevel;
            const baseSpeed = config.speedRange.min + Math.random() * (config.speedRange.max - config.speedRange.min);
            const intensity = this.calculateEffectIntensity();
            const slowdownMultiplier = 1 - (intensity * (1 - gameConfig.reacthion.maxSpeedMultiplier));
            const adjustedSpeed = baseSpeed * speedMultiplier * slowdownMultiplier;

            this.objects.push({
                element: obj,
                speed: adjustedSpeed,
                baseSpeed: baseSpeed,
                type,
                key,
                x: x,
                y: -50,
                width: scaledWidth,
                height: scaledHeight
            });

            if (this.objects.length >= this.MIN_OBJECTS) {
                this.spawnInterval = Math.max(gameConfig.spawn.minimumInterval, this.spawnInterval - gameConfig.spawn.intervalDecrease);
            }
            this.lastSpawn = now;
        }
    }

    updateObjectSpeeds() {
        const intensity = this.calculateEffectIntensity();
        const slowdownMultiplier = 1 - (intensity * (1 - gameConfig.reacthion.maxSpeedMultiplier));
        
        this.objects.forEach(obj => {
            const speedMultiplier = 1 + (this.level - 1) * gameConfig.scoring.speedIncreasePerLevel;
            const adjustedSpeed = obj.baseSpeed * speedMultiplier * slowdownMultiplier;
            obj.speed = adjustedSpeed;
        });
    }

    isColliding(rect1, rect2) {
        const padding = 10;
        return (rect1.left - padding) < (rect2.right + padding) &&
            (rect1.right + padding) > (rect2.left - padding) &&
            (rect1.top - padding) < (rect2.bottom + padding) &&
            (rect1.bottom + padding) > (rect2.top - padding);
    }

    checkCollisions() {
        const bottom = this.GAME_HEIGHT - gameConfig.cursor.position.bottom;
        const cursorWidth = this.assets.cursor.width * gameConfig.cursor.scale;
        const cursorHeight = this.assets.cursor.height * gameConfig.cursor.scale;
        const cursorX = this.ui.cursorX - cursorWidth / 2;
        const cursorY = bottom - cursorHeight / 2;

        const cursorRect = {
            left: cursorX,
            right: cursorX + cursorWidth,
            top: cursorY,
            bottom: cursorY + cursorHeight
        };

        if (!this.inCooldown) {
            const collidingDodgeObj = this.objects.find(obj => {
                if (obj.type !== 'dodge') return false;
                const objRect = {
                    left: obj.x,
                    right: obj.x + obj.width,
                    top: obj.y,
                    bottom: obj.y + obj.height
                };
                return this.isColliding(cursorRect, objRect);
            });

            if (collidingDodgeObj) {
                this.handleCollision(collidingDodgeObj);
                return;
            }
        }

        const collidingCatchObj = this.objects.find(obj => {
            if (obj.type !== 'catch') return false;
            const objRect = {
                left: obj.x,
                right: obj.x + obj.width,
                top: obj.y,
                bottom: obj.y + obj.height
            };
            return this.isColliding(cursorRect, objRect);
        });

        if (collidingCatchObj) {
            this.handleCollision(collidingCatchObj);
        }
    }

    handleCollision(obj) {
        const asset = this.assets[obj.type][obj.key];
        const config = gameConfig.objects[obj.type][obj.key];
        const sound = asset.sound.cloneNode();
        sound.volume = 0.5;
        sound.play().catch(e => console.error(e));

        if (obj.type === 'dodge') {
            this.inCooldown = true;
            setTimeout(() => {
                this.inCooldown = false;
            }, this.COOLDOWN_DURATION);
        }

        this.ui.changeCursor(asset.reaction, config.reactionScale);
        
        if (obj.type === 'catch') {
            if (obj.key === 'heal') {
                // Only increase overdose and health for heal items
                this.overdose = Math.min(100, this.overdose + gameConfig.health.overdose.increaseAmount);
                this.health = Math.min(100, this.health + config.healAmount);
                this.ui.updateOverdoseBar(this.overdose);
                this.ui.updateHealthBar(this.health);
                
                // Show floating heal text
                this.ui.createFloatingText(`+${config.healAmount}`, 'heal', 
                    obj.x + obj.width / 2, 
                    obj.y);
            } else {
                // Show floating score text for non-heal items
                this.ui.createFloatingText(`+${config.points}`, 'score', 
                    obj.x + obj.width / 2, 
                    obj.y);
            }
            this.score += config.points * gameConfig.scoring.multiplier;
            this.ui.updateScore(this.score, this.level);
            this.checkLevelUp();
        } else {
            const prevHealth = this.health;
            this.health = Math.max(0, this.health - config.damage);
            this.ui.updateHealthBar(this.health);
            this.ui.createFloatingText(`-${config.damage}`, 'damage', 
                obj.x + obj.width / 2, 
                obj.y);
        }

        obj.element.remove();
        this.objects = this.objects.filter(o => o !== obj);
    }

    updateObjects() {
        this.objects.forEach(obj => {
            obj.y += obj.speed;
            obj.element.style.top = `${obj.y}px`;
        });

        this.objects = this.objects.filter(obj => {
            if (obj.y > this.GAME_HEIGHT) {
                obj.element.remove();
                return false;
            }
            return true;
        });
    }

    updateOverdose() {
        const now = Date.now();
        if (this.overdose > 0 && now - this.lastOverdoseDecrease >= gameConfig.health.overdose.decreaseInterval) {
            const decreaseAmount = (gameConfig.health.overdose.decreaseRate * gameConfig.health.overdose.decreaseInterval) / 1000;
            this.overdose = Math.max(0, this.overdose - decreaseAmount);
            this.ui.updateOverdoseBar(this.overdose);
            this.lastOverdoseDecrease = now;
        }
    }

    checkLevelUp() {
        const pointsForNextLevel = this.level * gameConfig.scoring.pointsPerLevel;
        if (this.score >= pointsForNextLevel) {
            const oldLevel = this.level;
            this.level++;
            const speedMultiplier = 1 + (this.level - 1) * gameConfig.scoring.speedIncreasePerLevel;
            
            this.ui.createFloatingText(`speed x${speedMultiplier.toFixed(1)}`, 'speed', 
                this.ui.cursorX,
                this.GAME_HEIGHT - gameConfig.cursor.position.bottom - 50);
                
            this.ui.updateScore(this.score, this.level);
            this.updateObjectSpeeds();
        }
    }

    gameLoop() {
        if (!this.gameActive) return;

        const now = Date.now();
        const elapsed = now - this.lastFrame;

        if (elapsed > this.frameInterval) {
            this.lastFrame = now - (elapsed % this.frameInterval);

            this.spawnObject();
            this.updateObjects();
            this.updateOverdose();
            this.updateEffects();
            this.ui.updateMovement();

            if (now - this.lastCollisionCheck >= this.COLLISION_CHECK_INTERVAL) {
                this.checkCollisions();
                this.lastCollisionCheck = now;
            }
        }

        if (this.health > 0 && this.overdose < 100) {
            requestAnimationFrame(() => this.gameLoop());
        } else {
            this.ui.showGameOver(this.score, this.level);
        }
    }
}
