const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(express.static(__dirname+'/public/'));

app.get('/', (req, res) => {
  res.sendFile(__dirname+'/index.html');
})

let rooms=[], role="", index, newRoom;

io.on('connection', socket => {
  console.log("A user connected " + socket.id);

  if (rooms.length === 0){
    console.log("new room because there are no rooms")
    newRoom = {id: rooms.length,
              client1ID: "",
              client2ID: "",
              client3ID: "",
              start: false};
    rooms.push(newRoom);
  }
  index = rooms.length-1;

  // if this room hasn't started yet, we'll look for the available position and add the new user to it giving them a role as well
  if (rooms[index].start === false){

    if (rooms[index].client1ID === ""){
      rooms[index].client1ID = socket.id;
      role = "judge";
      socket.join("room-" + rooms[index].id);
      socket.emit('role', {role: role, room: rooms[index].id});

    } else if (rooms[index].client2ID === ""){
      rooms[index].client2ID = socket.id;
      role = "Blue";
      socket.join("room-" + rooms[index].id);
      socket.emit('role', {role: role, room: rooms[index].id});

    } else {
      rooms[index].client3ID = socket.id;
      role = "Red";
      socket.join("room-" + rooms[index].id);
      socket.emit('role', {role: role, room: rooms[index].id});
    }
    console.log("Room ID: " + rooms[index].id);
    console.log("1st: " + rooms[index].client1ID);
    console.log("2nd: " + rooms[index].client2ID);
    console.log("3rd: " + rooms[index].client3ID);
    // If there are 3 users in the room, we'll mark start as true
    if (rooms[index].client1ID != "" && rooms[index].client2ID != "" && rooms[index].client3ID != ""){
      console.log("room " + rooms[index].id + " is full, it's starting!");
      rooms[index].start = true;
      io.sockets.in("room-"+rooms[index].id).emit('start', "");
    }
  } else {
    console.log("new room because there are no rooms that didn't start");
    newRoom = {id: rooms.length,
              client1ID: socket.id,
              client2ID: "",
              client3ID: "",
              start: false};
    rooms.push(newRoom);
    role = "judge";
    socket.join("room-" + newRoom.id);
    socket.emit('role', {role: role, room: newRoom.id});
  }

  socket.on('message', data => {
    io.sockets.in("room-"+data.room).emit('newMessage', {role: data.role, message: data.message});
  });

  socket.on('pass', data => {
    socket.leave("room-" + data.room);
    socket.emit('playerLeave', {role: data.role});
    for (let i = 0; i < rooms.length; i++){
      if (rooms[i].id === data.room){
        // If a user passed before the debate started, we'll just remove their id from the room and wait for another user
        if (rooms[i].start === false){
          if (rooms[i].client1ID === socket.id){
            rooms[i].client1ID = "";
          } else if (rooms[i].client2ID === socket.id){
            rooms[i].client2ID = "";
          } else {
            rooms[i].client3ID = "";
          }
          // If a user passed while the debate was taking place, we'll inform all the users the player left and end the debate
        } else {
          io.sockets.in("room-"+data.room).emit('playerLeave', {role: data.role});
          for (let i = 0; i < rooms.length; i++){
            if (rooms[i].id === data.room){
              rooms.splice(i,1);
            }
          }
        }
      }
    }
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
