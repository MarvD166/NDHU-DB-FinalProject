const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { pool } = require('../config/db');

// Show login form
router.get('/login', (req, res) => {
  res.render('auth/login', { error: null });
});

// Show register form
router.get('/register', (req, res) => {
  res.render('auth/register', { error: null, title: 'Register' });
});


// Handle login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('Login input:', username, password);

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);

    if (rows.length === 0) {
      console.log('❌ Kein Benutzer gefunden');
      return res.render('auth/login', { error: 'Invalid username or password' });
    }

    const user = rows[0];
    console.log('🔍 Benutzer aus DB:', user);

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    console.log('✅ Passwortvergleich:', passwordMatch);

    if (!passwordMatch) {
      return res.render('auth/login', { error: 'Invalid username or password' });
    }

    req.session.user = {
      id: user.user_id,
      username: user.username,
      isAdmin: user.is_admin
    };

    res.redirect('/');
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).render('auth/login', { error: 'Internal server error' });
  }
});

router.post('/register', async (req, res) => {
  const { username, email, password, firstName, lastName } = req.body;

  try {
    // Existiert der Benutzer bereits?
    const [existingUsers] = await pool.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      return res.render('auth/register', {
        error: 'Username or email already exists',
        title: 'Register'
      });
    }

    // Passwort hashen
    const hashedPassword = await bcrypt.hash(password, 10);

    // Benutzer einfügen
    await pool.query(
      'INSERT INTO users (username, email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?, ?)',
      [username, email, hashedPassword, firstName, lastName]
    );

    // Nach Registrierung zur Login-Seite
    res.redirect('/auth/login');
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).render('auth/register', {
      error: 'Internal server error',
      title: 'Register'
    });
  }
});

// Handle logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login');
  });
});

module.exports = router;
