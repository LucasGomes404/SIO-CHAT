// Configuration du serveur et des modules

const express = require('express');
const app = express();

const session = require('express-session');
const mariadb = require('mariadb');
const db = mariadb.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: 'root',
  database: 'sio_chat',
  port: '8082'
});
let infosUtilisateur;

const http = require('http');
const server = http.createServer(app);
const {Server} = require("socket.io");
const io = new Server(server);

var path = require("path");
const PORT = 8080;
var msg = [];

app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//Port d'écoute 

server.listen(PORT, () => {
  console.log('Serveur démarré sur le port : ' + PORT);
});

//Génère les routes pour le serveur

app.get('/salon', (req, res) => {
  if(req.session.loggedin) {
    res.sendFile(path.join(__dirname, '..', '/index.html'));
  } else {
    res.send("Erreur ! Accès non autorisé !");
  }
  console.log(req.sessionID);
  console.log(req.session);
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '/login.html'));
});

app.get('/client.js',(req, res) => {
  res.sendFile(__dirname + '/client.js');
});

app.get('/bootstrap.min.js', (req, res) => {
  res.sendFile(__dirname +'bootstrap.min.js');
}); 

app.get('/style.css', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'css/style.css'));
});

app.get('/bootstrap.min.css', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'css/bootstrap.min.css'));
});

app.get('/Login-Form-Basic.css', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'css/Login-Form-Basic.css'));
});

app.get('/loginstyle.css'), (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'css/loginstyle.css'));
}

//Gestion évènement pour géré le Socket et la connexion au salon

app.post('/login', async(req, res) => {
  const conn = await db.getConnection();
  const sql = "SELECT * FROM user WHERE mail = ? AND password = ?";
  const rows = await conn.query(sql, [req.body.mail, req.body.password]);
  await conn.end();
  console.log(req.body.mail);

  if(rows.length > 0) {
    infosUtilisateur = {
      mail: rows[0].mail,
      pseudo: rows[0].pseudo,
    };
    req.session.loggedin = true;
    res.sendFile(path.join(__dirname, '..', 'index.html'));
  } else {
    res.send("Erreur ! Identifiant ou e-mail incorrect !");
  }
});

io.on('connection',(socket) => {
  // Socket de saisie du pseudo
    console.log(infosUtilisateur.mail + " vient de se connecter à " + new Date());
    socket.mail = infosUtilisateur.mail;
    room();
  

  //Réception des pseudo et les transformer en lien cliquable 
  function room() {
    io.fetchSockets().then((room) => {
      var utilisateur = [{id_users: 'salon', pseudo_client:'Salon'}];
      room.forEach((item) => {
        // console.log(item); DEBUG MODE 
        utilisateur.push({
          client_id : item.id,
          pseudo_client : item.mail
        });
      }); 
      io.emit('get-pseudo', utilisateur)
    });
    io.emit('msg', msg);
  }

  socket.on('emission_message',(Message, id) => {
    console.log(id);
    console.log(socket.mail + " à écrit : " + Message + " le : " + new Date());
    var Message = {
      emet_id: socket.id,
      dest_ID: id,
      pseudo: socket.mail,
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

