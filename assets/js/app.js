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
var playerOneWinsRef = database.ref("players/1/wins");
var playerTwoWinsRef = database.ref("players/2/wins");
var playerOneLossesRef = database.ref("players/1/losses");
var playerTwoLossesRef = database.ref("players/2/losses");

var playerOneMove;
var playerTwoMove;

var wins = 0;
var losses = 0;

var playerOneReady = false;
var playerTwoReady = false;
var playerNumber;

var turnRef = database.ref("turn");

//var connectedRef = database.ref(".info/connected");

var intervalID;

var gameBtns = "<div><button class='rpsBtns' data-move='r'>ROCK</button></div><div><button class='rpsBtns' data-move='p'>PAPER</button></div><div><button class='rpsBtns' data-move='s'>SCISSORS</button></div>";
var $playerOneBtns = $("#playerOneBtns");
var $playerTwoBtns = $("#playerTwoBtns");
var $results = $("#results");
var $playerOneWins = $("#playerOneWins");
var $playerOneLosses = $("#playerOneLosses");
var $playerTwoWins = $("#playerTwoWins");
var $playerTwoLosses = $("#playerTwoLosses");

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
            name: name,
            wins: wins,
            losses: losses
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

    clearInterval(intervalID);
    $results.empty();

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
    switch (snap.val()){
        case 1:
            clearInterval(intervalID);
            $results.empty();

            switch (playerNumber){
                case "1":
                    $playerOneBtns.html(gameBtns);
                    break;
                case "2": 
                    $playerTwoBtns.text("Waiting for Player 1");
                    break;
            }          
            break;
        case 2:
            switch (playerNumber){
                case "1":
                    $playerOneBtns.text("Waiting for Player 2");
                    break;
                case "2":
                    $playerTwoBtns.html(gameBtns);
                    break;
                }
            break;
        case 3:
            $playerOneBtns.empty();
            $playerTwoBtns.empty();
            checkMoves();
            break;
    }
});

function checkMoves() {
    var playerOneWins = false;
    var playerTwoWins = false;

    if (playerOneMove === playerTwoMove) {
        $results.text("TIE GAME!");
    }
    else{
        switch (playerOneMove){
            case "r":
                switch(playerTwoMove){
                    case "s":
                        playerOneWins = true;
                        break;
                    case "p":
                        playerTwoWins = true;
                        break;
                }
                break;
            case "p":
                switch(playerTwoMove){
                    case "r":
                        playerOneWins = true;
                        break;
                    case "s":
                        playerTwoWins = true;
                        break;
                }
                break;
            case "s":
                switch(playerTwoMove){
                    case "p":
                        playerOneWins = true;
                        break;
                    case "r":
                        playerTwoWins = true;
                        break;
                }
                break;
        }
    }

    if (playerOneWins) {
        $results.text("Player One Wins!");
        switch (playerNumber){
            case "1":
                wins++;
                playerOneRef.update({wins: wins});
                break;
            case "2":
                losses++;
                playerTwoRef.update({losses: losses});
                break;
        }
    }
    else if (playerTwoWins) {
        $results.text("Player Two Wins!");
        switch (playerNumber){
            case "1":
                losses++;
                playerOneRef.update({losses: losses});
                break;
            case "2":
                wins++;
                playerTwoRef.update({wins: wins});
                break;
        }
    }

    intervalID = setInterval(function () {
        databaseRef.update({
            turn: 1
        });
    }, 3000);
}

playerOneWinsRef.on("value", function(snap){
    var val = snap.val();
    if(val !== null){
        $playerOneWins.text(val);
    }
});

playerOneLossesRef.on("value", function(snap){
    var val = snap.val();
    if(val !== null){
        $playerOneLosses.text(val);
    }
});

playerTwoWinsRef.on("value", function(snap){
    var val = snap.val();
    if(val !== null){
        $playerTwoWins.text(val);
    }
});

playerTwoLossesRef.on("value", function(snap){
    var val = snap.val();
    if(val !== null){
        $playerTwoLosses.text(val);
    }
});

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