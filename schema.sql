CREATE DATABASE IF NOT EXISTS peer_learning;

USE peer_learning;


-- ============================================================
-- USERS
-- ============================================================

CREATE TABLE IF NOT EXISTS users (

    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(150) NOT NULL,

    email VARCHAR(255) NOT NULL UNIQUE,

    password VARCHAR(255) NOT NULL,

    department VARCHAR(100) DEFAULT 'CSE',

    year INT DEFAULT 2,

    bio TEXT,

    avatar VARCHAR(255) DEFAULT '',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

) ENGINE=InnoDB;


-- ============================================================
-- SKILLS
-- ============================================================

CREATE TABLE IF NOT EXISTS skills (

    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(150) NOT NULL UNIQUE,

    category VARCHAR(100) DEFAULT 'General'

) ENGINE=InnoDB;


-- ============================================================
-- USER SKILLS
-- ============================================================

CREATE TABLE IF NOT EXISTS user_skills (

    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    skill_id INT NOT NULL,

    skill_type VARCHAR(20) NOT NULL,

    CONSTRAINT chk_skill_type
        CHECK (skill_type IN ('teach', 'learn')),

    UNIQUE KEY unique_user_skill_type
        (user_id, skill_id, skill_type),

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (skill_id)
        REFERENCES skills(id)
        ON DELETE CASCADE

) ENGINE=InnoDB;


-- ============================================================
-- LEARNING REQUESTS
-- ============================================================

CREATE TABLE IF NOT EXISTS learning_requests (

    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    skill_id INT NOT NULL,

    description TEXT NOT NULL,

    level VARCHAR(50) DEFAULT 'Beginner',

    availability VARCHAR(100) DEFAULT 'Flexible',

    status VARCHAR(30) DEFAULT 'open',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (skill_id)
        REFERENCES skills(id)
        ON DELETE CASCADE

) ENGINE=InnoDB;


-- ============================================================
-- LEARNING OFFERS
-- ============================================================

CREATE TABLE IF NOT EXISTS learning_offers (

    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    skill_id INT NOT NULL,

    description TEXT NOT NULL,

    level VARCHAR(50) DEFAULT 'Beginner',

    availability VARCHAR(100) DEFAULT 'Flexible',

    status VARCHAR(30) DEFAULT 'open',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (skill_id)
        REFERENCES skills(id)
        ON DELETE CASCADE

) ENGINE=InnoDB;


-- ============================================================
-- MATCHES
-- ============================================================

CREATE TABLE IF NOT EXISTS matches (

    id INT AUTO_INCREMENT PRIMARY KEY,

    requester_id INT NOT NULL,

    teacher_id INT NOT NULL,

    request_id INT NOT NULL,

    offer_id INT NOT NULL,

    match_score DECIMAL(5,2) DEFAULT 0,

    status VARCHAR(30) DEFAULT 'pending',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY unique_request_offer
        (request_id, offer_id),

    FOREIGN KEY (requester_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (teacher_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (request_id)
        REFERENCES learning_requests(id)
        ON DELETE CASCADE,

    FOREIGN KEY (offer_id)
        REFERENCES learning_offers(id)
        ON DELETE CASCADE

) ENGINE=InnoDB;


-- ============================================================
-- SESSIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS sessions (

    id INT AUTO_INCREMENT PRIMARY KEY,

    match_id INT,

    title VARCHAR(255) NOT NULL,

    teacher_id INT NOT NULL,

    learner_id INT NOT NULL,

    scheduled_at VARCHAR(100) NOT NULL,

    duration_minutes INT DEFAULT 45,

    status VARCHAR(30) DEFAULT 'scheduled',

    notes TEXT DEFAULT NULL,

    FOREIGN KEY (match_id)
        REFERENCES matches(id)
        ON DELETE SET NULL,

    FOREIGN KEY (teacher_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (learner_id)
        REFERENCES users(id)
        ON DELETE CASCADE

) ENGINE=InnoDB;


-- ============================================================
-- MESSAGES
-- ============================================================

CREATE TABLE IF NOT EXISTS messages (

    id INT AUTO_INCREMENT PRIMARY KEY,

    sender_id INT NOT NULL,

    receiver_id INT NOT NULL,

    message TEXT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    is_read TINYINT(1) DEFAULT 0,

    FOREIGN KEY (sender_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (receiver_id)
        REFERENCES users(id)
        ON DELETE CASCADE

) ENGINE=InnoDB;


-- ============================================================
-- STUDY ROOMS
-- ============================================================

CREATE TABLE IF NOT EXISTS study_rooms (

    id INT AUTO_INCREMENT PRIMARY KEY,

    host_id INT NOT NULL,

    title VARCHAR(255) NOT NULL,

    topic VARCHAR(255) NOT NULL,

    scheduled_at VARCHAR(100) NOT NULL,

    duration_minutes INT DEFAULT 45,

    max_members INT DEFAULT 8,

    status VARCHAR(30) DEFAULT 'open',

    FOREIGN KEY (host_id)
        REFERENCES users(id)
        ON DELETE CASCADE

) ENGINE=InnoDB;


-- ============================================================
-- ROOM MEMBERS
-- ============================================================

CREATE TABLE IF NOT EXISTS room_members (

    id INT AUTO_INCREMENT PRIMARY KEY,

    room_id INT NOT NULL,

    user_id INT NOT NULL,

    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY unique_room_user
        (room_id, user_id),

    FOREIGN KEY (room_id)
        REFERENCES study_rooms(id)
        ON DELETE CASCADE,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE

) ENGINE=InnoDB;


-- ============================================================
-- DEFAULT SKILLS
-- ============================================================

INSERT IGNORE INTO skills (name, category) VALUES
('Python', 'Code'),
('Java', 'Code'),
('C++', 'Code'),
('SQL', 'Code'),
('Data Structures', 'Code'),
('Machine Learning', 'Code'),
('Web Development', 'Code'),
('Data Analysis', 'Code'),

('Figma', 'Design'),
('UI/UX Design', 'Design'),
('Illustration', 'Design'),
('Portfolio Design', 'Design'),

('English', 'Languages'),
('Spanish', 'Languages'),
('Communication', 'Languages'),

('Business', 'Business'),
('Data Storytelling', 'Business'),
('Public Speaking', 'Business'),

('Aptitude', 'General');