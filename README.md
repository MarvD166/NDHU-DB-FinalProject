# NDHU-DB-FinalProject

A local web-based application for managing events, user registrations, bookings, and reviews. Designed as a complete solution covering the full database application lifecycle—from ER modeling to deployment.

## Features
	•	User registration, login, and session handling
	•	Event creation, browsing, editing, and deletion
	•	Ticket booking with confirmation and cancellation
	•	Search and filter events by category
	•	Event reviews and ratings
	•	Admin dashboard for managing users, events, bookings, and categories

## Tech Stack
	•	Backend: Node.js, Express.js
	•	Frontend: HTML, CSS, JavaScript, Bootstrap, EJS
	•	Database: MySQL 8.0
	•	Authentication: bcrypt, express-session
	•	Architecture: MVC pattern

## Database Design
	•	Normalized to 3NF
	•	ER Diagram: Includes USERS, EVENTS, BOOKINGS, REVIEWS, EVENT_CATEGORIES, EVENT_CATEGORY_MAPPING
	•	Relationships:
	•	Users ↔ Events: 1:N (organizer)
	•	Users ↔ Bookings: 1:N
	•	Users ↔ Reviews: 1:N
	•	Events ↔ Categories: M:N via EVENT_CATEGORY_MAPPING
	•	Events ↔ Bookings, Reviews: 1:N

### Refer to the ER Diagram and Database Schema for technical details.

## Usage
#### See the User Guide for detailed usage instructions:
	•	Register/Login
	•	Create & manage events
	•	Book/cancel tickets
	•	Write and read reviews
	•	Use admin functions if authorized

## Testing

#### Comprehensive tests for:
	•	Authentication
	•	CRUD operations
	•	Search & filters
	•	Admin controls

### See Testing Documentation for cases and results.

## Development Process

#### Includes:
	•	ER modeling
	•	Relational schema design
	•	Full-stack development
	•	Testing and validation

### Details in Final Report.