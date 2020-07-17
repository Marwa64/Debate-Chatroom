let socket, room, thisRole, opponentRole, debatee1, debatee2;

function loadChat() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.querySelector(".main").innerHTML = this.responseText;
      socket = io();

      socket.on('role', data => {
        console.log(data.room);
        room = data.room;
        if (data.role === "red"){
          thisRole = "#f99999";
          opponentRole = "#9bc7f1";
        } else if (data.role === "blue"){
          thisRole = "#9bc7f1";
          opponentRole = "#f99999";
        } else {
          thisRole = data.role;
          debatee1 = "#f99999";
          debatee2 = "#9bc7f1";
          let messageInput = document.body.querySelector(".messageInput");
          messageInput.innerText = "You are the judge";
          messageInput.classList.add("judge");
        }
      });
      socket.on('newMessage', data => {
        if (thisRole === "judge"){
          judgeMessages(data.role, data.message);
        } else {
          if (data.role === "red" && thisRole != "#f99999"){
            createMessage(data.message, false);
          }
          if (data.role === "blue" && thisRole != "#9bc7f1"){
            createMessage(data.message, false);
          }
        }
      });
      let sendBtn = document.querySelector("#sendBtn");
      // If send is clicked
      sendBtn.addEventListener('click', () => {
        createMessage();
      });
      // If enter is pressed
      window.addEventListener('keydown', ()=>{
        try{
          if (event.keyCode === 13 ){
            createMessage();
          }
        } catch(err){
          console.log("you're the judge");
        }
      });
    }
  };
  xhttp.open("GET", "chatroom.html", true);
  xhttp.send();
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
        socket.emit('message', {room: room, role: "red", message: text});
      } else if (thisRole === "#9bc7f1"){
        socket.emit('message', {room: room, role: "blue", message: text});
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
  if (color === "red"){
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
