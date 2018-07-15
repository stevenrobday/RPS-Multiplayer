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

var playersRef = database.ref("players");

var connectedRef = database.ref(".info/connected");

var playerOneReady = false;
var playerTwoReady = false;
var playerNumber;

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

playersRef.on("value", function (snap) {
    playerOneReady = false;
    playerTwoReady = false;

    snap.forEach(function (childSnap) {
        var key = childSnap.key;
        if (key === "1") {
            playerOneReady = true;
            $("#playerOneName").text(childSnap.child("name").val());
        }
        else if (key === "2") {
            playerTwoReady = true;
            $("#playerTwoName").text(childSnap.child("name").val());
        }
    });

    if(!playerOneReady){
        $("#playerOneName").text("Waiting for Player 1");
    }
    if(!playerTwoReady){
        $("#playerTwoName").text("Waiting for Player 2");
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