// this handles displaying the leaderboard and searching for player statistics
// it fetches data from the back-end server and displays it in a table
const API_URL = 'http://localhost:3000/api';

// loads the top 20 players from the database and displays them in the leaderboard table
// this function runs automatically when the page loads
async function loadLeaderboard() {
  // get references to html elements we need to update
  const loadingIndicator = document.getElementById('loading-indicator');
  const errorMessage = document.getElementById('error-message');
  const leaderboardBody = document.getElementById('leaderboard-body');

  try {
    loadingIndicator.style.display = 'block';
    errorMessage.style.display = 'none';

    // send get request to fetch top 20 players from database
    // the server calculates total scores, averages, and highest scores for each player
    const response = await fetch(`${API_URL}/leaderboard?limit=20`);
    
    // checks if the request was successful
    if (!response.ok) {
      throw new Error('Failed to fetch leaderboard');
    }

    // converts the response to json format
    const leaderboardData = await response.json();
    
    // hides loading indicator now that data is loaded
    loadingIndicator.style.display = 'none';

    // calls function to display all the player data in the table
    displayLeaderboard(leaderboardData);

  } catch (error) {
    // if something goes wrong (server down, network error, etc), show error message
    console.error('Error loading leaderboard:', error);
    loadingIndicator.style.display = 'none';
    errorMessage.style.display = 'block';
  }
}

// displays leaderboard data in the table with rankings and stats
// takes the array of player data and creates html table rows for each player
function displayLeaderboard(data) {
  const leaderboardBody = document.getElementById('leaderboard-body');
  // clear any existing rows first
  leaderboardBody.innerHTML = '';

  // if no players found, show a message encouraging them to play
  if (data.length === 0) {
    leaderboardBody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 40px; color: #cfeff0;">
          No players found. Start playing to appear on the leaderboard!
        </td>
      </tr>
    `;
    return;
  }

  // loop through each player and create a table row
  data.forEach((player, index) => {
    // calculate rank based on position in array (0 becomes 1, 1 becomes 2, etc)
    const rank = index + 1;
    // add special css class for top 3 players to highlight them
    const rankClass = rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : rank === 3 ? 'rank-3' : 'rank-other';
    // add medal emojis for top 3 players (gold, silver, bronze)
    const rankEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';
    
    // format the last played date to look nice (converts database timestamp to readable date)
    const lastPlayed = new Date(player.last_played).toLocaleDateString();
    
    // create the html for this player's row with all their stats
    // escapehtml prevents security issues if player name has special characters
    const row = `
      <tr data-aos="fade-up" data-aos-delay="${index * 50}">
        <td>
          <span class="rank-badge ${rankClass}">${rankEmoji} ${rank}</span>
        </td>
        <td class="player-name">${escapeHtml(player.username)}</td>
        <td>${player.games_played}</td>
        <td class="score-highlight">${Math.round(player.total_score)}</td>
        <td>${Math.round(player.average_score)}</td>
        <td>${Math.round(player.highest_score)}</td>
        <td>${player.total_correct}</td>
        <td>${lastPlayed}</td>
      </tr>
    `;
    
    // add this row to the table body
    // aos animation makes each row fade up with a slight delay for smooth effect
    leaderboardBody.innerHTML += row;
  });
}

// searches for a specific player's statistics by username
// this lets users look up their own stats or other players' stats
// it's a two-step process: first find the user_id, then get their stats
async function searchPlayer() {
  const searchInput = document.getElementById('player-search');
  const playerStatsDiv = document.getElementById('player-stats');
  // remove extra spaces from username
  const username = searchInput.value.trim();

  // make sure the user actually entered a username
  if (!username) {
    alert('Please enter a username to search');
    return;
  }

  try {
    // first we need to get all users to find the user_id by username
    // we do this because the leaderboard api needs a user_id number, not a username string
    const usersResponse = await fetch(`${API_URL}/users`);
    
    if (!usersResponse.ok) {
      throw new Error('Failed to fetch users');
    }

    // get array of all users from database
    const users = await usersResponse.json();
    // search for the player by username (case-insensitive so "john" matches "John")
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());

    // if player doesn't exist in database, show error message
    if (!user) {
      playerStatsDiv.innerHTML = `
        <p style="text-align: center; color: #e94560;">
          Player "${escapeHtml(username)}" not found. Make sure you've played at least one game!
        </p>
      `;
      playerStatsDiv.style.display = 'block';
      return;
    }

    // now fetch that player's detailed statistics using their user_id
    const statsResponse = await fetch(`${API_URL}/leaderboard/${user.user_id}`);
    
    if (!statsResponse.ok) {
      throw new Error('Failed to fetch player stats');
    }

    const stats = await statsResponse.json();
    
    // displays player statistics in a card below the search box
    displayPlayerStats(stats);

  } catch (error) {
    console.error('Error searching for player:', error);
    playerStatsDiv.innerHTML = `
      <p style="text-align: center; color: #e94560;">
        Error loading player statistics. Please try again.
      </p>
    `;
    playerStatsDiv.style.display = 'block';
  }
}

// displays detailed statistics for a specific player in a nice card format
// shows games played, scores, accuracy rate, etc
function displayPlayerStats(stats) {
  const playerStatsDiv = document.getElementById('player-stats');
  
  // format date to be readable
  const lastPlayed = new Date(stats.last_played).toLocaleDateString();
  // calculate accuracy rate as percentage (each game has 20 questions)
  const accuracyRate = stats.games_played > 0 
    ? Math.round((stats.total_correct / (stats.games_played * 20)) * 100) 
    : 0;

  playerStatsDiv.innerHTML = `
    <h3>📊 ${escapeHtml(stats.username)}'s Statistics</h3>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Games Played</div>
        <div class="stat-value">${stats.games_played}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Score</div>
        <div class="stat-value">${Math.round(stats.total_score)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Average Score</div>
        <div class="stat-value">${Math.round(stats.average_score)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Highest Score</div>
        <div class="stat-value">${Math.round(stats.highest_score)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Correct</div>
        <div class="stat-value">${stats.total_correct}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Accuracy Rate</div>
        <div class="stat-value">${accuracyRate}%</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Last Played</div>
        <div class="stat-value" style="font-size: 1.2em;">${lastPlayed}</div>
      </div>
    </div>
  `;
  
  // make the stats card visible
  playerStatsDiv.style.display = 'block';
  
  // scroll smoothly to the stats card so user sees it
  playerStatsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// initializes particles.js for animated background effect
// creates floating particles with connecting lines that react to mouse hover
function initParticles() {
  particlesJS('particles-js', {
    "particles": {
      "number": { "value": 30, "density": { "enable": true, "value_area": 800 } },
      "color": { "value": ["#0fcece", "#e94560", "#ffffff"] },
      "shape": { "type": ["circle", "edge"], "stroke": { "width": 1, "color": "#0fcece" } },
      "opacity": { "value": 0.08, "random": true, "anim": { "enable": true, "speed": 1, "opacity_min": 0.03, "sync": false } },
      "size": { "value": 8, "random": true, "anim": { "enable": true, "speed": 2, "size_min": 3, "sync": false } },
      "line_linked": { "enable": true, "distance": 150, "color": "#0fcece", "opacity": 0.05, "width": 1 },
      "move": { "enable": true, "speed": 1.5, "direction": "top", "random": true, "straight": false, "out_mode": "out", "bounce": false }
    },
    "interactivity": {
      "detect_on": "canvas",
      "events": { "onhover": { "enable": true, "mode": "grab" }, "onclick": { "enable": true, "mode": "push" }, "resize": true },
      "modes": { "grab": { "distance": 140, "line_linked": { "opacity": 0.15 } }, "push": { "particles_nb": 4 } }
    },
    "retina_detect": true
  });
}

// initializes page when html finishes loading
// sets up animations, background particles, loads data, and adds event listeners
document.addEventListener('DOMContentLoaded', function() {
  // initialize aos (animate on scroll) library
  AOS.init({
    duration: 1000,
    easing: 'ease-in-out',
    once: true
  });
  
  initParticles();
  
  loadLeaderboard();
  
  document.getElementById('player-search').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      searchPlayer();
    }
  });
});
