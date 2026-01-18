# Expense Tracker - Setup Instructions

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** - [Download here](https://www.mongodb.com/try/download/community) or use MongoDB Atlas
- **Git** - [Download here](https://git-scm.com/)
- **npm** or **yarn** package manager

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd expense-tracker
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### 3. Configure Environment Variables

Edit the `.env` file in the backend directory with your configuration:

```env
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb://localhost:27017/expense-tracker
JWT_ACCESS_SECRET=your-super-secret-access-key-here-make-it-long-and-random
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here-make-it-different
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 4. Database Setup

#### Option A: Local MongoDB
1. Install MongoDB Community Edition
2. Start MongoDB service:
   ```bash
   # On macOS with Homebrew
   brew services start mongodb-community
   
   # On Windows
   net start MongoDB
   
   # On Linux
   sudo systemctl start mongod
   ```

#### Option B: MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string and update `MONGODB_URI` in `.env`

### 5. Email Configuration (Optional)

For budget alerts and notifications:

1. **Gmail Setup:**
   - Enable 2-factor authentication
   - Generate an App Password
   - Use the App Password in `EMAIL_PASS`

2. **Other Email Providers:**
   - Update `EMAIL_HOST` and `EMAIL_PORT` accordingly
   - Use appropriate authentication credentials

### 6. Start Backend Server

```bash
# In backend directory
npm run dev
```

The backend server will start on `http://localhost:4000`

### 7. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will start on `http://localhost:5173`

## Verification

### 1. Check Backend Health
Visit `http://localhost:4000/api/health` - should return:
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. Check Frontend
Visit `http://localhost:5173` - should show the login page

### 3. Test Registration
1. Go to registration page
2. Create a new account
3. Verify you can login and access the dashboard

## Production Deployment

### Backend Deployment (Heroku/Railway/DigitalOcean)

1. **Environment Variables:**
   ```env
   NODE_ENV=production
   PORT=4000
   MONGODB_URI=your-production-mongodb-uri
   JWT_ACCESS_SECRET=your-production-access-secret
   JWT_REFRESH_SECRET=your-production-refresh-secret
   CLIENT_URL=https://your-frontend-domain.com
   ```

2. **Build Command:**
   ```bash
   npm install
   ```

3. **Start Command:**
   ```bash
   npm start
   ```

### Frontend Deployment (Vercel/Netlify)

1. **Build Command:**
   ```bash
   npm run build
   ```

2. **Output Directory:**
   ```
   dist
   ```

3. **Environment Variables:**
   - Update API base URL in axios configuration
   - Or use environment variables for API endpoints

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error:**
   - Ensure MongoDB is running
   - Check connection string format
   - Verify network access (for Atlas)

2. **CORS Errors:**
   - Verify `CLIENT_URL` in backend `.env`
   - Check frontend is running on correct port

3. **JWT Errors:**
   - Ensure JWT secrets are set and consistent
   - Check token expiration times

4. **Email Not Working:**
   - Verify email credentials
   - Check firewall/network restrictions
   - Test with a simple email service first

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

### Database Reset

To reset the database:
```bash
# Connect to MongoDB
mongo expense-tracker

# Drop the database
db.dropDatabase()
```

## API Testing

Import the provided Postman collection (`Expense_Tracker_API.postman_collection.json`) to test all API endpoints.

### Sample API Calls

1. **Register User:**
   ```bash
   curl -X POST http://localhost:4000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"John Doe","email":"john@example.com","password":"Password123"}'
   ```

2. **Login:**
   ```bash
   curl -X POST http://localhost:4000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"john@example.com","password":"Password123"}'
   ```

3. **Create Transaction:**
   ```bash
   curl -X POST http://localhost:4000/api/transactions \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
     -d '{"type":"expense","amount":25.50,"category":"Food","description":"Lunch"}'
   ```

## Development Workflow

### Adding New Features

1. **Backend:**
   - Add routes in `/routes`
   - Add controllers in `/controllers`
   - Add models in `/models`
   - Add middleware in `/middleware`

2. **Frontend:**
   - Add components in `/src/components`
   - Add pages in `/src/pages`
   - Update routing in `App.jsx`

### Code Style

- Use ESLint for JavaScript linting
- Follow consistent naming conventions
- Add proper error handling
- Write meaningful commit messages

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Check console logs for errors
4. Verify environment configuration

## Next Steps

After successful setup:
1. Customize the UI theme and branding
2. Add additional expense categories
3. Implement advanced reporting features
4. Add data backup and restore functionality
5. Integrate with banking APIs for automatic transaction import