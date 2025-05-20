const express = require('express');
const { pool } = require('../config/db');

const router = express.Router();

// Middleware to check if user is logged in
const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  res.redirect('/auth/login');
};

// List all events
router.get('/', async (req, res) => {
  try {
    const [events] = await pool.query(`
      SELECT e.*, u.username as organizer_name, 
      (SELECT COUNT(*) FROM bookings WHERE event_id = e.event_id) as booked_tickets
      FROM events e
      JOIN users u ON e.organizer_id = u.user_id
      WHERE e.status != 'canceled'
      ORDER BY e.event_date ASC
    `);
    
    res.render('events/index', { 
      title: 'All Events', 
      events,
      currentUser: req.session.user || null
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).render('error', { 
      title: 'Error', 
      message: 'Failed to load events' 
    });
  }
});

// Search events
router.get('/search', async (req, res) => {
  const { query, category } = req.query;
  
  try {
    let sql = `
      SELECT e.*, u.username as organizer_name
      FROM events e
      JOIN users u ON e.organizer_id = u.user_id
    `;
    
    const params = [];
    
    if (query || category) {
      sql += ' WHERE ';
      const conditions = [];
      
      if (query) {
        conditions.push('(e.title LIKE ? OR e.description LIKE ? OR e.location LIKE ?)');
        const searchTerm = `%${query}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }
      
      if (category) {
        conditions.push(`
          e.event_id IN (
            SELECT event_id FROM event_category_mapping 
            WHERE category_id = ?
          )
        `);
        params.push(category);
      }
      
      sql += conditions.join(' AND ');
    }
    
    sql += ' ORDER BY e.event_date ASC';
    
    const [events] = await pool.query(sql, params);
    const [categories] = await pool.query('SELECT * FROM event_categories');
    
    res.render('events/search', { 
      title: 'Search Events', 
      events, 
      categories,
      searchQuery: query || '',
      selectedCategory: category || '',
      currentUser: req.session.user || null
    });
  } catch (error) {
    console.error('Error searching events:', error);
    res.status(500).render('error', { 
      title: 'Error', 
      message: 'Failed to search events' 
    });
  }
});

// Show event details
router.get('/:id', async (req, res) => {
  const eventId = req.params.id;
  
  try {
    // Get event details
    const [events] = await pool.query(`
      SELECT e.*, u.username as organizer_name
      FROM events e
      JOIN users u ON e.organizer_id = u.user_id
      WHERE e.event_id = ?
    `, [eventId]);
    
    if (events.length === 0) {
      return res.status(404).render('error', { 
        title: 'Not Found', 
        message: 'Event not found' 
      });
    }
    
    const event = events[0];
    
    // Get event categories
    const [categories] = await pool.query(`
      SELECT c.* 
      FROM event_categories c
      JOIN event_category_mapping m ON c.category_id = m.category_id
      WHERE m.event_id = ?
    `, [eventId]);
    
    // Get event reviews
    const [reviews] = await pool.query(`
      SELECT r.*, u.username
      FROM reviews r
      JOIN users u ON r.user_id = u.user_id
      WHERE r.event_id = ?
      ORDER BY r.created_at DESC
    `, [eventId]);
    
    // Calculate average rating
    let avgRating = 0;
    if (reviews.length > 0) {
      avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    }
    
    // Check if user has booked this event
    let userBooking = null;
    if (req.session.user) {
      const [bookings] = await pool.query(`
        SELECT * FROM bookings
        WHERE user_id = ? AND event_id = ?
      `, [req.session.user.id, eventId]);
      
      if (bookings.length > 0) {
        userBooking = bookings[0];
      }
    }
    
    // Check available tickets
    const [bookingResult] = await pool.query(`
      SELECT SUM(num_tickets) as booked_tickets
      FROM bookings
      WHERE event_id = ? AND status = 'confirmed'
    `, [eventId]);
    
    const bookedTickets = bookingResult[0].booked_tickets || 0;
    const availableTickets = event.capacity - bookedTickets;

    
    res.render('events/show', { 
      title: event.title, 
      event,
      categories,
      reviews,
      avgRating,
      userBooking,
      availableTickets,
      currentUser: req.session.user || null
    });
  } catch (error) {
    console.error('Error fetching event details:', error);
    res.status(500).render('error', { 
      title: 'Error', 
      message: 'Failed to load event details' 
    });
  }
});

// Create event form
router.get('/new', isAuthenticated, async (req, res) => {
  try {
    const [categories] = await pool.query('SELECT * FROM event_categories');
    
    res.render('events/new', { 
      title: 'Create Event', 
      categories,
      error: null
    });
  } catch (error) {
    console.error('Error loading create event form:', error);
    res.status(500).render('error', { 
      title: 'Error', 
      message: 'Failed to load create event form' 
    });
  }
});

// Process event creation
router.post('/', isAuthenticated, async (req, res) => {
  const { 
    title, description, event_date, location, 
    capacity, price, categories 
  } = req.body;
  
  try {
    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Insert event
      const [eventResult] = await connection.query(`
        INSERT INTO events (
          title, description, event_date, location, 
          capacity, price, organizer_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        title, description, event_date, location, 
        capacity, price, req.session.user.id
      ]);
      
      const eventId = eventResult.insertId;
      
      // Insert category mappings
      if (categories && categories.length > 0) {
        const categoryIds = Array.isArray(categories) ? categories : [categories];
        
        for (const categoryId of categoryIds) {
          await connection.query(`
            INSERT INTO event_category_mapping (event_id, category_id)
            VALUES (?, ?)
          `, [eventId, categoryId]);
        }
      }
      
      await connection.commit();
      connection.release();
      
      res.redirect(`/events/${eventId}`);
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Error creating event:', error);
    
    try {
      const [categories] = await pool.query('SELECT * FROM event_categories');
      
      res.render('events/new', { 
        title: 'Create Event', 
        categories,
        error: 'Failed to create event',
        formData: req.body
      });
    } catch (renderError) {
      res.status(500).render('error', { 
        title: 'Error', 
        message: 'Failed to create event' 
      });
    }
  }
});

// Edit event form
router.get('/:id/edit', isAuthenticated, async (req, res) => {
  const eventId = req.params.id;
  
  try {
    // Get event details
    const [events] = await pool.query(`
      SELECT * FROM events WHERE event_id = ?
    `, [eventId]);
    
    if (events.length === 0) {
      return res.status(404).render('error', { 
        title: 'Not Found', 
        message: 'Event not found' 
      });
    }
    
    const event = events[0];
    
    // Check if user is the organizer
    if (event.organizer_id !== req.session.user.id && !req.session.user.isAdmin) {
      return res.status(403).render('error', { 
        title: 'Forbidden', 
        message: 'You do not have permission to edit this event' 
      });
    }
    
    // Get all categories
    const [categories] = await pool.query('SELECT * FROM event_categories');
    
    // Get event categories
    const [eventCategories] = await pool.query(`
      SELECT category_id FROM event_category_mapping
      WHERE event_id = ?
    `, [eventId]);
    
    const selectedCategoryIds = eventCategories.map(ec => ec.category_id);
    
    res.render('events/edit', { 
      title: 'Edit Event', 
      event,
      categories,
      selectedCategoryIds,
      error: null
    });
  } catch (error) {
    console.error('Error loading edit event form:', error);
    res.status(500).render('error', { 
      title: 'Error', 
      message: 'Failed to load edit event form' 
    });
  }
});

// Update event
router.post('/:id', isAuthenticated, async (req, res) => {
  const eventId = req.params.id;
  const { 
    title, description, event_date, location, 
    capacity, price, status, categories 
  } = req.body;
  
  try {
    // Check if event exists and user is authorized
    const [events] = await pool.query(`
      SELECT * FROM events WHERE event_id = ?
    `, [eventId]);
    
    if (events.length === 0) {
      return res.status(404).render('error', { 
        title: 'Not Found', 
        message: 'Event not found' 
      });
    }
    
    const event = events[0];
    
    // Check if user is the organizer or admin
    if (event.organizer_id !== req.session.user.id && !req.session.user.isAdmin) {
      return res.status(403).render('error', { 
        title: 'Forbidden', 
        message: 'You do not have permission to edit this event' 
      });
    }
    
    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Update event
      await connection.query(`
        UPDATE events SET
          title = ?,
          description = ?,
          event_date = ?,
          location = ?,
          capacity = ?,
          price = ?,
          status = ?
        WHERE event_id = ?
      `, [
        title, description, event_date, location, 
        capacity, price, status, eventId
      ]);
      
      // Delete existing category mappings
      await connection.query(`
        DELETE FROM event_category_mapping
        WHERE event_id = ?
      `, [eventId]);
      
      // Insert new category mappings
      if (categories && categories.length > 0) {
        const categoryIds = Array.isArray(categories) ? categories : [categories];
        
        for (const categoryId of categoryIds) {
          await connection.query(`
            INSERT INTO event_category_mapping (event_id, category_id)
            VALUES (?, ?)
          `, [eventId, categoryId]);
        }
      }
      
      await connection.commit();
      connection.release();
      
      res.redirect(`/events/${eventId}`);
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Error updating event:', error);
    
    try {
      const [categories] = await pool.query('SELECT * FROM event_categories');
      
      res.render('events/edit', { 
        title: 'Edit Event', 
        event: { ...req.body, event_id: eventId },
        categories,
        selectedCategoryIds: Array.isArray(categories) ? categories : [categories],
        error: 'Failed to update event'
      });
    } catch (renderError) {
      res.status(500).render('error', { 
        title: 'Error', 
        message: 'Failed to update event' 
      });
    }
  }
});

// Delete event
router.post('/:id/delete', isAuthenticated, async (req, res) => {
  const eventId = req.params.id;
  
  try {
    // Check if event exists and user is authorized
    const [events] = await pool.query(`
      SELECT * FROM events WHERE event_id = ?
    `, [eventId]);
    
    if (events.length === 0) {
      return res.status(404).render('error', { 
        title: 'Not Found', 
        message: 'Event not found' 
      });
    }
    
    const event = events[0];
    
    // Check if user is the organizer or admin
    if (event.organizer_id !== req.session.user.id && !req.session.user.isAdmin) {
      return res.status(403).render('error', { 
        title: 'Forbidden', 
        message: 'You do not have permission to delete this event' 
      });
    }
    
    // Delete event (will cascade to bookings, reviews, and category mappings)
    await pool.query(`
      DELETE FROM events WHERE event_id = ?
    `, [eventId]);
    
    res.redirect('/events');
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).render('error', { 
      title: 'Error', 
      message: 'Failed to delete event' 
    });
  }
});

// Add review
router.post('/:id/reviews', isAuthenticated, async (req, res) => {
  const eventId = req.params.id;
  const { rating, comment } = req.body;
  
  try {
    // Check if user has already reviewed this event
    const [existingReviews] = await pool.query(`
      SELECT * FROM reviews
      WHERE user_id = ? AND event_id = ?
    `, [req.session.user.id, eventId]);
    
    if (existingReviews.length > 0) {
      // Update existing review
      await pool.query(`
        UPDATE reviews
        SET rating = ?, comment = ?
        WHERE user_id = ? AND event_id = ?
      `, [rating, comment, req.session.user.id, eventId]);
    } else {
      // Insert new review
      await pool.query(`
        INSERT INTO reviews (user_id, event_id, rating, comment)
        VALUES (?, ?, ?, ?)
      `, [req.session.user.id, eventId, rating, comment]);
    }
    
    res.redirect(`/events/${eventId}`);
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).render('error', { 
      title: 'Error', 
      message: 'Failed to add review' 
    });
  }
});

module.exports = router;
