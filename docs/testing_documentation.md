# Event Management System - Testing Documentation

## Test Plan

This document outlines the testing approach for the Event Management System to ensure all required functionality works as expected.

## Test Environment

- Database: MySQL 8.0
- Backend: Node.js with Express.js
- Frontend: HTML, CSS, JavaScript with EJS templates
- Browser: Latest version of Chrome/Firefox

## Test Cases

### 1. User Authentication

#### 1.1 User Registration
- **Test ID**: AUTH-REG-01
- **Description**: Verify that a new user can register with valid information
- **Steps**:
  1. Navigate to registration page
  2. Enter valid username, email, first name, last name, and password
  3. Submit the form
- **Expected Result**: User account is created and user is redirected to homepage with login session

#### 1.2 User Login
- **Test ID**: AUTH-LOGIN-01
- **Description**: Verify that a registered user can login with correct credentials
- **Steps**:
  1. Navigate to login page
  2. Enter valid username and password
  3. Submit the form
- **Expected Result**: User is logged in and redirected to homepage

#### 1.3 User Logout
- **Test ID**: AUTH-LOGOUT-01
- **Description**: Verify that a logged-in user can logout
- **Steps**:
  1. Login as a registered user
  2. Click on logout option
- **Expected Result**: User session is terminated and user is redirected to homepage

### 2. Event Management

#### 2.1 Create Event
- **Test ID**: EVENT-CREATE-01
- **Description**: Verify that a logged-in user can create a new event
- **Steps**:
  1. Login as a registered user
  2. Navigate to create event page
  3. Fill in all required event details
  4. Submit the form
- **Expected Result**: New event is created and user is redirected to event details page

#### 2.2 View Event
- **Test ID**: EVENT-VIEW-01
- **Description**: Verify that users can view event details
- **Steps**:
  1. Navigate to events page
  2. Click on an event
- **Expected Result**: Event details page is displayed with all information

#### 2.3 Edit Event
- **Test ID**: EVENT-EDIT-01
- **Description**: Verify that event organizer can edit their event
- **Steps**:
  1. Login as event organizer
  2. Navigate to event details page
  3. Click edit button
  4. Modify event details
  5. Submit the form
- **Expected Result**: Event details are updated and changes are reflected on event page

#### 2.4 Delete Event
- **Test ID**: EVENT-DELETE-01
- **Description**: Verify that event organizer can delete their event
- **Steps**:
  1. Login as event organizer
  2. Navigate to event details page
  3. Click delete button
  4. Confirm deletion
- **Expected Result**: Event is removed from the system

### 3. Booking Management

#### 3.1 Book Event
- **Test ID**: BOOK-CREATE-01
- **Description**: Verify that a logged-in user can book tickets for an event
- **Steps**:
  1. Login as a registered user
  2. Navigate to event details page
  3. Select number of tickets
  4. Click book now button
- **Expected Result**: Booking is created and confirmation is shown

#### 3.2 View Bookings
- **Test ID**: BOOK-VIEW-01
- **Description**: Verify that a user can view their bookings
- **Steps**:
  1. Login as a registered user
  2. Navigate to my bookings page
- **Expected Result**: List of user's bookings is displayed

#### 3.3 Cancel Booking
- **Test ID**: BOOK-CANCEL-01
- **Description**: Verify that a user can cancel their booking
- **Steps**:
  1. Login as a registered user
  2. Navigate to my bookings page
  3. Click cancel button for a booking
  4. Confirm cancellation
- **Expected Result**: Booking status is updated to canceled

### 4. Search Functionality

#### 4.1 Basic Search
- **Test ID**: SEARCH-BASIC-01
- **Description**: Verify that users can search for events by keywords
- **Steps**:
  1. Navigate to events page
  2. Enter search term in search box
  3. Submit search
- **Expected Result**: Events matching search criteria are displayed

#### 4.2 Category Search
- **Test ID**: SEARCH-CAT-01
- **Description**: Verify that users can filter events by category
- **Steps**:
  1. Navigate to search page
  2. Select a category
  3. Submit search
- **Expected Result**: Events in the selected category are displayed

### 5. Admin Functionality

#### 5.1 Admin Dashboard
- **Test ID**: ADMIN-DASH-01
- **Description**: Verify that admin users can access the admin dashboard
- **Steps**:
  1. Login as admin user
  2. Navigate to admin dashboard
- **Expected Result**: Admin dashboard is displayed with system statistics

#### 5.2 User Management
- **Test ID**: ADMIN-USER-01
- **Description**: Verify that admin can manage users
- **Steps**:
  1. Login as admin user
  2. Navigate to user management page
  3. Toggle admin status for a user
- **Expected Result**: User's admin status is updated

#### 5.3 Event Management
- **Test ID**: ADMIN-EVENT-01
- **Description**: Verify that admin can manage all events
- **Steps**:
  1. Login as admin user
  2. Navigate to event management page
  3. Change status of an event
- **Expected Result**: Event status is updated

#### 5.4 Category Management
- **Test ID**: ADMIN-CAT-01
- **Description**: Verify that admin can manage event categories
- **Steps**:
  1. Login as admin user
  2. Navigate to category management page
  3. Add a new category
- **Expected Result**: New category is created and available for events

## Test Results

### User Authentication
- Registration: ✅ PASS
- Login: ✅ PASS
- Logout: ✅ PASS

### Event Management
- Create Event: ✅ PASS
- View Event: ✅ PASS
- Edit Event: ✅ PASS
- Delete Event: ✅ PASS

### Booking Management
- Book Event: ✅ PASS
- View Bookings: ✅ PASS
- Cancel Booking: ✅ PASS

### Search Functionality
- Basic Search: ✅ PASS
- Category Search: ✅ PASS

### Admin Functionality
- Admin Dashboard: ✅ PASS
- User Management: ✅ PASS
- Event Management: ✅ PASS
- Category Management: ✅ PASS

## Issues and Resolutions

1. **Issue**: MySQL service initially failed to start due to port conflict
   - **Resolution**: Identified and terminated conflicting process, allowing MySQL service to start properly

2. **Issue**: Database connection required proper configuration
   - **Resolution**: Updated connection parameters to match the running MySQL instance

## Conclusion

All required functionality has been implemented and tested successfully. The Event Management System meets all the specified requirements, including user registration and login, database operations (create, read, update, delete), search functionality, and admin interface.
