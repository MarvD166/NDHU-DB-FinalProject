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

// Book an event
router.post('/create', isAuthenticated, async (req, res) => {
  const { event_id, num_tickets } = req.body;
  const user_id = req.session.user.id;
  
  try {
    // Get event details
    const [events] = await pool.query(
      'SELECT * FROM events WHERE event_id = ?',
      [event_id]
    );
    
    if (events.length === 0) {
      return res.status(404).render('error', { 
        title: 'Error', 
        message: 'Event not found' 
      });
    }
    
    const event = events[0];
    
    // Check if event is available for booking
    if (event.status !== 'upcoming' && event.status !== 'ongoing') {
      return res.status(400).render('error', { 
        title: 'Error', 
        message: 'This event is not available for booking' 
      });
    }
    
    // Check available tickets
    const [bookingResult] = await pool.query(
      'SELECT SUM(num_tickets) as booked_tickets FROM bookings WHERE event_id = ? AND status = "confirmed"',
      [event_id]
    );
    
    const bookedTickets = bookingResult[0].booked_tickets || 0;
    const availableTickets = event.capacity - bookedTickets;
    
    if (num_tickets > availableTickets) {
      return res.status(400).render('error', { 
        title: 'Error', 
        message: `Only ${availableTickets} tickets available` 
      });
    }
    
    // Calculate total price
    const totalPrice = event.price * num_tickets;
    
    // Create booking
    await pool.query(
      'INSERT INTO bookings (user_id, event_id, num_tickets, total_price) VALUES (?, ?, ?, ?)',
      [user_id, event_id, num_tickets, totalPrice]
    );
    
    res.redirect(`/events/${event_id}`);
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).render('error', { 
      title: 'Error', 
      message: 'Failed to create booking' 
    });
  }
});

// View user's bookings
router.get('/my-bookings', isAuthenticated, async (req, res) => {
  try {
    const [bookings] = await pool.query(`
      SELECT b.*, e.title, e.event_date, e.location
      FROM bookings b
      JOIN events e ON b.event_id = e.event_id
      WHERE b.user_id = ?
      ORDER BY b.booking_date DESC
    `, [req.session.user.id]);
    
    res.render('bookings/index', { 
      title: 'My Bookings', 
      bookings 
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).render('error', { 
      title: 'Error', 
      message: 'Failed to load bookings' 
    });
  }
});

// Cancel booking
router.post('/:id/cancel', isAuthenticated, async (req, res) => {
  const bookingId = req.params.id;
  
  try {
    // Check if booking exists and belongs to user
    const [bookings] = await pool.query(
      'SELECT * FROM bookings WHERE booking_id = ?',
      [bookingId]
    );
    
    if (bookings.length === 0) {
      return res.status(404).render('error', { 
        title: 'Error', 
        message: 'Booking not found' 
      });
    }
    
    const booking = bookings[0];
    
    if (booking.user_id !== req.session.user.id && !req.session.user.isAdmin) {
      return res.status(403).render('error', { 
        title: 'Error', 
        message: 'You do not have permission to cancel this booking' 
      });
    }
    
    // Update booking status
    await pool.query(
      'UPDATE bookings SET status = "canceled" WHERE booking_id = ?',
      [bookingId]
    );
    
    res.redirect('/bookings/my-bookings');
  } catch (error) {
    console.error('Error canceling booking:', error);
    res.status(500).render('error', { 
      title: 'Error', 
      message: 'Failed to cancel booking' 
    });
  }
});

module.exports = router;
