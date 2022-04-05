// Configuration du serveur et des modules

const express = require('express');
const app = express();
const http = require('http');

const server = http.createServer(app);
const {Server} = require("socket.io");
const io = new Server(server);

var path = require("path");
const PORT = 8080;
var msg = [];
app.use(express.json());

//Port d'écoute 

server.listen(PORT, () => {
  console.log('Serveur démarré sur le port : ' + PORT);
});

//Génère les routes pour le serveur

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.get('/client',(req, res) =>{
  res.sendFile(__dirname + '/client.js');
});

app.get('/style.css', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'css/style.css'));
});

//Gestion évènement pour géré le Socket

io.on('connection',(socket) => {
  // Socket de saisie du pseudo
  socket.on('set-pseudo',(pseudo) => {
    console.log(pseudo + " vient de se connecter à " + new Date());
    socket.nickname = pseudo;
    room();
  });

  //Réception des pseudo et les transformer en lien cliquable 
  function room() {
    io.fetchSockets().then((room) => {
      var utilisateur = [{id_users: 'salon', pseudo_client:'Salon'}];
      room.forEach((item) => {
        // console.log(item); DEBUG MODE 
        utilisateur.push({
          client_id : item.id,
          pseudo_client : item.nickname
        });
      }); 
      io.emit('get-pseudo', utilisateur)
    });
    io.emit('msg', msg);
  }

  socket.on('emission_message',(Message, id) => {
    console.log(id);
    console.log(socket.nickname + " à écrit : " + Message + " le : " + new Date());
    var Message = {
      emet_id: socket.id,
      dest_ID: id,
      pseudo: socket.nickname,
      msg: Message,
      recu: false
    }

    if (id === "Salon") {
      io.emit('reception_message', Message);
    } else {
      io.to(id).to(socket.id).emit('reception_message', Message);
    }
  });

  socket.on('disconnect',() => {
    console.log(socket.nickname + " s'est déconnecté à " + new Date());
    room();
  });

});

