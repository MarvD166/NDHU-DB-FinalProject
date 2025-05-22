-- Create the database
CREATE DATABASE IF NOT EXISTS event_management_system;
USE event_management_system;

-- Drop tables if they already exist
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS event_category_mapping;
DROP TABLE IF EXISTS event_categories;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS users;

-- USERS table
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_admin BOOLEAN DEFAULT FALSE
);

-- Insert admin and user accounts with pre-hashed passwords
INSERT INTO users (username, email, password_hash, first_name, last_name, is_admin) VALUES
('admin', 'admin@example.com', '$2b$10$sWJ/1WQN44tjfU1e11R2f.BGq0FL4NRADFUKHW1S/8ob4vQ1/Ke.2', 'Admin', 'User', TRUE),
('user', 'user@example.com', '$2b$10$XwiMcHvDmoOlwjfNFuxXMu8Yuk.P7txJ5aGbQXZaoI5/Xga2fi8tO', 'Normal', 'User', FALSE);

-- EVENTS table
CREATE TABLE events (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    event_date DATETIME NOT NULL,
    location VARCHAR(255) NOT NULL,
    capacity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    organizer_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status ENUM('upcoming', 'ongoing', 'completed', 'canceled') DEFAULT 'upcoming',
    FOREIGN KEY (organizer_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- EVENT_CATEGORIES table
CREATE TABLE event_categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);

-- EVENT_CATEGORY_MAPPING table
CREATE TABLE event_category_mapping (
    mapping_id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    category_id INT NOT NULL,
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES event_categories(category_id) ON DELETE CASCADE,
    UNIQUE KEY (event_id, category_id)
);

-- BOOKINGS table
CREATE TABLE bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    num_tickets INT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('confirmed', 'pending', 'canceled') DEFAULT 'confirmed',
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE
);

-- REVIEWS table
CREATE TABLE reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
    UNIQUE KEY (user_id, event_id)
);

-- Insert sample categories
INSERT INTO event_categories (name, description) VALUES
('Music', 'Concerts, festivals, and musical performances'),
('Sports', 'Sporting events and competitions'),
('Technology', 'Tech conferences, workshops, and meetups'),
('Business', 'Business conferences, networking events, and seminars'),
('Arts', 'Art exhibitions, theater performances, and cultural events');

-- Insert sample events
INSERT INTO events (title, description, event_date, location, capacity, price, organizer_id) VALUES
('Tech Conference 2025', 'A major annual tech conference.', '2025-10-10 09:00:00', 'Berlin Convention Center', 200, 199.99, 1),
('Music Fest', 'A weekend of live music and fun.', '2025-08-15 16:00:00', 'City Park', 500, 49.99, 1);

-- Map categories to events
INSERT INTO event_category_mapping (event_id, category_id) VALUES
(1, 3),  -- Tech Conference -> Technology
(2, 1);  -- Music Fest -> Music

-- Insert sample booking
INSERT INTO bookings (user_id, event_id, num_tickets, total_price, status) VALUES
(1, 2, 2, 99.98, 'confirmed');

-- Insert sample review
INSERT INTO reviews (user_id, event_id, rating, comment) VALUES
(1, 2, 5, 'Amazing event! Really enjoyed it.');
