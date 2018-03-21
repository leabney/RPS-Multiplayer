//On start, hide Rock, Paper, Scissors buttons//

$(document).ready(function () {
    $("#player1Options").hide();
    $("#player2Options").hide();
});

// Initialize Firebase Database//
var config = {
    apiKey: "AIzaSyDNWQ4z8isUGSAmqoojClCBKcoo2G9Cpx4",
    authDomain: "rps-multiplayer-67d60.firebaseapp.com",
    databaseURL: "https://rps-multiplayer-67d60.firebaseio.com",
    projectId: "rps-multiplayer-67d60",
    storageBucket: "rps-multiplayer-67d60.appspot.com",
    messagingSenderId: "318329058426"
};

firebase.initializeApp(config);

// Create variables to easily reference Firebase //
var database = firebase.database();
var playersConnect = database.ref("/players");
var player1Connect = database.ref("/players/1/");
var player2Connect = database.ref("/players/2/");
var turnConnect = database.ref("/turn");
var chatConnect = database.ref("/chat");
var messageRef = database.ref("/messages");

// Player variables //
var player1 = false;
var player2 = false;

var player1Name = "Waiting";
var player1Wins = 0;
var player1Losses = 0;
var player1Select = "";
var player1Id = "";

var player2Name = "Waiting";
var player2Wins = 0;
var player2Losses = 0;
var player2Select = "";
var player2Id = "";

var turn = 0;

var currentPlayer = 0;
var currentPlayerName = "";





// When submit button is clicked, record user details or display message for too many users//
$("#submit").click(function () {
    event.preventDefault();
    var name = $("#name").val().trim();
    currentPlayerName = name;

    $("form").hide();

    if (player1 !== true) {
        player1Connect.set({
            name: name,
            wins: 0,
            losses: 0
        });
        currentPlayer = 1;

        console.log(currentPlayer + ": " + currentPlayerName);
        $(".message").html("Hi, " + name + "!  You are Player 1. <br> Waiting for an opponent.");
        chatConnect.push({
            name: name,
            message: "connected."
        });
    }

    else if (player1 === true && player2 !== true) {
        player2Connect.set({
            name: name,
            wins: 0,
            losses: 0
        })

        currentPlayer = 2;
        console.log(currentPlayer + ": " + currentPlayerName);

        chatConnect.push({
            name: name,
            message: "connected."
        });
        $(".message").html("Hi, " + name + "!  You are Player 2. <br> Waiting for " + player1Name + " to make a selection.");

        firebase.database().ref("turn").update({
            player: 1
        })
    }

    else if (player1 === true && player2 === true) {
        alert("This game has the maximum number of players.  Please wait until someone disconnects.")
    }

     messageRef.onDisconnect().set({
       name: currentPlayerName,
       player: currentPlayer
     });

     
});

messageRef.on("value",function (snapshot){
    if (snapshot.child("/name").val() !==null){
        chatConnect.push({
        name: snapshot.child("/name").val(),
        message: "Disconnected."
    })    
    var remove = snapshot.child("/player").val()
    playersConnect.child("/"+remove).remove();
}
 });

// When database players are updated //
playersConnect.on("value", function (snapshot) {

    if (snapshot.child("/1").exists()) {
        player1 = true;
        player1Name = snapshot.child("/1").child("/name").val();
        player1Wins = snapshot.child("/1").child("/wins").val();
        player1Losses = snapshot.child("/1").child("/losses").val();
        player1Select = snapshot.child("/1").child("/choice").val();
        console.log("Player 1: " + player1Id);
    }

    if (snapshot.child("/2").exists()) {
        player2 = true;
        player2Name = snapshot.child("/2").child("/name").val();
        player2Wins = snapshot.child("/2").child("/wins").val();
        player2Losses = snapshot.child("/2").child("/losses").val();
        player2Select = snapshot.child("/2").child("/choice").val();
        console.log("Player 2: " + player2Id);
    }

    $("#player1Name").html("<h3>" + player1Name + "</h3>");
    $("#player1Stats").html("Wins: " + player1Wins + "     Losses: " + player1Losses);
    $("#player2Name").html("<h3>" + player2Name + "</h3>");
    $("#player2Stats").html("Wins: " + player2Wins + "     Losses: " + player2Losses);
});


// When database turns are updated //
turnConnect.on("value", function (turns) {

    turn = turns.child("player").val();
    console.log(turn);

   
    if (turn === 1 && currentPlayer === 1) {
        $("#player1Options").show();
        $(".message").html("Hi, " + currentPlayerName + "!  You are Player 1. <br>It's your turn!");
    }

    if (turn === 1 && currentPlayer === 2) {
        $(".message").html("Hi, " + player2Name + "!  You are Player 2.  <br>Waiting for " + player1Name + " to make a selection.");
    }

    if (turn === 2 && currentPlayer === 2) {
        $("#player2Options").show();
        $(".message").html("Hi, " + currentPlayerName + "!  You are Player 2. <br>It's your turn!");
    }

    if (turn === 0) {
        $("#player1Choice").html("<h3>" + player1Select + "</h3>");
        $("#player2Choice").html("<h3>" + player2Select + "</h3>");

        //Declare winner//
        if (player1Select === player2Select) {
            $("#gameMessage").html("<h2>Tie!</h2>");
        }
        else if ((player1Select === "Rock" && player2Select === "Scissors") ||
            (player1Select === "Paper" && player2Select === "Rock") ||
            (player1Select === "Scissors" && player2Select === "Paper")) {
            $("#gameMessage").html("<h2>" + player1Name + "<br>Wins!</h2>");
            player1Wins++
            player1Connect.update({
                wins: player1Wins
            });

            player2Losses++;
            player2Connect.update({
                losses: player2Losses
            });
        }
        else {
            $("#gameMessage").html("<h2>" + player2Name + "<br>Wins!</h2>")
            player2Wins++;
            player2Connect.update({
                wins: player2Wins
            });

            player1Losses++;
            player1Connect.update({
                losses: player1Losses
            });
        }

        function next() {
            turnConnect.update({
                player: 1
            })
            $("#gameMessage").html("<h4>Next Round</h4><p>Waiting for selections</p>");
            $("#player1Choice").empty();
            $("#player2Choice").empty();
        }
        setTimeout(next, 3000);
    }
});

// Selection made //
$(document).on('click', '.Rock, .Paper, .Scissors', function () {
    choice = $(this).attr("class");

    if (turn === 1 && currentPlayer === 1) {
        player1Connect.update({
            choice: choice
        })

        $("#player1Choice").html("<h3>" + choice + "</h3>");
        $("#player1Options").hide();

        player1Select = choice;

        turnConnect.update({
            player: 2
        })
        $(".message").html("Hi, " + currentPlayerName + "!  You are Player 1. <br>Waiting for " + player2Name + " to make a selection.");
    }



    if (turn === 2 && currentPlayer === 2) {
        player2Connect.update({
            choice: choice
        })

        $("#player2Choice").html("<h3>" + choice + "</h3>");
        $("#player2Options").hide();

        player2Select = choice;

        turnConnect.update({
            player: 0
        })
    };

});

$("#send").click(function () {
    event.preventDefault();
    var newMessage = $("#newMessage").val().trim();
    chatConnect.push({
        name: currentPlayerName,
        message: newMessage
    })

    $("#newMessage").val("");
});

// When chat messages are sent //
chatConnect.orderByKey().limitToLast(1).on('child_added', function (snapshot) {
    var addMessage = "<p>" + snapshot.child("/name").val() + ": " + snapshot.child("/message").val() + "</p>";
    $("#chatDisplay").append(addMessage)
    $("#chatDisplay").animate({ scrollTop: $('#chatDisplay').prop("scrollHeight") }, 1000);
});

