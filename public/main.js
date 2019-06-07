// Initialize variables
const usernameInput = document.getElementsByClassName('usernameInput')[0]; // Input for 
const passwordInput = document.getElementsByClassName('passwordInput')[0]; // Input for 

// Prompt for setting a username
var username;
var connected = false;
var num_people_meet = false;
var loginSuccess = true; //placeholder for database query return val
var flag = 0;

const socket = io();

//get all html elements
const loginWarning = document.getElementById("login warning")
//for later use
// const playersList = document.getElementById("playersList");
// const opponentSelectionPage = document.getElementById("selectOpponentPage");
const winPage = document.getElementById("page2");
const cvs = document.getElementById("snake");
const ctx = cvs.getContext("2d");
const icon = document.getElementById("icon");
const levels = document.getElementById("levels");
const easybtn = document.getElementById("easy");
const normalbtn = document.getElementById("normal");
const hardbtn = document.getElementById("hard");
const inst = document.getElementById("instruction");
const testbtn = document.getElementById("test");
const winTitle = document.getElementById("winTitle");
const waitSign = document.getElementById("wait_sign");
const againbtn = document.getElementById("again");
const loginP = document.getElementById("loginPage");
const p1ID = document.getElementById("player1id");
const p1Win = document.getElementById("player1win");
const p1Lost = document.getElementById("player1lost");
const p2ID = document.getElementById("player2id");
const p2Win = document.getElementById("player2win");
const p2Lost = document.getElementById("player2lost");
const progressBar = document.getElementsByClassName('progress-bar')[0];
const computedStyle = getComputedStyle(progressBar);

/* ----------------------------------------------game variables-------------------------------------------- */
let winnerName;
let player1 = "player1";
let player2 = "player2";
var playerID;

// create the unit
const box = 32;
var numLost;
var maxScore;
var updateSpeed;
var game;
var p1WinNum = 0;
var p2WinNum = 0;
var p1LostNum = 0;
var p2LostNum = 0;
var game_page = false;

// load images
const ground = new Image();
ground.src = "img/ground.png";
const foodImg = new Image();
foodImg.src = "img/food.png";

// create the snakes
let first_snake = [];
let second_snake = [];

//set the start position of the frist snake
first_snake[0] = {
    x: 17 * box,
    y: 17 * box
};

//set the start position of the second snanke
second_snake[0] = {
    x: 1 * box,
    y: 3 * box
};

// create the scores
let first_score = 0;
let second_score = 0;

//control the snakes
let initialVal = 100;
let first_val = initialVal;
let second_val = initialVal;
let first_dir;
let second_dir;
let newHead;
let newHead2;
let oldHead2;

// gets the response of the user's login request 
socket.on('reply login', (loginResponse) => {
    loginSuccess = (loginResponse == "success");
});

// Add user to the game and proceed to level selection upon successful login
function LoginUser() {
    username = usernameInput.value.trim();
    var password = passwordInput.value.trim();

    socket.emit('request login', username, password);

    if (loginSuccess) {
        socket.emit('add user');
        loginP.style.display = "none";
        setTimeout(showLevelPage, 1000);
    } else {
        loginWarning = 'Wrong username or password';
    }
}

window.addEventListener("keydown", event => {
    // Do nothing if enter is pressed
    if (event.which === 13) {
        return;
    }

    // Handle arrow key broadcasting
    var inputKey;
    // Check which key was pressed
    switch (event.which) {
        case 37:
            inputKey = 1; // left
            break;
        case 39:
            inputKey = 2; // right
            break;
        default:
            return;
    }

    socket.emit('new arrowkey', inputKey);
});


/* ---------------------------------------- Socket events ------------------------------------------------------------ */

socket.on('level selected', (data) => {
    snakeGame(data.goal, data.lost, data.speed);
});

// Whenever the server emits 'login', log the login message
socket.on('full', (data) => {
    connected = false;
    alert("Sorry the game is full");
});

// Whenever the server emits 'new arrowkey', update the display body
socket.on('new arrowkey', (data) => {
    if (game_page) {
        if (data.username == player2) {
            second_snake_direction(data.message);
        } else {
            first_snake_direction(data.message);
        }
    }
});

// Whenever the server emits 'make apple at', make an apple at specified position
socket.on('make apple at', (data) => {
    food = data.food;
    first_score = data.first_score;
    second_score = data.second_score;
    console.log("make apple at: " + food.x + ", " + food.y);
});

// Whenever the server emits 'user joined', log it in the game body
socket.on('user joined', (data) => {
    food = data.food;

    if (data.numUsers == 2) {
        player2 = data.player2;
        player1 = data.player1;
        wait_sign.innerHTML = "Please select a level";
        num_people_meet = true;
    }
});

// Whenever the server emits 'user left', log it in the game body
socket.on('user left', (data) => {
    alert(data.username + ' left');
    clearInterval(game);
    cvs.style.display = "none";
    
    p1WinNum = 0;
    p2WinNum = 0;
    p1LostNum = 0;
    p2LostNum = 0;

    restart();
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

/* ----------------------------------------------snake game-----------------------------------------------------*/

function selectedLevel(goal, lost, speed) {
    if (num_people_meet) {
        snakeGame(goal, lost, speed);
        socket.emit('level selected', goal, lost, speed);
    } else {
        alert("Please wait for the other player to join");
    }
}

//set numLost, maxScore, and updating speed based on the passing parameters
function snakeGame(goal, lost, speed) {

    game_page = true;
    numLost = lost;
    maxScore = goal;
    updateSpeed = speed;
    game = setInterval(draw, updateSpeed);
    let winnerName = "";
    setTimeout(start, 500);

}

function first_snake_direction(direction) {
    if (direction == 1) {
        first_val -= 1;
    } else {
        first_val += 1;
    }

    if (first_val % 4 == 0) {
        first_dir = "LEFT";
    } else if (first_val % 4 == 1) {
        first_dir = "UP";
    } else if (first_val % 4 == 2) {
        first_dir = "RIGHT";
    } else if (first_val % 4 == 3) {
        first_dir = "DOWN";
    }
}

function second_snake_direction(direction) {
    if (direction == 1) {
        second_val -= 1;
    } else {
        second_val += 1;
    }

    if (second_val % 4 == 0) {
        second_dir = "LEFT";
    } else if (second_val % 4 == 1) {
        second_dir = "UP";
    } else if (second_val % 4 == 2) {
        second_dir = "RIGHT";
    } else if (second_val % 4 == 3) {
        second_dir = "DOWN";
    }
}

// check collision function
function collision(head, array) {
    for (let i = 0; i < array.length; i++) {
        if (head.x == array[i].x && head.y == array[i].y) {
            return true;
        }
    }
    return false;
}

// draw everything to the canvas

function draw() {

    ctx.drawImage(ground, 0, 0);

    //draw the body of first_snake
    for (let i = 1; i < first_snake.length; i++) {
        ctx.fillStyle = "#99bbff";
        ctx.fillRect(first_snake[i].x, first_snake[i].y, box, box);

        ctx.strokeStyle = "#99bbff";
        ctx.strokeRect(first_snake[i].x, first_snake[i].y, box, box);
    }

    for (let i = 1; i < second_snake.length; i++) {
        ctx.fillStyle = "#ffcc80";
        ctx.fillRect(second_snake[i].x, second_snake[i].y, box, box);

        ctx.strokeStyle = "#ffcc80";
        ctx.strokeRect(second_snake[i].x, second_snake[i].y, box, box);
    }
    ctx.fillStyle = "green";
    ctx.fillRect(first_snake[0].x, first_snake[0].y, box, box);
    ctx.fillStyle = "red";
    ctx.fillRect(second_snake[0].x, second_snake[0].y, box, box);

    ctx.drawImage(foodImg, food.x, food.y);
    //end the game if one player gets the max score
    if (first_score == maxScore || second_score == maxScore) {

        if (first_score == maxScore) {
            winnerName = player1;
            p1WinNum++;
            p2LostNum++;
        } else {
            winnerName = player2;
            p2WinNum++;
            p1LostNum++;
        }
        clearInterval(game);
        console.log("emmited winner determined");
        socket.emit("winner determined", winnerName);
        drawGB();
    }

    // old head position
    let first_snakeX = first_snake[0].x;
    let first_snakeY = first_snake[0].y;

    let second_snakeX = second_snake[0].x;
    let second_snakeY = second_snake[0].y;

    // which direction
    if (first_dir == "LEFT") first_snakeX -= box;
    if (first_dir == "UP") first_snakeY -= box;
    if (first_dir == "RIGHT") first_snakeX += box;
    if (first_dir == "DOWN") first_snakeY += box;

    if (second_dir == "LEFT") second_snakeX -= box;
    if (second_dir == "UP") second_snakeY -= box;
    if (second_dir == "RIGHT") second_snakeX += box;
    if (second_dir == "DOWN") second_snakeY += box;

    // if the snake eats the food
    if (first_snakeX == food.x && first_snakeY == food.y) {
        first_score++;
        if (first_score != maxScore) {
            var newFood = {
                x: Math.floor(Math.random() * 17 + 1) * box,
                y: Math.floor(Math.random() * 15 + 3) * box
            }
            socket.emit('apple ate', newFood, first_score, second_score);
            console.log("apple snake 1 ate x, y: " + newFood.x + ", " + newFood.y);
        }
        // we don't remove the tail
    } else if (first_snake.length - 1 == first_score) {
        // remove the tail
        first_snake.pop();
    }

    // if the snake eats the food
    if (second_snakeX == food.x && second_snakeY == food.y) {
        second_score++;
        if (second_score != maxScore) {
            food = {
                x: Math.floor(Math.random() * 17 + 1) * box,
                y: Math.floor(Math.random() * 15 + 3) * box
            }
            socket.emit('apple ate', food, first_score, second_score);
            console.log("apple snake 2 ate x, y: " + food.x + ", " + food.y);
        }
        // we don't remove the tail
    } else if (second_snake.length - 1 == second_score) {
        // remove the tail
        second_snake.pop();
    }

    // add new Head
    oldHead = newHead;
    newHead = {
        x: first_snakeX,
        y: first_snakeY
    }
    oldHead2 = newHead2;
    newHead2 = {
        x: second_snakeX,
        y: second_snakeY
    }

    // game over
    if (first_snakeX < box || first_snakeX > 17 * box || first_snakeY < 3 * box || first_snakeY > 17 * box || collision(newHead, first_snake) || collision(newHead, second_snake) || headCollision()) {
        if (headCollision()) {
            second_die();
        }
        first_die();
    }

    if (second_snakeX < box || second_snakeX > 17 * box || second_snakeY < 3 * box || second_snakeY > 17 * box || collision(newHead2, second_snake) || collision(newHead2, first_snake) || headCollision()) {
        if (headCollision()) {
            first_die();
        }
        second_die();
    }

    first_snake.unshift(newHead);
    second_snake.unshift(newHead2);

    ctx.fillStyle = "green";
    ctx.font = "30px Changa one";
    ctx.fillText(player1 + ": " + first_score, 14 * box, 1.6 * box);
    ctx.fillStyle = "red";
    ctx.fillText(player2 + ": " + second_score, 2 * box, 1.6 * box);
    ctx.fillStyle = "white";
    ctx.fillText("Goal: " + maxScore, 8 * box, 1.6 * box);
}

function first_die() {
    if (first_score > numLost) {
        first_score -= numLost;
    } else {
        first_score = 0;
    }

    first_snake = [];
    first_val = 100;
    first_dir = "LEFT";

    newHead = {
        x: 17 * box,
        y: 17 * box
    };
}
function second_die() {
    if (second_score > numLost) {
        second_score -= numLost;
    } else {
        second_score = 0;
    }

    second_snake = [];
    second_val = 102;
    second_dir = "RIGHT";

    newHead2 = {
        x: 1 * box,
        y: 3 * box
    };
}

function headCollision() {
    if (newHead.x == newHead2.x && newHead.y == newHead2.y) {
        return true;
    } else if (oldHead2) {
        if (newHead.x == oldHead2.x && newHead.y == oldHead2.y)
            return true;
    }
    return false;

}

//display the game, hide detecting page
function start() {
    icon.style.display = "none";
    inst.style.display = "none";
    levels.style.display = "none";
    easybtn.style.display = "none";
    normalbtn.style.display = "none";
    hardbtn.style.display = "none";
    waitSign.style.display = "none";
    cvs.style.display = "block";
}

function restart() {
    num_people_meet = false;
    socket.emit('add user');
    winPage.style.display = "none";
    winTitle.style.display = "none";
    againbtn.style.display = "none";
    p1ID.style.display = "none";
    p1Lost.style.display = "none";
    p1Win.style.display = "none";
    p2ID.style.display = "none";
    p2Lost.style.display = "none";
    p2Win.style.display = "none";
    icon.style.display = "block";
    first_snake = [];
    second_snake = [];
    first_snake[0] = {
        x: 17 * box,
        y: 17 * box
    };

    second_snake[0] = {
        x: 1 * box,
        y: 3 * box
    };

    first_score = 0;
    second_score = 0;

    first_val = initialVal;
    second_val = initialVal;

    showLevelPage();
}


function drawGB() {
    winPage.style.display = "block";
    cvs.style.display = "none";
    winTitle.innerHTML = "You Win! " + winnerName;
    winTitle.style.display = "block";
    againbtn.style.display = "block";

    p1ID.innerHTML = player1;
    p2ID.innerHTML = player2;
    p1Win.innerHTML = "WIN: " + p1WinNum;
    p2Win.innerHTML = "WIN: " + p2WinNum;
    p1Lost.innerHTML = "LOST: " + p1LostNum;
    p2Lost.innerHTML = "LOST: " + p2LostNum;

    p1ID.style.display = "block";
    p1Lost.style.display = "block";
    p1Win.style.display = "block";
    p2ID.style.display = "block";
    p2Lost.style.display = "block";
    p2Win.style.display = "block";

}

function showLevelPage() {
    inst.style.display = "none";
    progressBar.style.display = "none";
    levels.style.display = "block";
    easybtn.style.display = "block";
    normalbtn.style.display = "block";
    hardbtn.style.display = "block";
    waitSign.style.display = "block";
}
