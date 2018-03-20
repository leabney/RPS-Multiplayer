$(document).ready(function(){
$("#player1Options").hide();
$("#player2Options").hide();
});

    // Initialize Firebase//
var config = {
    apiKey: "AIzaSyDNWQ4z8isUGSAmqoojClCBKcoo2G9Cpx4",
    authDomain: "rps-multiplayer-67d60.firebaseapp.com",
    databaseURL: "https://rps-multiplayer-67d60.firebaseio.com",
    projectId: "rps-multiplayer-67d60",
    storageBucket: "rps-multiplayer-67d60.appspot.com",
    messagingSenderId: "318329058426"
};

firebase.initializeApp(config);

// Create a variable to reference the database //
var database = firebase.database();


// Player variables //
var player1 = false;
var player2 = false;

var player1Name = "Waiting";
var player1Wins = 0;
var player1Losses = 0;
var player1Select ="";

var player2Name = "Waiting";
var player2Wins = 0;
var player2Losses = 0;
var player2Select="";

var turn = 0;
var currentUser ="";



$("#submit").click(function () {
    event.preventDefault();
    var name = $("#name").val().trim();

    $("form").hide();

  

    if (player1 !== true) {
        firebase.database().ref('/players/1/').set({
            name: name,
            wins: 0,
            losses: 0
        });

        $(".message").html("Hi, " + name + "!  You are Player 1. <br> Waiting for an opponent.");
    }

    else if (player1 === true && player2 !== true) {
        firebase.database().ref('/players/2/').set({
            name: name,
            wins: 0,
            losses: 0
        })

        $(".message").html("Hi, " + name + "!  You are Player 2. <br> Waiting for " + player1Name + " to make a selection.");

        firebase.database().ref("turn").update({
            player: 1
        })
        
    }

    else if (player1 === true && player2 === true) {
        alert("This game has the maximum number of players.  Please wait until someone disconnects.")
    }

});

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.
      var isAnonymous = user.isAnonymous;
      var uid = user.uid;
      // ...
    } else {
      // User is signed out.
      // ...
    }
    // ...
  });

database.ref("/players").on("value", function (snapshot) {

    if (snapshot.child("/1").exists()) {
        player1 = true;
        player1Name = snapshot.child("/1").child("/name").val();
        player1Wins = snapshot.child("/1").child("/wins").val();
        player1Losses = snapshot.child("/1").child("/losses").val();
    }

    if (snapshot.child("/2").exists()) {
        player2 = true;
        player2Name = snapshot.child("/2").child("/name").val();
        player2Wins = snapshot.child("/2").child("/wins").val();
        player2Losses = snapshot.child("/2").child("/losses").val();
    }     

    $("#player1Name").html("<h3>" + player1Name + "</h3>");
    $("#player1Stats").html("Wins: " + player1Wins + "     Losses: " + player1Losses);
    $("#player2Name").html("<h3>" + player2Name + "</h3>");
    $("#player2Stats").html("Wins: " + player2Wins + "     Losses: " + player2Losses);
});

  
database.ref("/turn").on("value", function(turns){
    
    turn = turns.child("player").val();
    console.log(turn);

    if(turn===1){
        $("#player1Options").show();

    }
    if(turn===2){
        $("#player2Options").show();
    }
    if(turn===0){
        //Player 1 Wins//
        if ((player1Select==="Rock" && player2Select==="Scissors")
            ||(player1Select==="Paper" && player2Select==="Rock")
            ||(player1Select==="Scissors" && player2Select==="Paper")){
                $("#gameMessage").html(player1Name & " Wins!")
                player1Wins ++
                player2Losses ++
            }
           else if ((player1Select==="Rock" && player2Select==="Paper")
            ||(player1Select==="Paper" && player2Select==="Scissors")
            ||(player1Select==="Scissors" && player2Select==="Rock")){
                $("#gameMessage").html(player2Name & " Wins!")
                player2Wins ++
                player1Losses++
            }
        else if (player1Select===player2Select){
                    $("#gameMessage").html("Tie!");
        };
    };    
    
});

$(document).on('click', '.Rock, .Paper, .Scissors', function () {
    choice = $(this).attr("class");

    if(turn===1){
        firebase.database().ref("players/1").update({
            choice: choice
    });
    
    firebase.database().ref("turn").update({
        player: 2
});
    $("#player1Options").hide();
    $("#player1Choice").html("<h3>"+choice+"</h3>")
    player1Select=choice;
    console.log("Player 1: "+player1Select)
}

    else if(turn===2){
        firebase.database().ref("players/2").update({
            choice: choice
        })

        firebase.database().ref("turn").update({
            player: 0
        })
        $("#player2Options").hide();
        $("#player2Choice").html("<h3>"+choice+"</h3>")
        player2Select=choice;
        console.log("Player 2: "+player2Select)
    };
console.log(player1Select===player2Select)
    
});
   




