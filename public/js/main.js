function loadChat() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.querySelector("body").innerHTML = this.responseText;
    }
  };
  xhttp.open("GET", "chatroom.html", true);
  xhttp.send();
}

let socket;

let startBtn = document.querySelector("#startBtn");
startBtn.addEventListener('click', () => {
  socket = io();
  console.log("clickity click click");
})
