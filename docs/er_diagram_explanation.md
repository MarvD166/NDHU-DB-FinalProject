# Event Management System - ER Diagram Explanation

## Entities and Their Attributes

### USERS
- **user_id**: Primary key, unique identifier for each user
- **username**: Unique username for login
- **email**: User's email address for notifications and account recovery
- **password_hash**: Securely stored password (hashed)
- **first_name**: User's first name
- **last_name**: User's last name
- **created_at**: Timestamp when the user account was created
- **is_admin**: Boolean flag to identify administrator users

### EVENTS
- **event_id**: Primary key, unique identifier for each event
- **title**: Name/title of the event
- **description**: Detailed description of the event
- **event_date**: Date and time when the event will take place
- **location**: Physical or virtual location of the event
- **capacity**: Maximum number of attendees allowed
- **price**: Cost per ticket
- **organizer_id**: Foreign key referencing the user who created the event
- **created_at**: Timestamp when the event was created
- **updated_at**: Timestamp when the event was last updated
- **status**: Current status of the event (e.g., upcoming, canceled, completed)

### EVENT_CATEGORIES
- **category_id**: Primary key, unique identifier for each category
- **name**: Name of the category (e.g., Music, Sports, Technology)
- **description**: Description of the category

### EVENT_CATEGORY_MAPPING
- **mapping_id**: Primary key, unique identifier for each mapping
- **event_id**: Foreign key referencing the event
- **category_id**: Foreign key referencing the category
- This is a junction table to implement the many-to-many relationship between events and categories

### BOOKINGS
- **booking_id**: Primary key, unique identifier for each booking
- **user_id**: Foreign key referencing the user who made the booking
- **event_id**: Foreign key referencing the event being booked
- **num_tickets**: Number of tickets purchased
- **total_price**: Total cost of the booking
- **booking_date**: Timestamp when the booking was made
- **status**: Current status of the booking (e.g., confirmed, canceled)

### REVIEWS
- **review_id**: Primary key, unique identifier for each review
- **user_id**: Foreign key referencing the user who wrote the review
- **event_id**: Foreign key referencing the event being reviewed
- **rating**: Numerical rating (e.g., 1-5)
- **comment**: Text comment/review
- **created_at**: Timestamp when the review was created

## Relationships

1. **USERS to EVENTS**: One-to-many relationship where a user can organize multiple events (organizer_id in EVENTS references user_id in USERS)

2. **USERS to BOOKINGS**: One-to-many relationship where a user can make multiple bookings

3. **USERS to REVIEWS**: One-to-many relationship where a user can write multiple reviews

4. **EVENTS to BOOKINGS**: One-to-many relationship where an event can have multiple bookings

5. **EVENTS to REVIEWS**: One-to-many relationship where an event can receive multiple reviews

6. **EVENTS to EVENT_CATEGORY_MAPPING**: One-to-many relationship where an event can belong to multiple categories

7. **EVENT_CATEGORIES to EVENT_CATEGORY_MAPPING**: One-to-many relationship where a category can be associated with multiple events

This ER diagram provides a comprehensive structure for an event management system, covering user management, event creation and categorization, booking functionality, and a review system.
