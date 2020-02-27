package com.codeoftheweb.salvo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.authentication.configuration.GlobalAuthenticationConfigurerAdapter;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.WebAttributes;
import org.springframework.security.web.authentication.logout.HttpStatusReturningLogoutSuccessHandler;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;


@SpringBootApplication
public class SalvoApplication {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

    public static void main(String[] args) {
        SpringApplication.run(SalvoApplication.class, args);
    }

    @Bean
    public CommandLineRunner initData(PlayerRepository playerRepository, GameRepository gameRepository, GamePlayerRepository gamePlayerRepository,
                                      ShipRepository shipRepository, SalvoRepository salvoRepository, ScoreRepository scoreRepository) {
        Date date1 = new Date();
        Date date2 = Date.from(date1.toInstant().plusSeconds(3600));
        Date date3 = Date.from(date2.toInstant().plusSeconds(3600));
        return (args) -> {
            // save a couple of customers
            Player p1 =  new Player("Jack", "malibu");
            playerRepository.save(p1);
            Player p2 =  new Player("Chloe", "huston66");
            playerRepository.save(p2);
            Player p3 =  new Player("Kim", "montevideo");
            playerRepository.save(p3);
            Player p4 =  new Player("David", "bonaventure05");
            playerRepository.save(p4);
            Player p5 =  new Player("Michelle", "odalisques");
            playerRepository.save(p5);


            // Adding 3 games (++ 1h)

            Game game1 = new Game(date1);
            gameRepository.save(game1);
            Game game2 = new Game(date2);
            gameRepository.save(game2);
            Game game3 = new Game(date3);
            gameRepository.save(game3);

            // Adding GamePlayers
            GamePlayer gamePlayer1 = new GamePlayer(game1, p1);
            gamePlayerRepository.save(gamePlayer1);
            GamePlayer gamePlayer2 = new GamePlayer(game2, p1);
            gamePlayerRepository.save(gamePlayer2);
            GamePlayer gamePlayer3 = new GamePlayer(game3, p2);
            gamePlayerRepository.save(gamePlayer3);
            GamePlayer gamePlayer4 = new GamePlayer(game1, p2);
            gamePlayerRepository.save(gamePlayer4);
            GamePlayer gamePlayer5 = new GamePlayer(game2, p3);
            gamePlayerRepository.save(gamePlayer5);
            GamePlayer gamePlayer6 = new GamePlayer(game3, p4);
            gamePlayerRepository.save(gamePlayer6);


            // Adding Ships
            List<String> locations1 = new ArrayList<>();
            locations1.add("H1");
            locations1.add("H2");
            locations1.add("H3");

            Ship ship1 = new Ship("Destroyer", gamePlayer1, locations1);
            shipRepository.save(ship1);

            List<String> locations2 = new ArrayList<>();
            locations2.add("D1");
            locations2.add("D2");
            locations2.add("D3");

            Ship ship2 = new Ship("Cruiser", gamePlayer2, locations2);
            shipRepository.save(ship2);

            List<String> locations3 = new ArrayList<>();
            locations3.add("E5");
            locations3.add("F5");
            locations3.add("G5");
            locations3.add("H5");

            Ship ship3 = new Ship("Battleship", gamePlayer1, locations3);
            shipRepository.save(ship3);

            List<String> locations4 = new ArrayList<>();
            locations4.add("E4");
            locations4.add("F4");


            Ship ship4 = new Ship("Patrol Boat", gamePlayer3, locations4);
            shipRepository.save(ship4);

            List<String> locations5 = new ArrayList<>();
            locations5.add("B7");
            locations5.add("C7");
            locations5.add("D7");


            Ship ship5 = new Ship("Submarine", gamePlayer1, locations5);
            shipRepository.save(ship5);
            long id = 1;

            List<String> locations16 = new ArrayList<>();
            locations16.add("G1");
            locations16.add("H1");
            locations16.add("I1");

            Ship ship6 = new Ship("Patrol Boat", gamePlayer4, locations16);
            shipRepository.save(ship6);

            // Adding Salvoes
            List<String> locations6 = new ArrayList<>();
            locations6.add("I1");
            locations6.add("J2");
            locations6.add("J3");

            Salvo salvo1 = new Salvo(1, gamePlayer1, locations6);
            salvoRepository.save(salvo1);

            List<String> locations7 = new ArrayList<>();
            locations7.add("A1");
            locations7.add("B2");
            locations7.add("C3");

            Salvo salvo2 = new Salvo(1, gamePlayer2, locations7);
            salvoRepository.save(salvo2);

            List<String> locations8 = new ArrayList<>();
            locations8.add("D1");
            locations8.add("D8");
            locations8.add("E3");

            Salvo salvo3 = new Salvo(1, gamePlayer3, locations8);
            salvoRepository.save(salvo3);

            List<String> locations9 = new ArrayList<>();
            locations9.add("E7");
            locations9.add("J2");
            locations9.add("D7");

            Salvo salvo4 = new Salvo(1, gamePlayer4, locations9);
            salvoRepository.save(salvo4);

            List<String> locations10 = new ArrayList<>();
            locations10.add("I5");
            locations10.add("J4");
            locations10.add("J6");

            Salvo salvo5 = new Salvo(1, gamePlayer5, locations10);
            salvoRepository.save(salvo5);

            List<String> locations11 = new ArrayList<>();
            locations11.add("C1");
            locations11.add("D2");
            locations11.add("E3");

            Salvo salvo6 = new Salvo(1, gamePlayer6, locations11);
            salvoRepository.save(salvo6);

            List<String> locations12 = new ArrayList<>();
            locations12.add("I8");
            locations12.add("J9");
            locations12.add("J4");

            Salvo salvo7 = new Salvo(2, gamePlayer1, locations12);
            salvoRepository.save(salvo7);

            List<String> locations13 = new ArrayList<>();
            locations13.add("B8");
            locations13.add("D9");
            locations13.add("I10");

            Salvo salvo8 = new Salvo(2, gamePlayer2, locations13);
            salvoRepository.save(salvo8);

            List<String> locations14 = new ArrayList<>();
            locations14.add("I1");
            locations14.add("J2");
            locations14.add("D7");

            Salvo salvo9 = new Salvo(2, gamePlayer3, locations14);
            salvoRepository.save(salvo9);

            List<String> locations15 = new ArrayList<>();
            locations15.add("I7");
            locations15.add("J7");
            locations15.add("J8");

            Salvo salvo10 = new Salvo(2, gamePlayer4, locations15);
            salvoRepository.save(salvo10);

            Score scr1= new Score(0.5, game1, p1);
            Score scr2= new Score(0.5, game1, p2);
            Score scr3= new Score(1.0, game2, p3);
            Score scr4= new Score(0.0, game2, p1);


            scoreRepository.save(scr1);
            scoreRepository.save(scr2);
            scoreRepository.save(scr3);
            scoreRepository.save(scr4);

        };
    }

}

@Configuration

class WebSecurityConfiguration extends GlobalAuthenticationConfigurerAdapter {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    PlayerRepository playerRepository;

    @Override
    public void init(AuthenticationManagerBuilder auth) throws Exception {
        auth.userDetailsService(inputName -> {
            Player player = playerRepository.findByUserName(inputName);
            if (player != null) {
                System.out.println(player.getUserName());
                return new User(player.getUserName(), passwordEncoder.encode(player.getPassword()),
                        AuthorityUtils.createAuthorityList("USER"));
            } else {
                throw new UsernameNotFoundException("Unknown user: " + inputName);
            }
        });
    }
}

@EnableWebSecurity
@Configuration
class WebSecurityConfig extends WebSecurityConfigurerAdapter {

    @Override
    protected void configure(HttpSecurity http) throws Exception {

        http.authorizeRequests()
                .antMatchers("/web/games.html").permitAll()
                .antMatchers("/favicon.ico").permitAll()
                .antMatchers("/api/games").permitAll()
                .antMatchers("/api/players").permitAll()
                .antMatchers("/web/games.js").permitAll()
                .antMatchers("/web/games.css").permitAll()
                .antMatchers("/rest/**").permitAll()
                .antMatchers("/api/login").permitAll()
                .antMatchers("/api/leaderboard").permitAll()
                .anyRequest().authenticated()
                .and()
                .formLogin()
                .usernameParameter("username")
                .passwordParameter("password")
                .loginPage("/api/login")
                .and()
                .logout()
                .logoutUrl("/api/logout");



        // turn off checking for CSRF tokens
        http.csrf().disable();

        // if user is not authenticated, just send an authentication failure response
        http.exceptionHandling().authenticationEntryPoint((req, res, exc) -> res.sendError(HttpServletResponse.SC_UNAUTHORIZED));

        // if login is successful, just clear the flags asking for authentication
        http.formLogin().successHandler((req, res, auth) -> clearAuthenticationAttributes(req));

        // if login fails, just send an authentication failure response
        http.formLogin().failureHandler((req, res, exc) -> res.sendError(HttpServletResponse.SC_UNAUTHORIZED));

        // if logout is successful, just send a success response
        http.logout().logoutSuccessHandler(new HttpStatusReturningLogoutSuccessHandler());

        //Disbale X-Frame
        http.headers().frameOptions().disable();

    }

    private void clearAuthenticationAttributes(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.removeAttribute(WebAttributes.AUTHENTICATION_EXCEPTION);
        }
    }
}

