// Setup basic express server
var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var port = process.env.PORT || 3000;
var player1;
var player2;
const box = 32;
var playerNum = 1;

/* ------------------------------- Setup Socket --------------------------------- */

server.listen(port, () => {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(path.join(__dirname, 'public')));

/* --------------------------------- Gameroom ----------------------------------- */
var numUsers = 0;

io.on('connection', (socket) => {
  var addedUser = false;
  var addedPassword = false;

  socket.on('left1', () => {
    console.log('left1');
    socket.broadcast.emit('left1');
  });

  socket.on('right1', () => {
        console.log('right1');
    socket.broadcast.emit('right1');
  });

  socket.on('left2', () => {
        console.log('left2');
    socket.broadcast.emit('left2');
  });

  socket.on('right2', () => {
        console.log('right2');
    socket.broadcast.emit('right2');
  });

  // when t client emits 'new arrowkey', this listens and executes
  socket.on('new arrowkey', (data) => {
    console.log("socket.username = " + socket.username);
    // we tell the client to execute 'new arrowkey'
    socket.broadcast.emit('new arrowkey', {
      username: socket.username,
      message: data
    });
  });

  socket.on('level selected', (goal, lost, speed) => {
    socket.broadcast.emit('level selected', {
      goal: goal,
      lost: lost,
      speed: speed
    });
  });

  socket.on("winner determined", (winnerName) => {
    socket.broadcast.emit("winner determined", {
      winnerName: winnerName
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', (username, password) => {
    // if (addedUser) return;
    // if (addedPassword) return;

    if (numUsers > 2) {
      socket.emit('full', {
        numUsers: numUsers
      });
      return;
    }

    // we store the username in the socket session for this client
    // socket.password = password;
    ++numUsers;
    console.log(numUsers);
    // addedUser = true;
    // addedPassword = true;
    if (numUsers <= 1) {
      player1 = username;
    } else {
      player2 = username;
    }

    console.log("player1: " + player1);
    console.log("player2: " + player2);
    // create the initial apple
    let food = {
      x : Math.floor(Math.random()*17+1) * box,
      y : Math.floor(Math.random()*15+3) * box
    }

    socket.emit('user joined', {
      player2: player2,
      player1: player1,
      food: food,
      // password: socket.password,
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      player2: player2,
      player1: player1,
      food: food,
      // password: socket.password,
      numUsers: numUsers
    });
    console.log("broadcasted");
  });


  socket.on('apple ate', (food, first_score, second_score) => {
    socket.broadcast.emit('make apple at', {
      food: food,
      first_score: first_score,
      second_score: second_score
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', () => {
    if (addedUser) {
      --numUsers;
      
      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});
