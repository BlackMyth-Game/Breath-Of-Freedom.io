# Black Myth: Breath of Freedom - Game Project Structure

## Core Files

### 1. index.html
- Main entry point of the game
- Sets up the basic HTML structure
- Contains menu screen and game container
- Links all necessary JavaScript files and CSS

### 2. styles.css
- Contains all game styling
- Defines animations and visual effects
- Handles layout and positioning
- Custom font implementation (@font-face)
- Responsive design elements

### 3. config.js
- Central configuration file
- Controls settings:
  - Keyboard controls and movement speed
  - Cursor properties
  - Game object properties (scale, points, speed)
  - Spawn rates and intervals
  - Scoring system

### 4. GameEngine.js
- Core game logic
- Handles:
  - Asset loading
  - Object spawning
  - Collision detection
  - Score tracking
  - Level progression
  - Game loop
  - Performance optimizations

### 5. GameUI.js
- User interface management
- Features:
  - Menu system
  - Custom cursor
  - Score display
  - Health bar
  - Floating text effects
  - Game over screen
  - Sound management

### 6. ScreenEffects.js
- Visual effects system
- Implements RGB split effect
- Handles:
  - Effect animations
  - Layer management
  - Dynamic object tracking
  - Performance optimization

## Asset Structure

### assets/
#### backgroun/
- back.jpg (Main game background)

#### catch/ (Collectible items)
##### coin/
- image.png (Coin sprite)
- reacthion.png (Collection effect)
- sound.mp3 (Collection sound)

##### heal/
- image.png (Health item sprite)
- reacthion.png (Collection effect)
- sound.mp3 (Collection sound)

##### star/
- image.png (Star sprite)
- reacthion.png (Collection effect)
- sound.mp3 (Collection sound)

#### cursor/
- default.png (Custom game cursor)

#### dodge/ (Hazardous items)
##### asteroid/
- image.png (Asteroid sprite)
- reacthion.png (Impact effect)
- sound.mp3 (Impact sound)

##### meteor/
- image.png (Meteor sprite)
- reacthion.png (Impact effect)
- sound.mp3 (Impact sound)

#### game_over/
- image.png (Game over screen)
- sound.mp3 (Game over sound)

#### music/
- mus.mp3 (Background music track)

#### text/
- sh.ttf (Custom game font)

## Game Mechanics

### Player Control
- Keyboard-based movement (left/right arrow keys)
- Fixed vertical position at bottom of screen
- Custom cursor visualization
- Real-time collision detection

### Gameplay Elements
1. Collectible Items:
   - Stars (10 points)
   - Coins (15 points)
   - Health items (25 HP restoration)

2. Hazards:
   - Asteroids (20 damage)
   - Meteors (25 damage)

### Progression System
- Dynamic level-based progression
- Increasing difficulty curve
- Speed multiplier scaling with levels
- Adaptive points requirement per level

### Visual Effects
- RGB split effect on healing
- Floating text for points and health
- Particle effects for collisions
- Screen shake and flash effects
- Dynamic visual feedback system

### Sound System
- Ambient background music
- Positional audio for effects
- Dynamic sound mixing
- Event-based sound triggers

## Technical Features

### Performance Optimizations
- Frame rate management (60 FPS target)
- Efficient collision system
- Object pooling for entities
- Asset preloading and caching
- Memory management

### Screen Effects System
- Modular effect pipeline
- Real-time RGB split shader
- Dynamic object tracking
- Performance-optimized rendering

### UI System
- Responsive layout design
- Real-time score updates
- Dynamic health visualization
- Smooth animations
- Adaptive game over screen
- Cross-browser compatibility
