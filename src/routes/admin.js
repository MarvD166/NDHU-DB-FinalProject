const express = require('express');
const { pool } = require('../config/db');

const router = express.Router();

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.isAdmin) {
    return next();
  }
  res.status(403).render('error', { 
    title: 'Access Denied', 
    message: 'You do not have permission to access this area' 
  });
};

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


// Manage users
router.get('/users', isAdmin, async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT u.*, 
      (SELECT COUNT(*) FROM events WHERE organizer_id = u.user_id) as event_count,
      (SELECT COUNT(*) FROM bookings WHERE user_id = u.user_id) as booking_count
      FROM users u
      ORDER BY u.created_at DESC
    `);
    
    res.render('admin/users', { 
      title: 'Manage Users',
      users
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
    // Get current status
    const [users] = await pool.query(
      'SELECT is_admin FROM users WHERE user_id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).render('error', { 
        title: 'Error', 
        message: 'User not found' 
      });
    }
    
    const currentStatus = users[0].is_admin;
    
    // Toggle status
    await pool.query(
      'UPDATE users SET is_admin = ? WHERE user_id = ?',
      [currentStatus ? 0 : 1, userId]
    );
    
    res.redirect('/admin/users');
  } catch (error) {
    console.error('Error toggling admin status:', error);
    res.status(500).render('error', { 
      title: 'Error', 
      message: 'Failed to update user' 
    });
  }
});

// Manage events
router.get('/events', isAdmin, async (req, res) => {
  try {
    const [events] = await pool.query(`
      SELECT e.*, u.username as organizer_name,
      (SELECT COUNT(*) FROM bookings WHERE event_id = e.event_id) as booking_count
      FROM events e
      JOIN users u ON e.organizer_id = u.user_id
      ORDER BY e.created_at DESC
    `);
    
    res.render('admin/events', { 
      title: 'Manage Events',
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
router.post('/events/:id/status', isAdmin, async (req, res) => {
  const eventId = req.params.id;
  const { status } = req.body;
  
  try {
    await pool.query(
      'UPDATE events SET status = ? WHERE event_id = ?',
      [status, eventId]
    );
    
    res.redirect('/admin/events');
  } catch (error) {
    console.error('Error updating event status:', error);
    res.status(500).render('error', { 
      title: 'Error', 
      message: 'Failed to update event' 
    });
  }
});

// Manage bookings
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
      title: 'Manage Bookings',
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
router.post('/bookings/:id/status', isAdmin, async (req, res) => {
  const bookingId = req.params.id;
  const { status } = req.body;
  
  try {
    await pool.query(
      'UPDATE bookings SET status = ? WHERE booking_id = ?',
      [status, bookingId]
    );
    
    res.redirect('/admin/bookings');
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).render('error', { 
      title: 'Error', 
      message: 'Failed to update booking' 
    });
  }
});

// Manage categories
router.get('/categories', isAdmin, async (req, res) => {
  try {
    const [categories] = await pool.query(`
      SELECT c.*, 
      (SELECT COUNT(*) FROM event_category_mapping WHERE category_id = c.category_id) as event_count
      FROM event_categories c
      ORDER BY c.name
    `);
    
    res.render('admin/categories', { 
      title: 'Manage Categories',
      categories,
      error: null
    });
  } catch (error) {
    console.error('Error loading categories:', error);
    res.status(500).render('error', { 
      title: 'Error', 
      message: 'Failed to load categories' 
    });
  }
});

// Add category
router.post('/categories', isAdmin, async (req, res) => {
  const { name, description } = req.body;
  
  try {
    await pool.query(
      'INSERT INTO event_categories (name, description) VALUES (?, ?)',
      [name, description]
    );
    
    res.redirect('/admin/categories');
  } catch (error) {
    console.error('Error adding category:', error);
    
    try {
      const [categories] = await pool.query(`
        SELECT c.*, 
        (SELECT COUNT(*) FROM event_category_mapping WHERE category_id = c.category_id) as event_count
        FROM event_categories c
        ORDER BY c.name
      `);
      
      res.render('admin/categories', { 
        title: 'Manage Categories',
        categories,
        error: 'Failed to add category'
      });
    } catch (renderError) {
      res.status(500).render('error', { 
        title: 'Error', 
        message: 'Failed to add category' 
      });
    }
  }
});

// Edit category
router.post('/categories/:id', isAdmin, async (req, res) => {
  const categoryId = req.params.id;
  const { name, description } = req.body;
  
  try {
    await pool.query(
      'UPDATE event_categories SET name = ?, description = ? WHERE category_id = ?',
      [name, description, categoryId]
    );
    
    res.redirect('/admin/categories');
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).render('error', { 
      title: 'Error', 
      message: 'Failed to update category' 
    });
  }
});

// Delete category
router.post('/categories/:id/delete', isAdmin, async (req, res) => {
  const categoryId = req.params.id;
  
  try {
    await pool.query(
      'DELETE FROM event_categories WHERE category_id = ?',
      [categoryId]
    );
    
    res.redirect('/admin/categories');
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).render('error', { 
      title: 'Error', 
      message: 'Failed to delete category. It may be in use by events.' 
    });
  }
});

// Database management
router.get('/database', isAdmin, async (req, res) => {
  try {
    // Get table statistics
    const [tables] = await pool.query(`
      SELECT 
        table_name, 
        table_rows,
        data_length,
        index_length,
        create_time,
        update_time
      FROM 
        information_schema.tables
      WHERE 
        table_schema = 'event_management_system'
      ORDER BY 
        table_name
    `);
    
    res.render('admin/database', { 
      title: 'Database Management',
      tables,
      message: null
    });
  } catch (error) {
    console.error('Error loading database info:', error);
    res.status(500).render('error', { 
      title: 'Error', 
      message: 'Failed to load database information' 
    });
  }
});

module.exports = router;
