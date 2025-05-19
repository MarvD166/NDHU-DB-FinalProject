const express = require('express');
const bcrypt = require('bcrypt');
const { pool } = require('../config/db');

const router = express.Router();

// Login page
router.get('/login', (req, res) => {
  res.render('auth/login', { title: 'Login', error: null });
});

// Register page
router.get('/register', (req, res) => {
  res.render('auth/register', { title: 'Register', error: null });
});

// Process registration
router.post('/register', async (req, res) => {
  const { username, email, password, firstName, lastName } = req.body;
  
  try {
    // Check if user already exists
    const [existingUsers] = await pool.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    
    if (existingUsers.length > 0) {
      return res.render('auth/register', {
        title: 'Register',
        error: 'Username or email already exists'
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert new user
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?, ?)',
      [username, email, hashedPassword, firstName, lastName]
    );
    
    // Auto login after registration
    req.session.user = {
      id: result.insertId,
      username,
      email,
      firstName,
      lastName,
      isAdmin: 0
    };
    
    res.redirect('/');
  } catch (error) {
    console.error('Registration error:', error);
    res.render('auth/register', {
      title: 'Register',
      error: 'An error occurred during registration'
    });
  }
});

// Process login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    // Find user
    const [users] = await pool.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    
    if (users.length === 0) {
      return res.render('auth/login', {
        title: 'Login',
        error: 'Invalid username or password'
      });
    }
    
    const user = users[0];
    
    // Check password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!passwordMatch) {
      return res.render('auth/login', {
        title: 'Login',
        error: 'Invalid username or password'
      });
    }
    
    // Set session
    req.session.user = {
      id: user.user_id,
      username: user.username,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      isAdmin: user.is_admin
    };
    
    res.redirect('/');
  } catch (error) {
    console.error('Login error:', error);
    res.render('auth/login', {
      title: 'Login',
      error: 'An error occurred during login'
    });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
