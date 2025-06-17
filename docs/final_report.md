# Event Management System - Final Project Report

## 1. Introduction

This report documents the design and development process of an Event Management System, created as a term project for a Database course. The system is a local web-based application that allows users to register, create events, book tickets, search for events, and includes an administrative interface for database management.

## 2. Project Requirements

The project requirements specified:
- An online database application (local database as minimum)
- Use of an open-source DBMS as backend
- Browser-based user interface
- User registration and password login
- Functions to search the internal database
- Functions to perform create, insert, delete, and update operations
- A process corresponding to the commit of any update
- Exercise the entire process of database design (ER → Schema → DB → Application)
- Include a DBA interface

## 3. Design Process

### 3.1 Entity-Relationship (ER) Diagram

The first step in the design process was creating an Entity-Relationship diagram to model the database structure. The ER diagram includes the following entities:

- **USERS**: Stores user account information
- **EVENTS**: Contains details about events
- **EVENT_CATEGORIES**: Lists different categories for events
- **EVENT_CATEGORY_MAPPING**: Junction table for the many-to-many relationship between events and categories
- **BOOKINGS**: Records ticket bookings made by users
- **REVIEWS**: Stores user reviews for events

The relationships between these entities were carefully designed to ensure data integrity and efficient querying:

- One-to-many relationship between USERS and EVENTS (a user can organize multiple events)
- One-to-many relationship between USERS and BOOKINGS (a user can make multiple bookings)
- One-to-many relationship between USERS and REVIEWS (a user can write multiple reviews)
- One-to-many relationship between EVENTS and BOOKINGS (an event can have multiple bookings)
- One-to-many relationship between EVENTS and REVIEWS (an event can receive multiple reviews)
- Many-to-many relationship between EVENTS and EVENT_CATEGORIES (resolved using the EVENT_CATEGORY_MAPPING junction table)

### 3.2 Database Schema Design

After the ER diagram was designed, it was converted into a relational database schema. The schema design followed these principles:

- **Primary Keys**: Auto-incrementing integers for simplicity and performance
- **Foreign Keys**: Used to enforce referential integrity with CASCADE options for automatic cleanup
- **Data Types**: Appropriate types chosen for each field (VARCHAR, TEXT, DATETIME, DECIMAL, etc.)
- **Constraints**: NOT NULL, UNIQUE, and CHECK constraints to ensure data validity
- **Indexes**: Created on primary and foreign keys to improve query performance
- **Normalization**: Schema follows Third Normal Form (3NF) to minimize redundancy

### 3.3 Application Architecture

The application follows a Model-View-Controller (MVC) architecture:

- **Models**: Database tables and their relationships
- **Views**: EJS templates for rendering HTML
- **Controllers**: Express.js routes handling business logic

The technology stack includes:
- **Backend**: Node.js with Express.js
- **Database**: MySQL 8.0
- **Frontend**: HTML, CSS, JavaScript with Bootstrap for responsive design
- **Template Engine**: EJS for server-side rendering
- **Authentication**: Custom implementation using bcrypt for password hashing and express-session for session management

## 4. Implementation Process

### 4.1 Database Implementation

The database was implemented using MySQL 8.0. The implementation process included:
- Creating the database schema
- Setting up tables with appropriate constraints
- Establishing relationships between tables
- Adding indexes for performance optimization
- Inserting initial data for categories

### 4.2 Backend Development

The backend was developed using Node.js with Express.js. Key components include:

- **Authentication System**: User registration, login, and session management
- **Event Management**: CRUD operations for events
- **Booking System**: Creating and managing event bookings
- **Review System**: Adding and displaying event reviews
- **Search Functionality**: Searching events by keywords and filtering by categories
- **Admin Interface**: Managing users, events, bookings, and categories

### 4.3 Frontend Development

The frontend was developed using HTML, CSS, and JavaScript with Bootstrap for responsive design. EJS was used as the template engine for server-side rendering. Key features include:

- **Responsive Design**: Works on both desktop and mobile devices
- **Modern UI**: Clean, intuitive interface with consistent styling
- **Interactive Elements**: Dynamic content loading, form validation, and user feedback
- **Accessibility**: Semantic HTML and proper contrast for better accessibility

## 5. Testing

Comprehensive testing was performed to ensure all requirements were met:

- **User Authentication**: Registration, login, and logout functionality
- **Event Management**: Creating, viewing, editing, and deleting events
- **Booking Management**: Creating and canceling bookings
- **Search Functionality**: Basic search and category filtering
- **Admin Functionality**: User, event, booking, and category management

All tests passed successfully, with minor issues resolved during the testing phase.

## 6. Challenges and Solutions

### 6.1 MySQL Configuration

**Challenge**: Initial setup of MySQL encountered port conflicts with an existing MySQL process.
**Solution**: Identified the conflicting process and terminated it, allowing the MySQL service to start properly.

### 6.2 Database Connection

**Challenge**: Configuring the correct database connection parameters.
**Solution**: Updated connection parameters to match the running MySQL instance and implemented a connection pool for better performance.

### 6.3 Transaction Management

**Challenge**: Ensuring data consistency during complex operations like event creation with categories.
**Solution**: Implemented database transactions to ensure atomicity of operations.

## 7. Conclusion

The Event Management System successfully meets all the project requirements. It provides a comprehensive solution for event management with user authentication, database operations, search functionality, and an admin interface.

The project demonstrates the entire process of database systems and applications design, from ER diagram to schema design to implementation and testing.

## 8. References

- Node.js Documentation: https://nodejs.org/en/docs/
- Express.js Documentation: https://expressjs.com/
- MySQL Documentation: https://dev.mysql.com/doc/
- Bootstrap Documentation: https://getbootstrap.com/docs/
- EJS Documentation: https://ejs.co/
