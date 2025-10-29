/**
 * Main JavaScript Entry Point
 * Handles initialization, data loading, and component registration
 */

// ========================================
// Preloader Manager
// ========================================

class PreloaderManager {
    constructor(options = {}) {
        this.minDuration = options.minDuration || 2000;
        this.maxDuration = options.maxDuration || 3000;
        this.sessionOnce = options.sessionOnce || false;
        this.element = null;
        this.startTime = null;
        this.isShown = false;
    }

    /**
     * 顯示 preloader overlay
     */
    show() {
        // 檢查 sessionOnce
        if (this.sessionOnce && sessionStorage.getItem('preloader_seen')) {
            return false;
        }

        // 檢查 URL 參數
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('no-preloader') === '1') {
            return false;
        }

        // 記錄開始時間
        this.startTime = Date.now();

        // 建立 preloader DOM
        this.element = document.createElement('div');
        this.element.className = 'preloader';
        this.element.setAttribute('role', 'status');
        this.element.setAttribute('aria-live', 'polite');
        this.element.setAttribute('aria-label', '正在載入網站資源');
        
        this.element.innerHTML = `
            <div class="preloader__backdrop"></div>
            <div class="preloader__logo">AI康斯特</div>
            <div class="preloader__subtitle">正在載入...</div>
            <div class="preloader__progress">
                <div class="preloader__progress-bar"></div>
            </div>
        `;

        // 注入到 body 最前面
        if (document.body) {
            document.body.insertBefore(this.element, document.body.firstChild);
        } else {
            // 如果 body 還沒準備好，等待
            document.addEventListener('DOMContentLoaded', () => {
                document.body.insertBefore(this.element, document.body.firstChild);
            });
        }

        // 套用 HTML 類別
        document.documentElement.classList.add('is-preloading');

        this.isShown = true;

        // 標記 sessionStorage
        if (this.sessionOnce) {
            sessionStorage.setItem('preloader_seen', '1');
        }

        return true;
    }

    /**
     * 等待關鍵資源載入
     */
    async waitForCritical() {
        const promises = [];

        // 1. 等待字型（限時 1000ms）
        if (document.fonts) {
            const fontPromise = Promise.race([
                document.fonts.ready,
                new Promise(resolve => setTimeout(resolve, 1000))
            ]);
            promises.push(fontPromise);
        }

        // 2. 等待標記為 data-preload 的圖片（如有）
        const preloadImages = document.querySelectorAll('img[data-preload], [data-preload-bg]');
        if (preloadImages.length > 0) {
            const imagePromises = Array.from(preloadImages).map(img => {
                return new Promise((resolve) => {
                    if (img.complete) {
                        resolve();
                    } else {
                        img.addEventListener('load', resolve);
                        img.addEventListener('error', resolve);
                        // 圖片逾時 800ms
                        setTimeout(resolve, 800);
                    }
                });
            });
            promises.push(Promise.all(imagePromises));
        }

        // 3. 等待所有 Promise（但不超過 maxDuration）
        try {
            await Promise.race([
                Promise.all(promises),
                new Promise(resolve => setTimeout(resolve, this.maxDuration))
            ]);
        } catch (error) {
            console.warn('部分資源載入失敗:', error);
        }
    }

    /**
     * 隱藏 preloader
     */
    hide() {
        if (!this.isShown || !this.element) return;

        // 計算已經顯示的時間
        const elapsedTime = Date.now() - this.startTime;
        const remainingTime = Math.max(0, this.minDuration - elapsedTime);

        // 確保至少顯示 minDuration
        setTimeout(() => {
            this.element.classList.add('preloader--hidden');
            document.documentElement.classList.remove('is-preloading');

            // 400ms 後移除 DOM
            setTimeout(() => {
                if (this.element && this.element.parentNode) {
                    this.element.parentNode.removeChild(this.element);
                }
                this.element = null;
                this.isShown = false;
            }, 400);
        }, remainingTime);
    }

    /**
     * 執行完整流程
     */
    async run() {
        const shown = this.show();
        if (!shown) {
            return; // 被跳過或已顯示過
        }

        // 等待資源或達到最大時間
        await this.waitForCritical();

        // 隱藏（會自動處理最小顯示時間）
        this.hide();
    }
}

// 建立全域 preloader 實例
const preloader = new PreloaderManager({
    minDuration: 2000,
    maxDuration: 3000,
    sessionOnce: true
});

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
        
        // Initialize side decoration triggers
        initSideDecoTriggers();
        
        // Load effects if enabled
        if (!noEffects) {
            await loadEffects();
        }
        
        // Update demo links
        await updateDemoLinks();
        
        console.log('🚀 AI康斯特網站已成功初始化');
        
        // 初始化完成，通知 preloader 可以隱藏
        // preloader 會自動處理最小顯示時間
        if (preloader.isShown) {
            preloader.hide();
        }
        
    } catch (error) {
        console.error('初始化失敗:', error);
        // 即使初始化失敗也要隱藏 preloader
        if (preloader.isShown) {
            preloader.hide();
        }
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
 * Initialize side decoration triggers
 * 監聽指定區域的 reveal 元素，與卡片出現時機同步
 */
function initSideDecoTriggers() {
    const delayedDecos = document.querySelectorAll('.side-deco--delayed');
    
    if (delayedDecos.length === 0) return;
    
    // 為每個延遲顯示的裝飾設置觀察器
    delayedDecos.forEach(deco => {
        const triggerSelector = deco.getAttribute('data-trigger');
        if (!triggerSelector) return;
        
        const triggerSection = document.getElementById(triggerSelector);
        if (!triggerSection) return;
        
        // 找到該區域內的第一個 reveal 元素（通常是卡片）
        const firstRevealElement = triggerSection.querySelector('.reveal');
        if (!firstRevealElement) return;
        
        // 檢查元素是否已經在視窗內
        const rect = firstRevealElement.getBoundingClientRect();
        const isInView = rect.top < window.innerHeight && rect.bottom > 0;
        
        if (isInView) {
            // 如果元素已經在視窗內，延遲一小段時間再觸發動畫
            // 確保 DOM 已經準備好且動畫可以正常播放
            requestAnimationFrame(() => {
                setTimeout(() => {
                    deco.classList.add('is-visible');
                }, 50);
            });
        } else {
            // 如果元素不在視窗內，使用 Intersection Observer 監聽
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // 當第一個卡片開始 reveal 時，同時顯示側邊裝飾
                        deco.classList.add('is-visible');
                        // 只觸發一次
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                // 使用與 scroll-reveal 相同的設定
                threshold: 0.1,
                rootMargin: '0px 0px -100px 0px'
            });
            
            // 觀察第一個 reveal 元素
            observer.observe(firstRevealElement);
        }
    });
    
    console.log('✨ 側邊裝飾觸發器已初始化（與 reveal 同步）');
}

/**
 * Update all demo links to open modal
 */
async function updateDemoLinks() {
    if (!siteConfig?.project?.demoUrl) return;
    
    // Load demo modal and wait for it to complete
    await loadDemoModal();
    
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
        const response = await fetch('./partials/demo-modal.html');
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
    } else {
        console.warn('Demo modal 尚未載入完成，請稍候再試');
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

// 立即啟動 preloader（在 DOM 載入前）
preloader.show();

// 啟動資源等待（背景執行）
preloader.waitForCritical().catch(err => {
    console.warn('資源載入逾時或失敗:', err);
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
