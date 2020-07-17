const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(express.static(__dirname+'/public/'));

app.get('/', (req, res) => {
  res.sendFile(__dirname+'/index.html');
})

let roomNum = 0, clientNum = 0, role="";
io.on('connection', socket => {
  console.log("A user connected " + clientNum);
  // We're inceasing the room number if there are 3 people in the room
  if(io.nsps['/'].adapter.rooms["room-"+roomNum] && io.nsps['/'].adapter.rooms["room-"+roomNum].length == 3){
    roomNum++;
    clientNum = 0;
    console.log("New room!");
  }
  socket.join("room-" + roomNum);
  if (clientNum === 0){
    role = "judge";
  } else if (clientNum === 1){
    role = "red";
  } else if (clientNum === 2){
    role = "blue";
  }
  clientNum++;
  socket.emit('role', {role: role, room: roomNum});

  socket.on('message', data => {
    console.log(data.role);
    io.sockets.in("room-"+data.room).emit('newMessage', {role: data.role, message: data.message});
  });
  socket.on('disconnect', () => {
    console.log("A user disconnected");
  })
})

server.listen(process.env.PORT || 3000);
