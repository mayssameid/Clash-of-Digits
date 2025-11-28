// this file connects to the back-end server to save user data
// it handles creating users, game sessions, and storing info before starting the game
const API_URL = window.location.port === '5500'
  ? 'http://localhost:3000/api'
  : window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api' 
  : '/api';

// creates a new user or gets existing user from database
// this function sends the username to the server using fetch api
// the server checks if the user already exists and returns their id
// if they don't exist, it creates a new user in the database
async function createOrGetUser(username, email = null) {
  try {
    // send post request to create or get user
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email })
    });
    
    // checks if the request was successful
    if (!response.ok) {
      throw new Error('Failed to create/get user');
    }
    
    // gets the user data from the response
    const result = await response.json();
    // returns the user object which contains user_id and username
    return result.user;
  } catch (error) {
    // if something goes wrong, it logs the error and returns null
    // this allows the game to continue even if database connection fails
    console.error('Error creating/getting user:', error);
    return null;
  }
}

// this function stores information about the game that's about to start
// it tracks who's playing, the difficulty level, and whether it's single or multiplayer
// the session_id it returns is used later to link scores to this specific game
async function createGameSession(player1Id, player2Id, difficulty, gameMode) {
  try {
    // sends all the game session details to the server
    const response = await fetch(`${API_URL}/game-sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        player1_id: player1Id,
        player2_id: player2Id,
        difficulty: difficulty,
        game_mode: gameMode
      })
    });
    
    // checks if session was created successfully
    if (!response.ok) {
      throw new Error('Failed to create game session');
    }
    
    // gets the session_id from the response
    const result = await response.json();
    // returns session_id so we can save it in sessionstorage
    return result.session_id;
  } catch (error) {
    // if session creation fails, logs error and returns null
    console.error('Error creating game session:', error);
    return null;
  }
}

// shows or hides player 2 input based on game mode
// when user selects multiplayer, it shows the player 2 name field
// when user selects single player, it hides it because they play against computer
function togglePlayer2Input() {
  // gets the currently selected game mode from radio buttons
  const gameMode = document.querySelector('input[name="game-mode"]:checked').value;
  const player2Section = document.getElementById('player2-section');
  
  if (gameMode === 'multiplayer') {
    // shows player 2 input and makes it required
    player2Section.style.display = 'block';
    document.getElementById('player2').required = true;
  } else {
    // hides player 2 input and removes required validation
    player2Section.style.display = 'none';
    document.getElementById('player2').required = false;
  }
}

// validates inputs and redirects to game arena
// this is the main function that runs when user clicks start game button
// it collects all the input data, creates users in database, creates game session, and then redirects to arena
async function startGame() {
  // gets all the form values from the html inputs
  const player1Name = document.getElementById("player1").value.trim();
  const gameMode = document.querySelector('input[name="game-mode"]:checked').value;
  const difficulty = document.getElementById("difficulty").value;

  // makes sure player 1 entered their name
  if (!player1Name) {
    alert("Please enter Player 1 name");
    return;
  }

  let player2Name;

  // checks if multiplayer mode is selected
  if (gameMode === 'multiplayer') {
    // gets player 2 name and validates it
    player2Name = document.getElementById("player2").value.trim();
    if (!player2Name) {
      alert("Please enter Player 2 name for multiplayer mode");
      return;
    }
  } else {
    // for single player mode, player 2 is always the computer
    player2Name = "Computer";
  }

  // stores player info in sessionstorage so arena.html can access it
  // sessionstorage keeps data available across different pages
  sessionStorage.setItem("player1Name", player1Name);
  sessionStorage.setItem("player2Name", player2Name);
  sessionStorage.setItem("gameMode", gameMode);
  sessionStorage.setItem("difficulty", difficulty);

  // creates users and game session in database
  // this part connects to the back-end to save everything to mysql
  try {
    // first creates or gets player 1 from database
    const player1 = await createOrGetUser(player1Name);
    
    // if we successfully got player 1 data, save their id
    if (player1) {
      sessionStorage.setItem("player1Id", player1.user_id);
    }

    // only creates player 2 in database if it's multiplayer and not against computer
    let player2 = null;
    if (gameMode === 'multiplayer' && player2Name !== 'Computer') {
      // creates or gets player 2 from database
      player2 = await createOrGetUser(player2Name);
      
      // saves player 2 id if we got it successfully
      if (player2) {
        sessionStorage.setItem("player2Id", player2.user_id);
      }
    }

    // now creates the game session record in database
    if (player1) {
      // passes all the game details to create session
      // player2.user_id is null if playing against computer
      const sessionId = await createGameSession(
        player1.user_id,
        player2 ? player2.user_id : null,
        difficulty,
        gameMode
      );
      
      // saves session id so it can link scores to this game later
      if (sessionId) {
        sessionStorage.setItem("sessionId", sessionId);
      }
    }
  } catch (error) {
    // if database connection fails, still let them play the game
    // scores just won't be saved to leaderboard
    console.error("Error setting up game in database:", error);
    alert("Note: Could not connect to database. Game will still work, but scores won't be saved.");
  }

  // redirect to the game arena page to start playing
  window.location.href = "arena.html";
}

// sets up page when it loads
// this runs automatically when the html page finishes loading
document.addEventListener('DOMContentLoaded', function() {
  // attaches event listeners to game mode radio buttons
  // whenever user clicks single player or multiplayer, it calls togglePlayer2Input
  const gameModeRadios = document.querySelectorAll('input[name="game-mode"]');
  gameModeRadios.forEach(radio => {
    radio.addEventListener('change', togglePlayer2Input);
  });
  
  // call it once on page load to set correct initial state
  togglePlayer2Input();

  // initialize aos (animate on scroll) library for smooth scroll animations
  // duration is how long animations take, once means they only play one time
  AOS.init({ 
    duration: 1000, 
    easing: 'ease-in-out', 
    once: true 
  });

  // initializes particles.js to create animated background particles
  // particles-js is the id of the div where particles will appear
  particlesJS('particles-js', {
    "particles": { 
      "number": { "value": 20 },  // how many particles appear on screen
      "color": { "value": ["#0fcece", "#e94560"] }, 
      "shape": { "type": "circle" },  
      "opacity": { "value": 0.08 },  
      "size": { "value": 6 },  
      "line_linked": {  
        "enable": true, 
        "distance": 150,  
        "color": "#0fcece",  
        "opacity": 0.04  
      }, 
      "move": {  
        "enable": true, 
        "speed": 1  
      } 
    },
    "interactivity": {  
      "events": { 
        "onhover": { 
          "enable": true, 
          "mode": "grab"  
        } 
      } 
    },
    "retina_detect": true  
  });
});
