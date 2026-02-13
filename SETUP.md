# 🚀 Quick Setup Guide

Follow these steps to get the application running in under 10 minutes!

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js (v14+) - Check: `node --version`
- ✅ MySQL (v5.7+) - Check: `mysql --version`
- ✅ npm - Check: `npm --version`

## Step-by-Step Setup

### 1. Backend Setup (5 minutes)

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your MySQL credentials
# nano .env  (or use your favorite editor)
# Update: DB_USER, DB_PASSWORD, JWT_SECRET

# Create MySQL database
mysql -u root -p
CREATE DATABASE scalable_api_db;
exit;

# Run database migrations
npm run migrate

# Seed database with demo data (optional but recommended)
npm run seed

# Start the backend server
npm run dev
```

Backend will be running at `http://localhost:5000`

**Test it:** Open `http://localhost:5000/api-docs` in your browser

### 2. Frontend Setup (3 minutes)

```bash
# Open a NEW terminal window
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the frontend
npm start
```

Frontend will open automatically at `http://localhost:3000`

### 3. Login & Test (2 minutes)

**Demo Credentials:**

Regular User:
- Email: `john@example.com`
- Password: `user123`

Admin User:
- Email: `admin@example.com`
- Password: `admin123`

## Troubleshooting

### Port Already in Use

Backend (5000):
```bash
# Find and kill process
lsof -ti:5000 | xargs kill -9
```

Frontend (3000):
```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9
```

### Database Connection Error

1. Make sure MySQL is running:
   ```bash
   sudo service mysql start
   ```

2. Verify credentials in `.env` file

3. Check if database exists:
   ```bash
   mysql -u root -p
   SHOW DATABASES;
   ```

### Module Not Found

```bash
# In backend or frontend directory
rm -rf node_modules package-lock.json
npm install
```

### CORS Errors

1. Ensure backend is running on port 5000
2. Ensure frontend is running on port 3000
3. Check CORS_ORIGIN in backend `.env` file

## Verify Installation

### Backend Checklist
- [ ] Server starts without errors
- [ ] Can access http://localhost:5000
- [ ] Can access http://localhost:5000/api-docs
- [ ] Database tables are created

### Frontend Checklist
- [ ] App opens at http://localhost:3000
- [ ] Login page displays correctly
- [ ] Can login with demo credentials
- [ ] Dashboard loads with tasks

## Next Steps

1. **Explore the API:** Visit http://localhost:5000/api-docs
2. **Test with Postman:** Import `Postman_Collection.json`
3. **Read Documentation:** Check `README.md` files
4. **Learn Scalability:** Read `SCALABILITY.md`

## Quick Commands Reference

```bash
# Backend
npm run dev      # Start development server
npm run migrate  # Run database migrations
npm run seed     # Seed database
npm start        # Start production server

# Frontend
npm start        # Start development server
npm run build    # Build for production
npm test         # Run tests
```

## Getting Help

- Check the main README.md
- Check backend/README.md
- Check frontend/README.md
- Review SCALABILITY.md for architecture details

## Success! 🎉

If you can:
1. See the Swagger docs at http://localhost:5000/api-docs
2. Login to the frontend at http://localhost:3000
3. Create, edit, and delete tasks

Then you're all set! The application is running successfully.

---

Need more help? Check the detailed README files or open an issue on GitHub.
