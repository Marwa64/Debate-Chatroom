const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(express.static(__dirname+'/public/'));

app.get('/', (req, res) => {
  res.sendFile(__dirname+'/index.html');
})

let topics = ['A college degree is essential for getting a good job',
              'Boarding school is harmful for students',
              'Cell phones should be banned in schools',
              'College should be free for everyone',
              'Do you need homework in order to learn?',
              'Education should focus on maths and science rather than music and art',
              'Fast food should be banned in schools',
              'Homeschooling is better than traditional schooling',
              'Public schools are better than private schools',
              'School uniforms should be mandatory',
              'Studying a second language should be compulsory',
              'Teachers should be paid as much as doctors',
              'Burning the flag should be illegal',
              'Censorship is sometimes warranted on the internet',
              'Companies should be required to hire 50% male and 50% female employees',
              'Drug addicts should be helped rather than punished',
              'Drug use should be treated as a mental health issue rather than a criminal offense',
              'Has the #MeToo movement gone too far?',
              'Healthcare should be universal',
              'Is graffiti art just as worthy of regard as classical paintings?',
              'Peer pressure is a good thing',
              'Smoking should be banned',
              'Social media does more harm than good',
              'The death penalty should be abolished',
              'The minimum wage should be raised',
              'Robots should have rights',
              'Reality television is harming society',
              'Animal testing should be banned',
              'Children should not be allowed to play violent video games',
              'There should be no advertisements on kids channels',
              'Torture is never justified, no matter what the situation is',
              'Fast-food chains are the major cause of increase in obesity rate',
              'Social networking sites are used for stalking instead of communicating',
              'Money is a major source of motivation in the workplace',
              'Models are setting wrong standards of beauty',
              'The sale of human organs should be legalized'
            ];

let rooms=[], role="", index, newRoom;

io.on('connection', socket => {
  console.log("A user connected " + socket.id);

  if (rooms.length === 0){
    console.log("new room because there are no rooms")
    let topicIndex = Math.floor(Math.random() * topics.length);
    newRoom = {id: rooms.length,
              topic: topics[topicIndex],
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

    // If there are 3 users in the room, we'll mark start as true
    if (rooms[index].client1ID != "" && rooms[index].client2ID != "" && rooms[index].client3ID != ""){
      console.log("room " + rooms[index].id + " is full, it's starting!");
      rooms[index].start = true;
      io.sockets.in("room-"+rooms[index].id).emit('start', {topic: rooms[index].topic});
    }
  } else {
    console.log("new room because there are no rooms that didn't start");
    let topicIndex = Math.floor(Math.random() * topics.length);
    newRoom = {id: rooms.length,
              topic: topics[topicIndex],
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

  socket.on('vote', data => {
    console.log(data.reason);
    io.sockets.in("room-"+data.room).emit('results', {reason: data.reason, winner: data.winner});
  })

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
