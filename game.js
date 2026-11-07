// ==========================================================================
// 1. NEON PARTICLE BACKGROUND GRAPHICS ENGINE PIPELINE
// ==========================================================================
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

let particlesArray = [];

// Automatic structural display scaling resize matrix
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 0.4 - 0.2;
        this.speedY = Math.random() * 0.4 - 0.2;
        this.color = Math.random() > 0.5 ? 'rgba(0, 243, 255, 0.2)' : 'rgba(255, 0, 127, 0.2)';
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
        if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
    }
    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initParticles() {
    particlesArray = [];
    for (let i = 0; i < 60; i++) {
        particlesArray.push(new Particle());
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
    }
    requestAnimationFrame(animateParticles);
}
initParticles();
animateParticles();

// ==========================================================================
// 2. HARDWARE-ACCELERATED 3D TILT PHYSICS CALCULATION
// ==========================================================================
function tiltCard(event, card) {
    const cardRect = card.getBoundingClientRect();
    const cardWidth = cardRect.width;
    const cardHeight = cardRect.height;
    
    // Locate the coordinate relative to card anchor grid systems
    const mouseX = event.clientX - cardRect.left - cardWidth / 2;
    const mouseY = event.clientY - cardRect.top - cardHeight / 2;
    
    // Map bounds to a smooth maximum 15-degree layout tilt threshold
    const rotateX = -(mouseY / (cardHeight / 2)) * 15;
    const rotateY = (mouseX / (cardWidth / 2)) * 15;
    
    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
}

function resetCard(card) {
    card.style.transform = `rotateX(0deg) rotateY(0deg) scale(1)`;
}

// ==========================================================================
// 3. CORE CHECKOUT ENGINE INTERACTIVE OVERLAY ACTION LOGIC
// ==========================================================================
let currentIngredients = [];

function triggerOrderFlow() {
    const popup = document.getElementById('game-popup');
    popup.classList.remove('hidden');
    currentIngredients = [];
    document.getElementById('cooking-pot').innerText = "🍲 Matrix is empty... select inputs!";
    document.getElementById('game-status').innerText = "";
}

function selectIngredient(ingredient) {
    if (currentIngredients.length < 3) {
        currentIngredients.push(ingredient);
        document.getElementById('cooking-pot').innerText = "⚡ Uploading: " + currentIngredients.join(" + ");
    }
    if (currentIngredients.length === 3) {
        checkRecipe();
    }
}

function checkRecipe() {
    const statusBox = document.getElementById('game-status');
    if (currentIngredients.includes('🍞 Dough') && currentIngredients.includes('🍅 Tomato') && currentIngredients.includes('🧀 Cheese')) {
        statusBox.innerHTML = "✨ SUCCESS! Generated Premium Cyber Pizza! 🍕 <br> Use Code: <span style='color:#00f3ff; text-shadow:0 0 10px #00f3ff;'>CYBERPIZZA15</span> (15% Off)";
    } else if (currentIngredients.includes('🍅 Tomato') && currentIngredients.includes('🧀 Cheese') && currentIngredients.includes('🌿 Basil')) {
        statusBox.innerHTML = "✨ SUCCESS! Synthesized Neon Herb Pasta! 🍝 <br> Use Code: <span style='color:#ff007f; text-shadow:0 0 10px #ff007f;'>NEONPASTA10</span> (10% Off)";
    } else {
        statusBox.innerHTML = "❌ COMBO UNSTABLE! Formula rejected by server matrix. Try again.";
    }
}

function closeGame() {
    document.getElementById('game-popup').classList.add('hidden');
}