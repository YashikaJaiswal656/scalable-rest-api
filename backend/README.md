# Scalable REST API - Backend

A production-ready REST API built with Express.js, MySQL, JWT authentication, and role-based access control (RBAC).

## 🚀 Features

- ✅ **User Authentication** - Register, Login, Token Refresh
- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **Role-Based Access Control** - User and Admin roles
- ✅ **CRUD Operations** - Complete task management
- ✅ **Input Validation** - Request validation with express-validator
- ✅ **Error Handling** - Centralized error handling
- ✅ **API Versioning** - Support for multiple API versions
- ✅ **Rate Limiting** - Protection against brute force attacks
- ✅ **API Documentation** - Interactive Swagger/OpenAPI docs
- ✅ **Security** - Helmet, CORS, bcrypt password hashing
- ✅ **Database** - MySQL with connection pooling
- ✅ **Logging** - Morgan HTTP request logger

## 📋 Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd scalable-rest-api/backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` file with your configuration:

```env
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=scalable_api_db
DB_USER=root
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_REFRESH_EXPIRE=30d

# Security
BCRYPT_ROUNDS=10

# CORS
CORS_ORIGIN=http://localhost:3000
```

### 4. Create MySQL database

```bash
mysql -u root -p
CREATE DATABASE scalable_api_db;
exit;
```

### 5. Run database migrations

```bash
npm run migrate
```

### 6. Seed the database (optional)

```bash
npm run seed
```

This creates:
- **Admin User**: admin@example.com / admin123
- **Regular User**: john@example.com / user123
- Sample tasks

### 7. Start the server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

Server will start on `http://localhost:5000`

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:5000/api-docs
- **API Base**: http://localhost:5000/api/v1

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### Register a new user

```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "Password123",
  "role": "user"
}
```

### Login

```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "role": "user"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Using the token

Include the access token in the Authorization header:

```bash
Authorization: Bearer <your_access_token>
```

## 📍 API Endpoints

### Authentication (`/api/v1/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/register` | Register new user | Public |
| POST | `/login` | Login user | Public |
| POST | `/refresh` | Refresh access token | Public |
| GET | `/me` | Get current user | Private |
| PUT | `/me` | Update profile | Private |

### Tasks (`/api/v1/tasks`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | Get all tasks | Private |
| POST | `/` | Create new task | Private |
| GET | `/stats` | Get task statistics | Private |
| GET | `/:id` | Get single task | Private |
| PUT | `/:id` | Update task | Private |
| DELETE | `/:id` | Delete task | Private |

### Users (`/api/v1/users`) - Admin Only

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | Get all users | Admin |
| GET | `/:id` | Get single user | Admin |
| PUT | `/:id` | Update user | Admin |
| DELETE | `/:id` | Delete user | Admin |

## 📊 Database Schema

### Users Table

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Tasks Table

```sql
CREATE TABLE tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  due_date TIMESTAMP NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js       # Database connection
│   │   └── swagger.js        # API documentation config
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── taskController.js
│   │   └── userController.js
│   ├── database/
│   │   ├── migrate.js        # Database migrations
│   │   └── seed.js           # Database seeding
│   ├── middleware/
│   │   ├── auth.js           # JWT & RBAC middleware
│   │   ├── errorHandler.js   # Error handling
│   │   └── validate.js       # Input validation
│   ├── models/
│   │   ├── User.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── taskRoutes.js
│   │   └── userRoutes.js
│   ├── utils/
│   │   └── jwt.js            # JWT utilities
│   ├── validators/
│   │   ├── authValidator.js
│   │   └── taskValidator.js
│   └── server.js             # Entry point
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## 🔒 Security Features

1. **Password Hashing** - bcrypt with configurable rounds
2. **JWT Authentication** - Secure token-based auth
3. **Rate Limiting** - Prevent brute force attacks
4. **Helmet** - Security headers
5. **CORS** - Cross-origin resource sharing
6. **Input Validation** - Sanitize and validate all inputs
7. **SQL Injection Prevention** - Parameterized queries
8. **Role-Based Access** - Granular permissions

## 🚀 Scalability Considerations

### 1. **Horizontal Scaling**
- Stateless architecture (JWT)
- Connection pooling
- Load balancer ready

### 2. **Caching** (Optional Enhancement)
```javascript
// Redis integration for caching
const redis = require('redis');
const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});
```

### 3. **Microservices Architecture**
Current modular structure allows easy migration:
- Auth Service
- Task Service
- User Service
- Notification Service

### 4. **Database Optimization**
- Indexed columns (email, username, user_id, status)
- Connection pooling
- Query optimization

### 5. **API Gateway**
Ready for integration with:
- Kong
- AWS API Gateway
- NGINX

### 6. **Monitoring & Logging**
- Morgan for HTTP logging
- Winston for application logging
- Ready for ELK stack integration

### 7. **Docker Deployment**
```dockerfile
FROM node:14-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🧪 Testing

```bash
# Run tests (implement with Jest/Mocha)
npm test

# Test coverage
npm run test:coverage
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment | development |
| PORT | Server port | 5000 |
| DB_HOST | Database host | localhost |
| DB_PORT | Database port | 3306 |
| DB_NAME | Database name | scalable_api_db |
| JWT_SECRET | JWT secret key | - |
| JWT_EXPIRE | Token expiry | 7d |
| CORS_ORIGIN | CORS origin | http://localhost:3000 |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

MIT License

## 👤 Author

Your Name - your.email@example.com

## 🔗 Links

- [Frontend Repository](../frontend)
- [API Documentation](http://localhost:5000/api-docs)
- [Postman Collection](./docs/postman_collection.json)
