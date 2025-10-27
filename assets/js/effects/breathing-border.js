/**
 * Breathing Border Effect Module
 * Creates animated glowing border around the screen edges
 */

let borderElement = null;
let cornerElements = [];
let isInitialized = false;

/**
 * Initialize breathing border effect
 */
export function initBreathingBorder(options = {}) {
    if (isInitialized) return;
    
    const {
        showCorners = false,  // 預設不顯示角落
        intensity = 'normal', // 'subtle', 'normal', 'intense'
        color = 'primary' // 'primary', 'accent', 'dual'
    } = options;
    
    // Create main border element
    createBorderElement(intensity, color);
    
    // Create corner accents
    if (showCorners) {
        createCornerElements();
    }
    
    isInitialized = true;
    
    console.log('💫 Breathing border effect initialized');
}

/**
 * Create the main breathing border element
 * Note: pointer-events: none is set in CSS to ensure it doesn't block any interactions
 */
function createBorderElement(intensity, color) {
    borderElement = document.createElement('div');
    borderElement.className = 'breathing-border';
    
    // Ensure pointer-events is none (redundant with CSS, but explicit)
    borderElement.style.pointerEvents = 'none';
    
    // Apply intensity class
    if (intensity === 'subtle') {
        borderElement.style.opacity = '0.5';
    } else if (intensity === 'intense') {
        borderElement.style.opacity = '1';
    }
    
    // Apply color variation
    if (color === 'accent') {
        borderElement.style.setProperty('--border-color-primary', 'var(--c-accent)');
        borderElement.style.setProperty('--border-color-secondary', 'var(--c-primary)');
    }
    
    document.body.appendChild(borderElement);
}

/**
 * Create corner accent elements
 * Note: pointer-events: none ensures corners don't block interactions
 * Only creates top corners (tl, tr) - bottom corners are hidden
 */
function createCornerElements() {
    const corners = ['tl', 'tr'];  // 只創建上方角落
    
    corners.forEach(position => {
        const corner = document.createElement('div');
        corner.className = `breathing-border-corner breathing-border-corner--${position}`;
        corner.style.pointerEvents = 'none';
        document.body.appendChild(corner);
        cornerElements.push(corner);
    });
}

/**
 * Update breathing border intensity
 */
export function updateIntensity(intensity) {
    if (!borderElement) return;
    
    switch(intensity) {
        case 'subtle':
            borderElement.style.opacity = '0.5';
            break;
        case 'normal':
            borderElement.style.opacity = '0.8';
            break;
        case 'intense':
            borderElement.style.opacity = '1';
            break;
    }
}

/**
 * Toggle corner accents
 */
export function toggleCorners(show) {
    cornerElements.forEach(corner => {
        corner.style.display = show ? 'block' : 'none';
    });
}

/**
 * Pause breathing animation
 */
export function pauseBreathing() {
    if (borderElement) {
        borderElement.style.animationPlayState = 'paused';
    }
    cornerElements.forEach(corner => {
        corner.style.animationPlayState = 'paused';
    });
}

/**
 * Resume breathing animation
 */
export function resumeBreathing() {
    if (borderElement) {
        borderElement.style.animationPlayState = 'running';
    }
    cornerElements.forEach(corner => {
        corner.style.animationPlayState = 'running';
    });
}

/**
 * Change breathing speed
 */
export function setBreathingSpeed(speed) {
    if (!borderElement) return;
    
    const duration = speed === 'slow' ? '6s' : 
                    speed === 'fast' ? '2s' : '4s';
    
    borderElement.style.animationDuration = duration;
}

/**
 * Destroy breathing border effect
 */
export function destroyBreathingBorder() {
    if (borderElement) {
        borderElement.remove();
        borderElement = null;
    }
    
    cornerElements.forEach(corner => corner.remove());
    cornerElements = [];
    
    isInitialized = false;
}

/**
 * Check if breathing border is active
 */
export function isActive() {
    return isInitialized && borderElement !== null;
}
