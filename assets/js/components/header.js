/**
 * Header Web Component
 * Loads and manages the site header
 */

export class HeaderComponent extends HTMLElement {
    constructor() {
        super();
        this.isLoaded = false;
    }
    
    async connectedCallback() {
        if (this.isLoaded) return;
        
        try {
            // Fetch the header partial
            const response = await fetch('/partials/header.html');
            if (!response.ok) throw new Error('Failed to load header');
            
            const html = await response.text();
            this.innerHTML = html;
            
            // Initialize mobile menu
            this.initMobileMenu();
            
            // Mark current page as active
            this.markActivePage();
            
            this.isLoaded = true;
            
        } catch (error) {
            console.error('Header loading error:', error);
            this.innerHTML = '<div class="nav container"><a href="/" class="nav__brand">AI 客服專題</a></div>';
        }
    }
    
    initMobileMenu() {
        const toggle = this.querySelector('#nav-toggle');
        const menu = this.querySelector('#nav-menu');
        const overlay = this.querySelector('#nav-overlay');
        
        if (toggle && menu) {
            // Toggle menu
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = menu.classList.contains('nav__menu--open');
                
                if (isOpen) {
                    this.closeMenu(menu, toggle, overlay);
                } else {
                    this.openMenu(menu, toggle, overlay);
                }
            });
            
            // Close menu when clicking overlay
            if (overlay) {
                overlay.addEventListener('click', () => {
                    this.closeMenu(menu, toggle, overlay);
                });
            }
            
            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!this.contains(e.target) && menu.classList.contains('nav__menu--open')) {
                    this.closeMenu(menu, toggle, overlay);
                }
            });
            
            // Close menu when clicking a link
            const links = menu.querySelectorAll('.nav__link, .btn');
            links.forEach(link => {
                link.addEventListener('click', () => {
                    this.closeMenu(menu, toggle, overlay);
                });
            });
            
            // Close menu on ESC key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && menu.classList.contains('nav__menu--open')) {
                    this.closeMenu(menu, toggle, overlay);
                }
            });
        }
    }
    
    openMenu(menu, toggle, overlay) {
        menu.classList.add('nav__menu--open');
        toggle.classList.add('nav__toggle--active');
        if (overlay) overlay.classList.add('nav__overlay--visible');
        document.body.style.overflow = 'hidden';
    }
    
    closeMenu(menu, toggle, overlay) {
        menu.classList.remove('nav__menu--open');
        toggle.classList.remove('nav__toggle--active');
        if (overlay) overlay.classList.remove('nav__overlay--visible');
        document.body.style.overflow = '';
    }
    
    markActivePage() {
        const currentPath = window.location.pathname;
        const links = this.querySelectorAll('[data-nav-link]');
        
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPath || 
                (currentPath === '/' && href === '/index.html') ||
                (currentPath === '/index.html' && href === '/')) {
                link.classList.add('nav__link--active');
            }
        });
    }
}
