class ScreenEffects {
    constructor() {
        this.activeEffect = null;
        this.gameContainer = document.getElementById('game-container');
        this.backgroundMusic = document.getElementById('background-music');
        this.setupStyles();
    }

    setupStyles() {
        if (!document.getElementById('screen-effects-style')) {
            const style = document.createElement('style');
            style.id = 'screen-effects-style';
            style.textContent = `
                @keyframes rgbSplitRed {
                    0% { transform: translate(var(--split-x-red), var(--split-y-red)); }
                    50% { transform: translate(calc(var(--split-x-red) * 1.5), calc(var(--split-y-red) * 1.5)); }
                    100% { transform: translate(var(--split-x-red), var(--split-y-red)); }
                }
                @keyframes rgbSplitGreen {
                    0% { transform: translate(var(--split-x-green), var(--split-y-green)); }
                    50% { transform: translate(calc(var(--split-x-green) * 1.5), calc(var(--split-y-green) * 1.5)); }
                    100% { transform: translate(var(--split-x-green), var(--split-y-green)); }
                }
                @keyframes rgbSplitBlue {
                    0% { transform: translate(var(--split-x-blue), var(--split-y-blue)); }
                    50% { transform: translate(calc(var(--split-x-blue) * 1.5), calc(var(--split-y-blue) * 1.5)); }
                    100% { transform: translate(var(--split-x-blue), var(--split-y-blue)); }
                }
                .rgb-split-container {
                    position: relative;
                    --split-x-red: 12px;
                    --split-y-red: -4px;
                    --split-x-green: -10px;
                    --split-y-green: 6px;
                    --split-x-blue: -12px;
                    --split-y-blue: 4px;
                }
                .rgb-split-layer {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 1;
                }
                .rgb-split-red {
                    mix-blend-mode: screen;
                    animation: rgbSplitRed 1.5s ease-in-out infinite;
                    filter: brightness(var(--brightness));
                }
                .rgb-split-green {
                    mix-blend-mode: screen;
                    animation: rgbSplitGreen 1.5s ease-in-out infinite;
                    filter: brightness(var(--brightness));
                }
                .rgb-split-blue {
                    mix-blend-mode: screen;
                    animation: rgbSplitBlue 1.5s ease-in-out infinite;
                    filter: brightness(var(--brightness));
                }
            `;
            document.head.appendChild(style);
        }
    }

    static Effect = class {
        constructor(element) {
            this.element = element;
        }
        
        apply() {
            throw new Error('Effect.apply() must be implemented by subclass');
        }
        
        remove() {
            throw new Error('Effect.remove() must be implemented by subclass');
        }

        updateIntensity() {
            throw new Error('Effect.updateIntensity() must be implemented by subclass');
        }
    }

    static RGBSplitEffect = class extends ScreenEffects.Effect {
        apply() {
            this.element.classList.add('rgb-split-container');
            
            const redLayer = document.createElement('div');
            redLayer.className = 'rgb-split-layer rgb-split-red';
            
            const greenLayer = document.createElement('div');
            greenLayer.className = 'rgb-split-layer rgb-split-green';
            
            const blueLayer = document.createElement('div');
            blueLayer.className = 'rgb-split-layer rgb-split-blue';
            
            const gameObjects = this.element.querySelectorAll('.game-object');
            gameObjects.forEach(obj => {
                this.createClones(obj, redLayer, greenLayer, blueLayer);
            });
            
            this.element.appendChild(redLayer);
            this.element.appendChild(greenLayer);
            this.element.appendChild(blueLayer);
            
            this.redLayer = redLayer;
            this.greenLayer = greenLayer;
            this.blueLayer = blueLayer;

            this.observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach((node) => {
                            if (node instanceof Element && (node.classList.contains('game-object') || node.querySelector('.game-object'))) {
                                if (node.classList.contains('game-object')) {
                                    this.createClones(node, this.redLayer, this.greenLayer, this.blueLayer);
                                }
                                node.querySelectorAll('.game-object').forEach(gameObj => {
                                    this.createClones(gameObj, this.redLayer, this.greenLayer, this.blueLayer);
                                });
                            }
                        });
                        
                        mutation.removedNodes.forEach((node) => {
                            if (node instanceof Element) {
                                if (node.classList && node.classList.contains('game-object')) {
                                    const dataId = node.getAttribute('data-id');
                                    if (dataId) {
                                        this.removeClones(dataId);
                                    }
                                }
                                node.querySelectorAll('.game-object').forEach(gameObj => {
                                    const dataId = gameObj.getAttribute('data-id');
                                    if (dataId) {
                                        this.removeClones(dataId);
                                    }
                                });
                            }
                        });
                    }
                });
            });

            this.observer.observe(this.element, {
                childList: true,
                subtree: true
            });

            this.updateInterval = setInterval(() => {
                this.updateClonesPosition();
            }, 16);
        }

        updateIntensity(intensity) {
            // Update CSS variables for split distances
            const maxSplitX = 18; // Maximum split distance in pixels
            const maxSplitY = 10;
            
            const splitX = maxSplitX * intensity;
            const splitY = maxSplitY * intensity;
            
            this.element.style.setProperty('--split-x-red', `${splitX}px`);
            this.element.style.setProperty('--split-y-red', `${-splitY/2}px`);
            this.element.style.setProperty('--split-x-green', `${-splitX}px`);
            this.element.style.setProperty('--split-y-green', `${splitY}px`);
            this.element.style.setProperty('--split-x-blue', `${-splitX}px`);
            this.element.style.setProperty('--split-y-blue', `${splitY/2}px`);

            // Update brightness based on intensity
            const maxBrightness = 1.8;
            const brightness = 1 + (maxBrightness - 1) * intensity;
            this.element.style.setProperty('--brightness', brightness);

            // Update clone filters
            const updateLayerFilters = (layer, color) => {
                const clones = layer.querySelectorAll('[data-clone-id]');
                clones.forEach(clone => {
                    const opacity = 0.3 + (0.3 * intensity);
                    const saturation = 6000 + (6000 * intensity);
                    clone.style.filter = `opacity(${opacity}) brightness(${brightness}) sepia(1) saturate(${saturation}%) hue-rotate(${color})`;
                });
            };

            updateLayerFilters(this.redLayer, '-50deg');
            updateLayerFilters(this.greenLayer, '60deg');
            updateLayerFilters(this.blueLayer, '180deg');
        }

        createClones(obj, redLayer, greenLayer, blueLayer) {
            const dataId = obj.getAttribute('data-id') || 'game-object-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
            obj.setAttribute('data-id', dataId);

            const existingClone = redLayer.querySelector(`[data-clone-id="${dataId}"]`);
            if (existingClone) {
                return;
            }

            const redClone = obj.cloneNode(true);
            const greenClone = obj.cloneNode(true);
            const blueClone = obj.cloneNode(true);
            
            redClone.setAttribute('data-clone-id', dataId);
            greenClone.setAttribute('data-clone-id', dataId);
            blueClone.setAttribute('data-clone-id', dataId);
            
            redClone.style.filter = 'opacity(0.6) brightness(1.8) sepia(1) saturate(12000%) hue-rotate(-50deg)';
            greenClone.style.filter = 'opacity(0.6) brightness(1.8) sepia(1) saturate(12000%) hue-rotate(60deg)';
            blueClone.style.filter = 'opacity(0.6) brightness(1.8) sepia(1) saturate(12000%) hue-rotate(180deg)';
            
            redClone.style.top = obj.style.top;
            redClone.style.left = obj.style.left;
            redClone.style.transform = obj.style.transform;
            greenClone.style.top = obj.style.top;
            greenClone.style.left = obj.style.left;
            greenClone.style.transform = obj.style.transform;
            blueClone.style.top = obj.style.top;
            blueClone.style.left = obj.style.left;
            blueClone.style.transform = obj.style.transform;
            
            redLayer.appendChild(redClone);
            greenLayer.appendChild(greenClone);
            blueLayer.appendChild(blueClone);
        }

        removeClones(dataId) {
            const removeFromLayer = (layer, id) => {
                const clone = layer.querySelector(`[data-clone-id="${id}"]`);
                if (clone) {
                    clone.remove();
                }
            };
            
            removeFromLayer(this.redLayer, dataId);
            removeFromLayer(this.greenLayer, dataId);
            removeFromLayer(this.blueLayer, dataId);
        }

        updateClonesPosition() {
            const gameObjects = this.element.querySelectorAll('.game-object');
            gameObjects.forEach(obj => {
                const dataId = obj.getAttribute('data-id');
                if (dataId) {
                    const updateClonePosition = (layer, id) => {
                        const clone = layer.querySelector(`[data-clone-id="${id}"]`);
                        if (clone) {
                            clone.style.top = obj.style.top;
                            clone.style.left = obj.style.left;
                            clone.style.transform = obj.style.transform;
                            clone.style.width = obj.style.width;
                            clone.style.height = obj.style.height;
                            clone.className = obj.className;
                        }
                    };

                    updateClonePosition(this.redLayer, dataId);
                    updateClonePosition(this.greenLayer, dataId);
                    updateClonePosition(this.blueLayer, dataId);
                }
            });
        }

        remove() {
            if (this.observer) {
                this.observer.disconnect();
            }
            if (this.updateInterval) {
                clearInterval(this.updateInterval);
            }

            if (this.redLayer) this.redLayer.remove();
            if (this.greenLayer) this.greenLayer.remove();
            if (this.blueLayer) this.blueLayer.remove();
            
            this.element.classList.remove('rgb-split-container');
            this.element.style.removeProperty('--split-x-red');
            this.element.style.removeProperty('--split-y-red');
            this.element.style.removeProperty('--split-x-green');
            this.element.style.removeProperty('--split-y-green');
            this.element.style.removeProperty('--split-x-blue');
            this.element.style.removeProperty('--split-y-blue');
            this.element.style.removeProperty('--brightness');
        }
    }

    updateIntensity(intensity) {
        if (!this.activeEffect) {
            this.activeEffect = new ScreenEffects.RGBSplitEffect(this.gameContainer);
            this.activeEffect.apply();
        }
        this.activeEffect.updateIntensity(intensity);
    }

    removeEffects() {
        if (this.activeEffect) {
            this.activeEffect.remove();
            this.activeEffect = null;
        }
    }
}
