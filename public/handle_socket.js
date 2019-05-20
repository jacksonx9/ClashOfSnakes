const COLORS = [
    '#e21400', '#91580f', '#f8a700', '#f78b00',
    '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
    '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
];
//initialize database
/*const sqlite3 = require('sqlite3').verbose()
const DB_PATH = 'Users.db'

const DB = new sqlite3.Database(DB_PATH, function(err){
    if (err) {
        console.log(err)
        return
    }
    console.log('Connected to ' + DB_PATH + ' database.')
});
    

//creating first table for user logins

dbSchema = `CREATE TABLE IF NOT EXISTS Users(
    id integer NOT NULL PRIMARY KEY AUTOINCREMENT,
    username text NOT NULL UNIQUE,
    password text NOT NULL,
    in_use integer DEFAULT 0,
    wins integer DEFAULT 0,
    losses integer DEFAULT 0,
);`

    DB.exec(dbSchema, function(err){
        if (err) {
            console.log(err)
        }
    });
*/

// Initialize variables
const usernameInput = document.getElementsByClassName('usernameInput')[0]; // Input for username
const passwordInput = document.getElementsByClassName('passwordInput')[0]; // Input for password
const messages = document.getElementsByClassName('messages')[0]; // Messages area

const loginPage = document.getElementsByClassName('login.page')[0]; // The login page
const gamePage = document.getElementsByClassName('game.page')[0]; // The game page

// Prompt for setting a username
var username;
var password;
var connected = false;

const socket = io();

function addStatusMessage(data) {
    var message = '';
    if (data.numUsers === 1) {
        message += "there's 1 participant";
    } else {
        message += "there are " + data.numUsers + " participants";
    }
    console.log(message);
}

// new User entered. Move to level Select Page 
function newUser() {
    username = usernameInput.value.trim();
    password = passwordInput.value.trim();
    
    // If the username is valid
    // ----------------------------------------------------- Add database check here @Tony @Sunny
    if (username && password) {
        // Tell the server your username
        socket.emit('add user', username, password);     
    }
}

// Sends a arrow key message
function sendArrowKey(keyPressed) {
    // if there is a non-empty message and a socket connection
    if (keyPressed && connected) {
        addGameMessage({
            username: username,
            message: keyPressed
        });
        // tell server to execute 'new arrowkey' and send along one parameter
        socket.emit('new arrowkey', keyPressed);
    }
}

// Adds the visual game message to the message list
function addGameMessage(data, options) {
    console.log(data.username + ': ' + data.message);
}

// Keyboard events
window.addEventListener("keydown", event => {
    // Do nothing if enter is pressed
    if (event.which === 13) {
        return;
    }
    // Handle username settings
    if (!username && !password) {
        newUser();
        return;
    }

    // Handle arrow key broadcasting
    var inputKey;
    // Check which key was pressed
    switch (event.which) {
    case 37:
        inputKey = 'left';
        break;
    case 39:
        inputKey = 'right';
        break;
    default:
        return;
    }

    sendArrowKey(inputKey);   
});


/* ---------------------------------------- Socket events ------------------------------------------------------------ */

// Whenever the server emits 'login', log the login message
socket.on('login', (data) => {
    connected = true;
    console.log('joined');
    window.location.href = "levelSelection.html";
    if (data.numUsers == 1) {
        wait_sign.innerHTML = "Please wait for player2 to join";
    } else {
        wait_sign.innerHTML = "Please select a level";
    }
    addStatusMessage(data);
});

// Whenever the server emits 'login', log the login message
socket.on('full', (data) => {
    connected = false;
    var message = "Sorry, the game is full. You can observe the current game";
    console.log('full');
});

// Whenever the server emits 'new arrowkey', update the display body
socket.on('new arrowkey', (data) => {
    addGameMessage(data);
});

// Whenever the server emits 'user joined', log it in the game body
socket.on('user joined', (data) => {
    console.log(data.username + ' joined; His/Her password is: ' + data.password);
    wait_sign.innerHTML = "Please select a level";
    addStatusMessage(data);
});

// Whenever the server emits 'user left', log it in the game body
socket.on('user left', (data) => {
    console.log(data.username + ' left');
    addStatusMessage(data);
});

socket.on('disconnect', () => {
    console.log('you have been disconnected');
});

socket.on('reconnect', () => {
    console.log('you have been reconnected');
    if (username) {
        socket.emit('add user', username);
    }
});

socket.on('reconnect_error', () => {
    console.log('attempt to reconnect has failed');
});

/*----------------------------------------------------------------------------------*/
function registerUser(username, password) {
    var sql= "INSERT INTO Users (username, password) "
    sql += "VALUES (? ,?) "
 
    DB.run(sql, [username, password], function(error) {
        if (error) {
            console.log(error)
        } else {
            console.log("Last ID: " + this.lastID)
            console.log("# of Row Changes: " + this.changes)
        }
    });
}