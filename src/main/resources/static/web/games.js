games = "";

createGames();
createLeaderboard();
setInterval(function () {
  createGames();
  createLeaderboard();
}, 2500);

function createGames() {
  fetch("http://localhost:8080/api/games")
    .then(function (data) {
      return data.json();
    })
    .then(function (myData) {
      console.log(myData);
      if (myData.games.length !== games.length) {
        games = myData.games;
        user = myData.user;
        displayDivs();
        createList();
      }
    });
}



function createLeaderboard() {
  fetch("http://localhost:8080/api/leaderboard")
    .then(function (data) {
      return data.json();
    })
    .then(function (myData) {
      leaderboard = myData;
      createTable();
    });
}

var gamePlayer = "";


function createList() {
  document.getElementById("gamesList").innerHTML = "";
  for (i = 0; i < games.length; i++) {
    var playersNumber = games[i].gamePlayers.length;
    var a = document.createElement("a");
    var newGame = document.createElement("div");
    newGame.setAttribute("class", "card");
    var gameNo = i + 1;
    var gameHeader = document.createElement("div");
    gameHeader.setAttribute("class", "header");
    var headerTitle = document.createElement("h2");
    headerTitle.innerHTML = "Game " + gameNo;
    gameHeader.appendChild(headerTitle);

    var headline1 = document.createElement("h4");
    var headline2 = document.createElement("h4");

    var versus = document.createElement("IMG");
    versus.setAttribute("src", "../../images/vs.png");
    versus.setAttribute("class", "versus");

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
    } else {
      newGame.setAttribute("class", "card unlinked")
    }
    // if there are already two players in the game

    newGame.appendChild(gameHeader);
    if (playersNumber == 2) {
      headline1.innerHTML =
        games[i].gamePlayers[0].player.userName;
      headline2.innerHTML =
        games[i].gamePlayers[1].player.userName;

      newGame.appendChild(headline1);
      newGame.appendChild(versus);
      newGame.appendChild(headline2);
    }
    // if there is only one player in the game
    else {
      headline1.innerHTML = games[i].gamePlayers[0].player.userName;
      headline2.innerHTML = " is waiting for opponent!";
      headline2.style.color = "red";
      newGame.appendChild(headline1);
      newGame.appendChild(headline2);
      // adding button to join game (only if user is logged in and user is not already in the game)
      if (
        user.id !== games[i].gamePlayers[0].player.id &&
        user.userName !== "Guest"
      ) {
        newGame.setAttribute("class", "card")
        newGame.setAttribute("data-game-id", games[i].id);
        console.log(games[i])
        newGame.onclick = function (e) {
          let gameId = newGame.getAttribute("data-game-id")
          joinGame(gameId);
        }
      }
    }
    a.appendChild(newGame);
    document.getElementById("gamesList").appendChild(a);
  }
}

function createTable() {
  // creating head of the table
  var newRow = document.createElement("tr");
  newRow.insertCell().innerHTML = "Pos";
  newRow.insertCell().innerHTML = "Player";
  newRow.insertCell().innerHTML = "Wins";
  newRow.insertCell().innerHTML = "Loses";
  newRow.insertCell().innerHTML = "Ties";
  newRow.insertCell().innerHTML = "Total points";
  document.getElementById("leaderboard").innerHTML = "";
  document.getElementById("leaderboard").appendChild(newRow);

  //sorting the array
  console.log(leaderboard);
  leaderboard.sort(function (a, b) {
    return b.totalPts - a.totalPts;
  });
  //adding data to the table

  for (i = 0; i < leaderboard.length; i++) {
    let position = i + 1;
    var newRow = document.createElement("tr");
    newRow.insertCell().innerHTML = position + ".";
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
  var console = document.getElementById("console");
  var register = document.getElementById("register");
  var welcome = document.getElementById("welcome");
  var newGame = document.getElementById("newGame");
  if (user.userName == "Guest") {
    login.style.display = "block";
    register.style.display = "block";
    console.style.display = "none";
    logout.style.display = "none";
    welcome.style.display = "none";
    newGame.style.display = "none";
  } else {
    login.style.display = "none";
    register.style.display = "none";
    logout.style.display = "block";
    welcome.innerHTML = "Hello " + user.userName + "!";
    newGame.style.display = "block";
  }
}