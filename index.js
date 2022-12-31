const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

submit = 0;
let spoints = {};

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/word.html', (req, res) => {
  res.sendFile(__dirname + "/word.html")
})

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on("info", function(data){
    console.log(data);
    socket.room = data.roomId;
    socket.name = data.name;
    socket.join(socket.room);
    socket.emit("info", {
      "roomcode": socket.room,
      "name": socket.name
    });
    spoints[socket.room] = {};
  });

  socket.on("message",function(data){
    console.log(data.chat);
    socket.to(socket.room).emit("message",{
      "chat": data.chat,
      "name": socket.name
    })
  });

  socket.on("points",function(data){
    let point = data.score[data.roomcode][data.pname];
    spoints[data.roomcode][data.pname] = point;
    console.log(spoints);
    socket.emit("score",{
      "scores": spoints,
      "roomcode": data.roomcode
    });
  })

  socket.on("mouse", function(data){
    socket.to(socket.room).emit("mouse",{
      "x": data.x,
      "y": data.y
    })
    console.log(data);
  })
  
  socket.on("signal",function(data){
    count = 0;
    myinterval = setInterval(function(){
      count = count + 1
      console.log(count);
      if(count > 90){
        socket.emit("signal",0);
        clearInterval(myinterval);
      }
    },1000);
  })

  socket.on("chossenword", function(data){
    socket.to(socket.room).emit("chossenword",data);
    console.log(data);
  })
});


server.listen(8000, () => {
  console.log('listening on *:8000');
});