const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve les fichiers statiques du dossier "public"
app.use(express.static('public'));

// Stocke les joueurs et les nourritures
let players = {};
let foodItems = [];

// Générer de la nourriture aléatoirement
function generateFood() {
  return {
    x: Math.random() * 800,
    y: Math.random() * 600,
    size: Math.random() * 10 + 5,
  };
}

// Création initiale de nourritures
for (let i = 0; i < 50; i++) {
  foodItems.push(generateFood());
}

// Lorsqu'un joueur se connecte
io.on('connection', (socket) => {
  // Ajouter un joueur avec un ID unique
  players[socket.id] = {
    x: 400,
    y: 300,
    size: 20,
    color: 'blue',
  };

  // Envoyer l'état initial du jeu (joueurs et nourritures) au client
  socket.emit('init', { players, foodItems });

  // Notifier les autres joueurs de l'arrivée d'un nouveau joueur
  socket.broadcast.emit('newPlayer', { id: socket.id, player: players[socket.id] });

  // Lorsqu'un joueur se déplace
  socket.on('playerMove', (data) => {
    if (players[socket.id]) {
      players[socket.id].x = data.x;
      players[socket.id].y = data.y;
    }
    // Envoyer la position mise à jour à tous les clients
    io.emit('updatePlayers', players);
  });

  // Lorsqu'un joueur déconnecte
  socket.on('disconnect', () => {
    delete players[socket.id];
    io.emit('removePlayer', socket.id);
  });
});

// Lancer le serveur sur le port 3000
server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
