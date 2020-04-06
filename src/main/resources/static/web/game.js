//getting the proper gamePlayer from the url
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const gp = urlParams.get("gp");

fetchData();

async function fetchData() {
  const res = await fetch("http://localhost:8080/api/game_view/" + gp);
  const data = await res.json();
  status = data.status;
  if (status == "ACCEPTED") {
    games = data;
    launchGame();
  } else {
    alert(myData.error);
  }
}

function launchGame() {
  createTable("playerTable");
  createShips();
  checkStatus();
  setInterval(function () {
    checkStatus();
  }, 2500);
}

async function checkStatus() {
  // fetching data
  const res = await fetch("http://localhost:8080/api/game_view/" + gp);
  const updatedData = await res.json();
  status = updatedData.status;
  if (status == "ACCEPTED") {
    games = updatedData;
    gameStatus = games.gameStatus;
    checkPlayer();
    getPlayersShipsLocations();
    displayStatus();
    activePlaceSalvo();
    markOpponentSalvoes();

    let shipsButton = document.getElementById("shipsButton");
    if (games.ships.length == 5) {
      shipsSent = true;
    }
    if (shipsPlaced == true && shipsSent == false) {
      shipsButton.setAttribute("class", "active");
    } else {
      shipsButton.setAttribute("class", "inactive");
      if (shipsSent == true && shipsMarked == false) {
        markShips();
        shipsMarked = true;
      }
    }
    if (opponent !== "") {
      if (opponentTableCreated == false) {
        createTable("opponentTable");
        opponentTableCreated = true;
      }
      markPlayerSalvoes();

      // Starting turns
      turnOfPlayer = gameStatus.substr(0, gameStatus.indexOf("'"));
      console.log(turnOfPlayer);
      createDetailsList();
      if (gameEnd == false) {
        gameOver();
      }
      if (placeSalvoCalled == false) {
        placeSalvo();
        placeSalvoCalled = true;
      }

    }
  } else {
    alert(myData.error);
  }
}

// Table
var rows = ["", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
var columns = ["", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

//vars

var games = "";
var gameStatus = "";
var player = "";
var playerId = "";
var opponent = "";
var opponentId = "";
var player1 = "";
var player2 = "";
var player1Id = "";
var player2Id = "";
var turnOfPlayer = "";
var opponentTableCreated = false;
var shipsPlaced = false;
var shipsMarked = false;
var shipsSent = false;
var playersShipsLocations = [];
var salvosPlaced = false;
var SalvoCounter = 0;
var placeSalvoCalled = false;
var playerSalvos = [];
var currentSalvos = [];
var opponentSalvos = [];
var gameEnd = false;
var playersShips = [{
    type: "Submarine",
    locations: [],
    length: 3,
    position: "horizontal"
  },
  {
    type: "Battleship",
    locations: [],
    length: 4,
    position: "horizontal"
  },
  {
    type: "Destroyer",
    locations: [],
    length: 4,
    position: "horizontal"
  },
  {
    type: "Patrol Boat",
    locations: [],
    length: 2,
    position: "horizontal"
  },
  {
    type: "Cruiser",
    locations: [],
    length: 3,
    position: "horizontal"
  }
];

function displayStatus() {
  let status = games.gameStatus;
  document.getElementById("status").innerHTML = status;
}

function checkPlayer() {
  var gamePlayers = games.gamePlayers;
  var gamePlayerId = games.id;
  for (i = 0; i < gamePlayers.length; i++) {
    if (gamePlayers[i].gamePlayer_id == gamePlayerId) {
      player = gamePlayers[i].player.username;
      playerId = gamePlayers[i].player.id;
    } else {
      opponent = gamePlayers[i].player.username;
      opponentId = gamePlayers[i].player.id;
      if (gamePlayers[i].gamePlayer_id > gamePlayerId) {
        player1 = player;
        player1Id = playerId;
        player2 = opponent;
        player2Id = opponentId;
      } else {
        player1 = opponent;
        player1Id = opponentId;
        player2 = player;
        player2Id = playerId;

      }
    }
  }

  document.getElementById("player").innerHTML = player;
  document.getElementById("opponent").innerHTML = opponent;
}

function createTable(table) {
  for (i = 0; i < rows.length; i++) {
    var newRow = document.createElement("tr");
    for (y = 0; y < columns.length; y++) {
      newCell = newRow.insertCell(y);
      if (i == 0 || y == 0) {
        newCell.innerHTML = rows[i] + columns[y];
        newCell.setAttribute("class", "first")
        newRow.insertCell;
      } else {
        newCell.setAttribute("id", rows[i] + columns[y]);
        if (table == "playerTable") {
          newCell.setAttribute("class", "event");
        } else if (table == "opponentTable") {
          newCell.setAttribute("class", "salvo");
        }
        newRow.insertCell;
      }
    }
    document.getElementById(table).appendChild(newRow);
  }
}

function createShips() {
  playersShips.forEach(ship => {
    this.ship = document.createElement("img");
    this.ship.setAttribute("data-type", ship.type);
    this.ship.setAttribute("data-length", ship.length);
    this.ship.setAttribute("class", "ship");
    this.ship.setAttribute("draggable", "true");
    this.ship.setAttribute("src", "../images/" + ship.type + ".png");
    this.ship.addEventListener("dblclick", function (e) {
      turnShip(e.target.getAttribute("data-type"));
    });
    document.getElementById("ships").appendChild(this.ship);
  });

  //drag'n drop
  const ships = document.querySelectorAll(".ship");
  const grid = document.querySelectorAll(".event");

  let draggedItem = null;

  for (let i = 0; i < ships.length; i++) {
    const ship = ships[i];
    ship.addEventListener("dragstart", function (e) {
      draggedItem = e.target;
      setTimeout(function () {
        ship.style.display = "none";
      }, 0);
    });
    ship.addEventListener("dragend", function () {
      setTimeout(function () {
        draggedItem.style.display = "block";
        draggedItem = null;
      }, 0);
    });

    for (let y = 0; y < grid.length; y++) {
      const cell = grid[y];

      cell.addEventListener("dragover", function (e) {
        e.preventDefault();
      });
      cell.addEventListener("dragenter", function (e) {
        e.preventDefault();
      });
      cell.addEventListener("dragleave", function (e) {
        e.preventDefault();
      });
      cell.addEventListener("drop", function (e) {
        //------placing locations to playersShips based on ship length property
        let shipName = draggedItem.getAttribute("data-type");
        let previousLocations = [];
        for (z = 0; z < playersShips.length; z++) {
          //when the ship is found
          if (shipName == playersShips[z].type) {
            let position = playersShips[z].position;
            let locations = [];
            //function put as many ids of the cells as the ship is long
            for (t = 0; t < playersShips[z].length; t++) {
              if (position == "horizontal") {
                let location = grid[y + t].getAttribute("id");
                locations.push(location);
              } else if (position == "vertical") {
                let firstLocation = grid[y].getAttribute("id");
                let number = firstLocation.slice(1);
                let letter = firstLocation[0];
                let letterInCharCode = letter.charCodeAt();
                newLocation =
                  String.fromCharCode(letterInCharCode + t) + number;
                locations.push(newLocation);
              }
            }
            //adding the array of loctions to the playersShips
            previousLocations = playersShips[z].locations;
            playersShips[z].locations = locations;
          }
          playersShips.forEach(ship => {
            if (ship.locations.length == 0) {
              shipsPlaced = false;
            }
          });
        }
        if (
          checkShipsPositions(shipName) == true ||
          checkOverlapping(shipName) == true
        ) {
          console.log("rule broken");
          // if the rules are broken, the the previous locations should be remained to the dragged ship
          for (z = 0; z < playersShips.length; z++) {
            //when the ship is found
            if (shipName == playersShips[z].type) {
              playersShips[z].locations = previousLocations;
            }
          }
        } else {
          shipsPlaced = true;
          playersShips.forEach(ship => {
            if (ship.locations.length == 0) {
              shipsPlaced = false;
            }
          });
          checkStatus();
          draggedItem.style.position = "absolute";
          draggedItem.style.padding = "0px";
          this.append(draggedItem);
        }
      });
    }
  }
}

function checkShipsPositions(shipName) {
  let duplicate = false;
  for (i = 0; i < playersShips.length; i++) {
    if (playersShips[i].type == shipName) {
      for (p = 0; p < playersShips[i].locations.length; p++) {
        let checkedLocation = playersShips[i].locations[p];
        for (y = 0; y < playersShips.length; y++) {
          if (playersShips[y].type !== shipName) {
            if (playersShips[y].locations.includes(checkedLocation)) {
              duplicate = true;
            }
          }
        }
      }
    }
  }
  if (duplicate == true) {
    return true;
  } else {
    return false;
  }
}

function checkOverlapping(shipName) {
  for (i = 0; i < playersShips.length; i++) {
    var shipLength = playersShips[i].length;
    if (playersShips[i].type == shipName) {
      var firstLocationNumber = playersShips[i].locations[0].slice(1);
      var lastLocationLetter = playersShips[i].locations[shipLength - 1][0];
      if (
        (playersShips[i].locations.length + parseInt(firstLocationNumber) >
          11 &&
          playersShips[i].position == "horizontal") ||
        (lastLocationLetter.charCodeAt() > 74 &&
          playersShips[i].position == "vertical")
      ) {
        return true;
      } else {
        return false;
      }
    }
  }
}

function turnShip(shipName) {
  for (i = 0; i < playersShips.length; i++) {
    let ship = playersShips[i];
    if (ship.type == shipName && ship.locations.length !== 0) {
      let firstCell = ship.locations[0];
      let previousLocations = ship.locations;
      let previousPosition = ship.position;
      let number = firstCell[1];
      let letter = firstCell[0];
      let newLocations = [firstCell];
      if (ship.position == "horizontal") {
        ship.position = "vertical";
        let letterInCharCode = letter.charCodeAt();
        let letterFromCharCode = String.fromCharCode(letterInCharCode);
        for (j = 1; j < ship.length; j++) {
          newLocation = String.fromCharCode(letterInCharCode + j) + number;
          newLocations.push(newLocation);
        }
      } else {
        playersShips[i].position = "horizontal";
        for (j = 1; j < ship.length; j++) {
          newLocation = letter + (parseInt(number) + j);
          newLocations.push(newLocation);
        }
      }
      ship.locations = newLocations;

      if (
        checkShipsPositions(shipName) == true ||
        checkOverlapping(shipName) == true
      ) {
        console.log("rule broken");
        // if the rules are broken, the the previous locations should be remained to the dragged ship
        for (z = 0; z < playersShips.length; z++) {
          //when the ship is found
          if (shipName == playersShips[z].type) {
            playersShips[z].locations = previousLocations;
            playersShips[z].position = previousPosition;
          }
        }
      } else {
        const image = document.querySelectorAll(
          "[data-type='" + ship.type + "']"
        );
        // adding styles for the ships basing on the position and ship type
        if (ship.position == "vertical") {
          image[0].style.transform = "rotate(90deg)";
          if (ship.length == 4) {
            image[0].style.marginLeft = "-92px";
            image[0].style.marginTop = "56px";
          } else if (ship.length == 3) {
            image[0].style.marginLeft = "-65px";
            image[0].style.marginTop = "28px";
          } else if (ship.length == 2) {
            image[0].style.marginLeft = "-36px";
            image[0].style.marginTop = "3px";
          }
        } else {
          image[0].style.transform = "rotate(0deg)";
          image[0].style.marginLeft = "-15px";
          image[0].style.marginTop = "-27px";
        }
      }
    }
  }
}

function markShips() {
  // var cells = document.getElementById("playerTable").getElementsByTagName("td");
  // var playerLocations = [];

  // for (i = 0; i < games.ships.length; i++) {
  //   for (y = 0; y < games.ships[i].locations.length; y++) {
  //     playerLocations.push(games.ships[i].locations[y]);
  //   }
  // }
  // for (z = 0; z < cells.length; z++) {
  //   if (playerLocations.includes(cells[z].id)) {
  //     var id = cells[z].id;
  //     cells[z].setAttribute("class", "marked");
  //   }
  // }
  let cells = document.getElementById("playerTable").getElementsByTagName("td");
  games.ships.forEach(ship => {
    let image = document.querySelectorAll("[data-type='" + ship.type + "']");
    let firstLocation = ship.locations[0];
    for (i = 0; i < cells.length; i++) {
      if (cells[i].id == firstLocation) {
        cells[i].appendChild(image[0]);
        image[0].setAttribute("draggable", "false");
        image[0].setAttribute("class", "shipPlaced")
        if (ship.position == "vertical") {
          image[0].style.transform = "rotate(90deg)";
          if (ship.type == "Battleship" || ship.type == "Destroyer") {
            image[0].style.marginLeft = "-92px";
            image[0].style.marginTop = "56px";
          } else if (ship.type == "Cruiser" || ship.type == "Submarine") {
            image[0].style.marginLeft = "-65px";
            image[0].style.marginTop = "28px";
          } else if (ship.type == "Patrol Boat") {
            image[0].style.marginLeft = "-36px";
            image[0].style.marginTop = "3px";
          }
        } else {
          image[0].style.transform = "rotate(0deg)";
          image[0].style.marginLeft = "-15px";
          image[0].style.marginTop = "-27px";
        }
      }
    }
  });
}

function activePlaceSalvo() {
  var opponentTable = document
    .getElementById("opponentTable")
    .getElementsByTagName("td");
  for (let i = 0; i < opponentTable.length; i++) {
    let cell = opponentTable[i];
    if (turnOfPlayer == player && cell.getAttribute("class") == "salvo") {
      cell.setAttribute("class", "salvoActive")
    } else if (turnOfPlayer == opponent && cell.getAttribute("class") == "salvoActive" || gameEnd == "true") {
      cell.setAttribute("class", "salvo")
    }
  }
}

function placeSalvo() {
  let fireButton = document.getElementById("salvosButton");
  var opponentTable = document
    .getElementById("opponentTable")
    .getElementsByTagName("td");
  for (let i = 0; i < opponentTable.length; i++) {
    let cell = opponentTable[i];
    if (turnOfPlayer == player && cell.getAttribute("id") !== null) {
      cell.setAttribute("class", "salvoActive");
    }
    cell.addEventListener("click", function () {
      if (gameEnd !== true) {
        if (shipsSent == false) {
          alert("Please put first your ships on the grid!");
        } else if (turnOfPlayer == opponent) {
          alert("Wait for your turn!");
        } else if (gameStatus == "opponent is still placing the ships...") {
          alert("Wait for your opponent to place the ships!");
        } else {
          let type = cell.getAttribute("class");
          let location = cell.getAttribute("id");
          if (type == "salvoActive") {
            SalvoCounter++;
            if (SalvoCounter > 5) {
              alert("you can only fire 5 salvos at one turn");
              SalvoCounter--;
            } else {
              cell.setAttribute("class", "mark");
              currentSalvos.push(location);
            }
          } else if (type == "mark") {
            SalvoCounter--;
            for (j = 0; j < currentSalvos.length; j++) {
              let salvo = currentSalvos[j];
              if (salvo == location) {
                currentSalvos.splice(j, 1);
              }
            }
            cell.setAttribute("class", "salvoActive");
          }
          if (currentSalvos.length == 5) {
            salvosPlaced = true;
            fireButton.setAttribute("class", "active");
          } else {
            salvosPlaced = false;
            fireButton.setAttribute("class", "inactive");
          }
          console.log(currentSalvos);
          console.log(SalvoCounter);
        }
      }
    });
  }
}

function getPlayersShipsLocations() {
  let ships = games.ships;
  if (ships.length !== 0) {
    ships.forEach(ship => {
      let shipLocations = ship.locations;
      playersShipsLocations = playersShipsLocations.concat(shipLocations);
    });
  }
}

function markPlayerSalvoes() {
  var opponentTable = document
    .getElementById("opponentTable")
    .getElementsByTagName("td");

  let array1 = games.salvos[0];
  let array2 = games.salvos[1];

  if (games.salvos.length == 1 && array1.length !== 0) {
    if (array1[0].player_id == playerId) {
      playerSalvos = array1;
    }
  }
  if (games.salvos.length == 2) {
    if (array1.length !== 0 && array1[0].player_id == playerId) {
      playerSalvos = array1;
    } else if (array2.length !== 0 && array2[0].player_id == playerId) {
      playerSalvos = array2;
    }
  }
  if (playerSalvos.length > 0) {
    playerSalvos.sort(function (a, b) {
      return b.turn - a.turn;
    });
    let allHits = playerSalvos[0].allHits;
    for (i = 0; i < playerSalvos.length; i++) {
      for (y = 0; y < playerSalvos[i].locations.length; y++) {
        for (z = 0; z < opponentTable.length; z++) {
          if (playerSalvos[i].locations[y] == opponentTable[z].id) {
            if (allHits.includes(opponentTable[z].id)) {
              opponentTable[z].setAttribute("class", "hit");
            } else {
              opponentTable[z].setAttribute("class", "shoot");
            }
            // opponentTable[z].innerHTML = playerSalvos[i].turn;
          }
        }
      }
    }
  }
}

function markOpponentSalvoes() {
  var playerTable = document
    .getElementById("playerTable")
    .getElementsByTagName("td");

  let array1 = games.salvos[0];
  let array2 = games.salvos[1];
  if (games.salvos.length == 1 && array1.length !== 0) {
    if (array1[0].player_id !== playerId) {
      opponentSalvos = array1;
    }
  }
  if (games.salvos.length == 2) {
    console.log(array1.length);
    if (array1.length !== 0 && array1[0].player_id !== playerId) {
      opponentSalvos = array1;
    } else if (array2.length !== 0 && array2[0].player_id !== playerId) {
      opponentSalvos = array2;
    }
  }
  if (opponentSalvos.length > 0) {
    for (i = 0; i < opponentSalvos.length; i++) {
      for (y = 0; y < opponentSalvos[i].locations.length; y++) {
        for (z = 0; z < playerTable.length; z++) {
          if (opponentSalvos[i].locations[y] == playerTable[z].id) {
            // playerTable[z].innerHTML = opponentSalvos[i].turn;
            let cellId = playerTable[z].id;
            if (playersShipsLocations.includes(cellId)) {
              playerTable[z].setAttribute("class", "hit");
            } else {
              playerTable[z].setAttribute("class", "shoot");
            }
          }
        }
      }
    }
  }
}

function sendShips() {
  shipsPlaced = true;
  playersShips.forEach(ship => {
    if (ship.locations.length == 0) {
      shipsPlaced = false;
    }
  });
  if (shipsPlaced == true) {
    let data = playersShips;
    // switching off draggable feature
    var ships = document.getElementsByClassName("ship");
    Array.prototype.forEach.call(ships, ship => {
      ship.setAttribute("draggable", "false");
    });
    fetch("http://localhost:8080/api/games/players/" + gp + "/ships", {
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        method: "POST",
        body: JSON.stringify(data)
      })
      .then(response => {
        console.log(response);
        if (response.status == 201) {
          alert("Your ships are successfully placed!");
          shipsButton.setAttribute("class", "inactive");
          shipsSent = true;
          checkStatus();
        }
        return response.json();
      })
      .then(json => {
        console.log(json);
      })
      .catch(error => {
        console.log("Request failure: ", error);
      });
  } else if (shipsSent == true) {
    alert("Your ships have been already placed!");
  } else {
    alert("Please place all ships on the grid!");
  }
}

function sendSalvos() {
  if (gameEnd !== true) {
    if (turnOfPlayer == opponent) {
      alert("Wait for your turn!");
    } else if (currentSalvos.length == 5) {
      let data = {
        locations: currentSalvos
      };
      console.log(data);
      // switching off moving feature
      fetch("http://localhost:8080/api/games/players/" + gp + "/salvos", {
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          method: "POST",
          body: JSON.stringify(data)
        })
        .then(response => {
          console.log(response);
          if (response.status == 201) return response.json();
        })
        .then(json => {
          console.log(json);
          currentSalvos = [];
          salvosPlaced = false;
          SalvoCounter = 0;
          let fireButton = document.getElementById("salvosButton");
          fireButton.setAttribute("class", "inactive");
          gameOver();
          checkStatus();
        });
    } else {
      alert("Please place five salvos on the grid!");
    }
  }
}

function createDetailsList() {
  let list = document.getElementById("detailsList");
  list.innerHTML = "";
  if (games.salvos.length == 2) {
    let playerData = games.salvos[0];
    let opponentData = games.salvos[1];
    let allData = playerData.concat(opponentData);
    // sorting salvos first with player1 & player2, then turn
    if (player1Id < player2Id) {
      allData.sort(function (a, b) {
        return a.player_id - b.player_id;
      })
    } else {
      allData.sort(function (a, b) {
        return b.player_id - a.player_id;
      })
    }
    allData.sort(function (a, b) {
      return a.turn - b.turn;
    });
    let playerSunkShips = 0;
    let opponentSunkShips = 0;
    let sunkShip = "";
    for (i = 0; i < allData.length; i++) {
      let playerName = "";
      let opponentName = "";
      if (allData[i].turnHits.length !== 0) {
        if (allData[i].player_id == playerId) {
          playerName = player;
          opponentName = opponent;
          // if (allData[i].sunkShips.length > playerSunkShips) {
          //   sunkShip = " and sinks " + allData[i].sunkShips[0]
          //   playerSunkShips++;
          // }
        } else {
          playerName = opponent;
          opponentName = player;
          // if (allData[i].sunkShips.length > opponentSunkShips) {
          //   sunkShip = " and sinks " + allData[i].sunkShips[0]
          //   opponentSunkShips++;
          // }
        }
        var newRow = document.createElement("li");
        let line =
          "Turn " +
          allData[i].turn +
          ": " +
          playerName +
          " hits " +
          opponentName +
          " on the positions: " +
          allData[i].turnHits;

        // if (allData[i].sunkShips.length > )
        newRow.innerHTML = line + sunkShip + "!";
        list.appendChild(newRow);
        sunkShip = "";
      }
    }
  }
}

function gameOver() {
  if (gameStatus.includes("wins") || gameStatus.includes("Draw")) {
    gameEnd = true;
    ZZ
    turnOfPlayer = "";
    if (gameStatus.includes(player)) {
      console.log(player)
    } else if (gameStatus.includes(opponent)) {
      console.log(opponent)
    } else {
      console.log("draw");
    }
  }
}