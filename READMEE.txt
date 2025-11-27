these js files were done with the help of ai in order to implement a well-structured game and it 
was beyond the scope of what we took. I made sure to understand them well and i hope that is fine
by you. Enjoy the game! :p


FRONT-End:
• Added Fetch API integration to all interactive pages
• Created new Leaderboard page (leaderboard.html)
• Enhanced feedback page with real-time database submission
• Added database connectivity to player registration system
• Integrated score saving functionality in game arena
• Updated navigation across all pages to include Leaderboard link
• Added loading indicators and error handling for API calls
• Implemented player statistics display with search functionality
• Enhanced user experience with database-driven testimonials
• Added "View Leaderboard" button to game results screen

BACK-END:
• Set up Node.js and Express server (server.js)
• Implemented MySQL database with 5 tables
• Created 10+ RESTful API endpoints
• Enabled CORS for cross-origin requests
• Added connection pooling for efficient database access
• Implemented error handling and validation
• Added health check endpoint for monitoring


EXTERNAL LIBRARIES:
• AOS (Animate On Scroll) - https://github.com/michalsnik/aos
• Particles.js - https://github.com/VincentGarreau/particles.js/
• Howler.js - https://github.com/goldfire/howler.js
• jQuery (for feedback page) - https://jquery.com/

=============================================================================
PAGES THAT INTERACT WITH DATABASE (5+)
=============================================================================

1. PLAYER INPUT PAGE (player.html / player.js)
   - Creates/retrieves users in database
   - Creates game session record
   - Stores player IDs in sessionStorage

2. GAME ARENA PAGE (arena.html / arena.js)
   - Saves final scores to database
   - Tracks correct answers and time spent
   - Links scores to game session

3. FEEDBACK PAGE (feedback.html / feedback.js)
   - Submits feedback to database
   - Fetches recent testimonials
   - Displays dynamic feedback

4. LEADERBOARD PAGE (leaderboard.html / leaderboard.js)
   - Fetches top player rankings
   - Displays player statistics
   - Search functionality for individual players

5. HOME PAGE (home.html)
   - Served by Express server
   - Static content with dynamic background

=============================================================================
ONLINE RESOURCES USED
=============================================================================

DOCUMENTATION AND REFERENCES
-----------------------------
• Node.js Documentation: https://nodejs.org/docs/
• Express.js Guide: https://expressjs.com/
• MySQL2 npm Package: https://www.npmjs.com/package/mysql2
• MDN Web Docs - Fetch API: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
• MDN Web Docs - Web Audio API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
• MDN Web Docs - SessionStorage: https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage

EXTERNAL LIBRARIES
------------------
• AOS (Animate On Scroll): https://github.com/michalsnik/aos
• Particles.js: https://github.com/VincentGarreau/particles.js/
• Howler.js: https://github.com/goldfire/howler.js
• jQuery: https://jquery.com/
• CORS npm package: https://www.npmjs.com/package/cors

ASSETS
------
• Background music: Pixabay (https://pixabay.com/music/)
• Logo design: Custom created


=============================================================================
TESTING INSTRUCTIONS
=============================================================================

TEST 1: User Registration
-------------------------
1. Go to Player Input page
2. Enter player names
3. Click "Start Game"
4. Check browser console for "Player 1 ID" and "Game Session ID"
5. Verify in database: SELECT * FROM users; SELECT * FROM game_sessions;

TEST 2: Score Saving
--------------------
1. Complete a game
2. Check browser console for "Score saved successfully"
3. Verify in database: SELECT * FROM scores;

TEST 3: Leaderboard
-------------------
1. Play multiple games with different players
2. Navigate to Leaderboard page
3. Verify rankings are displayed correctly
4. Search for a specific player

TEST 4: Feedback System
-----------------------
1. Go to Feedback page
2. Fill out and submit feedback form
3. Check if feedback appears in testimonials
4. Verify in database: SELECT * FROM feedback;

