const gameConfig = {
    controls: {
        type: 'keyboard',
        keyboard: {
            left: 'ArrowLeft',
            right: 'ArrowRight',
            moveSpeed: 15
        }
    },
    cursor: {
        scale: 0.8,
        position: {
            bottom: 70,
            initialX: 400
        },
        assets: {
            default: 'assets/cursor/default.png'
        }
    },
    reacthion: {
        // Base duration when overdose is at maximum
        maxDuration: 4000,
        // Maximum music slowdown (0.5 = half speed, 1 = normal speed)
        maxMusicSlowdown: 0.5,
        // Maximum item speed multiplier (0.67 = slower, 1 = normal speed)
        maxSpeedMultiplier: 0.67,
        // How much to multiply the overdose percentage for effects (higher = stronger effects at lower overdose)
        intensityMultiplier: 1.4
    },
    health: {
        maxHealth: 100,
        overdose: {
            decreaseRate: 5,      // Amount to decrease per second
            decreaseInterval: 100, // Check every 100ms
            increaseAmount: 30,    // Amount to increase when catching heal
            // New settings for effect scaling
            minEffectThreshold: 10 // Minimum overdose percentage needed for effects to start
        }
    },
    objects: {
        catch: {
            star: {
                scale: 0.2,
                reactionScale: 0.5,
                points: 10,
                speedRange: { min: 6, max: 9 },
                assets: {
                    image: 'assets/catch/star/image.png',
                    sound: 'assets/catch/star/sound.mp3',
                    reaction: 'assets/catch/star/reacthion.png'
                }
            },
            coin: {
                scale: 0.08,
                reactionScale: 0.5,
                points: 15,
                speedRange: { min: 6, max: 9 },
                assets: {
                    image: 'assets/catch/coin/image.png',
                    sound: 'assets/catch/coin/sound.mp3',
                    reaction: 'assets/catch/coin/reacthion.png'
                }
            },
            heal: {
                scale: 0.3,
                reactionScale: 0.35,
                points: 5,
                healAmount: 25,
                speedRange: { min: 6, max: 9 },
                assets: {
                    image: 'assets/catch/heal/image.png',
                    sound: 'assets/catch/heal/sound.mp3',
                    reaction: 'assets/catch/heal/reacthion.png'
                }
            }
        },
        dodge: {
            asteroid: {
                scale: 0.16,
                reactionScale: 1.3,
                damage: 16,
                speedRange: { min: 3, max: 7 },
                assets: {
                    image: 'assets/dodge/asteroid/image.png',
                    sound: 'assets/dodge/asteroid/sound.mp3',
                    reaction: 'assets/dodge/asteroid/reacthion.png'
                }
            },
            meteor: {
                scale: 0.6,
                reactionScale: 1.3,
                damage: 20,
                speedRange: { min: 3, max: 7 },
                assets: {
                    image: 'assets/dodge/meteor/image.png',
                    sound: 'assets/dodge/meteor/sound.mp3',
                    reaction: 'assets/dodge/meteor/reacthion.png'
                }
            }
        }
    },
    spawn: {
        initialInterval: 1000,
        catchInitialInterval: 1500,
        minimumInterval: 500,
        intervalDecrease: 5
    },
    scoring: {
        basePoints: 10,
        multiplier: 1,
        pointsPerLevel: 100,
        speedIncreasePerLevel: 0.2
    }
};
