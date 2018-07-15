// Initialize Firebase
var config = {
    apiKey: "AIzaSyBVHb2LSa71BGnWtl953fTD6lqNxxZGKcw",
    authDomain: "rps-multiplayer-1597a.firebaseapp.com",
    databaseURL: "https://rps-multiplayer-1597a.firebaseio.com",
    projectId: "rps-multiplayer-1597a",
    storageBucket: "rps-multiplayer-1597a.appspot.com",
    messagingSenderId: "268715794856"
};
firebase.initializeApp(config);

var database = firebase.database();

var databaseRef = database.ref();

var playersRef = database.ref("players");
var playerOneRef = database.ref("players/1");
var playerTwoRef = database.ref("players/2");
var playerOneMoveRef = database.ref("players/1/move");
var playerTwoMoveRef = database.ref("players/2/move");

var playerOneMove;
var playerTwoMove;

var turnRef = database.ref("turn");

var connectedRef = database.ref(".info/connected");

var playerOneReady = false;
var playerTwoReady = false;
var playerNumber;

var gameBtns = "<div><button class='rpsBtns' data-move='r'>ROCK</button></div><div><button class='rpsBtns' data-move='p'>PAPER</button></div><div><button class='rpsBtns' data-move='s'>SCISSORS</button></div>";
var $playerOneBtns = $("#playerOneBtns");
var $playerTwoBtns = $("#playerTwoBtns");

$("#nameForm").on("submit", function (e) {
    e.preventDefault();
    var name = $("#nameInput").val();
    $("#nameInput").val("");
    if (!playerOneReady) {
        addPlayer("1", name);
    }
    else if (!playerTwoReady) {
        addPlayer("2", name);
    }
});

function addPlayer(playerNum, name) {
    var playerObj = {
        [playerNum]: {
            name: name
        }
    };

    playerNumber = playerNum;
    $("#nameForm").hide();

    playersRef.update(playerObj);
    var ref = firebase.database().ref("players/" + playerNum);
    ref.onDisconnect().remove();
}

playersRef.on("child_added", function (snap) {
    //playerOneReady = false;
    //playerTwoReady = false;

    //playersRef.forEach(function (childSnap) {
    var key = snap.key;
    if (key === "1") {
        playerOneReady = true;
        $("#playerOneName").text(snap.child("name").val());
    }
    else if (key === "2") {
        playerTwoReady = true;
        $("#playerTwoName").text(snap.child("name").val());
    }
    //});

    checkIfReady();
    if (playerOneReady && playerTwoReady) {
        databaseRef.update({
            turn: 1
        });
    }
});

playersRef.on("child_removed", function (snap) {
    var key = snap.key;
    if (key === "1") {
        playerOneReady = false;
        $("#playerOneName").text(snap.child("name").val());
    }
    else if (key === "2") {
        playerTwoReady = false;
        $("#playerTwoName").text(snap.child("name").val());
    }

    checkIfReady();
});

function checkIfReady() {
    if (!playerOneReady) {
        $("#playerOneName").text("Waiting for Player 1");
        $playerTwoBtns.empty();
        turnRef.remove();
    }
    if (!playerTwoReady) {
        $("#playerTwoName").text("Waiting for Player 2");
        $playerOneBtns.empty();
        turnRef.remove();
    }
}

playerOneMoveRef.on("value", function (snap) {
    playerOneMove = snap.val();
});

playerTwoMoveRef.on("value", function (snap) {
    playerTwoMove = snap.val();
});

turnRef.on("value", function (snap) {
    if (snap.val() === 1) {
        if (playerNumber === "1") {
            $playerOneBtns.html(gameBtns);
        }
        else if (playerNumber === "2") {
            $playerTwoBtns.text("Waiting for Player 1");
        }
    }
    else if (snap.val() === 2) {
        if (playerNumber === "1") {
            $playerOneBtns.text("Waiting for Player 2");
        }
        else if (playerNumber === "2") {
            $playerTwoBtns.html(gameBtns);
        }
    }
    else if(snap.val()===3){
        $playerOneBtns.empty();
        $playerTwoBtns.empty();
        //console.log(firebase.database().ref().val().child('players/1/move'));
        //checkMoves();
    }
});

//function checkMoves(player1, player2){

//}

$(document).on("click", ".rpsBtns", function () {
    var val = $(this).attr("data-move");

    if (playerNumber === "1") {
        playerOneRef.update({
            move: val
        });
        databaseRef.update({
            turn: 2
        });
    }
    else if (playerNumber === "2") {
        playerTwoRef.update({
            move: val
        });
        databaseRef.update({
            turn: 3
        });
    }
});
  /*
  connectedRef.on("value", function(snap) {

    // If they are connected..
    if (snap.val()) {
        
      // Add user to the connections list.
      var con = connectionsRef.push(true);

      console.log(con);
      // Remove user from the connection list when they disconnect.
      con.onDisconnect().remove();
    }
  });*/