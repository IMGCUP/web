/**
 * Detection Utility Functions
 * Detect device capabilities, performance, and user preferences
 */

/**
 * Detect device performance level
 */
export function detectPerformance() {
    // Check device memory (if available)
    const memoryGB = navigator.deviceMemory || 4;
    
    // Check CPU cores
    const cores = navigator.hardwareConcurrency || 4;
    
    // Check connection type
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const connectionType = connection?.effectiveType || '4g';
    
    // Mobile check
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Calculate performance score
    if (memoryGB <= 2 || cores <= 2 || connectionType === 'slow-2g' || connectionType === '2g') {
        return 'low';
    } else if (memoryGB <= 4 || cores <= 4 || connectionType === '3g' || isMobile) {
        return 'medium';
    } else {
        return 'high';
    }
}

/**
 * Detect motion preference
 */
export function detectMotionPreference() {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    return mediaQuery.matches ? 'reduce' : 'no-preference';
}

/**
 * Detect color scheme preference
 */
export function detectColorScheme() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    return mediaQuery.matches ? 'dark' : 'light';
}

/**
 * Check if device is mobile
 */
export function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           window.innerWidth <= 768;
}

/**
 * Check if device is tablet
 */
export function isTablet() {
    return /(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(navigator.userAgent) ||
           (window.innerWidth > 768 && window.innerWidth <= 1024);
}

/**
 * Check if device is desktop
 */
export function isDesktop() {
    return !isMobile() && !isTablet();
}

/**
 * Get device type
 */
export function getDeviceType() {
    if (isMobile()) return 'mobile';
    if (isTablet()) return 'tablet';
    return 'desktop';
}

/**
 * Check browser capabilities
 */
export function checkCapabilities() {
    return {
        webgl: checkWebGL(),
        webgl2: checkWebGL2(),
        worker: typeof Worker !== 'undefined',
        serviceWorker: 'serviceWorker' in navigator,
        intersectionObserver: 'IntersectionObserver' in window,
        customElements: 'customElements' in window,
        modules: 'noModule' in HTMLScriptElement.prototype,
        grid: CSS.supports('display', 'grid'),
        flexbox: CSS.supports('display', 'flex'),
        backdropFilter: CSS.supports('backdrop-filter', 'blur(10px)') || 
                        CSS.supports('-webkit-backdrop-filter', 'blur(10px)'),
        aspectRatio: CSS.supports('aspect-ratio', '16/9'),
        gap: CSS.supports('gap', '1rem')
    };
}

/**
 * Check WebGL support
 */
function checkWebGL() {
    try {
        const canvas = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && 
                 (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
        return false;
    }
}

/**
 * Check WebGL2 support
 */
function checkWebGL2() {
    try {
        const canvas = document.createElement('canvas');
        return !!(window.WebGL2RenderingContext && canvas.getContext('webgl2'));
    } catch (e) {
        return false;
    }
}

/**
 * Get browser info
 */
export function getBrowserInfo() {
    const ua = navigator.userAgent;
    let browserName = 'Unknown';
    let browserVersion = 'Unknown';
    
    // Chrome
    if (ua.indexOf('Chrome') > -1 && ua.indexOf('Edg') === -1) {
        browserName = 'Chrome';
        browserVersion = ua.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
    }
    // Edge
    else if (ua.indexOf('Edg') > -1) {
        browserName = 'Edge';
        browserVersion = ua.match(/Edg\/(\d+)/)?.[1] || 'Unknown';
    }
    // Firefox
    else if (ua.indexOf('Firefox') > -1) {
        browserName = 'Firefox';
        browserVersion = ua.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
    }
    // Safari
    else if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) {
        browserName = 'Safari';
        browserVersion = ua.match(/Version\/(\d+)/)?.[1] || 'Unknown';
    }
    
    return {
        name: browserName,
        version: browserVersion,
        userAgent: ua
    };
}

/**
 * Check if PDF can be embedded
 */
export function canEmbedPDF() {
    // Check if browser supports PDF embedding
    const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    const isFirefox = /Firefox/.test(navigator.userAgent);
    const isEdge = /Edg/.test(navigator.userAgent);
    
    // Most modern browsers support PDF embedding except some mobile browsers
    if (isMobile()) {
        // Mobile Safari and some mobile browsers don't support PDF embedding well
        return false;
    }
    
    return isChrome || isFirefox || isEdge;
}

/**
 * Get viewport dimensions
 */
export function getViewport() {
    return {
        width: window.innerWidth,
        height: window.innerHeight,
        aspectRatio: window.innerWidth / window.innerHeight,
        orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
    };
}

/**
 * Monitor performance
 */
export function monitorPerformance(callback) {
    if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            callback(entries);
        });
        
        observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift'] });
        
        return observer;
    }
    
    return null;
}
