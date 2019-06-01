// Setup basic express server
var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var port = process.env.PORT || 3000;
const box = 32;
var firstGame = true;

var player1;
var player2;

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

  //accept or deny client login request
  socket.on('request login', (username, password) => {
    var reply = 'success'; //some database query default to success for now

    if (reply == 'success') {
      socket.addedUser = true;
      socket.username = username; // save this client's username for later identification use
    }

    socket.emit('reply login', reply);
  });

  // when client emits 'new arrowkey', this listens and executes
  socket.on('new arrowkey', (data) => {
    console.log("socket.username = " + socket.username);
    // we tell the client to execute 'new arrowkey'
    io.emit('new arrowkey', {
      username: socket.username,
      message: data
    });
  });

  socket.on('level selected', (goal, lost, speed) => {
    console.log("speed: " + speed);
    socket.broadcast.emit('level selected', {
      goal: goal,
      lost: lost,
      speed: speed
    });
  });

  socket.on("winner determined", (winnerName) => {
    firstGame = false;
    console.log("winner determined");
    numUsers = 0;
    socket.broadcast.emit("winner determined", {
      winnerName: winnerName
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', () => {
    //delete after scaling to multiplayer
    if (numUsers == 2) {
      socket.emit('full', {
        numUsers: numUsers
      });
      return;
    }

    ++numUsers;
    console.log("numUsers " + numUsers);

    if (firstGame) {
      if (numUsers == 1) {
        player1 = socket.username;
      } else {
        player2 = socket.username;
      }
    }

    console.log("player1: " + player1);
    console.log("player2: " + player2);

    // create the initial apple
    let food = {
      x: Math.floor(Math.random() * 17 + 1) * box,
      y: Math.floor(Math.random() * 15 + 3) * box
    }

    // echo globally (all clients) that a person has connected
    io.emit('user joined', {
      player2: player2,
      player1: player1,
      food: food,
      numUsers: numUsers
    });
  });

  socket.on('apple ate', (food, first_score, second_score) => {
    io.emit('make apple at', {
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
