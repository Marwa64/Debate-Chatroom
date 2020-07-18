let socket, room, thisRole, opponentRole, debatee1, debatee2;

function loadChat() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.querySelector(".main").innerHTML = this.responseText;
      let passBtn = document.body.querySelector("#passBtn");
      passBtn.addEventListener('click', pass);
      joinRoom();
    }
  };
  xhttp.open("GET", "chatroom.html", true);
  xhttp.send();
}

function joinRoom(){
  socket = io();

  thisRole = "";

  let messageInput = document.body.querySelector(".messageInput");
  messageInput.innerText = "Waiting for debaters to join..";
  messageInput.classList.add("judge");

  socket.on('role', data => {
    console.log(data.room);
    room = data.room;
    if (data.role === "Red"){
      thisRole = "#f99999";
      opponentRole = "#9bc7f1";
    } else if (data.role === "Blue"){
      thisRole = "#9bc7f1";
      opponentRole = "#f99999";
    } else {
      thisRole = data.role;
      debatee1 = "#f99999";
      debatee2 = "#9bc7f1";
    }
  });

  socket.on('start', () => {
    let messageInput = document.body.querySelector(".messageInput");
    if (thisRole != "judge"){
      messageInput.innerHTML = "<div id='messageRow' class='row'><div class='col-9'><input type='text' class='form-control' placeholder='Enter your message'></div><div class='col-3'><button type='button' class='btn btn-warning btn-block btnFont' id='sendBtn'>Send</button></div></div>";
      let sendBtn = document.querySelector("#sendBtn");
      sendBtn.addEventListener('click', () => {
        createMessage();
      });
      window.addEventListener('keydown', ()=>{
        try{
          if (event.keyCode === 13 ){
            createMessage();
          }
        } catch(err){
          console.log("Can't send");
        }
      });
    } else {
      messageInput.innerText = "You are the judge";
      messageInput.classList.add("judge");
    }

    setInterval(checkTyping, 100);
  });

  socket.on('newMessage', data => {
    if (thisRole === "judge"){
      judgeMessages(data.role, data.message);
    } else {
      if (data.role === "Red" && thisRole != "#f99999"){
        createMessage(data.message, false);
      }
      if (data.role === "Blue" && thisRole != "#9bc7f1"){
        createMessage(data.message, false);
      }
    }
  });
  socket.on('playerLeave', data => {
    thisRole = "";
    disconnect();
    socket.disconnect();
  });

  socket.on('playerTyping', data => {
    let typingBox = document.body.querySelector(".typing");
    if (thisRole === "judge"){
      if (typingBox.innerText === ""){
        typingBox.innerText = data.role + " is typing..";
      }
    } else {
      if (data.role === "Red" && thisRole != "#f99999"){
        typingBox.innerText = data.role + " is typing..";
      }
      if (data.role === "Blue" && thisRole != "#9bc7f1"){
        typingBox.innerText = data.role + " is typing..";
      }
    }
  });

  socket.on('playerNotTyping', data => {
    let typingBox = document.body.querySelector(".typing");
    if (thisRole === "judge"){
      let newTyping = data.role + " is typing..";
      if (newTyping === typingBox.innerText){
        typingBox.innerText = "";
      }
    } else {
      if (data.role === "Red" && thisRole != "#f99999"){
        typingBox.innerText = "";
      }
      if (data.role === "Blue" && thisRole != "#9bc7f1"){
        typingBox.innerText = "";
      }
    }
  });

}

function pass(){
  if (thisRole === "#f99999"){
    socket.emit('pass', {room: room, role: "Red"});
  } else  if (thisRole === "#9bc7f1") {
    socket.emit('pass', {room: room, role: "Blue"});
  } else {
    socket.emit('pass', {room: room, role: "judge"});
  }
}

function join(){
  console.log("Join!");
  let passBtn = document.body.querySelector("#passBtn");
  passBtn.addEventListener('click', pass);
  passBtn.classList.remove("unactiveBtn");
  passBtn.classList.add("activeBtn");

  let joinBtn = document.body.querySelector("#joinBtn");
  joinBtn.removeEventListener('click', join);
  joinBtn.classList.remove("activeBtn");
  joinBtn.classList.add("unactiveBtn");
  joinRoom();
}

function createMessage(text=document.querySelector("input").value, mine=true) {
  if (text != ""){
    let message = document.createElement("div");
    message.innerText = text;
    message.classList.add("message");
    if (mine){
      message.classList.add("mr-auto");
      message.style.background = thisRole;
      document.querySelector("input").value="";
      if (thisRole === "#f99999"){
        socket.emit('message', {room: room, role: "Red", message: text});
      } else if (thisRole === "#9bc7f1"){
        socket.emit('message', {room: room, role: "Blue", message: text});
      }
    } else {
      message.classList.add("ml-auto");
      message.style.background = opponentRole;
    }
    document.querySelector(".messagesBox").appendChild(message);
    message.scrollIntoView();
  }
}

function judgeMessages(color, text) {
  let message = document.createElement("div");
  message.classList.add("message");
  if (color === "Red"){
    message.classList.add("mr-auto");
    message.style.background = debatee1;
  } else {
    message.classList.add("ml-auto");
    message.style.background = debatee2;
  }
  message.innerText = text;
  document.querySelector(".messagesBox").appendChild(message);
  message.scrollIntoView();
}

function disconnect() {
  console.log("pass");
  // Activate Join debate button
  let joinBtn = document.body.querySelector("#joinBtn");
  joinBtn.addEventListener('click', join);
  joinBtn.classList.remove("unactiveBtn");
  joinBtn.classList.add("activeBtn");
  // Deactivate pass button
  let passBtn = document.body.querySelector("#passBtn");
  passBtn.removeEventListener('click', pass);
  passBtn.classList.remove("activeBtn");
  passBtn.classList.add("unactiveBtn");
  // Clear messages
  let box = document.body.querySelector(".messagesBox");
  box.innerHTML = "";
  // Declare that the debate is over
  let messageInput = document.body.querySelector(".messageInput");
  messageInput.innerText = "A player left, this debate is over.";
  messageInput.classList.add("judge");
}

function checkTyping(){
  if (thisRole != "judge" && thisRole != ""){
    if (document.querySelector("input").value != ""){
      if (thisRole === "#f99999"){
        socket.emit('typing', {room: room, role: "Red"});
      } else  if (thisRole === "#9bc7f1") {
        socket.emit('typing', {room: room, role: "Blue"});
      }
    } else {
      if (thisRole === "#f99999"){
        socket.emit('notTyping', {room: room, role: "Red"});
      } else  if (thisRole === "#9bc7f1") {
        socket.emit('notTyping', {room: room, role: "Blue"});
      }
    }
  }
}
