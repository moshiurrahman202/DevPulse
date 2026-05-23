# Internal Tech Issue & Feature Tracker API
# This is a Assignment for Programming Hero

A backend API for reporting bugs and feature requests inside a software team.

## Features

* User Registration & Login
* JWT Authentication
* Role Based Authorization
* Create Issues
* Get All Issues
* Get Single Issue
* Update Issues
* Delete Issues
* PostgreSQL Database
* Raw SQL Queries
* Modular Architecture

---

# Tech Stack

* Node.js
* Express.js
* TypeScript
* PostgreSQL
* bcrypt
* jsonwebtoken

---

# Project Setup

## Clone Repository

```bash
git clone <repository-link>
```

## Install Dependencies

```bash
npm install
```

## Create .env File

```env
PORT=5000
DATABASE_URL=your_database_url
JWT_SECRET=your_secret_key
```

---

# Run Project

## Development

```bash
npm run dev
```

## Production Build

```bash
npm run build
npm start
```

---

# API Endpoints

## Auth Routes

### Register User

```http
POST /api/auth/signup
```

### Login User

```http
POST /api/auth/login
```

---

## Issue Routes

### Create Issue

```http
POST /api/issues
```

### Get All Issues

```http
GET /api/issues
```

### Get Single Issue

```http
GET /api/issues/:id
```

### Update Issue

```http
PATCH /api/issues/:id
```

### Delete Issue

```http
DELETE /api/issues/:id
```

---

# User Roles

## Contributor

* Create issue
* View issues
* Update own open issues

## Maintainer

* All contributor permissions
* Update any issue
* Delete issue
* Change issue status

---

# Database Tables

## users

* id
* name
* email
* password
* role
* created_at
* updated_at

## issues

* id
* title
* description
* type
* status
* reporter_id
* created_at
* updated_at

---

# Important Notes

* Passwords are hashed using bcrypt
* JWT is used for authentication
* Raw SQL queries are used
* No ORM or SQL JOIN is used
* Modular architecture is followed

---

# Author

Mosiur Rahman
