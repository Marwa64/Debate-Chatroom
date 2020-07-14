const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(express.static(__dirname+'/public/'));

app.get('/', (req, res) => {
  res.sendFile(__dirname+'/index.html');
})

io.on('connection', data => {
  console.log("A user connected");

  socket.on('disconnect', data => {
    console.log("A user disconnected");
  })
})

server.listen(process.env.PORT || 3000);
