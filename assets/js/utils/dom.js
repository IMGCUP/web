/**
 * DOM Utility Functions
 * Helper functions for DOM manipulation and data loading
 */

/**
 * Load site configuration from JSON
 */
export async function loadSiteData() {
    try {
        const response = await fetch('./data/site.json');
        if (!response.ok) throw new Error('Failed to load site configuration');
        return await response.json();
    } catch (error) {
        console.error('Error loading site data:', error);
        return getDefaultSiteData();
    }
}

/**
 * Get default site data as fallback
 */
function getDefaultSiteData() {
    return {
        project: {
            title: 'AI康斯特',
            tagline: 'AI對於企業窗口之應用與實作',
            demoUrl: '#'
        },
        assets: {},
        videos: [],
        effects: {
            particles: false,
            three: false,
            scrollReveal: false
        }
    };
}

/**
 * Get URL query parameter value
 */
export function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

/**
 * Query selector with error handling
 */
export function $(selector, context = document) {
    return context.querySelector(selector);
}

/**
 * Query selector all with error handling
 */
export function $$(selector, context = document) {
    return Array.from(context.querySelectorAll(selector));
}

/**
 * Create element with attributes
 */
export function createElement(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);
    
    // Set attributes
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'innerHTML') {
            element.innerHTML = value;
        } else if (key === 'textContent') {
            element.textContent = value;
        } else if (key.startsWith('data')) {
            const dataKey = key.replace('data', '').replace(/([A-Z])/g, '-$1').toLowerCase();
            element.dataset[dataKey.slice(1)] = value;
        } else {
            element.setAttribute(key, value);
        }
    });
    
    // Add children
    children.forEach(child => {
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        } else if (child instanceof HTMLElement) {
            element.appendChild(child);
        }
    });
    
    return element;
}

/**
 * Add event listener with delegation support
 */
export function on(element, event, selectorOrHandler, handler) {
    if (typeof selectorOrHandler === 'function') {
        // Direct event binding
        element.addEventListener(event, selectorOrHandler);
    } else {
        // Event delegation
        element.addEventListener(event, (e) => {
            const target = e.target.closest(selectorOrHandler);
            if (target) {
                handler.call(target, e);
            }
        });
    }
}

/**
 * Debounce function
 */
export function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function
 */
export function throttle(func, limit = 300) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Fade in element
 */
export function fadeIn(element, duration = 300) {
    element.style.opacity = 0;
    element.style.display = 'block';
    
    const start = performance.now();
    
    const fade = (timestamp) => {
        const elapsed = timestamp - start;
        const progress = elapsed / duration;
        
        if (progress < 1) {
            element.style.opacity = progress;
            requestAnimationFrame(fade);
        } else {
            element.style.opacity = 1;
        }
    };
    
    requestAnimationFrame(fade);
}

/**
 * Fade out element
 */
export function fadeOut(element, duration = 300) {
    const start = performance.now();
    const initialOpacity = parseFloat(window.getComputedStyle(element).opacity);
    
    const fade = (timestamp) => {
        const elapsed = timestamp - start;
        const progress = elapsed / duration;
        
        if (progress < 1) {
            element.style.opacity = initialOpacity * (1 - progress);
            requestAnimationFrame(fade);
        } else {
            element.style.opacity = 0;
            element.style.display = 'none';
        }
    };
    
    requestAnimationFrame(fade);
}
