const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const player = {
    x: 50,
    y: 50,
    width: 30,
    height: 30,
    speed: 3,
    dx: 0,
    dy: 0
};

// Tamanho do canvas
canvas.width = 800;
canvas.height = 600;

// Função para desenhar o jogador
function drawPlayer() {
    ctx.fillStyle = 'blue';
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

// Função de atualização do jogo
function updateGameArea() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa o canvas
    drawSafeZone(); // Desenha a zona segura
    drawPlayer(); // Desenha o jogador
    movePlayer(); // Move o jogador
    shrinkZone(); // Encolhe a zona segura
}

// Função para mover o jogador
function movePlayer() {
    player.x += player.dx;
    player.y += player.dy;
    
    // Impede que o jogador saia dos limites do canvas
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;
}

// Função que escuta as teclas pressionadas para mover o jogador
function move(event) {
    if (event.key === "ArrowUp") {
        player.dy = -player.speed;
    } else if (event.key === "ArrowDown") {
        player.dy = player.speed;
    } else if (event.key === "ArrowLeft") {
        player.dx = -player.speed;
    } else if (event.key === "ArrowRight") {
        player.dx = player.speed;
    }
}

// Função que escuta quando a tecla é solta
function stopMove(event) {
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        player.dy = 0;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        player.dx = 0;
    }
}

// Adicionando os ouvintes de eventos de teclado
window.addEventListener('keydown', move);
window.addEventListener('keyup', stopMove);

// Função para desenhar a zona segura
let zoneRadius = 250; // Raio inicial da zona
let zoneCenterX = canvas.width / 2;
let zoneCenterY = canvas.height / 2;

function drawSafeZone() {
    ctx.beginPath();
    ctx.arc(zoneCenterX, zoneCenterY, zoneRadius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fill();
}

// Função que simula a redução da zona segura
function shrinkZone() {
    zoneRadius -= 0.1;
    if (zoneRadius < 50) zoneRadius = 50;
}

// Função de loop do jogo
function gameLoop() {
    updateGameArea();
    requestAnimationFrame(gameLoop);
}

// Iniciar o loop do jogo
gameLoop();
