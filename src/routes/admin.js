const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.isAdmin) {
    next();
  } else {
    res.status(403).render('error', { 
      title: 'Access Denied', 
      message: 'You do not have permission to access this page' 
    });
  }
};

// Root admin route - redirect to dashboard
router.get('/', isAdmin, (req, res) => {
  res.redirect('/admin/dashboard');
});

// Admin dashboard
router.get('/dashboard', isAdmin, async (req, res) => {
  try {
    // Get counts for dashboard
    const [userCount] = await pool.query('SELECT COUNT(*) as count FROM users');
    const [eventCount] = await pool.query('SELECT COUNT(*) as count FROM events');
    const [bookingCount] = await pool.query('SELECT COUNT(*) as count FROM bookings');
    const [categoryCount] = await pool.query('SELECT COUNT(*) as count FROM event_categories');

    const stats = {
      userCount: userCount[0].count,
      eventCount: eventCount[0].count,
      bookingCount: bookingCount[0].count,
      categoryCount: categoryCount[0].count
    };
    
    // Get recent events
    const [recentEvents] = await pool.query(`
      SELECT e.*, u.username as organizer_name
      FROM events e
      JOIN users u ON e.organizer_id = u.user_id
      ORDER BY e.created_at DESC
      LIMIT 5
    `);
    
    // Get recent bookings
    const [recentBookings] = await pool.query(`
      SELECT b.*, u.username, e.title as event_title
      FROM bookings b
      JOIN users u ON b.user_id = u.user_id
      JOIN events e ON b.event_id = e.event_id
      ORDER BY b.booking_date DESC
      LIMIT 5
    `);
    
    res.render('admin/dashboard', { 
      title: 'Admin Dashboard',
      stats,
      recentEvents,
      recentBookings
    });
  } catch (error) {
    console.error('Error loading admin dashboard:', error);
    res.status(500).render('error', { 
      title: 'Error', 
      message: 'Failed to load admin dashboard' 
    });
  }
});

// User management
router.get('/users', isAdmin, async (req, res) => {
  try {
    const [users] = await pool.query('SELECT * FROM users');
    
    res.render('admin/users', { 
      title: 'User Management',
      users,
      currentUser: req.session.user
    });
  } catch (error) {
    console.error('Error loading users:', error);
    res.status(500).render('error', { 
      title: 'Error', 
      message: 'Failed to load users' 
    });
  }
});

// Toggle admin status
router.post('/users/:id/toggle-admin', isAdmin, async (req, res) => {
  const userId = req.params.id;
  
  try {
    // Get current admin status
    const [userResult] = await pool.query('SELECT is_admin FROM users WHERE user_id = ?', [userId]);
    
    if (userResult.length === 0) {
      return res.status(404).render('error', { 
        title: 'Error', 
        message: 'User not found' 
      });
    }
    
    const newStatus = userResult[0].is_admin ? 0 : 1;
    
    // Update admin status
    await pool.query('UPDATE users SET is_admin = ? WHERE user_id = ?', [newStatus, userId]);
    
    res.redirect('/admin/users');
  } catch (error) {
    console.error('Error toggling admin status:', error);
    res.status(500).render('error', { 
      title: 'Error', 
      message: 'Failed to update user' 
    });
  }
});

// Event management
router.get('/events', isAdmin, async (req, res) => {
  try {
    const [events] = await pool.query(`
      SELECT e.*, u.username as organizer_name
      FROM events e
      JOIN users u ON e.organizer_id = u.user_id
      ORDER BY e.event_date DESC
    `);
    
    res.render('admin/events', { 
      title: 'Event Management',
      events
    });
  } catch (error) {
    console.error('Error loading events:', error);
    res.status(500).render('error', { 
      title: 'Error', 
      message: 'Failed to load events' 
    });
  }
});

// Update event status
router.post('/events/:id/toggle-status', isAdmin, async (req, res) => {
  const eventId = req.params.id;
  const { status } = req.body;
  
  try {
    await pool.query('UPDATE events SET status = ? WHERE event_id = ?', [status, eventId]);
    
    res.redirect('/admin/events');
  } catch (error) {
    console.error('Error updating event status:', error);
    res.status(500).render('error', { 
      title: 'Error', 
      message: 'Failed to update event' 
    });
  }
});

// Booking management
router.get('/bookings', isAdmin, async (req, res) => {
  try {
    const [bookings] = await pool.query(`
      SELECT b.*, u.username, e.title as event_title
      FROM bookings b
      JOIN users u ON b.user_id = u.user_id
      JOIN events e ON b.event_id = e.event_id
      ORDER BY b.booking_date DESC
    `);
    
    res.render('admin/bookings', { 
      title: 'Booking Management',
      bookings
    });
  } catch (error) {
    console.error('Error loading bookings:', error);
    res.status(500).render('error', { 
      title: 'Error', 
      message: 'Failed to load bookings' 
    });
  }
});

// Update booking status
router.post('/bookings/:id/update-status', isAdmin, async (req, res) => {
  const bookingId = req.params.id;
  const { status } = req.body;
  
  try {
    await pool.query('UPDATE bookings SET status = ? WHERE booking_id = ?', [status, bookingId]);
    
    res.redirect('/admin/bookings');
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).render('error', { 
      title: 'Error', 
      message: 'Failed to update booking' 
    });
  }
});

// Category management
router.get('/categories', isAdmin, async (req, res) => {
  try {
    // Get categories with event counts
    const [categories] = await pool.query(`
      SELECT c.*, COUNT(ecm.event_id) as event_count
      FROM event_categories c
      LEFT JOIN event_category_mapping ecm ON c.category_id = ecm.category_id
      GROUP BY c.category_id
      ORDER BY c.name
    `);
    
    res.render('admin/categories', { 
      title: 'Category Management',
      categories
    });
  } catch (error) {
    console.error('Error loading categories:', error);
    res.status(500).render('error', { 
      title: 'Error', 
      message: 'Failed to load categories' 
    });
  }
});

// Create category
router.post('/categories/create', isAdmin, async (req, res) => {
  const { name } = req.body;
  
  try {
    await pool.query('INSERT INTO event_categories (name) VALUES (?)', [name]);
    
    res.redirect('/admin/categories');
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).render('error', { 
      title: 'Error', 
      message: 'Failed to create category' 
    });
  }
});

// Delete category
router.post('/categories/:id/delete', isAdmin, async (req, res) => {
  const categoryId = req.params.id;
  
  try {
    await pool.query('DELETE FROM event_categories WHERE category_id = ?', [categoryId]);
    
    res.redirect('/admin/categories');
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).render('error', { 
      title: 'Error', 
      message: 'Failed to delete category' 
    });
  }
});

module.exports = router;
