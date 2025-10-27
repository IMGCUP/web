/**
 * Three.js Hero Effect Module
 * Creates 3D animated background for hero section
 * Note: Requires Three.js library to be loaded
 */

let scene = null;
let camera = null;
let renderer = null;
let animationId = null;
let isRunning = false;
let geometries = [];
let mouseX = 0;
let mouseY = 0;

/**
 * Initialize Three.js hero effect
 */
export function initThreeHero() {
    const canvas = document.getElementById('three-canvas');
    if (!canvas) {
        console.log('Three.js canvas not found');
        return;
    }
    
    // Check if Three.js is available
    if (typeof THREE === 'undefined') {
        console.log('Three.js library not loaded, using fallback');
        createFallback2D(canvas);
        return;
    }
    
    try {
        // Initialize Three.js scene
        initScene(canvas);
        
        // Create 3D objects
        createObjects();
        
        // Start animation
        if (!isRunning) {
            isRunning = true;
            animate();
        }
        
        // Event listeners
        window.addEventListener('resize', handleResize);
        document.addEventListener('mousemove', handleMouseMove);
        
        console.log('🎮 Three.js hero effect initialized');
        
    } catch (error) {
        console.error('Error initializing Three.js:', error);
        createFallback2D(canvas);
    }
}

/**
 * Initialize Three.js scene
 */
function initScene(canvas) {
    // Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0B0F14, 1, 1000);
    
    // Camera
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 30;
    
    // Renderer
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    
    // Lights
    const ambientLight = new THREE.AmbientLight(0x00E5FF, 0.5);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xFF2D95, 1);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);
}

/**
 * Create 3D objects
 */
function createObjects() {
    // Create low-poly geometric shapes
    const geometryTypes = [
        new THREE.TetrahedronGeometry(5, 0),
        new THREE.OctahedronGeometry(4, 0),
        new THREE.IcosahedronGeometry(3, 0)
    ];
    
    const material = new THREE.MeshPhongMaterial({
        color: 0x00E5FF,
        emissive: 0x00E5FF,
        emissiveIntensity: 0.2,
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });
    
    // Create multiple geometric objects
    for (let i = 0; i < 5; i++) {
        const geometry = geometryTypes[Math.floor(Math.random() * geometryTypes.length)];
        const mesh = new THREE.Mesh(geometry.clone(), material.clone());
        
        // Random position
        mesh.position.x = (Math.random() - 0.5) * 50;
        mesh.position.y = (Math.random() - 0.5) * 30;
        mesh.position.z = (Math.random() - 0.5) * 30;
        
        // Random rotation speed
        mesh.userData.rotationSpeed = {
            x: Math.random() * 0.01,
            y: Math.random() * 0.01,
            z: Math.random() * 0.01
        };
        
        scene.add(mesh);
        geometries.push(mesh);
    }
}

/**
 * Animation loop
 */
function animate() {
    if (!isRunning) return;
    
    // Rotate geometries
    geometries.forEach(mesh => {
        mesh.rotation.x += mesh.userData.rotationSpeed.x;
        mesh.rotation.y += mesh.userData.rotationSpeed.y;
        mesh.rotation.z += mesh.userData.rotationSpeed.z;
    });
    
    // Camera movement based on mouse
    if (camera) {
        camera.position.x += (mouseX * 5 - camera.position.x) * 0.05;
        camera.position.y += (mouseY * 5 - camera.position.y) * 0.05;
        camera.lookAt(scene.position);
    }
    
    // Render
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
    
    animationId = requestAnimationFrame(animate);
}

/**
 * Handle window resize
 */
function handleResize() {
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

/**
 * Handle mouse movement
 */
function handleMouseMove(event) {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
}

/**
 * Create 2D fallback if Three.js is not available
 */
function createFallback2D(canvas) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Simple animated gradient background
    let hue = 180;
    
    function drawFallback() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Create gradient
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, `hsla(${hue}, 100%, 50%, 0.1)`);
        gradient.addColorStop(0.5, `hsla(${hue + 60}, 100%, 50%, 0.05)`);
        gradient.addColorStop(1, `hsla(${hue + 120}, 100%, 50%, 0.1)`);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        hue = (hue + 0.1) % 360;
        
        requestAnimationFrame(drawFallback);
    }
    
    drawFallback();
}

/**
 * Destroy Three.js effect
 */
export function destroyThreeHero() {
    isRunning = false;
    
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    
    // Clean up Three.js objects
    if (scene) {
        geometries.forEach(mesh => {
            if (mesh.geometry) mesh.geometry.dispose();
            if (mesh.material) mesh.material.dispose();
            scene.remove(mesh);
        });
        geometries = [];
    }
    
    if (renderer) {
        renderer.dispose();
        renderer = null;
    }
    
    scene = null;
    camera = null;
    
    window.removeEventListener('resize', handleResize);
    document.removeEventListener('mousemove', handleMouseMove);
}
