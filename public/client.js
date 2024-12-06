const socket = io(); // Connexion au serveur

// Initialiser le canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Variables de jeu
let player = { x: 0, y: 0, size: 20, color: 'blue' };
const players = {};
let foodItems = [];

// Recevoir l'état initial du jeu du serveur
socket.on('init', (data) => {
  Object.assign(players, data.players);
  foodItems = data.foodItems;
  player = players[socket.id]; // Identifier notre joueur
});

// Ajouter un nouveau joueur
socket.on('newPlayer', (data) => {
  players[data.id] = data.player;
});

// Retirer un joueur
socket.on('removePlayer', (id) => {
  delete players[id];
});

// Mettre à jour les joueurs
socket.on('updatePlayers', (updatedPlayers) => {
  Object.assign(players, updatedPlayers);
});

// Détecter les mouvements de la souris pour déplacer le joueur
canvas.addEventListener('mousemove', (event) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  // Déplacer le joueur vers la position de la souris
  player.x += (mouseX - player.x) * 0.1;
  player.y += (mouseY - player.y) * 0.1;

  // Envoyer la nouvelle position au serveur
  socket.emit('playerMove', { x: player.x, y: player.y });
});

// Dessiner un joueur
function drawPlayer(p) {
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
  ctx.fillStyle = p.color;
  ctx.fill();
  ctx.closePath();
}

// Dessiner une nourriture
function drawFood(food) {
  ctx.beginPath();
  ctx.arc(food.x, food.y, food.size, 0, Math.PI * 2);
  ctx.fillStyle = 'orange';
  ctx.fill();
  ctx.closePath();
}

// Boucle principale du jeu
function gameLoop() {
  // Nettoyer l'écran
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Dessiner la nourriture
  foodItems.forEach(drawFood);

  // Dessiner tous les joueurs
  for (const id in players) {
    drawPlayer(players[id]);
  }

  // Dessiner le joueur principal
  drawPlayer(player);

  // Appeler la boucle de jeu à nouveau
  requestAnimationFrame(gameLoop);
}

// Démarrer la boucle de jeu
gameLoop();
