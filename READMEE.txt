these js files were done with the help of ai in order to implement a well-structured game and it 
was beyond the scope of what we took. I made sure to understand them well and i hope that is fine
by you. Enjoy the game! :p


FRONT-End:
• Implemented React Components with Hooks on Leaderboard page
  - Used useState for managing leaderboard data, search query, and loading states
  - Used useEffect for fetching data from API on component mount
  - Implemented React props for component composition
• Added Fetch API integration to all interactive pages
• Created new Leaderboard page (leaderboard.html) with React
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
• Implemented MySQL database with 4 tables (users, game_sessions, scores, feedback) and 1 view (leaderboard)
• Created 8 RESTful API endpoints (POST/GET users, POST game-sessions, POST scores, POST feedback, GET feedback/recent, GET leaderboard, GET leaderboard/:userId)
• Enabled CORS for cross-origin requests
• Added connection pooling for efficient database access
• Implemented error handling and validation


EXTERNAL LIBRARIES:
• React 18 - https://react.dev/ (Leaderboard page with useState and useEffect hooks)
• AOS (Animate On Scroll) - https://github.com/michalsnik/aos
• Particles.js - https://github.com/VincentGarreau/particles.js/
• Howler.js - https://github.com/goldfire/howler.js
• jQuery (for feedback page) - https://jquery.com/
• CORS npm package: https://www.npmjs.com/package/cors



