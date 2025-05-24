# NDHU-DB-FinalProject – Event Management System

A containerized full-stack web application for managing events, user registrations, bookings, and reviews. Built as a final project to demonstrate database modeling, web development, and deployment using modern technologies and Docker.

---

## 📦 Features

- User registration, login, and session handling
- Event creation, browsing, editing, and deletion
- Ticket booking with confirmation and cancellation
- Event search and filtering by category
- Event reviews and ratings
- Admin dashboard to manage users, events, bookings, and categories

---

## 🛠 Tech Stack

- **Backend**: Node.js, Express.js
- **Frontend**: HTML, CSS, JavaScript, Bootstrap, EJS
- **Database**: MySQL 8.0 (Dockerized)
- **Authentication**: bcrypt, express-session
- **Containerization**: Docker, Docker Compose
- **Architecture**: MVC pattern

---

## 🧱 Database Design

- Normalized to 3NF
- **Tables**: USERS, EVENTS, BOOKINGS, REVIEWS, EVENT_CATEGORIES, EVENT_CATEGORY_MAPPING
- **Relationships**:
  - Users ↔ Events: 1:N (organizer)
  - Users ↔ Bookings: 1:N
  - Users ↔ Reviews: 1:N
  - Events ↔ Categories: M:N via EVENT_CATEGORY_MAPPING
  - Events ↔ Bookings, Reviews: 1:N

📎 Refer to the ER Diagram and `init.sql` for schema structure.

---

## 🚀 Getting Started (with Docker)

### 📋 Requirements

- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Git](https://git-scm.com/)

### 🔧 Setup Instructions

1. **Clone the repository**

```bash
git clone https://github.com/MarvD166/NDHU-DB-FinalProject.git
cd NDHU-DB-FinalProject
```

2. **Rename the .env.example file to .env** 
```bash
cp .env.example .env
```

3. **Start the app using Docker Compose**
```bash
docker-compose up --build
````
📌 On first run, the MySQL database will be initialized using init.sql, and test users + sample events will be added automatically.

4. **Access the application**
- Frontend: http://localhost:3000
- Admin login:
Username: admin
Password: admin123
User login:
Username: user
Password: user123
