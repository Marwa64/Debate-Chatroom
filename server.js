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

  if (clientNum > 2){
    roomNum++;
    clientNum = 0;
    console.log("New room!");
  }
  if (clientNum === 0){
    role = "judge";
    clientNum++;
  } else if (clientNum === 1){
    role = "Red";
    clientNum++;
  } else if (clientNum === 2){
    role = "Blue";
    clientNum++;
    io.sockets.in("room-"+roomNum).emit('start', "");
    socket.emit('start', "");
  } 
  socket.join("room-" + roomNum);
  socket.emit('role', {role: role, room: roomNum});

  socket.on('message', data => {
    io.sockets.in("room-"+data.room).emit('newMessage', {role: data.role, message: data.message});
  });

  socket.on('pass', data => {
    io.sockets.in("room-"+data.room).emit('playerLeave', {role: data.role});
    socket.leave("room-" + data.room);
  });

  socket.on('typing', data => {
    io.sockets.in("room-"+data.room).emit('playerTyping', {role: data.role});
  });

  socket.on('notTyping', data => {
    io.sockets.in("room-"+data.room).emit('playerNotTyping', {role: data.role});
  });

  socket.on('disconnect', () => {
    console.log("A user disconnected");
  })
})

server.listen(process.env.PORT || 3000);
