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
var playerOneName;
var playerTwoName;

var turnRef = database.ref("turn");
var messagesRef = database.ref("messages");
var avatarsRef = database.ref("avatars");

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
var $messagingContainer = $("#messagingContainer");
var $messagingWindow = $("#messagingWindow");
var $messagingInput = $("#messagingInput");

var images = ["littleMac", "docLouis", "glassJoe", "vonKaiser", "pistonHonda", "donFlamenco", "kingHippo", "greatTiger", "baldBull", "sodaPop", "sandman", "machoMan", "mikeTyson"];
var $images = $("#images");

images.forEach(function (el) {
    $images.append("<img data-img='" + el + "' class='avatarImg' src='assets/images/" + el + ".png'>");
});

$messagingContainer.hide();

$("#nameForm").on("submit", function (e) {
    e.preventDefault();
    var name = $("#nameInput").val();
    $("#nameInput").val("");
    if (!playerOneReady) {
        addPlayer("1", name);
        $("#playerOneAvatar").html("<button class='choose'>SELECT YOUR FIGHTER</button>");
        $("#playerOneAvatar").show();
    }
    else if (!playerTwoReady) {
        addPlayer("2", name);
        $("#playerTwoAvatar").html("<button class='choose'>SELECT YOUR FIGHTER</button>");
        $("#playerTwoAvatar").show();
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
    var name = snap.child("name").val();
    //playersRef.forEach(function (childSnap) {
    var key = snap.key;
    if (key === "1") {
        playerOneReady = true;
        playerOneName = name;
        $("#playerOneName").text(name);
    }
    else if (key === "2") {
        playerTwoReady = true;
        playerTwoName = name;
        $("#playerTwoName").text(name);
    }
    //});

    checkIfReady();
    if (playerOneReady && playerTwoReady) {
        messagesRef.remove();
        $messagingContainer.show();
        databaseRef.update({
            turn: 1
        });
    }
});

playersRef.on("child_removed", function (snap) {
    var key = snap.key;

    clearInterval(intervalID);
    $results.empty();

    messagesRef.remove();
    $messagingContainer.hide();

    if (key === "1") {
        playerOneReady = false;
        $("#playerOneName").text(snap.child("name").val() + " IS CHICKEN");
        $("#playerOneAvatar").hide();
    }
    else if (key === "2") {
        playerTwoReady = false;
        $("#playerTwoName").text(snap.child("name").val() + " IS CHICKEN");
        $("#playerTwoAvatar").hide();
    }

    checkIfReady();
});

function checkIfReady() {
    if (!playerOneReady) {
        $results.text("Waiting for Player 1");
        $playerTwoBtns.empty();
        turnRef.remove();
        database.ref("avatars/1").remove();
    }
    if (!playerTwoReady) {
        $results.text("Waiting for Player 2");
        $playerOneBtns.empty();
        turnRef.remove();
        database.ref("avatars/2").remove();
    }
}

playerOneMoveRef.on("value", function (snap) {
    playerOneMove = snap.val();
});

playerTwoMoveRef.on("value", function (snap) {
    playerTwoMove = snap.val();
});

turnRef.on("value", function (snap) {
    switch (snap.val()) {
        case 1:
            clearInterval(intervalID);
            $results.empty();

            switch (playerNumber) {
                case "1":
                    $results.html(gameBtns);
                    break;
                case "2":
                    $results.text("Waiting for " + playerOneName);
                    break;
            }
            break;
        case 2:
            switch (playerNumber) {
                case "1":
                    $results.text("Waiting for " + playerTwoName);
                    break;
                case "2":
                    $results.html(gameBtns);
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
    else {
        switch (playerOneMove) {
            case "r":
                switch (playerTwoMove) {
                    case "s":
                        playerOneWins = true;
                        break;
                    case "p":
                        playerTwoWins = true;
                        break;
                }
                break;
            case "p":
                switch (playerTwoMove) {
                    case "r":
                        playerOneWins = true;
                        break;
                    case "s":
                        playerTwoWins = true;
                        break;
                }
                break;
            case "s":
                switch (playerTwoMove) {
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
        $results.text(playerOneName + " TKOs " + playerTwoName + "!");
        switch (playerNumber) {
            case "1":
                wins++;
                playerOneRef.update({ wins: wins });
                break;
            case "2":
                losses++;
                playerTwoRef.update({ losses: losses });
                break;
        }
    }
    else if (playerTwoWins) {
        $results.text(playerTwoName + " TKOs " + playerOneName + "!");
        switch (playerNumber) {
            case "1":
                losses++;
                playerOneRef.update({ losses: losses });
                break;
            case "2":
                wins++;
                playerTwoRef.update({ wins: wins });
                break;
        }
    }

    intervalID = setInterval(function () {
        databaseRef.update({
            turn: 1
        });
    }, 3000);
}

playerOneWinsRef.on("value", function (snap) {
    var val = snap.val();
    if (val !== null) {
        $playerOneWins.text(val);
    }
});

playerOneLossesRef.on("value", function (snap) {
    var val = snap.val();
    if (val !== null) {
        $playerOneLosses.text(val);
    }
});

playerTwoWinsRef.on("value", function (snap) {
    var val = snap.val();
    if (val !== null) {
        $playerTwoWins.text(val);
    }
});

playerTwoLossesRef.on("value", function (snap) {
    var val = snap.val();
    if (val !== null) {
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

$("#messagingForm").on("submit", function (e) {
    e.preventDefault();
    var message = $messagingInput.val().trim();
    if (message === "") {
        return;
    }

    $messagingInput.val("");
    var messageObj = {
        playerNumber: playerNumber,
        message: message
    };
    messagesRef.push(messageObj);
});

messagesRef.on("child_added", function (snap) {
    var playerNum = snap.child("playerNumber").val();
    var message = snap.child("message").val();
    var playerName;

    if (playerNum === "1") {
        playerName = playerOneName;
    }
    else if (playerNum === "2") {
        playerName = playerTwoName;
    }

    $messagingWindow.append("<p>" + playerName + ": " + message + "</p>");
    $messagingWindow.scrollTop($messagingWindow[0].scrollHeight);
});

$(".avatarImg").on("click", function () {
    $("#shade").hide();
    $("#avatars").hide();
    var img = $(this).attr("data-img");
    var imgObj = {
        [playerNumber]: {
            img: img
        }
    };

    avatarsRef.update(imgObj);
});

avatarsRef.on("child_added", function (snap) {
    var img = snap.child("img").val();
    var key = snap.key;

    //console.log(playerNum);

    if (key === "1") {
        $("#playerOneAvatar").html("<img src='assets/images/" + img + ".png'>")
        $("#playerOneAvatar").show();
    }
    else if (key === "2") {
        $("#playerTwoAvatar").html("<img src='assets/images/" + img + ".png'>")
        $("#playerTwoAvatar").show();
    }
});

$(document).on("click", ".choose", function () {
    $("#shade").show();
    $("#avatars").show();
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