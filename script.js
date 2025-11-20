// Production-ready JavaScript for Birthday Website

class BirthdayApp {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.isAnimating = false;
        this.countdownInterval = null;
        
        this.init();
    }

    init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.setupCanvas();
        this.setupEventListeners();
        this.startCountdown();
        this.hideLoadingScreen();
        
        // Performance optimization: Use requestAnimationFrame
        this.animate();
    }

    setupCanvas() {
        this.canvas = document.getElementById('birthday');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        // Add resize listener
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        if (!this.canvas) return;
        
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setupEventListeners() {
        // Heart click handler
        const heartIcon = document.getElementById('i');
        if (heartIcon) {
            heartIcon.addEventListener('click', () => this.handleHeartClick());
            heartIcon.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.handleHeartClick();
                }
            });
            heartIcon.setAttribute('tabindex', '0');
            heartIcon.setAttribute('role', 'button');
            heartIcon.setAttribute('aria-label', 'Start birthday animation');
        }

        // Error handling for missing elements
        this.validateElements();
    }

    validateElements() {
        const requiredElements = ['container', 'birthday', 'svg-overlay'];
        const missingElements = requiredElements.filter(id => !document.getElementById(id));
        
        if (missingElements.length > 0) {
            console.warn('Missing elements:', missingElements);
        }
    }

    handleHeartClick() {
        try {
            this.back();
            this.startAnimation();
        } catch (error) {
            console.error('Error in heart click handler:', error);
        }
    }

    back() {
        const backDiv = document.getElementById('back');
        const container = document.getElementById('container');
        
        if (backDiv && container) {
            backDiv.style.display = 'none';
            container.style.display = 'block';
        }
    }

    startAnimation() {
        const heartIcon = document.getElementById('i');
        if (heartIcon) {
            heartIcon.classList.add('active');
            
            // Remove class after animation completes
            setTimeout(() => {
                heartIcon.classList.remove('active');
            }, 6000);
        }
        
        this.createParticles();
        this.isAnimating = true;
    }

    createParticles() {
        const colors = ['#ff0062', '#00FF00', '#00ffff', '#ff0080', '#ffff00'];
        
        for (let i = 0; i < 50; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 3 + 1,
                life: 1.0,
                decay: Math.random() * 0.02 + 0.005
            });
        }
    }

    animate() {
        if (!this.ctx) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.isAnimating) {
            this.updateParticles();
            this.drawParticles();
        }
        
        requestAnimationFrame(() => this.animate());
    }

    updateParticles() {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= particle.decay;
            
            // Bounce off edges
            if (particle.x <= 0 || particle.x >= this.canvas.width) particle.vx *= -1;
            if (particle.y <= 0 || particle.y >= this.canvas.height) particle.vy *= -1;
            
            return particle.life > 0;
        });
        
        if (this.particles.length === 0) {
            this.isAnimating = false;
        }
    }

    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }

    startCountdown() {
        const countdownElement = document.getElementById('countdown');
        if (!countdownElement) return;

        // Set target date (you can modify this)
        const targetDate = new Date();
        targetDate.setHours(targetDate.getHours() + 1); // 1 hour from now as example

        this.countdownInterval = setInterval(() => {
            const now = new Date().getTime();
            const distance = targetDate.getTime() - now;

            if (distance < 0) {
                clearInterval(this.countdownInterval);
                countdownElement.innerHTML = "🎉 It's Time! 🎉";
                return;
            }

            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            countdownElement.innerHTML = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    hideLoadingScreen() {
        const loadingScreen = document.querySelector('.loading-screen');
        if (loadingScreen) {
            setTimeout(() => {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }, 1500);
        }
    }

    // Cleanup method
    destroy() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }
        
        window.removeEventListener('resize', this.resizeCanvas);
        this.particles = [];
        this.isAnimating = false;
    }
}

// Global functions for backward compatibility
let birthdayApp;

function back() {
    if (birthdayApp) {
        birthdayApp.back();
    }
}

function ani() {
    if (birthdayApp) {
        birthdayApp.startAnimation();
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    birthdayApp = new BirthdayApp();
});

// Handle page visibility changes for performance
document.addEventListener('visibilitychange', () => {
    if (document.hidden && birthdayApp) {
        birthdayApp.isAnimating = false;
    }
});

// Error handling
window.addEventListener('error', (event) => {
    console.error('JavaScript error:', event.error);
});

// Service Worker registration for PWA capabilities
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}