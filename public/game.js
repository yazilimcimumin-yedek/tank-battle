// Socket.IO bağlantısı - henüz başlatma
let socket = null;
let playerName = '';

// Three.js setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 0, 300);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ 
    canvas: document.getElementById('gameCanvas'),
    antialias: true 
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Kamera kontrolleri
let cameraDistance = 18;
let cameraHeight = 10;
let cameraAngle = 0;

// Işıklandırma
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(50, 100, 50);
directionalLight.castShadow = true;
directionalLight.shadow.camera.left = -100;
directionalLight.shadow.camera.right = 100;
directionalLight.shadow.camera.top = 100;
directionalLight.shadow.camera.bottom = -100;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
scene.add(directionalLight);

// Zemin
const groundGeometry = new THREE.PlaneGeometry(200, 200, 20, 20);
const groundMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x4a7c4e,
    roughness: 0.8,
    metalness: 0.2
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;

const gridHelper = new THREE.GridHelper(200, 40, 0x000000, 0x000000);
gridHelper.material.opacity = 0.1;
gridHelper.material.transparent = true;
scene.add(ground);
scene.add(gridHelper);

// Engeller - LABİRENT VE DAĞLIK ALAN
const obstacles = [];

function createObstacles() {
    // DIŞ SINIR DUVARLARI
    const borderWalls = [
        { x: 0, z: -100, w: 200, h: 8, d: 2 },
        { x: 0, z: 100, w: 200, h: 8, d: 2 },
        { x: -100, z: 0, w: 2, h: 8, d: 200 },
        { x: 100, z: 0, w: 2, h: 8, d: 200 },
    ];
    
    borderWalls.forEach(wall => {
        const geometry = new THREE.BoxGeometry(wall.w, wall.h, wall.d);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x4a4a4a,
            roughness: 0.9
        });
        const obstacle = new THREE.Mesh(geometry, material);
        obstacle.position.set(wall.x, wall.h / 2, wall.z);
        obstacle.castShadow = true;
        obstacle.receiveShadow = true;
        obstacle.userData.isWall = true;
        scene.add(obstacle);
        obstacles.push(obstacle);
    });
    
    // STRATEJİK DUVARLAR - Az ve açık
    const strategicWalls = [
        { x: -60, z: -40, w: 20, h: 5, d: 3 },
        { x: 60, z: -40, w: 20, h: 5, d: 3 },
        { x: -60, z: 40, w: 20, h: 5, d: 3 },
        { x: 60, z: 40, w: 20, h: 5, d: 3 },
        { x: 0, z: 0, w: 15, h: 5, d: 3 },
        { x: -40, z: 0, w: 3, h: 5, d: 30 },
        { x: 40, z: 0, w: 3, h: 5, d: 30 },
    ];
    
    strategicWalls.forEach(wall => {
        const geometry = new THREE.BoxGeometry(wall.w, wall.h, wall.d);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x654321,
            roughness: 0.85
        });
        const obstacle = new THREE.Mesh(geometry, material);
        obstacle.position.set(wall.x, wall.h / 2, wall.z);
        obstacle.castShadow = true;
        obstacle.receiveShadow = true;
        obstacle.userData.isWall = true;
        scene.add(obstacle);
        obstacles.push(obstacle);
    });
    
    // YIKILABIR KUTULAR - Daha az
    for (let i = 0; i < 12; i++) {
        const size = Math.random() * 2 + 2;
        
        const geometry = new THREE.BoxGeometry(size, size, size);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0xa0522d,
            roughness: 0.9
        });
        const box = new THREE.Mesh(geometry, material);
        
        box.position.x = Math.random() * 140 - 70;
        box.position.y = size / 2;
        box.position.z = Math.random() * 140 - 70;
        box.castShadow = true;
        box.receiveShadow = true;
        box.userData.health = 100;
        box.userData.isDestructible = true;
        
        scene.add(box);
        obstacles.push(box);
    }
}

createObstacles();

// Ağaçlar - Daha az
for (let i = 0; i < 10; i++) {
    const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 3, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x4a2511 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    
    const leavesGeometry = new THREE.SphereGeometry(2, 8, 8);
    const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x2d5016 });
    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
    leaves.position.y = 3;
    
    const tree = new THREE.Group();
    tree.add(trunk);
    tree.add(leaves);
    
    tree.position.x = Math.random() * 180 - 90;
    tree.position.z = Math.random() * 180 - 90;
    tree.castShadow = true;
    trunk.castShadow = true;
    leaves.castShadow = true;
    
    scene.add(tree);
}

// PROFESYONEL TANK MODELİ - Z Ekseni İleri
function createTank(color) {
    const tank = new THREE.Group();
    
    const tankMaterial = new THREE.MeshStandardMaterial({ 
        color: color,
        roughness: 0.5,
        metalness: 0.6
    });
    
    // Alt gövde
    const baseGeometry = new THREE.BoxGeometry(3, 0.6, 4.5);
    const base = new THREE.Mesh(baseGeometry, tankMaterial);
    base.position.y = 0.3;
    base.castShadow = true;
    base.receiveShadow = true;
    tank.add(base);
    
    // Üst gövde
    const bodyGeometry = new THREE.BoxGeometry(2.8, 1.2, 3.8);
    const body = new THREE.Mesh(bodyGeometry, tankMaterial);
    body.position.y = 1.2;
    body.castShadow = true;
    body.receiveShadow = true;
    tank.add(body);
    
    // Kule - SABİT (tankla birlikte döner)
    const turretBaseGeometry = new THREE.CylinderGeometry(1.2, 1.2, 0.5, 16);
    const turretBase = new THREE.Mesh(turretBaseGeometry, tankMaterial);
    turretBase.position.y = 1.8;
    turretBase.castShadow = true;
    tank.add(turretBase);
    
    // Kule gövdesi
    const turretBodyGeometry = new THREE.BoxGeometry(1.8, 0.9, 2.2);
    const turretBody = new THREE.Mesh(turretBodyGeometry, tankMaterial);
    turretBody.position.y = 2.5;
    turretBody.position.z = 0.3;
    turretBody.castShadow = true;
    tank.add(turretBody);
    
    // NAMLU - SABİT, tankla birlikte döner
    const barrelGeometry = new THREE.CylinderGeometry(0.2, 0.2, 3.5, 16);
    const barrelMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x1a1a1a,
        roughness: 0.3,
        metalness: 0.9
    });
    const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);
    barrel.rotation.x = -Math.PI / 2;
    barrel.position.y = 2.5;
    barrel.position.z = 2.8;
    barrel.castShadow = true;
    tank.add(barrel);
    tank.barrel = barrel;
    
    // Tekerlekler
    const wheelGeometry = new THREE.CylinderGeometry(0.45, 0.45, 0.5, 16);
    const wheelMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x1a1a1a,
        roughness: 0.9
    });
    
    const wheelPositions = [
        [-1.6, 0, 1.8], [1.6, 0, 1.8],
        [-1.6, 0, 1], [1.6, 0, 1],
        [-1.6, 0, 0.2], [1.6, 0, 0.2],
        [-1.6, 0, -0.6], [1.6, 0, -0.6],
        [-1.6, 0, -1.4], [1.6, 0, -1.4],
        [-1.6, 0, -2.2], [1.6, 0, -2.2],
    ];
    
    wheelPositions.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(...pos);
        wheel.castShadow = true;
        tank.add(wheel);
    });
    
    // Paletler
    const trackGeometry = new THREE.BoxGeometry(0.4, 0.8, 5);
    const trackMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x2a2a2a,
        roughness: 0.95
    });
    
    const leftTrack = new THREE.Mesh(trackGeometry, trackMaterial);
    leftTrack.position.set(-1.7, 0.3, 0);
    leftTrack.castShadow = true;
    tank.add(leftTrack);
    
    const rightTrack = new THREE.Mesh(trackGeometry, trackMaterial);
    rightTrack.position.set(1.7, 0.3, 0);
    rightTrack.castShadow = true;
    tank.add(rightTrack);
    
    // İsim etiketi - parametre olarak al
    tank.setName = function(name) {
        if (tank.nameTag) {
            tank.remove(tank.nameTag);
        }
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 64;
        context.fillStyle = 'rgba(0, 0, 0, 0.7)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.font = 'Bold 24px Arial';
        context.fillStyle = 'white';
        context.textAlign = 'center';
        context.fillText(name || 'Tank', canvas.width / 2, canvas.height / 2 + 8);
        
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.position.y = 4;
        sprite.scale.set(3, 0.75, 1);
        tank.add(sprite);
        tank.nameTag = sprite;
    };
    
    return tank;
}

// Oyun durumu
const gameState = {
    players: {},
    bullets: {},
    myId: null,
    myTank: null,
    myHealth: 100,
    myScore: 0,
    isDead: false,
    gameStarted: false
};

// GİRİŞ EKRANI
document.getElementById('joinButton').addEventListener('click', startGame);
document.getElementById('playerName').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        startGame();
    }
});

// Oyun başlatma
function startGame() {
    const nameInput = document.getElementById('playerName');
    const name = nameInput.value.trim();
    
    if (name.length < 2) {
        alert('İsmin en az 2 karakter olmalı!');
        return;
    }
    
    playerName = name;
    
    // Giriş ekranını gizle
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('gameCanvas').style.display = 'block';
    document.getElementById('ui').style.display = 'block';
    
    // Kamerayı başlat
    camera.position.set(0, 15, 20);
    camera.lookAt(0, 0, 0);
    
    // Socket bağlantısı başlat
    socket = io();
    setupSocketListeners();
    
    gameState.gameStarted = true;
    
    // Animasyonu başlat
    animate();
}

// KONTROLLER - TAM DÜZELTİLMİŞ
const keys = {};
const mouse = { 
    x: 0, 
    y: 0, 
    movementX: 0,
    movementY: 0,
    rightButton: false 
};
let turretRotation = 0;

document.addEventListener('keydown', (e) => { 
    keys[e.key.toLowerCase()] = true;
    
    // Space ile ateş
    if (e.code === 'Space' && !gameState.isDead && gameState.myTank && gameState.gameStarted) {
        e.preventDefault();
        shootBullet();
    }
});

document.addEventListener('keyup', (e) => { 
    keys[e.key.toLowerCase()] = false; 
});

// Fare hareketi - sadece UI için
document.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

// Tıklama - sadece ateş
document.addEventListener('mousedown', (e) => {
    if (e.button === 0) {
        if (!gameState.isDead && gameState.myTank && gameState.gameStarted) {
            shootBullet();
        }
    }
});

document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// ATEŞ ETME - Sabit namlu, tank yönünde
function shootBullet() {
    const tank = gameState.myTank;
    if (!tank) return;
    
    // Tank rotasyonu = ateş yönü
    const direction = new THREE.Vector3(
        Math.sin(tank.rotation.y),
        0,
        Math.cos(tank.rotation.y)
    );
    
    const bulletSpeed = 1.2; // Daha yavaş
    const spawnOffset = 4.5;
    
    const bulletData = {
        x: tank.position.x + direction.x * spawnOffset,
        y: tank.position.y + 2.5,
        z: tank.position.z + direction.z * spawnOffset,
        velocityX: direction.x * bulletSpeed,
        velocityY: 0,
        velocityZ: direction.z * bulletSpeed
    };
    
    socket.emit('shootBullet', bulletData);
    
    // Geri tepme
    tank.barrel.position.z = 2.5;
    setTimeout(() => { tank.barrel.position.z = 2.8; }, 100);
    
    playShootSound();
}

function playShootSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 100;
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

// Mermi oluşturma
function createBullet() {
    const geometry = new THREE.SphereGeometry(0.25, 12, 12);
    const material = new THREE.MeshStandardMaterial({ 
        color: 0xffff00,
        emissive: 0xffaa00,
        emissiveIntensity: 0.8,
        metalness: 0.5
    });
    const bullet = new THREE.Mesh(geometry, material);
    bullet.castShadow = true;
    
    const light = new THREE.PointLight(0xffaa00, 1, 10);
    bullet.add(light);
    
    return bullet;
}

// Patlama efekti
function createExplosion(position) {
    const particleCount = 30;
    const particles = [];
    
    for (let i = 0; i < particleCount; i++) {
        const geometry = new THREE.SphereGeometry(0.1 + Math.random() * 0.2, 4, 4);
        const material = new THREE.MeshBasicMaterial({ 
            color: Math.random() > 0.5 ? 0xff6600 : 0xffaa00
        });
        const particle = new THREE.Mesh(geometry, material);
        
        particle.position.copy(position);
        particle.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.3,
            Math.random() * 0.4,
            (Math.random() - 0.5) * 0.3
        );
        particle.life = 1.0;
        
        scene.add(particle);
        particles.push(particle);
    }
    
    const light = new THREE.PointLight(0xff6600, 5, 20);
    light.position.copy(position);
    scene.add(light);
    
    const startTime = Date.now();
    const animate = () => {
        const elapsed = (Date.now() - startTime) / 1000;
        if (elapsed > 1) {
            particles.forEach(p => scene.remove(p));
            scene.remove(light);
            return;
        }
        
        particles.forEach(p => {
            p.position.add(p.velocity);
            p.velocity.y -= 0.02;
            p.scale.setScalar(1 - elapsed);
        });
        
        light.intensity = 5 * (1 - elapsed);
        
        requestAnimationFrame(animate);
    };
    animate();
    
    playExplosionSound();
}

function playExplosionSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 80;
    oscillator.type = 'sawtooth';
    
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

// Socket events
function setupSocketListeners() {
socket.on('currentPlayers', (players) => {
    Object.values(players).forEach(playerData => {
        if (playerData.id === socket.id) {
            gameState.myId = playerData.id;
            const tank = createTank(playerData.color);
            tank.position.set(playerData.x, 0.5, playerData.z);
            tank.setName(playerName);
            scene.add(tank);
            gameState.myTank = tank;
            gameState.players[playerData.id] = { tank, data: playerData };
            
            // Kamerayı tankın arkasına ayarla
            camera.position.set(
                tank.position.x,
                tank.position.y + 10,
                tank.position.z - 15
            );
            camera.lookAt(tank.position);
            
            // İsmi sunucuya gönder
            socket.emit('setPlayerName', playerName);
        } else {
            const tank = createTank(playerData.color);
            tank.position.set(playerData.x, 0.5, playerData.z);
            tank.setName(playerData.name || 'Oyuncu');
            scene.add(tank);
            gameState.players[playerData.id] = { tank, data: playerData };
        }
    });
    updatePlayerCount();
    updateScoreboard();
});

socket.on('newPlayer', (playerData) => {
    const tank = createTank(playerData.color);
    tank.position.set(playerData.x, 0.5, playerData.z);
    tank.setName(playerData.name || 'Oyuncu');
    scene.add(tank);
    gameState.players[playerData.id] = { tank, data: playerData };
    updatePlayerCount();
});

socket.on('playerNameUpdate', (data) => {
    if (gameState.players[data.id] && gameState.players[data.id].tank) {
        gameState.players[data.id].tank.setName(data.name);
        gameState.players[data.id].data.name = data.name;
    }
});

socket.on('playerMoved', (playerData) => {
    if (gameState.players[playerData.id]) {
        const player = gameState.players[playerData.id];
        player.tank.position.set(playerData.x, 0.5, playerData.z);
        player.tank.rotation.y = playerData.rotation;
        player.data = playerData;
    }
});

socket.on('playerDisconnected', (playerId) => {
    if (gameState.players[playerId]) {
        scene.remove(gameState.players[playerId].tank);
        delete gameState.players[playerId];
        updatePlayerCount();
    }
});

socket.on('bulletFired', (bulletData) => {
    const bullet = createBullet();
    bullet.position.set(bulletData.x, bulletData.y, bulletData.z);
    bullet.velocity = new THREE.Vector3(bulletData.velocityX, bulletData.velocityY, bulletData.velocityZ);
    scene.add(bullet);
    gameState.bullets[bulletData.id] = { mesh: bullet, data: bulletData };
});

socket.on('bulletExpired', (bulletId) => {
    if (gameState.bullets[bulletId]) {
        scene.remove(gameState.bullets[bulletId].mesh);
        delete gameState.bullets[bulletId];
    }
});

socket.on('playerDamaged', (data) => {
    if (data.id === gameState.myId) {
        gameState.myHealth = data.health;
        updateHealthBar();
        
        if (data.health <= 0) {
            gameState.isDead = true;
            document.getElementById('respawn-msg').style.display = 'block';
        }
    }
});

socket.on('playerRespawned', (playerData) => {
    if (playerData.id === gameState.myId) {
        gameState.isDead = false;
        gameState.myHealth = 100;
        updateHealthBar();
        document.getElementById('respawn-msg').style.display = 'none';
        
        if (gameState.myTank) {
            gameState.myTank.position.set(playerData.x, 0.5, playerData.z);
        }
    } else if (gameState.players[playerData.id]) {
        gameState.players[playerData.id].tank.position.set(playerData.x, 0.5, playerData.z);
    }
});

socket.on('scoreUpdate', (data) => {
    if (gameState.players[data.id]) {
        gameState.players[data.id].data.score = data.score;
        
        if (data.id === gameState.myId) {
            gameState.myScore = data.score;
            document.getElementById('score').textContent = data.score;
            showKillNotification();
        }
    }
    updateScoreboard();
});
}

// UI güncelleme
function updatePlayerCount() {
    document.getElementById('playerCount').textContent = Object.keys(gameState.players).length;
}

function updateHealthBar() {
    const healthFill = document.getElementById('health-fill');
    const healthText = document.getElementById('health-text');
    healthFill.style.width = gameState.myHealth + '%';
    healthText.textContent = gameState.myHealth + ' HP';
}

function updateScoreboard() {
    const scoreList = document.getElementById('scoreList');
    const sortedPlayers = Object.values(gameState.players)
        .sort((a, b) => (b.data.score || 0) - (a.data.score || 0));
    
    scoreList.innerHTML = sortedPlayers.map(player => {
        const isMe = player.data.id === gameState.myId;
        const name = player.data.name || 'Oyuncu';
        return `<div class="player-score" style="${isMe ? 'background: rgba(255,255,255,0.2); padding: 5px; border-radius: 5px;' : ''}">
            <span>${isMe ? '👉 ' : ''}${name}</span>
            <span>${player.data.score || 0} 💀</span>
        </div>`;
    }).join('');
}

function showKillNotification() {
    const notification = document.getElementById('kill-notification');
    notification.textContent = '💀 KILL! +1';
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 2000);
}

// OYUN DÖNGÜSÜ
let lastUpdate = Date.now();

function animate() {
    requestAnimationFrame(animate);
    
    if (!gameState.gameStarted) {
        return;
    }
    
    const now = Date.now();
    const delta = (now - lastUpdate) / 1000;
    lastUpdate = now;
    
    if (gameState.myTank && !gameState.isDead) {
        // Hareket - DAHA YAVAŞ
        const speed = 0.15;
        const rotationSpeed = 0.025;
        
        let moved = false;
        const oldPos = gameState.myTank.position.clone();
        
        // W/S - İleri/Geri (DÜZELTİLDİ)
        if (keys['w']) {
            gameState.myTank.position.x += Math.sin(gameState.myTank.rotation.y) * speed;
            gameState.myTank.position.z += Math.cos(gameState.myTank.rotation.y) * speed;
            moved = true;
        }
        if (keys['s']) {
            gameState.myTank.position.x -= Math.sin(gameState.myTank.rotation.y) * speed;
            gameState.myTank.position.z -= Math.cos(gameState.myTank.rotation.y) * speed;
            moved = true;
        }
        
        // A/D - Dönüş
        if (keys['a']) {
            gameState.myTank.rotation.y += rotationSpeed;
            moved = true;
        }
        if (keys['d']) {
            gameState.myTank.rotation.y -= rotationSpeed;
            moved = true;
        }
        
        // Çarpışma kontrolü - daha iyi algılama
        let collision = false;
        const tankRadius = 2; // Tank yarıçapı
        
        obstacles.forEach(obstacle => {
            if (!obstacle.geometry) return;
            
            const box = new THREE.Box3().setFromObject(obstacle);
            
            // Tank pozisyonunu genişlet (çarpışma kutusu)
            const tankBox = new THREE.Box3(
                new THREE.Vector3(
                    gameState.myTank.position.x - tankRadius,
                    gameState.myTank.position.y - 0.5,
                    gameState.myTank.position.z - tankRadius
                ),
                new THREE.Vector3(
                    gameState.myTank.position.x + tankRadius,
                    gameState.myTank.position.y + 2.5,
                    gameState.myTank.position.z + tankRadius
                )
            );
            
            if (box.intersectsBox(tankBox)) {
                collision = true;
            }
        });
        
        if (collision) {
            gameState.myTank.position.copy(oldPos);
        }
        
        // Sınırlar
        gameState.myTank.position.x = Math.max(-95, Math.min(95, gameState.myTank.position.x));
        gameState.myTank.position.z = Math.max(-95, Math.min(95, gameState.myTank.position.z));
        
        // Kamera - tankın arkasından
        const camDist = 15;
        const camHeight = 8;
        const camX = Math.sin(gameState.myTank.rotation.y) * camDist;
        const camZ = Math.cos(gameState.myTank.rotation.y) * camDist;
        
        const targetCamPos = new THREE.Vector3(
            gameState.myTank.position.x - camX,
            gameState.myTank.position.y + camHeight,
            gameState.myTank.position.z - camZ
        );
        
        camera.position.lerp(targetCamPos, 0.15);
        
        const lookTarget = new THREE.Vector3(
            gameState.myTank.position.x,
            gameState.myTank.position.y + 2,
            gameState.myTank.position.z
        );
        camera.lookAt(lookTarget);
        
        // Sunucuya gönder
        if (moved) {
            socket.emit('playerMovement', {
                x: gameState.myTank.position.x,
                y: 0.5,
                z: gameState.myTank.position.z,
                rotation: gameState.myTank.rotation.y,
                turretRotation: 0
            });
        }
    }
    
    // Mermileri güncelle
    Object.entries(gameState.bullets).forEach(([id, bullet]) => {
        bullet.mesh.position.add(bullet.mesh.velocity);
        
        let hitSomething = false;
        
        // Oyuncu çarpışması
        Object.entries(gameState.players).forEach(([playerId, player]) => {
            if (bullet.data.playerId !== playerId && !hitSomething) {
                const distance = bullet.mesh.position.distanceTo(player.tank.position);
                if (distance < 2.5) {
                    createExplosion(bullet.mesh.position.clone());
                    scene.remove(bullet.mesh);
                    delete gameState.bullets[id];
                    hitSomething = true;
                    
                    // Sunucuya hasar bildir
                    socket.emit('playerHit', {
                        hitPlayerId: playerId,
                        shooterId: bullet.data.playerId
                    });
                }
            }
        });
        
        // Duvar çarpışması
        if (!hitSomething) {
            obstacles.forEach((obstacle, index) => {
                if (obstacle.userData.isDestructible && !hitSomething) {
                    const box = new THREE.Box3().setFromObject(obstacle);
                    if (box.containsPoint(bullet.mesh.position)) {
                        createExplosion(bullet.mesh.position.clone());
                        scene.remove(bullet.mesh);
                        delete gameState.bullets[id];
                        hitSomething = true;
                        
                        obstacle.userData.health -= 50;
                        if (obstacle.userData.health <= 0) {
                            scene.remove(obstacle);
                            obstacles.splice(index, 1);
                        } else {
                            obstacle.material.color.setHex(0x4a2511);
                        }
                    }
                }
            });
        }
        
        // Zemin kontrolü
        if (!hitSomething && (bullet.mesh.position.y < 0 || 
            Math.abs(bullet.mesh.position.x) > 100 || 
            Math.abs(bullet.mesh.position.z) > 100)) {
            createExplosion(bullet.mesh.position.clone());
            scene.remove(bullet.mesh);
            delete gameState.bullets[id];
        }
    });
    
    renderer.render(scene, camera);
}

// Başlangıçta render et
renderer.render(scene, camera);

// Pencere boyutu
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
