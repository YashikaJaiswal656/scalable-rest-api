# Scalable REST API - Frontend

A modern React.js frontend application for the Task Management system with authentication and real-time task management.

## 🚀 Features

- ✅ **User Authentication** - Login and Registration with JWT
- ✅ **Protected Routes** - Route guards based on authentication status
- ✅ **Task Management** - Full CRUD operations for tasks
- ✅ **Real-time Filtering** - Filter tasks by status and priority
- ✅ **Task Statistics** - Visual dashboard with task metrics
- ✅ **Responsive Design** - Mobile-friendly interface
- ✅ **Toast Notifications** - Real-time feedback for user actions
- ✅ **Token Refresh** - Automatic token refresh on expiry
- ✅ **Error Handling** - Comprehensive error handling and user feedback

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend API running on port 5000

## 🛠️ Installation

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Set up environment variables (optional)

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:5000/api/v1
```

### 3. Start the development server

```bash
npm start
```

The app will open at `http://localhost:3000`

## 📦 Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

## 🎯 Usage

### Login

Use the demo credentials:
- **Regular User**: john@example.com / user123
- **Admin**: admin@example.com / admin123

### Register

Create a new account with:
- Username (3+ characters)
- Email address
- Password (6+ characters with uppercase, lowercase, and number)

### Dashboard Features

1. **View Statistics** - See total, pending, in-progress, and completed tasks
2. **Create Task** - Click "New Task" to create a task
3. **Filter Tasks** - Use dropdown filters for status and priority
4. **Edit Task** - Click the edit button on any task
5. **Delete Task** - Click the delete button (with confirmation)
6. **Task Details** - View title, description, status, priority, and due date

## 🏗️ Project Structure

```
frontend/
├── public/
│   └── index.html              # HTML template
├── src/
│   ├── components/
│   │   ├── ProtectedRoute.js   # Route authentication guard
│   │   ├── TaskForm.js         # Task create/edit modal
│   │   ├── TaskForm.css
│   │   ├── TaskList.js         # Task list display
│   │   └── TaskList.css
│   ├── context/
│   │   └── AuthContext.js      # Global authentication state
│   ├── pages/
│   │   ├── Login.js            # Login page
│   │   ├── Register.js         # Registration page
│   │   ├── Dashboard.js        # Main dashboard
│   │   ├── Auth.css            # Auth pages styling
│   │   └── Dashboard.css       # Dashboard styling
│   ├── services/
│   │   └── api.js              # Axios API client
│   ├── App.js                  # Main app component
│   ├── App.css
│   ├── index.js                # Entry point
│   └── index.css               # Global styles
├── package.json
└── README.md
```

## 🔑 Key Components

### AuthContext

Manages global authentication state:
- User information
- Authentication status
- Login/Logout functionality
- Token management

```javascript
const { user, isAuthenticated, login, logout } = useAuth();
```

### API Service

Centralized API client with:
- Axios interceptors
- Automatic token attachment
- Token refresh handling
- Error handling

```javascript
import { authAPI, taskAPI } from './services/api';
```

### Protected Routes

Restricts access to authenticated users:

```javascript
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```

## 🎨 Styling

The app uses custom CSS with:
- CSS Grid and Flexbox for layouts
- CSS Variables for theming
- Smooth animations and transitions
- Responsive breakpoints
- Mobile-first approach

Color Scheme:
- Primary: `#667eea` (Purple)
- Secondary: `#764ba2` (Dark Purple)
- Success: `#10b981` (Green)
- Warning: `#f59e0b` (Orange)
- Error: `#ef4444` (Red)

## 📱 Responsive Design

Breakpoints:
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## 🔒 Security Features

1. **JWT Token Storage** - Secure localStorage implementation
2. **Automatic Token Refresh** - Seamless token renewal
3. **Protected Routes** - Authentication guards
4. **Input Validation** - Client-side validation
5. **XSS Protection** - React's built-in sanitization
6. **Secure API Calls** - HTTPS-ready configuration

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Generate coverage report
npm test -- --coverage
```

## 🚀 Deployment

### Deploy to Netlify

1. Build the project:
```bash
npm run build
```

2. Deploy the `build/` folder to Netlify

3. Set environment variables in Netlify dashboard:
```
REACT_APP_API_URL=https://your-api-domain.com/api/v1
```

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

### Deploy to GitHub Pages

```bash
npm install --save-dev gh-pages
```

Add to `package.json`:
```json
{
  "homepage": "https://yourusername.github.io/your-repo-name",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
```

Deploy:
```bash
npm run deploy
```

## 📊 Performance Optimization

- Code splitting with React.lazy
- Image optimization
- Minified production builds
- Tree shaking for unused code
- Caching strategies

## 🐛 Troubleshooting

### CORS Errors

If you encounter CORS errors, ensure:
1. Backend is running on port 5000
2. Backend CORS is configured for `http://localhost:3000`
3. Use the proxy setting in `package.json` (already configured)

### Token Expiration

Tokens are automatically refreshed. If issues persist:
1. Clear localStorage
2. Re-login to get new tokens

### API Connection Issues

Check:
1. Backend server is running
2. Database is connected
3. Environment variables are correct

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| REACT_APP_API_URL | Backend API URL | http://localhost:5000/api/v1 |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License

## 🔗 Links

- [Backend Repository](../backend)
- [API Documentation](http://localhost:5000/api-docs)
- [Live Demo](#) (Add your deployed URL)

## 👤 Author

Your Name - your.email@example.com

## 🙏 Acknowledgments

- React.js team
- React Router team
- Axios team
- React Hot Toast team
