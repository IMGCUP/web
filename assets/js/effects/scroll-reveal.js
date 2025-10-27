/**
 * Scroll Reveal Effect Module
 * Handles scroll-triggered animations and parallax effects
 */

let observer = null;
let parallaxElements = [];
let isInitialized = false;

// Configuration
const config = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px',
    animationDuration: 800,
    animationDelay: 100,
    parallaxSpeed: 0.5
};

/**
 * Initialize scroll reveal effects
 */
export function initScrollReveal(customConfig = {}) {
    if (isInitialized) return;
    
    Object.assign(config, customConfig);
    
    // Set up Intersection Observer for reveal animations
    setupRevealObserver();
    
    // Set up parallax scrolling
    setupParallax();
    
    // Add CSS classes for animations
    addAnimationStyles();
    
    // Initial check for elements already in view
    checkElementsInView();
    
    isInitialized = true;
    
    console.log('📜 Scroll reveal effects initialized');
}

/**
 * Set up Intersection Observer for reveal animations
 */
function setupRevealObserver() {
    const observerOptions = {
        threshold: config.threshold,
        rootMargin: config.rootMargin
    };
    
    observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Add delay based on index for staggered animation
                setTimeout(() => {
                    entry.target.classList.add('reveal--visible');
                }, index * config.animationDelay);
                
                // Optional: Stop observing after animation
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe all elements with reveal class
    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(element => {
        observer.observe(element);
    });
}

/**
 * Set up parallax scrolling effect
 */
function setupParallax() {
    parallaxElements = Array.from(document.querySelectorAll('.parallax'));
    
    if (parallaxElements.length === 0) return;
    
    // Add scroll event listener with throttling
    let ticking = false;
    
    function updateParallax() {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                handleParallaxScroll();
                ticking = false;
            });
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', updateParallax);
    
    // Initial parallax positioning
    handleParallaxScroll();
}

/**
 * Handle parallax scrolling calculations
 */
function handleParallaxScroll() {
    const scrolled = window.pageYOffset;
    const windowHeight = window.innerHeight;
    
    parallaxElements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const elementTop = rect.top + scrolled;
        const elementHeight = element.offsetHeight;
        
        // Check if element is in viewport
        if (elementTop + elementHeight >= scrolled && elementTop <= scrolled + windowHeight) {
            // Calculate parallax offset
            const speed = element.dataset.parallaxSpeed || config.parallaxSpeed;
            const yPos = -(scrolled - elementTop) * speed;
            
            // Apply transform
            element.style.transform = `translateY(${yPos}px)`;
        }
    });
}

/**
 * Add animation styles dynamically
 */
function addAnimationStyles() {
    if (document.getElementById('scroll-reveal-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'scroll-reveal-styles';
    style.textContent = `
        .reveal {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity ${config.animationDuration}ms ease,
                       transform ${config.animationDuration}ms ease;
        }
        
        .reveal--visible {
            opacity: 1;
            transform: translateY(0);
        }
        
        .reveal--left {
            transform: translateX(-30px);
        }
        
        .reveal--left.reveal--visible {
            transform: translateX(0);
        }
        
        .reveal--right {
            transform: translateX(30px);
        }
        
        .reveal--right.reveal--visible {
            transform: translateX(0);
        }
        
        .reveal--scale {
            transform: scale(0.9);
        }
        
        .reveal--scale.reveal--visible {
            transform: scale(1);
        }
        
        .reveal--fade {
            transform: none;
        }
        
        .parallax {
            will-change: transform;
            transform: translateZ(0);
        }
        
        @media (prefers-reduced-motion: reduce) {
            .reveal,
            .parallax {
                transition: none !important;
                transform: none !important;
                opacity: 1 !important;
            }
        }
    `;
    
    document.head.appendChild(style);
}

/**
 * Check elements already in view on load
 */
function checkElementsInView() {
    const revealElements = document.querySelectorAll('.reveal');
    const windowHeight = window.innerHeight;
    
    revealElements.forEach(element => {
        const rect = element.getBoundingClientRect();
        
        // If element is already in view, reveal it immediately
        if (rect.top < windowHeight && rect.bottom > 0) {
            element.classList.add('reveal--visible');
        }
    });
}

/**
 * Add reveal class to element
 */
export function addReveal(element, type = '') {
    if (!element) return;
    
    element.classList.add('reveal');
    
    if (type) {
        element.classList.add(`reveal--${type}`);
    }
    
    if (observer) {
        observer.observe(element);
    }
}

/**
 * Add parallax effect to element
 */
export function addParallax(element, speed = config.parallaxSpeed) {
    if (!element) return;
    
    element.classList.add('parallax');
    element.dataset.parallaxSpeed = speed;
    
    parallaxElements.push(element);
    
    // Initial positioning
    handleParallaxScroll();
}

/**
 * Trigger reveal animation manually
 */
export function revealElement(element) {
    if (!element) return;
    
    element.classList.add('reveal--visible');
}

/**
 * Reset reveal animation
 */
export function resetReveal(element) {
    if (!element) return;
    
    element.classList.remove('reveal--visible');
}

/**
 * Destroy scroll reveal effects
 */
export function destroyScrollReveal() {
    if (observer) {
        observer.disconnect();
        observer = null;
    }
    
    parallaxElements = [];
    
    window.removeEventListener('scroll', handleParallaxScroll);
    
    // Remove added styles
    const styleElement = document.getElementById('scroll-reveal-styles');
    if (styleElement) {
        styleElement.remove();
    }
    
    isInitialized = false;
}

/**
 * Batch reveal elements with stagger
 */
export function batchReveal(elements, delay = 100) {
    if (!elements || elements.length === 0) return;
    
    elements.forEach((element, index) => {
        setTimeout(() => {
            revealElement(element);
        }, index * delay);
    });
}
