
// this is the main server file that connects the front-end game to the MySQL database
const cors = require('cors');
const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

//these functions run before every request reaches the endpoints
app.use(cors()); // cors allows the browser to make requests from html pages to this server
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // parses the form data from HTML forms
app.use(express.static(path.join(__dirname))); 

// database connection pool setup
// this creates a pool of reusable database connections for better performance
// instead of opening/closing a new connection for every single request
// for deployment: the code uses environment variables (process.env) so when i deploy
// to a hosting platform, it can provide its own database credentials securely
// for local development: if no environment variables are set, it uses the || operator
// to fall back to my local database settings (localhost, root, my password, project2_db)
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost', 
  user: process.env.DB_USER || 'root', 
  password: process.env.DB_PASSWORD || 'Mayssameidweb1_',
  database: process.env.DB_NAME || 'project2_db', 
  connectionLimit: 10 //max of 10 database connections
});

// this is called from player.js when users enter their names to start a game
app.post('/api/users', (req, res) => {
    // extract username and email from the request sent by the front-end
    const { username, email } = req.body;
    
    // this is for validation, to make sure username was provided
    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }
    
    // first, check if this username already exists in the database
    const checkQuery = 'SELECT * FROM users WHERE username = ?';
    // execute the query - the array [username] replaces the ? placeholder safely
    pool.query(checkQuery, [username], (error, results) => {
        if (error) {
            console.error('Error checking user:', error);
            return res.status(500).json({ error: 'Database error' });
        }
        
        // if results array has data, the user already exists in the database
        // so we return the existing user instead of creating a duplicate
        if (results.length > 0) {
            return res.json({ 
                message: 'User already exists',
                user: results[0]  // send back the existing user data
            });
        }
        
        // user doesn't exist, so create a new record in the users table
        const insertQuery = 'INSERT INTO users (username, email) VALUES (?, ?)';
        pool.query(insertQuery, [username, email], (error, results) => {
            if (error) {
                console.error('Error creating user:', error);
                return res.status(500).json({ error: 'Failed to create user' });
            }
            
            // successfully created the user
            // status 201 means "created", this is the standard http code for successful resource creation
            // results.insertid gives us the auto-generated user_id from the database
            res.status(201).json({ 
                message: 'User created successfully',
                user: {
                    user_id: results.insertId,  // the new user's id assigned by mysql
                    username: username,
                    email: email
                }
            });
        });
    });
});

// this is used by leaderboard.js to search for users by username
app.get('/api/users', (req, res) => {
    // sql query to get user info, ordered by newest first
    const query = 'SELECT user_id, username, email, created_at FROM users ORDER BY created_at DESC';
    
    pool.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching users:', error);
            return res.status(500).json({ error: 'Failed to retrieve users' });
        }
        // send the array of users back to the front-end as json
        res.json(results);
    });
});

// to create a new game session record
// this is called from player.js after both users are created but before the game starts
// it tracks who played together, when, and what game settings were used
app.post('/api/game-sessions', (req, res) => {
    // extract game session data from the request
    const { player1_id, player2_id, difficulty, game_mode } = req.body;
    
    // validation: ensure required fields are present
    // player2_id can be null for single-player mode
    if (!player1_id || !difficulty || !game_mode) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // insert a new game session record into the database
    const query = 'INSERT INTO game_sessions (player1_id, player2_id, difficulty, game_mode) VALUES (?, ?, ?, ?)';
    
    pool.query(query, [player1_id, player2_id, difficulty, game_mode], (error, results) => {
        if (error) {
            console.error('Error creating game session:', error);
            return res.status(500).json({ error: 'Failed to create game session' });
        }
        
        // return the newly created session_id so arena.js can link scores to this session
        res.status(201).json({ 
            message: 'Game session created successfully',
            session_id: results.insertId  // this id is stored in sessionstorage
        });
    });
});


// to save a player's score after they finish a game
// this is called from arena.js in the endgame() function
// each player gets their own score record, even in multiplayer games
app.post('/api/scores', (req, res) => {
    // extract score data sent from the front-end
    const { session_id, user_id, score, correct_answers, total_questions, time_spent } = req.body;
    
    // validation: make sure we have the essential data
    // score can be 0, so we check for undefined specifically
    if (!session_id || !user_id || score === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // insert the score into the database
    // this data is used by the leaderboard view to calculate rankings
    const query = `
        INSERT INTO scores (session_id, user_id, score, correct_answers, total_questions, time_spent) 
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    pool.query(query, [session_id, user_id, score, correct_answers, total_questions, time_spent], (error, results) => {
        if (error) {
            console.error('Error saving score:', error);
            return res.status(500).json({ error: 'Failed to save score' });
        }
        
        res.status(201).json({ 
            message: 'Score saved successfully',
            score_id: results.insertId
        });
    });
});

// to save user feedback from the feedback form
// this is called from feedback.js when users submit their opinions about the game
app.post('/api/feedback', (req, res) => {
    // extract all the feedback fields from the form submission
    const { name, email, rating, liked, disliked, feature_requests, challenges, additional_comments } = req.body;
    
    // validation: name, email, and rating are required fields
    // other fields are optional and can be null
    if (!name || !email || !rating) {
        return res.status(400).json({ error: 'Name, email, and rating are required' });
    }
    
    // inserts the feedback into the database
    // the feedback table stores all user opinions for later analysis
    const query = `
        INSERT INTO feedback (name, email, rating, liked, disliked, feature_requests, challenges, additional_comments) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    pool.query(query, [name, email, rating, liked, disliked, feature_requests, challenges, additional_comments], (error, results) => {
        if (error) {
            console.error('Error saving feedback:', error);
            return res.status(500).json({ error: 'Failed to save feedback' });
        }
        
        res.status(201).json({ 
            message: 'Feedback submitted successfully',
            feedback_id: results.insertId
        });
    });
});

// to get recent feedback for displaying as testimonials
// shows all feedback regardless of rating
app.get('/api/feedback/recent', (req, res) => {
    const limit = req.query.limit || 5;
    // select all feedback, ordered by newest first
    const query = 'SELECT name, rating, liked, created_at FROM feedback ORDER BY created_at DESC LIMIT ?';
    
    pool.query(query, [parseInt(limit)], (error, results) => {
        if (error) {
            console.error('Error fetching recent feedback:', error);
            return res.status(500).json({ error: 'Failed to retrieve feedback' });
        }
        res.json(results);
    });
});


// to get the top players for the leaderboard page
app.get('/api/leaderboard', (req, res) => {
    const limit = req.query.limit || 10;
    // query the leaderboard view created in database_setup.sql
    // only include players who have actually played at least one game
    const query = `
        SELECT * FROM leaderboard 
        WHERE games_played > 0
        ORDER BY total_score DESC 
        LIMIT ?
    `;
    
    pool.query(query, [parseInt(limit)], (error, results) => {
        if (error) {
            console.error('Error fetching leaderboard:', error);
            return res.status(500).json({ error: 'Failed to retrieve leaderboard' });
        }
        res.json(results);
    });
});

// to get statistics for a specific player
// used by the search function on leaderboard.js to look up individual player stats
// returns aggregated data like total games played, average score, highest score...
app.get('/api/leaderboard/:userId', (req, res) => {
    const userId = req.params.userId;
    // query the leaderboard view for this specific user
    // the view automatically calculates all their stats from the scores table
    const query = 'SELECT * FROM leaderboard WHERE user_id = ?';
    
    pool.query(query, [userId], (error, results) => {
        if (error) {
            console.error('Error fetching player stats:', error);
            return res.status(500).json({ error: 'Failed to retrieve player statistics' });
        }
        
        // if player hasn't played any games, they won't be in the leaderboard view
        if (results.length === 0) {
            return res.status(404).json({ error: 'Player not found' });
        }
        
        res.json(results[0]);
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'home.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});