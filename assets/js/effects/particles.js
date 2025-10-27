/**
 * Particles Effect Module
 * Creates animated particle background using Canvas
 */

let canvas = null;
let ctx = null;
let particles = [];
let animationId = null;
let isRunning = false;
let mouseX = -1000;
let mouseY = -1000;

// Configuration
const config = {
    particleCount: 80,
    particleSize: 2,
    particleSpeed: 0.5,
    lineDistance: 150,
    particleColor: '#00E5FF',
    lineColor: 'rgba(0, 229, 255, 0.1)'
};

/**
 * Particle class
 */
class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * config.particleSpeed;
        this.vy = (Math.random() - 0.5) * config.particleSpeed;
        this.size = Math.random() * config.particleSize + 1;
    }
    
    update() {
        // Move particle
        this.x += this.vx;
        this.y += this.vy;
        
        // Bounce off edges
        if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
        if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;
        
        // Mouse interaction
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 150) {
            const force = (150 - distance) / 150;
            this.x -= dx * force * 0.02;
            this.y -= dy * force * 0.02;
        }
    }
    
    draw() {
        ctx.fillStyle = config.particleColor;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

/**
 * Initialize particles effect
 */
export function initParticles(customConfig = {}) {
    Object.assign(config, customConfig);
    
    canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    
    ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    resizeCanvas();
    createParticles();
    
    if (!isRunning) {
        isRunning = true;
        animate();
    }
    
    // Event listeners
    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    
    console.log('✨ Particles effect initialized');
}

/**
 * Create particles
 */
function createParticles() {
    particles = [];
    const count = Math.min(config.particleCount, window.innerWidth < 768 ? 40 : config.particleCount);
    
    for (let i = 0; i < count; i++) {
        particles.push(new Particle());
    }
}

/**
 * Animation loop
 */
function animate() {
    if (!isRunning) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw particles
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });
    
    // Draw connections
    drawConnections();
    
    animationId = requestAnimationFrame(animate);
}

/**
 * Draw connections between nearby particles
 */
function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < config.lineDistance) {
                const opacity = (1 - distance / config.lineDistance) * 0.5;
                ctx.strokeStyle = `rgba(0, 229, 255, ${opacity})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
}

/**
 * Resize canvas
 */
function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

/**
 * Handle resize event
 */
function handleResize() {
    resizeCanvas();
    createParticles();
}

/**
 * Handle mouse move
 */
function handleMouseMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
}

/**
 * Handle mouse leave
 */
function handleMouseLeave() {
    mouseX = -1000;
    mouseY = -1000;
}

/**
 * Destroy particles effect
 */
export function destroyParticles() {
    isRunning = false;
    
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    
    particles = [];
    
    window.removeEventListener('resize', handleResize);
    
    if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
    }
}
