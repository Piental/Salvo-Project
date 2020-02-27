package com.codeoftheweb.salvo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")

public class SalvoController {

    @Autowired
    private GameRepository gameRepository;

    @Autowired
    private PlayerRepository playerRepository;

    @Autowired
    private GamePlayerRepository gamePlayerRepository;

    @Autowired
    private ScoreRepository scoreRepository;

    @Autowired
    private ShipRepository shipRepository;

    @CrossOrigin(origins = "http://127.0.0.1:5500")
    @RequestMapping("/games")

    public Map<String, Object> getGamesInfo(Authentication authentication) {
        Map<String, Object> gamesInfo = new HashMap<>();
        if (!isGuest(authentication))
        {gamesInfo.put("user", currentUserName(authentication));}
        else {Map<String, Object> guest = new HashMap<>();
            guest.put("userName", "Guest");
            gamesInfo.put("user", guest);}
            gamesInfo.put("games", getGames());
        return gamesInfo;
    }

    @RequestMapping(path = "/games", method = RequestMethod.POST)
    public ResponseEntity<Map<String, Object>> createGame(Authentication authentication) {
        if (!isGuest(authentication)) {
            Player player = playerRepository.findByUserName(authentication.getName());
            Date newDate = new Date();
            Game newGame = new Game(newDate);
            gameRepository.save(newGame);
            GamePlayer newGamePlayer = new GamePlayer(newGame, player);
            gamePlayerRepository.save(newGamePlayer);
            return new ResponseEntity<>(makeMap("id", newGamePlayer.getId()), HttpStatus.CREATED);
        }
        else {return new ResponseEntity<>(makeMap("error", "you are not logged in"), HttpStatus.UNAUTHORIZED);}
    }

    @RequestMapping(path = "/games/{gameId}/players", method = RequestMethod.POST)
    public ResponseEntity<Map<String, Object>> joinGame(@PathVariable Long gameId, Authentication authentication) {
        if (!isGuest(authentication)) {
            Player player = playerRepository.findByUserName(authentication.getName());
            Game currentGame = gameRepository.getOne(gameId);
            if (currentGame != null) {
                Integer numberOfGP = currentGame.getGamePlayers().size();
                System.out.println(numberOfGP);
                if (numberOfGP < 2 && !currentGame.getGamePlayers().contains(player)) {
                    GamePlayer newGP = new GamePlayer(currentGame, player);
                    gamePlayerRepository.save(newGP);
                    return new ResponseEntity<>(makeMap("id", newGP.getId()), HttpStatus.CREATED);
                } else {
                    return new ResponseEntity<>(makeMap("error", "the player is already in the game or game is full"), HttpStatus.FORBIDDEN);
                }
            } else {
                return new ResponseEntity<>(makeMap("error", "the game doesn't exist"), HttpStatus.NOT_FOUND);
            }
        } else {
            return new ResponseEntity<>(makeMap("error", "you are not logged in"), HttpStatus.UNAUTHORIZED);
        }
    }

    @RequestMapping(path = "/games/players/{gamePlayerId}/ships", method = RequestMethod.POST)
    public ResponseEntity<Map<String, Object>> addShips(@PathVariable Long gamePlayerId, @RequestBody Set<Ship> ships, Authentication authentication)
    {   GamePlayer currentGamePlayer = gamePlayerRepository.getOne(gamePlayerId);
        Player currentPlayer = playerRepository.findByUserName((authentication.getName()));
        if (isGuest(authentication) || currentGamePlayer == null || currentGamePlayer.getPlayer().getId() != currentPlayer.getId()) {
            return new ResponseEntity<>(makeMap("error", "action is not allowed"), HttpStatus.UNAUTHORIZED);
        } else if (currentGamePlayer.getShips().size() > 5)
        {return new ResponseEntity<>(makeMap("error", "the ships are already placed"), HttpStatus.FORBIDDEN);}
        else {
            int counter = 0;
            for (Ship ship : ships) {
                counter++;
                if (counter < 6) {
                    currentGamePlayer.addShip(ship);
                    shipRepository.save(ship);
                } else {
                    return new ResponseEntity<>(makeMap("error", "you can place only 5 ships"), HttpStatus.FORBIDDEN);
                }
            }
            return new ResponseEntity<>(makeMap("success", "ships have been placed"), HttpStatus.CREATED);
        }
    }




    @RequestMapping(path = "/players", method = RequestMethod.POST)
    public ResponseEntity<Object> createNewPlayer(@RequestParam String username, @RequestParam String password) {
        //add the code for empty strings

        if (username.trim().isEmpty() || password.trim().isEmpty()) {
            return new ResponseEntity<>("Please provide both name and password (space cannot be used)", HttpStatus.NO_CONTENT);
        } else {
            if (playerRepository.findByUserName(username) == null) {
                Player newPlayer = new Player(username, password);
                playerRepository.save(newPlayer);
                return new ResponseEntity<>(newPlayer.getUserName(), HttpStatus.CREATED);
            }
            else {
                return new ResponseEntity<>("This username is already in use, please provide a different one", HttpStatus.FORBIDDEN);
            }
        }
    }

    @CrossOrigin(origins = "http://127.0.0.1:5500")
    @RequestMapping("/leaderboard")
    public Set<Map<String, Object>> getLeaderBoardInfo() {
        Set<Map<String, Object>> leaderBoard = new HashSet<>();

        List<GamePlayer> gamePlayers = gamePlayerRepository.findAll();

        for (GamePlayer gamePlayer : gamePlayers) {
            Map<String, Object> gameDetail = new HashMap<>();
            gameDetail.put("name", gamePlayer.getPlayer().getUserName());
            gameDetail.put("totalPts", gamePlayer.getPlayer().getScores().stream().mapToDouble(score -> score.getScore()).sum());
            gameDetail.put("wins", gamePlayer.getPlayer().getScores().stream().filter(score -> score.getScore() == 1).count());
            gameDetail.put("loses", gamePlayer.getPlayer().getScores().stream().filter(score -> score.getScore() == 0).count());
            gameDetail.put("draws", gamePlayer.getPlayer().getScores().stream().filter(score -> score.getScore() == 0.5).count());
            leaderBoard.add(gameDetail);
        }
        return leaderBoard;
    }

    @CrossOrigin(origins = "http://127.0.0.1:5500")
    @RequestMapping("/game_view/{gameId}")
    public Map<String, Object> getGame(@PathVariable Long gameId, Authentication authentication) {
        Map<String, Object> gameViewInfo = new LinkedHashMap<>();
        if (!isGuest(authentication)) {
            Player player = playerRepository.findByUserName(authentication.getName());
            GamePlayer currentGamePlayer = gamePlayerRepository.getOne(gameId);
            if (player.getId() == currentGamePlayer.getPlayer().getId()) {
                gameViewInfo.put("status", HttpStatus.ACCEPTED);
                gameViewInfo.put("player", currentUserName(authentication));
                gameViewInfo.put("created", currentGamePlayer.getGame().getDate());
                gameViewInfo.put("id", currentGamePlayer.getId());
                gameViewInfo.put("gamePlayers", currentGamePlayer.getGame().getGamePlayers().stream()
                        .map(gamePlayer -> getGamePlayers(gamePlayer))
                        .collect(Collectors.toList())
                );
                gameViewInfo.put("ships", currentGamePlayer.getShips().stream()
                        .map(ship -> getShipInfo(ship))
                        .collect(Collectors.toList()));
                gameViewInfo.put("salvos", currentGamePlayer.getGame().getGamePlayers().stream()
                        .map(gamePlayer -> gamePlayer.getSalvoes().stream()
                                .map(salvo -> getSalvo(salvo))
                                .collect(Collectors.toSet())).collect(Collectors.toList()));
            } else {
                gameViewInfo.put("error", "Not allowed to view opponents game");
                gameViewInfo.put("status", HttpStatus.FORBIDDEN);
            }
        }
        else{gameViewInfo.put("error", "You are not logged in");
            gameViewInfo.put("status", HttpStatus.UNAUTHORIZED);
        }
        return gameViewInfo;
    }

    //helpers:

    private Map<String, Object> makeMap(String key, Object value) {
        Map<String, Object> map = new HashMap<>();
        map.put(key, value);
        return map;
    }

    @RequestMapping(value = "/username", method = RequestMethod.GET)
    @ResponseBody
    public Player currentUserName(Authentication authentication) {
        return playerRepository.findByUserName(authentication.getName());
    }

    public List<Object> getGames() {
        List<Object> games = new ArrayList<>();
        for (Game game : gameRepository.findAll()) {
            Map<String, Object> singleGame = new LinkedHashMap<>();

            singleGame.put("id", game.getId());
            singleGame.put("created", game.getDate().getTime());

            //Creating list of gamePlayers
            singleGame.put("gamePlayers", game.getGamePlayers()
                    .stream().sorted((b1, b2) -> (int) (b1.getId() - b2.getId()))
                    .map(gp -> {
                        Map<String, Object> singleGamePlayer = new LinkedHashMap();
                        singleGamePlayer.put("id", gp.getId());
                        //Creating Player map
                        Map<String, Object> singlePlayer = new LinkedHashMap<>();
                        singlePlayer.put("id", gp.getPlayer().getId());
                        singlePlayer.put("userName", gp.getPlayer().getUserName());
                        singleGamePlayer.put("player", singlePlayer);
                        return singleGamePlayer;
                    }));
            games.add(singleGame);
            // adding scores
            singleGame.put("scores", game.getScores().stream()
                    .map(score -> getGameScores(score))
                    .collect(Collectors.toList())
            );

        }
        return games;
    }


    public Map<String, Object> getGameScores(Score score) {
        Map<String, Object> scoreInfo = new LinkedHashMap<>();
        scoreInfo.put("score", score.getScore());
        scoreInfo.put("player_id", score.getPlayer().getId());
        return scoreInfo;
    }

    Map<String, Object> getPlayerInfo(Player player) {
        Map<String, Object> playerDetail = new HashMap<>();
        playerDetail.put("id", player.getId());
        playerDetail.put("username", player.getUserName());
        return playerDetail;
    }

    public Map<String, Object> getGamePlayers(GamePlayer gamePlayer) {
        Map<String, Object> gamePlayerDetail = new HashMap<>();
        gamePlayerDetail.put("gamePlayer_id", gamePlayer.getId());
        gamePlayerDetail.put("player", getPlayerInfo(gamePlayer.getPlayer()));
        return gamePlayerDetail;
    }

    public Map<String, Object> getShipInfo(Ship ship) {
        Map<String, Object> shipTypeAndLocations = new LinkedHashMap<>();
        shipTypeAndLocations.put("type", ship.getType());
        shipTypeAndLocations.put("locations", ship.getLocations());
        return shipTypeAndLocations;
    }

    public Map<String, Object> getSalvo(Salvo salvo) {
        Map<String, Object> salvoTurnAndLocations = new LinkedHashMap<>();
        salvoTurnAndLocations.put("player_id", salvo.getGamePlayer().getPlayer().getId());
        salvoTurnAndLocations.put("turn", salvo.getTurn());
        salvoTurnAndLocations.put("locations", salvo.getLocations());
        return salvoTurnAndLocations;
    }

    private boolean isGuest(Authentication authentication) {
        return authentication == null || authentication instanceof AnonymousAuthenticationToken;
    }




        //Works!!!!!
//
//   @RequestMapping("/game_view/{gamePlayerId}")
//   Optional<GamePlayer> gameView(@PathVariable long gamePlayerId) {
//   Optional<GamePlayer> gamePlayer = gamePlayerRepository.findById(gamePlayerId);
//   return gamePlayer.isPresent() ? gamePlayer : null;
//}
}


