//getting the proper gamePlayer from the url
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const gp = urlParams.get("gp");

async function fetchData() {
  fetch("http://localhost:8080/api/game_view/" + gp)
    .then(function(data) {
      return data.json();
    })
    .then(function(myData) {
      console.log(myData);
      status = myData.status;
      if (status == "ACCEPTED") {
        games = myData;
        createTable("playerTable");
        createTable("opponentTable");
        createShips();
        if (games.ships.length > 0) {
          markShips();
        }
        checkPlayer();
        if (games.ships.length > 0) {
          // will be done later
          // markPlayerSalvoes();
          // markOpponentSalvoes();
        }
      } else {
        alert(myData.error);
        //window.location.href = 'http://localhost:8080/web/games.html'
      }
    });
}

fetchData();

// Table data
var rows = ["", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
var columns = ["", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

//check player & opponent
var player = "";
var playerId = "";
var opponent = "";
var opponentId = "";
var shipsPlaced = false;
var playerSalvoes = [];
var opponentSalvos = [];
var playersShips = [
  {
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
        newRow.insertCell;
      } else {
        newCell.setAttribute("id", rows[i] + columns[y]);
        if (table == "playerTable") {
          newCell.setAttribute("class", "event");
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
    this.ship.addEventListener("dblclick", function(e) {
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
    ship.addEventListener("dragstart", function(e) {
      draggedItem = e.target;
      setTimeout(function() {
        ship.style.display = "none";
      }, 0);
    });
    ship.addEventListener("dragend", function() {
      setTimeout(function() {
        draggedItem.style.display = "block";
        draggedItem = null;
      }, 0);
    });

    for (let y = 0; y < grid.length; y++) {
      const cell = grid[y];

      cell.addEventListener("dragover", function(e) {
        e.preventDefault();
      });
      cell.addEventListener("dragenter", function(e) {
        e.preventDefault();
      });
      cell.addEventListener("dragleave", function(e) {
        e.preventDefault();
      });
      cell.addEventListener("drop", function(e) {
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
                console.log(number);
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
          draggedItem.style.position = "absolute";
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
        console.log(ship);
        const image = document.querySelectorAll(
          "[data-type='" + ship.type + "']"
        );
        // adding styles for the ships basing on the position and ship type
        if (ship.position == "vertical") {
          image[0].style.transform = "rotate(90deg)";
          if (ship.length == 4) {
            image[0].style.marginLeft = "-55px";
            image[0].style.marginTop = "38px";
          } else if (ship.length == 3) {
            image[0].style.marginLeft = "-38px";
            image[0].style.marginTop = "20px";
          } else if (ship.length == 2) {
            image[0].style.marginLeft = "-18px";
            image[0].style.marginTop = "5px";
          }
        } else {
          image[0].style.transform = "rotate(0deg)";
          image[0].style.marginLeft = "0px";
          image[0].style.marginTop = "-15px";
        }
      }
    }
  }
}

function markShips() {
  var cells = document.getElementById("playerTable").getElementsByTagName("td");
  var playerLocations = [];

  for (i = 0; i < games.ships.length; i++) {
    for (y = 0; y < games.ships[i].locations.length; y++) {
      playerLocations.push(games.ships[i].locations[y]);
    }
  }
  for (z = 0; z < cells.length; z++) {
    if (playerLocations.includes(cells[z].id)) {
      var id = cells[z].id;
      cells[z].setAttribute("class", "marked");
    }
  }
}

function markPlayerSalvoes() {
  var opponentTable = document
    .getElementById("opponentTable")
    .getElementsByTagName("td");

  if (games.salvos[0][0].player_id == playerId) {
    var playerSalvos = games.salvos[0];
  } else {
    var playerSalvos = games.salvos[1];
  }
  for (i = 0; i < playerSalvos.length; i++) {
    for (y = 0; y < playerSalvos[i].locations.length; y++) {
      for (z = 0; z < opponentTable.length; z++) {
        if (playerSalvos[i].locations[y] == opponentTable[z].id) {
          opponentTable[z].setAttribute("class", "shoot");
          opponentTable[z].innerHTML = playerSalvos[i].turn;
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
    console.log(data);
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
          // window.location.reload();
          alert("Your ships are successfully placed!");
        }
        return response.json();
      })
      .then(json => {
        console.log(json);
      })
      .catch(error => {
        console.log("Request failure: ", error);
      });
  } else {
    alert("Please place all ships on the grid!");
  }
}

function markOpponentSalvoes() {
  var playerTable = document
    .getElementById("playerTable")
    .getElementsByTagName("td");

  if (games.salvos[0][0].player_id !== playerId) {
    var opponentSalvos = games.salvos[0];
  } else {
    var opponentSalvos = games.salvos[1];
  }
  for (i = 0; i < opponentSalvos.length; i++) {
    for (y = 0; y < opponentSalvos[i].locations.length; y++) {
      for (z = 0; z < playerTable.length; z++) {
        if (opponentSalvos[i].locations[y] == playerTable[z].id) {
          playerTable[z].innerHTML = opponentSalvos[i].turn;
          if (playerTable[z].className == "marked") {
            playerTable[z].setAttribute("class", "hit");
          } else {
            playerTable[z].setAttribute("class", "shoot");
          }
        }
      }
    }
  }
}
