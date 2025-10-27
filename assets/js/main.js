/**
 * Main JavaScript Entry Point
 * Handles initialization, data loading, and component registration
 */

// Import components
import { HeaderComponent } from './components/header.js';
import { FooterComponent } from './components/footer.js';

// Import utilities
import { loadSiteData, getQueryParam } from './utils/dom.js';
import { detectPerformance, detectMotionPreference } from './utils/detect.js';
import { initPDFFallback } from './utils/pdf-fallback.js';

// Import effects (lazy loaded based on config)
let particlesModule = null;
let threeModule = null;
let scrollModule = null;
let breathingBorderModule = null;

// Global site configuration
let siteConfig = null;

/**
 * Initialize the application
 */
async function init() {
    try {
        // Load site configuration
        siteConfig = await loadSiteData();
        
        // Check for effect overrides
        const noEffects = checkNoEffects();
        
        // Register Web Components
        registerComponents();
        
        // Set up navigation
        setupNavigation();
        
        // Initialize page-specific features
        initPageFeatures();
        
        // Load effects if enabled
        if (!noEffects) {
            await loadEffects();
        }
        
        // Update demo links
        updateDemoLinks();
        
        console.log('🚀 AI 客服專題網站已成功初始化');
        
    } catch (error) {
        console.error('初始化失敗:', error);
    }
}

/**
 * Check if effects should be disabled
 */
function checkNoEffects() {
    // Check URL parameter
    const fxParam = getQueryParam('fx');
    if (fxParam === 'off') {
        document.body.classList.add('no-effects');
        return true;
    }
    
    // Check motion preference
    if (detectMotionPreference() === 'reduce') {
        document.body.classList.add('no-effects');
        return true;
    }
    
    // Check performance
    const performance = detectPerformance();
    if (performance === 'low') {
        document.body.classList.add('no-effects');
        return true;
    }
    
    // Check config
    if (siteConfig?.effects) {
        const allDisabled = !siteConfig.effects.particles && 
                          !siteConfig.effects.three && 
                          !siteConfig.effects.scrollReveal &&
                          !siteConfig.effects.breathingBorder;
        if (allDisabled) {
            document.body.classList.add('no-effects');
            return true;
        }
    }
    
    return false;
}

/**
 * Register Web Components
 */
function registerComponents() {
    customElements.define('x-header', HeaderComponent);
    customElements.define('x-footer', FooterComponent);
}

/**
 * Set up navigation
 */
function setupNavigation() {
    // Highlight active page
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('[data-nav-link]');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('nav__link--active');
        }
    });
    
    // Mobile menu toggle
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('nav__menu--open');
        });
    }
}

/**
 * Initialize page-specific features
 */
function initPageFeatures() {
    const path = window.location.pathname;
    
    switch(path) {
        case '/':
        case '/index.html':
            initHomePage();
            break;
        case '/slides.html':
            initSlidesPage();
            break;
        case '/videos.html':
            initVideosPage();
            break;
        case '/poster.html':
            initPosterPage();
            break;
        case '/intro.html':
            initIntroPage();
            break;
    }
}

/**
 * Initialize home page
 */
function initHomePage() {
    // Home page specific initialization
    console.log('首頁已載入');
}

/**
 * Initialize slides page
 */
function initSlidesPage() {
    const pdfFrame = document.getElementById('slides-pdf');
    const fallbackElement = document.getElementById('pdf-fallback');
    
    if (pdfFrame && siteConfig?.assets?.slidesPdf) {
        pdfFrame.src = siteConfig.assets.slidesPdf;
        
        initPDFFallback(pdfFrame, fallbackElement, {
            newWindowLink: document.getElementById('pdf-new-window'),
            pdfUrl: siteConfig.assets.slidesPdf
        });
    }
}

/**
 * Initialize videos page
 */
async function initVideosPage() {
    const videosGrid = document.getElementById('videos-grid');
    
    if (videosGrid && siteConfig?.videos) {
        // Clear existing content
        videosGrid.innerHTML = '';
        
        // Create video cards
        siteConfig.videos.forEach(video => {
            const card = createVideoCard(video);
            videosGrid.appendChild(card);
        });
        
        // Set up modal
        setupVideoModal();
    }
}

/**
 * Create a video card element
 */
function createVideoCard(video) {
    const card = document.createElement('div');
    card.className = 'video-card reveal';
    card.dataset.videoId = video.youtubeId;
    
    card.innerHTML = `
        <div class="video-card__thumbnail">
            <img src="https://i.ytimg.com/vi/${video.youtubeId}/maxresdefault.jpg" 
                 alt="${video.title}" 
                 onerror="this.src='https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg'">
            <div class="video-card__play">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                </svg>
            </div>
        </div>
        <div class="video-card__title">
            ${video.title}
        </div>
    `;
    
    card.addEventListener('click', () => openVideoModal(video.youtubeId));
    
    return card;
}

/**
 * Set up video modal
 */
function setupVideoModal() {
    const modal = document.getElementById('video-modal');
    const closeBtn = document.getElementById('close-modal');
    
    if (modal && closeBtn) {
        closeBtn.addEventListener('click', closeVideoModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeVideoModal();
            }
        });
    }
}

/**
 * Open video modal
 */
function openVideoModal(videoId) {
    const modal = document.getElementById('video-modal');
    const playerContainer = document.getElementById('video-player');
    
    if (modal && playerContainer) {
        playerContainer.innerHTML = `
            <iframe 
                width="100%" 
                height="450" 
                src="https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
            </iframe>
        `;
        modal.classList.add('modal--open');
    }
}

/**
 * Close video modal
 */
function closeVideoModal() {
    const modal = document.getElementById('video-modal');
    const playerContainer = document.getElementById('video-player');
    
    if (modal && playerContainer) {
        modal.classList.remove('modal--open');
        // Clear iframe to stop video
        setTimeout(() => {
            playerContainer.innerHTML = '';
        }, 300);
    }
}

/**
 * Initialize poster page
 */
function initPosterPage() {
    const posterImage = document.getElementById('poster-image');
    const posterNewWindow = document.getElementById('poster-new-window');
    
    // Load poster image if available
    if (posterImage && siteConfig?.assets?.posterImage) {
        posterImage.src = siteConfig.assets.posterImage;
    }
    
    // Set up new window link for poster
    if (posterNewWindow && siteConfig?.assets?.posterPdf) {
        posterNewWindow.href = siteConfig.assets.posterPdf;
    } else if (posterNewWindow && siteConfig?.assets?.posterImage) {
        posterNewWindow.href = siteConfig.assets.posterImage;
    }
}

/**
 * Initialize intro page
 */
function initIntroPage() {
    const pdfFrame = document.getElementById('intro-pdf');
    const fallbackElement = document.getElementById('intro-pdf-fallback');
    
    if (pdfFrame && siteConfig?.assets?.introPdf) {
        pdfFrame.src = siteConfig.assets.introPdf;
        
        initPDFFallback(pdfFrame, fallbackElement, {
            newWindowLink: document.getElementById('intro-new-window'),
            pdfUrl: siteConfig.assets.introPdf
        });
    }
}

/**
 * Load effects modules dynamically
 */
async function loadEffects() {
    if (!siteConfig?.effects) return;
    
    const promises = [];
    
    // Load particles effect
    if (siteConfig.effects.particles) {
        promises.push(
            import('./effects/particles.js').then(module => {
                particlesModule = module;
                module.initParticles();
            })
        );
    }
    
    // Load 3D effect
    if (siteConfig.effects.three) {
        promises.push(
            import('./effects/three-hero.js').then(module => {
                threeModule = module;
                module.initThreeHero();
            })
        );
    }
    
    // Load scroll reveal
    if (siteConfig.effects.scrollReveal) {
        promises.push(
            import('./effects/scroll-reveal.js').then(module => {
                scrollModule = module;
                module.initScrollReveal();
            })
        );
    }
    
    // Load breathing border effect
    if (siteConfig.effects.breathingBorder) {
        promises.push(
            import('./effects/breathing-border.js').then(module => {
                breathingBorderModule = module;
                module.initBreathingBorder({
                    showCorners: false,  // 不顯示角落裝飾
                    intensity: 'normal',
                    color: 'primary'
                });
            })
        );
    }
    
    await Promise.all(promises);
}

/**
 * Update all demo links to open modal
 */
function updateDemoLinks() {
    if (!siteConfig?.project?.demoUrl) return;
    
    // Load demo modal
    loadDemoModal();
    
    // Update all demo links to open modal instead of direct link
    const demoLinks = document.querySelectorAll('[data-demo-link]');
    demoLinks.forEach(link => {
        link.href = '#';
        link.addEventListener('click', (e) => {
            e.preventDefault();
            openDemoModal();
        });
    });
}

/**
 * Load demo modal partial
 */
async function loadDemoModal() {
    try {
        const response = await fetch('/partials/demo-modal.html');
        const html = await response.text();
        
        // Insert modal into body
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = html;
        document.body.appendChild(modalContainer.firstElementChild);
        
        // Initialize modal
        initDemoModal();
    } catch (error) {
        console.error('Failed to load demo modal:', error);
    }
}

/**
 * Initialize demo modal events
 */
function initDemoModal() {
    const modal = document.getElementById('demo-modal');
    const frontendLink = document.getElementById('demo-frontend');
    const backendLink = document.getElementById('demo-backend');
    const closeBtn = document.getElementById('demo-modal-close');
    
    if (!modal || !frontendLink || !backendLink) return;
    
    // Set URLs from config
    if (typeof siteConfig.project.demoUrl === 'object') {
        frontendLink.href = siteConfig.project.demoUrl.frontend || '#';
        backendLink.href = siteConfig.project.demoUrl.backend || '#';
    }
    
    // Close button
    if (closeBtn) {
        closeBtn.addEventListener('click', closeDemoModal);
    }
    
    // Click outside to close
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeDemoModal();
        }
    });
    
    // ESC key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('demo-modal--open')) {
            closeDemoModal();
        }
    });
}

/**
 * Open demo modal
 */
function openDemoModal() {
    const modal = document.getElementById('demo-modal');
    if (modal) {
        modal.classList.add('demo-modal--open');
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Close demo modal
 */
function closeDemoModal() {
    const modal = document.getElementById('demo-modal');
    if (modal) {
        modal.classList.remove('demo-modal--open');
        document.body.style.overflow = '';
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
