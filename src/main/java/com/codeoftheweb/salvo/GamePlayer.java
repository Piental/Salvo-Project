package com.codeoftheweb.salvo;

import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.util.Set;


@Entity
public class GamePlayer {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "native")
    @GenericGenerator(name = "native", strategy = "native")
    private long id;


    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="player_id")
    private Player player;


    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="game_id")
    private Game game;

    @OneToMany(mappedBy="gamePlayer", fetch=FetchType.EAGER)
    Set<Ship> ships;

    @OneToMany(mappedBy="gamePlayer", fetch=FetchType.EAGER)
    Set<Salvo> salvos;

    public GamePlayer() { }

    public GamePlayer(Game game,
                      Player player) {
        this.game = game;
        this.player = player;
    }

    public Player getPlayer() {
        return player;
    }

    public long getId() {
        return id;
    }

    public void setPlayer(Player player) {
        this.player = player;
    }


    public Game getGame() {
        return game;
    }

    public void setGame(Game game) {
        this.game = game;
    }


    public Set<Ship> getShips() {
        return ships;
    }
    public Set<Salvo> getSalvos() {return salvos;}

    public void addShip(Ship ship) {
        ship.setGamePlayer(this);
        ships.add(ship);
    }

    public void addSalvo(Salvo salvo) {
        salvo.setGamePlayer(this);
        salvos.add(salvo);
    }

    public Integer getLastTurn(){
        if(!this.getSalvos().isEmpty()){
            return this.getSalvos().stream()
                    .map(salvo1 ->salvo1.getTurn() )
                    .max((x,y)->Integer.compare(x,y))
                    .get();
        }else {
            return 0;
        }
    }

}