let socket;

function loadChat() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.querySelector(".main").innerHTML = this.responseText;
      socket = io();
      console.log("clickity click click");
      let sendBtn = document.querySelector("#sendBtn");
      // If send is clicked
      sendBtn.addEventListener('click', () => {
        createMessage();
      });
      // If enter is pressed
      window.addEventListener('keydown', ()=>{
        if (event.keyCode === 13 ){
          createMessage();
        }
      })
      // For testing purposes if chat box is clicked
      let messagesBox = document.querySelector(".messagesBox");
      messagesBox.addEventListener('click', () => {
        createMessage("Boooo", false);
      });
    }
  };
  xhttp.open("GET", "chatroom.html", true);
  xhttp.send();
}

function createMessage(text=document.querySelector("input").value, mine=true){
  if (text != ""){
    let message = document.createElement("div");
    message.classList.add("message");
    if (mine){
      message.classList.add("mr-auto");
    } else {
      message.classList.add("ml-auto");
    }
    message.innerText = text;
    document.querySelector(".messagesBox").appendChild(message);
    message.scrollIntoView();
    document.querySelector("input").value="";
  }
}
