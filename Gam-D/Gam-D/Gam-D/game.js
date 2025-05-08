// Game Constants
const CANVAS = document.getElementById('gameCanvas');
const CTX = CANVAS.getContext('2d');
const START_SCREEN = document.getElementById('startScreen');
const WEAPON_SELECTION_SCREEN = document.getElementById('weaponSelectionScreen');
const START_BUTTON = document.getElementById('startButton');
const PLAYER_NAME_INPUT = document.getElementById('playerName');
const WEAPON_BUTTONS = document.querySelectorAll('#weaponSelectionScreen .weapon-options button');

const PLAYER_COLLISION_SIZE = 25;
const PLAYER_SPRITE_SIZE = 50;

// Bullet Constants (will be overridden by weapon stats)
let BULLET_SIZE = 6;
let BULLET_SPEED = 7;
let SHOOT_DELAY = 200;

// Enemy Constants
const ENEMY_COLLISION_SIZE = 20;
const ENEMY_SPRITE_SIZE = 40;
const ENEMY_SPEED = 2;
const ENEMY_SCORE = 10;

// Boss Enemy Constants
const BOSS_ENEMY_COLLISION_SIZE = 35;
const BOSS_ENEMY_SPRITE_SIZE = 60;
const BOSS_ENEMY_SPEED = 1.5;
const BOSS_ENEMY_SCORE = 50;
const BOSS_ENEMY_SPAWN_CHANCE = 0.1;

const ENEMY_SPAWN_RATE = 1000;
const MAX_ENEMIES = 20;

const PLAYER_SPEED = 5;

// Image Assets
const playerImg = new Image(); playerImg.src = '../assets/imagens/Jogador.png';
const gunImg = new Image(); gunImg.src = '../assets/imagens/gun.png';
const gun2Img = new Image(); gun2Img.src = '../assets/imagens/gun2.png';
const gun3Img = new Image(); gun3Img.src = '../assets/imagens/gun3.png';
const enemyImg = new Image(); enemyImg.src = '../assets/imagens/enemy.png';
const bossEnemyImg = new Image(); bossEnemyImg.src = '../assets/imagens/bossenemy.png';


const gunImages = [gunImg, gun2Img, gun3Img];

// Define Weapon Types with stats
// Adjusted drawScale for all weapons to be smaller (0.025 for ~2.5x2.5px attempt)
const WEAPONS = [
    {
        name: "Rifle Simples",
        img: gunImg,
        shootDelay: 200,
        bulletSpeed: 7,
        bulletSize: 6,
        drawScale: 0.025, // Decreased size for ~2.5x2.5px attempt
        gunOffsetX: -1,  // Adjusted offset for smaller sprite
        gunOffsetY: 0,
        muzzleOffsetFactor: 0.8 // Factor along scaled width for muzzle
    },
    {
        name: "Rifle de Assalto",
        img: gun2Img,
        shootDelay: 100,
        bulletSpeed: 8,
        bulletSize: 5,
        drawScale: 0.025, // Decreased size for ~2.5x2.5px attempt
        gunOffsetX: -1,  // Adjusted offset for smaller sprite
        gunOffsetY: 0,
        muzzleOffsetFactor: 0.8
    },
    {
        name: "Metralhadora Pesada",
        img: gun3Img,
        shootDelay: 300,
        bulletSpeed: 10,
        bulletSize: 8,
        drawScale: 0.025, // Decreased size for ~2.5x2.5px attempt
        gunOffsetX: -1,  // Adjusted offset for smaller sprite
        gunOffsetY: 0,
        muzzleOffsetFactor: 0.8
    }
];

// Game State
let player = { x: 0, y: 0, angle: 0, health: 100, lastShootTime: 0 };
let bullets = [];
let enemies = [];
let lastSpawnTime = 0;
let score = 0;
let gameOver = false;
let gameRunning = false;
let playerName = "Jogador";
let selectedWeaponIndex = 0;

// Input State
let keys = {};
let mouse = { x: 0, y: 0, down: false };

// Event Listeners
window.addEventListener('resize', resizeCanvas);
window.addEventListener('keydown', (e) => keys[e.key] = true);
window.addEventListener('keyup', (e) => keys[e.key] = false);
window.addEventListener('mousemove', (e) => {
    const rect = CANVAS.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
});
window.addEventListener('mousedown', (e) => mouse.down = true);
window.addEventListener('mouseup', (e) => mouse.down = false);
window.addEventListener('keydown', handleRestart);

// Start Button Handler: Goes to weapon selection
START_BUTTON.addEventListener('click', () => {
    playerName = PLAYER_NAME_INPUT.value || "Jogador";
    showWeaponSelection();
});

// Weapon Selection Button Handlers
WEAPON_BUTTONS.forEach(button => {
    button.addEventListener('click', (e) => {
        selectedWeaponIndex = parseInt(e.currentTarget.dataset.weapon);
        startGame();
    });
});

// Game Functions
function resizeCanvas() {
    CANVAS.width = window.innerWidth;
    CANVAS.height = window.innerHeight;
    if (player.x === 0 && player.y === 0 || !gameRunning) {
         player.x = CANVAS.width / 2;
         player.y = CANVAS.height / 2;
    }
}

function initGame() {
    resizeCanvas();
    player.x = CANVAS.width / 2;
    player.y = CANVAS.height / 2;
    player.health = 100;
    player.lastShootTime = 0;
    bullets = [];
    enemies = [];
    score = 0;
    gameOver = false;
    gameRunning = true;
    lastSpawnTime = performance.now();

    // Set bullet stats based on selected weapon
    const currentWeapon = WEAPONS[selectedWeaponIndex];
    BULLET_SIZE = currentWeapon.bulletSize;
    BULLET_SPEED = currentWeapon.bulletSpeed;
    SHOOT_DELAY = currentWeapon.shootDelay;
}

function showWeaponSelection() {
    START_SCREEN.classList.add('hidden');
    WEAPON_SELECTION_SCREEN.classList.remove('hidden');
}

function startGame() {
    WEAPON_SELECTION_SCREEN.classList.add('hidden');
    initGame();
}

function endGame() {
    gameOver = true;
    gameRunning = false;
    START_SCREEN.style.display = 'flex';
    START_SCREEN.classList.remove('hidden');

    document.querySelector('#startScreen h1').innerText = `Fim de Jogo - Pontuação: ${score}`;
    document.querySelector('#startScreen label').classList.add('hidden');
    document.querySelector('#startScreen input').classList.add('hidden');
    document.querySelector('#startScreen button').innerText = 'Jogar Novamente (Pressione R)';
}

function handleRestart(e) {
    if (gameOver && (e.key === 'r' || e.key === 'R')) {
        document.querySelector('#startScreen h1').innerText = 'Jogo de Tiro Simples';
        document.querySelector('#startScreen label').classList.remove('hidden');
        document.querySelector('#startScreen input').classList.remove('hidden');
        document.querySelector('#startScreen input').value = playerName;
        document.querySelector('#startScreen button').innerText = 'Começar Jogo';
        document.querySelector('#startScreen button').onclick = () => {
             playerName = PLAYER_NAME_INPUT.value || "Jogador";
             showWeaponSelection();
        };

        START_SCREEN.classList.add('hidden');
        showWeaponSelection();
    }
}

function getEnemyProperties(type) {
    if (type === 'boss') {
        return {
            collisionSize: BOSS_ENEMY_COLLISION_SIZE,
            spriteSize: BOSS_ENEMY_SPRITE_SIZE,
            speed: BOSS_ENEMY_SPEED,
            score: BOSS_ENEMY_SCORE,
            img: bossEnemyImg
        };
    } else {
        return {
            collisionSize: ENEMY_COLLISION_SIZE,
            spriteSize: ENEMY_SPRITE_SIZE,
            speed: ENEMY_SPEED,
            score: ENEMY_SCORE,
            img: enemyImg
        };
    }
}

function update(currentTime) {
    if (!gameRunning || gameOver) return;

    let dx = 0;
    let dy = 0;
    if (keys['w'] || keys['ArrowUp']) dy -= PLAYER_SPEED;
    if (keys['s'] || keys['ArrowDown']) dy += PLAYER_SPEED;
    if (keys['a'] || keys['ArrowLeft']) dx -= PLAYER_SPEED;
    if (keys['d'] || keys['ArrowRight']) dx += PLAYER_SPEED;

    if (dx !== 0 && dy !== 0) {
        const speed = Math.sqrt(dx * dx + dy * dy);
        dx = (dx / speed) * PLAYER_SPEED;
        dy = (dy / speed) * PLAYER_SPEED;
    }

    player.x += dx;
    player.y += dy;

    player.x = Math.max(PLAYER_COLLISION_SIZE / 2, Math.min(CANVAS.width - PLAYER_COLLISION_SIZE / 2, player.x));
    player.y = Math.max(PLAYER_COLLISION_SIZE / 2, Math.min(CANVAS.height - PLAYER_COLLISION_SIZE / 2, player.y));

    const angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);
    player.angle = angle;

    if (mouse.down && (currentTime - player.lastShootTime) > SHOOT_DELAY) {
        shootBullet();
        player.lastShootTime = currentTime;
    }

    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;

        if (bullet.x < -BULLET_SIZE || bullet.x > CANVAS.width + BULLET_SIZE || bullet.y < -BULLET_SIZE || bullet.y > CANVAS.height + BULLET_SIZE) {
            bullets.splice(i, 1);
        }
    }

    const timeElapsedSinceLastSpawn = currentTime - lastSpawnTime;
    if (timeElapsedSinceLastSpawn > ENEMY_SPAWN_RATE && enemies.length < MAX_ENEMIES) {
        spawnEnemy();
        lastSpawnTime = currentTime;
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        const enemyProps = getEnemyProperties(enemy.type);

        const angleToPlayer = Math.atan2(player.y - enemy.y, player.x - enemy.x);
        enemy.x += Math.cos(angleToPlayer) * enemyProps.speed;

        enemy.y += Math.sin(angleToPlayer) * enemyProps.speed;

        const distToPlayer = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        if (distToPlayer < (PLAYER_COLLISION_SIZE / 2) + (enemyProps.collisionSize / 2)) {
            player.health -= (enemy.type === 'boss' ? 20 : 10);
            enemies.splice(i, 1);
            if (player.health <= 0) {
                endGame();
            }
            continue;
        }

        let hitByBullet = false;
        for (let j = bullets.length - 1; j >= 0; j--) {
            const bullet = bullets[j];
            const distToBullet = Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y);

            if (distToBullet < (BULLET_SIZE / 2) + (enemyProps.collisionSize / 2)) {
                bullets.splice(j, 1);
                enemies.splice(i, 1);

                score += enemyProps.score;

                hitByBullet = true;
                break;
            }
        }
         if (hitByBullet) continue;
    }
}

function shootBullet() {
     const currentWeapon = WEAPONS[selectedWeaponIndex];

     // Calculate scaled dimensions for the current weapon sprite
     const originalGunWidth = currentWeapon.img.width || 30;
     const scaledDrawWidth = originalGunWidth * currentWeapon.drawScale;

     // Calculate the muzzle position (distance from player center along the angle)
     // It's the gunOffsetX (left edge position) + scaledWidth * muzzleOffsetFactor (position along the scaled width)
     const GUN_MUZZLE_DISTANCE = currentWeapon.gunOffsetX + scaledDrawWidth * currentWeapon.muzzleOffsetFactor;


     const bulletStartX = player.x + Math.cos(player.angle) * GUN_MUZZLE_DISTANCE;
     const bulletStartY = player.y + Math.sin(player.angle) * GUN_MUZZLE_DISTANCE;

     const vx = Math.cos(player.angle) * currentWeapon.bulletSpeed;
     const vy = Math.sin(player.angle) * currentWeapon.bulletSpeed;

     bullets.push({
         x: bulletStartX,
         y: bulletStartY,
         vx: vx,
         vy: vy,
         size: currentWeapon.bulletSize
     });
}

function spawnEnemy() {
    let x, y;
    const side = Math.floor(Math.random() * 4);

    const enemyType = Math.random() < BOSS_ENEMY_SPAWN_CHANCE ? 'boss' : 'regular';
    const enemyProps = getEnemyProperties(enemyType);

    switch (side) {
        case 0:
            x = Math.random() * CANVAS.width;
            y = -enemyProps.spriteSize / 2;
            break;
        case 1:
            x = CANVAS.width + enemyProps.spriteSize / 2;
            y = Math.random() * CANVAS.height;
            break;
        case 2:
            x = Math.random() * CANVAS.width;
            y = CANVAS.height + enemyProps.spriteSize / 2;
            break;
        case 3:
            x = -enemyProps.spriteSize / 2;
            y = Math.random() * CANVAS.height;
            break;
    }

    enemies.push({ x: x, y: y, type: enemyType });
}

function render() {
    CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);

    if (bgImg.complete) {
        const patternSize = bgImg.width; // Assuming the background image is square
        // Calculate offsets to center the background pattern relative to the player
        const offsetX = (player.x % patternSize + patternSize) % patternSize;
        const offsetY = (player.y % patternSize + patternSize) % patternSize;

        // Draw the repeating background pattern
         for (let y = -offsetY; y < CANVAS.height; y += patternSize) {
            for (let x = -offsetX; x < CANVAS.width; x += patternSize) {
                 CTX.drawImage(bgImg, x, y, patternSize, patternSize);
            }
        }
    }

    if (gameRunning) {
        // Draw player sprite
        if (playerImg.complete) {
             // Player sprite is currently drawn without rotation, just centered
            CTX.drawImage(playerImg, player.x - PLAYER_SPRITE_SIZE / 2, player.y - PLAYER_SPRITE_SIZE / 2, PLAYER_SPRITE_SIZE, PLAYER_SPRITE_SIZE);

            const currentGunImg = WEAPONS[selectedWeaponIndex].img;
            const currentWeapon = WEAPONS[selectedWeaponIndex];

            if (currentGunImg && currentGunImg.complete) {
                CTX.save();
                // Translate origin to player center for rotation
                CTX.translate(player.x, player.y);
                // Rotate context
                CTX.rotate(player.angle);

                const originalGunWidth = currentGunImg.width || 30;
                const originalGunHeight = currentGunImg.height || 10;
                
                // Calculate scaled dimensions
                const scaledDrawWidth = originalGunWidth * currentWeapon.drawScale;
                const scaledDrawHeight = originalGunHeight * currentWeapon.drawScale;

                // Draw the weapon image. Its top-left corner is placed at 
                // (-currentWeapon.gunOffsetX, currentWeapon.gunOffsetY) relative to the rotated context origin.
                // The image is drawn using the scaled dimensions.
                CTX.drawImage(currentGunImg, currentWeapon.gunOffsetX, currentWeapon.gunOffsetY, scaledDrawWidth, scaledDrawHeight);
                CTX.restore();
            }
        }

        enemies.forEach(enemy => {
            const enemyProps = getEnemyProperties(enemy.type);
            if (enemyProps.img.complete) {
                 CTX.drawImage(enemyProps.img, enemy.x - enemyProps.spriteSize / 2, enemy.y - enemyProps.spriteSize / 2, enemyProps.spriteSize, enemyProps.spriteSize);
            }
        });

        CTX.fillStyle = 'red'; 
        bullets.forEach(bullet => {
            CTX.beginPath();
            CTX.arc(bullet.x, bullet.y, bullet.size / 2, 0, Math.PI * 2); 
            CTX.fill();
        });

        CTX.fillStyle = 'white';
        CTX.font = '20px Arial';
        CTX.fillText(`Jogador: ${playerName}`, 10, 25);
        CTX.fillText(`Pontuação: ${score}`, 10, 50);
        CTX.fillText(`Arma: ${WEAPONS[selectedWeaponIndex].name}`, 10, 105); 


        CTX.fillStyle = 'red';
        CTX.fillRect(10, 65, 100, 15);
        CTX.fillStyle = 'green';
        const healthBarWidth = Math.max(0, (player.health / 100) * 100);
        CTX.fillRect(10, 65, healthBarWidth, 15);
        CTX.strokeStyle = 'white';
        CTX.strokeRect(10, 65, 100, 15);
        CTX.fillStyle = 'white';
        CTX.font = '14px Arial';
        CTX.fillText(`Vida: ${Math.max(0, player.health)}`, 10, 90);

    } else if (gameOver) {
    }
}

let lastTime = 0;
function gameLoop(currentTime = 0) {
    update(currentTime);
    render();
    requestAnimationFrame(gameLoop);
}

let assetsLoaded = 0;
const totalAssets = 7;

function assetLoaded() {
    assetsLoaded++;
    if (assetsLoaded === totalAssets) {
        START_SCREEN.classList.remove('hidden');
        WEAPON_SELECTION_SCREEN.classList.add('hidden');
        gameLoop(); 
    }
}

playerImg.onload = assetLoaded;
gunImg.onload = assetLoaded;
gun2Img.onload = assetLoaded;
gun3Img.onload = assetLoaded;
enemyImg.onload = assetLoaded;
bossEnemyImg.onload = assetLoaded;
bgImg.onload = assetLoaded;

if (playerImg.complete && gunImg.complete && gun2Img.complete && gun3Img.complete && enemyImg.complete && bossEnemyImg.complete && bgImg.complete) {
     assetsLoaded = totalAssets;
     START_SCREEN.classList.remove('hidden');
     WEAPON_SELECTION_SCREEN.classList.add('hidden');
     gameLoop();
} else {
    if(playerImg.complete) assetLoaded();
    if(gunImg.complete) assetLoaded();
    if(gun2Img.complete) assetLoaded();
    if(gun3Img.complete) assetLoaded();
    if(enemyImg.complete) assetLoaded();
    if(bossEnemyImg.complete) assetLoaded();
    if(bgImg.complete) assetLoaded();
}
