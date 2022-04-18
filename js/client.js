//Instanciation des sockets et des variables

const socket = io();
var id_salon = 'Salon';
var lesMessages = [];
const messages = document.getElementById('messages');
const users = document.getElementById('users');
const form = document.getElementById('form');
const input = document.getElementById('input');

//Ecoute des messages et envoie des messages

form.addEventListener('submit', (e) => {
  e.preventDefault();

  if (input.value !== '') {
    socket.emit('emission_message', input.value, id_salon);
    input.value = '';
  }
});

//Réception des messages

socket.on('reception_message', (Message) => {
  console.log(Message);
  lesMessages.push({
    pseudo: Message.pseudo,
    message: Message.msg,
    dest_ID: Message.dest_ID,
    emet_id: Message.emet_id,
    recu: Message.recu
  });

  salon(id_salon);
  check_unread();
  window.scrollTo(0, document.body.scrollHeight);
  
});

//Mise en place des variables pour le salon général et privé 

socket.on('get-pseudo', (utilisateur) => {
  // console.log(utilisateur); DEBUG MODE 
  users.innerHTML = "";
  var salon_li = document.createElement("li");
  var salon_a = document.createElement("a");

  salon_li.setAttribute("id", id_salon);
  users.appendChild(salon_li).appendChild(salon_a);

  utilisateur.forEach((element) => {
    var li = document.createElement("li");
    var a = document.createElement("a");
    var notif = document.createElement("span");

    // console.log(li); DEBUG MODE

    a.href = "#";
    a.setAttribute("onclick", "salon('" + element.client_id + "')");

    notif.setAttribute("id", element.client_id);
    notif.setAttribute("class", "badge badge-light");
    // console.log(element); DEBUG MODE 
    a.innerHTML = (socket.id !== element.client_id ? element.pseudo_client : null);
    users.appendChild(li).appendChild(a).appendChild(notif);
  });
});

function salon(id) {
  id_salon = id;
  messages.innerHTML = "";
  lesMessages.forEach((contenu) => {
    if (contenu.dest_ID === id_salon || contenu.emet_id === id_salon && contenu.dest_ID !== "Salon") {
      var li = document.createElement("li");
      li.innerHTML = contenu.pseudo + " : " + contenu.message;
      messages.appendChild(li);
      contenu.recu = true;
    }
  });

  if (id_salon !== 'Salon') {
    document.getElementById(id_salon).innerHTML = "";
  }
}

function check_unread() {
  var mesli = [];
  for(const contenu of lesMessages) {
    if(contenu.dest_ID !== 'salon' && contenu.recu === false) {
      if(mesli[contenu.dest_ID] === undefined) {
        mesli[contenu.dest_ID] = 0;
      }

      mesli[contenu.dest_ID]++;
      document.getElementById(contenu.emet_id).innerHTML=mesli[contenu.dest_ID]
    }
  }
}