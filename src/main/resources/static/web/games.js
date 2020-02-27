fetch("http://localhost:8080/api/games")
  .then(function (data) {
    return data.json();
  })
  .then(function (myData) {
    console.log(myData);
    games = myData.games;
    user = myData.user;
    displayDivs();
    createList();
  });

fetch("http://localhost:8080/api/leaderboard")
  .then(function (data) {
    return data.json();
  })
  .then(function (myData) {
    leaderboard = myData;
    console.log(leaderboard);
    createTable();
  });

var gamePlayer = "";

function createList() {
  document.getElementById("list").innerHTML = "";
  for (i = 0; i < games.length; i++) {
    var playersNumber = games[i].gamePlayers.length;
    var newRow = document.createElement("li");
    var a = document.createElement("a");
    var player1 = games[i].gamePlayers[0].player;
    if (playersNumber == 2) {
      var player2 = games[i].gamePlayers[1].player;
    }
    //creating a links for the proper GP (player1 or player2)
    if (user.userName !== "Guest" && player1.id == user.id) {
      gamePlayer = games[i].gamePlayers[0].id;
      a.href = "http://localhost:8080/web/game.html?gp=" + gamePlayer;
    } else if (
      user.userName !== "Guest" &&
      playersNumber == 2 &&
      player2.id == user.id
    ) {
      gamePlayer = games[i].gamePlayers[1].id;
      a.href = "http://localhost:8080/web/game.html?gp=" + gamePlayer;
    }
    // if there are already two players in the game
    if (playersNumber == 2) {
      a.innerHTML =
        games[i].created +
        " game created " +
        games[i].gamePlayers[0].player.userName +
        " vs " +
        games[i].gamePlayers[1].player.userName;
      newRow.appendChild(a);
    }
    // if there is only one player in the game
    else {
      a.innerHTML =
        games[i].created +
        " game created " +
        games[i].gamePlayers[0].player.userName +
        " is waiting for opponent! ";
      newRow.appendChild(a);
      // adding button to join game (only if user is logged in and user is not already in the game)
      if (
        user.id !== games[i].gamePlayers[0].player.id &&
        user.userName !== "Guest"
      ) {
        var button = document.createElement("button");
        button.innerHTML = "join game";
        button.setAttribute("data-game-id", games[i].id);
        console.log(games[i])
        button.onclick = function (e) {
          let gameId = button.getAttribute("data-game-id")
          console.log(gameId)
          joinGame(gameId);
        }
        newRow.appendChild(button);
      }
    }
    document.getElementById("list").appendChild(newRow);
  }
}

function createTable() {
  // creating head of the table
  var newRow = document.createElement("tr");
  newRow.insertCell().innerHTML = "Player";
  newRow.insertCell().innerHTML = "Wins";
  newRow.insertCell().innerHTML = "Loses";
  newRow.insertCell().innerHTML = "Ties";
  newRow.insertCell().innerHTML = "Total points";
  document.getElementById("leaderboard").appendChild(newRow);

  //sorting the array

  leaderboard.sort(function (a, b) {
    return b.totalPts - a.totalPts;
  });
  //adding data to the table

  for (i = 0; i < leaderboard.length; i++) {
    var newRow = document.createElement("tr");
    newRow.insertCell().innerHTML = leaderboard[i].name;
    newRow.insertCell().innerHTML = leaderboard[i].wins;
    newRow.insertCell().innerHTML = leaderboard[i].loses;
    newRow.insertCell().innerHTML = leaderboard[i].draws;
    newRow.insertCell().innerHTML = leaderboard[i].totalPts;
    document.getElementById("leaderboard").appendChild(newRow);
  }
}

function logIn() {
  var name = document.getElementById("username").value;
  var password = document.getElementById("password").value;
  data = "username=" + name + "&password=" + password;

  if (name == "" || password == "") {
    alert("username or password empty");
  } else {
    console.log(data);

    fetch("/api/login", {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        credentials: "include",
        method: "POST",
        body: data
      })
      .then(data => {
        console.log("Request success: ", data);
        if (data.status === 200) {
          alert("Login successful!");
          window.location.reload();
        } else {
          alert("Wrong username or password, try again!");
        }
      })
      .catch(error => {
        console.log("Request failure: ", error);
        alert("Wrong user name or password!");
      });
  }
}

function logout() {
  fetch("/api/logout", {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    credentials: "include",
    method: "POST"
  }).then(data => {
    console.log("Request success: ", data);
    if (data.status === 200) {
      alert("You are logged out!");
      window.location.reload();
    } else {
      alert("Something went wrong");
    }
  });
}

function newGame() {
  fetch("/api/games", {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      credentials: "include",
      method: "POST"
    })
    .then(function (response) {
      console.log(response);
      return response.json();
    })
    .then(function (data) {
      console.log("New: ", data);
      gpId = data.id;
      console.log(gpId);
      window.location = "game.html?gp=" + gpId;
    })
    .catch(function (error) {
      console.log("Error: " + error);
    });
}


function joinGame(gameId) {
  var url = "/api/games/" + gameId + "/players";
  console.log(url);
  fetch(url, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      credentials: "include",
      method: "POST"
    })
    .then(function (response) {
      console.log(response);
      return response.json();
    })
    .then(function (data) {
      console.log("New: ", data);
      gpId = data.id;
      console.log(gpId);
      window.location = "game.html?gp=" + gpId;
    })
    .catch(function (error) {
      console.log("Error: " + error);
    });
}

function register() {
  var newName = document.getElementById("newUsername").value;
  var newPassword = document.getElementById("newPassword").value;

  fetch("/api/players", {
      credentials: "include",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: "POST",
      body: "username=" + newName + "&password=" + newPassword
    })
    .then(data => {
      console.log("Request success: ", data);
      if (data.status === 201) {
        alert("Welcome " + newName + ", you can login now!");
        window.location.reload();
      } else if (data.status === 403) {
        alert("Sorry, this username is already used, try different one!");
      } else if (data.status === 204) {
        alert(
          "Please provide both username and password (space cannot be used)"
        );
      }
    })
    .catch(function (error) {
      console.log("Request failure: ", error);
    });
}

function displayDivs() {
  var login = document.getElementById("login");
  var logout = document.getElementById("logout");
  var register = document.getElementById("register");
  var welcome = document.getElementById("welcome");
  var newGame = document.getElementById("newGame");
  if (user.userName == "Guest") {
    login.style.display = "block";
    register.style.display = "block";
    logout.style.display = "none";
    welcome.style.display = "none";
    newGame.style.display = "none";
  } else {
    login.style.display = "none";
    register.style.display = "none";
    logout.style.display = "block";
    welcome.innerHTML = "Hello " + user.userName + "!";
    welcome.style.display = "block";
    newGame.style.display = "block";
  }
}