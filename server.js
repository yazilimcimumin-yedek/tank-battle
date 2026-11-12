const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

const PORT = 3000;

// Oyuncu durumları
const players = {};
const bullets = {};
let bulletIdCounter = 0;

// Static dosyalar
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Socket.IO bağlantıları
io.on('connection', (socket) => {
    console.log(`Oyuncu bağlandı: ${socket.id}`);

    // Yeni oyuncu oluştur
    players[socket.id] = {
        id: socket.id,
        x: Math.random() * 80 - 40,
        y: 0.5,
        z: Math.random() * 80 - 40,
        rotation: 0,
        turretRotation: 0,
        health: 100,
        score: 0,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`,
        name: 'Oyuncu'
    };

    // İsim ayarlama
    socket.on('setPlayerName', (name) => {
        if (players[socket.id]) {
            players[socket.id].name = name;
            // Diğer oyunculara bildir
            socket.broadcast.emit('playerNameUpdate', {
                id: socket.id,
                name: name
            });
        }
    });

    // Yeni oyuncuya mevcut oyuncuları gönder
    socket.emit('currentPlayers', players);
    
    // Diğer oyunculara yeni oyuncuyu bildir
    socket.broadcast.emit('newPlayer', players[socket.id]);

    // Oyuncu hareketi
    socket.on('playerMovement', (movementData) => {
        if (players[socket.id]) {
            players[socket.id].x = movementData.x;
            players[socket.id].y = movementData.y;
            players[socket.id].z = movementData.z;
            players[socket.id].rotation = movementData.rotation;
            players[socket.id].turretRotation = movementData.turretRotation;
            
            // Diğer oyunculara bildir
            socket.broadcast.emit('playerMoved', players[socket.id]);
        }
    });

    // Ateş etme
    socket.on('shootBullet', (bulletData) => {
        const bulletId = `${socket.id}-${bulletIdCounter++}`;
        bullets[bulletId] = {
            id: bulletId,
            playerId: socket.id,
            x: bulletData.x,
            y: bulletData.y,
            z: bulletData.z,
            velocityX: bulletData.velocityX,
            velocityY: bulletData.velocityY,
            velocityZ: bulletData.velocityZ,
            createdAt: Date.now()
        };

        // Tüm oyunculara mermiyi gönder
        io.emit('bulletFired', bullets[bulletId]);
    });

    // Hasar alma
    socket.on('playerHit', (data) => {
        if (players[data.hitPlayerId]) {
            const damage = data.damage || 25;
            players[data.hitPlayerId].health -= damage;
            
            if (players[data.hitPlayerId].health <= 0) {
                players[data.hitPlayerId].health = 0;
                
                // Vuran oyuncuya puan ver
                if (players[data.shooterId]) {
                    players[data.shooterId].score += 1;
                    io.emit('scoreUpdate', {
                        id: data.shooterId,
                        score: players[data.shooterId].score
                    });
                }
                
                // Ölen oyuncuyu respawn et
                setTimeout(() => {
                    if (players[data.hitPlayerId]) {
                        players[data.hitPlayerId].health = 100;
                        players[data.hitPlayerId].x = Math.random() * 80 - 40;
                        players[data.hitPlayerId].z = Math.random() * 80 - 40;
                        io.emit('playerRespawned', players[data.hitPlayerId]);
                    }
                }, 2000);
            }
            
            io.emit('playerDamaged', {
                id: data.hitPlayerId,
                health: players[data.hitPlayerId].health
            });
        }
    });

    // Oyuncu ayrıldı
    socket.on('disconnect', () => {
        console.log(`Oyuncu ayrıldı: ${socket.id}`);
        delete players[socket.id];
        io.emit('playerDisconnected', socket.id);
    });
});

// Mermileri temizle (5 saniyeden eski)
setInterval(() => {
    const now = Date.now();
    Object.keys(bullets).forEach(id => {
        if (now - bullets[id].createdAt > 5000) {
            delete bullets[id];
            io.emit('bulletExpired', id);
        }
    });
}, 1000);

http.listen(PORT, '0.0.0.0', () => {
    console.log('='.repeat(50));
    console.log('🎮 3D TANK BATTLE OYUNU BAŞLATILDI! 🎮');
    console.log('='.repeat(50));
    console.log(`\n✅ Server çalışıyor: http://localhost:${PORT}`);
    console.log(`\n📡 LAN'dan bağlanmak için:`);
    console.log(`   Bu bilgisayarın IP adresini bulun ve diğer`);
    console.log(`   bilgisayarlardan şu şekilde bağlanın:`);
    console.log(`   http://[IP-ADRESI]:${PORT}`);
    console.log('\n' + '='.repeat(50));
});
