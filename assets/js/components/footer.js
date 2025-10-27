/**
 * Footer Web Component
 * Loads and manages the site footer
 */

export class FooterComponent extends HTMLElement {
    constructor() {
        super();
        this.isLoaded = false;
    }
    
    async connectedCallback() {
        if (this.isLoaded) return;
        
        try {
            // Fetch the footer partial
            const response = await fetch('/partials/footer.html');
            if (!response.ok) throw new Error('Failed to load footer');
            
            const html = await response.text();
            this.innerHTML = html;
            
            // Update year
            this.updateYear();
            
            this.isLoaded = true;
            
        } catch (error) {
            console.error('Footer loading error:', error);
            this.innerHTML = `
                <div class="container">
                    <div class="text-center">
                        <p class="text-dim">&copy; ${new Date().getFullYear()} AI 客服專題</p>
                    </div>
                </div>
            `;
        }
    }
    
    updateYear() {
        const yearElement = this.querySelector('p');
        if (yearElement) {
            const currentYear = new Date().getFullYear();
            yearElement.innerHTML = yearElement.innerHTML.replace('2024', currentYear);
        }
    }
}
