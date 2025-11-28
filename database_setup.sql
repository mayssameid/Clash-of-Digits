
-- creates the database
CREATE DATABASE IF NOT EXISTS project2_db;
USE project2_db;

-- Table 1: Users table to store player information
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_username (username)
);

-- Table 2: Game sessions table to track each game played
CREATE TABLE IF NOT EXISTS game_sessions (
    session_id INT AUTO_INCREMENT PRIMARY KEY,
    player1_id INT NOT NULL,
    player2_id INT,
    difficulty VARCHAR(20) NOT NULL,
    game_mode VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player1_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (player2_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_created_at (created_at)
);

-- Table 3: Scores table to store game results
CREATE TABLE IF NOT EXISTS scores (
    score_id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    user_id INT NOT NULL,
    score INT NOT NULL DEFAULT 0,
    correct_answers INT DEFAULT 0,
    total_questions INT DEFAULT 0,
    time_spent INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES game_sessions(session_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_score (score DESC),
    INDEX idx_user_score (user_id, score DESC)
);

-- Table 4: Feedback table to store user feedback
CREATE TABLE IF NOT EXISTS feedback (
    feedback_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    liked TEXT,
    disliked TEXT,
    feature_requests TEXT,
    challenges VARCHAR(500),
    additional_comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_rating (rating),
    INDEX idx_created_at (created_at DESC)
);

-- Table 5: Leaderboard view 
-- This creates a virtual table that shows top players
CREATE OR REPLACE VIEW leaderboard AS
SELECT 
    u.user_id,
    u.username,
    COUNT(DISTINCT s.session_id) as games_played,
    COALESCE(SUM(s.score), 0) as total_score,
    COALESCE(AVG(s.score), 0) as average_score,
    COALESCE(MAX(s.score), 0) as highest_score,
    COALESCE(SUM(s.correct_answers), 0) as total_correct,
    MAX(s.created_at) as last_played
FROM users u
LEFT JOIN scores s ON u.user_id = s.user_id
GROUP BY u.user_id, u.username
ORDER BY total_score DESC;

