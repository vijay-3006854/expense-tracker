# Expense Tracker - MERN Stack Application

A full-featured expense tracking application built with MongoDB, Express.js, React.js, and Node.js.

## Features

- 🔐 JWT Authentication (Access & Refresh Tokens)
- 💰 Income & Expense Management
- 📊 Data Visualization (Charts)
- 🎯 Budget Management with Alerts
- 📱 Responsive Design with Dark Mode
- 🔍 Advanced Filtering & Search
- 📄 Export to CSV/PDF
- 📧 Email Notifications

## Tech Stack

**Frontend:**
- React 18 (Vite)
- Tailwind CSS
- Axios
- Chart.js
- React Router DOM
- Context API

**Backend:**
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- bcrypt
- express-validator
- nodemailer

## Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd expense-tracker
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Configure your environment variables
npm run dev
```

3. **Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

4. **Environment Variables**

Create `.env` in backend folder:
```env
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb://localhost:27017/expense-tracker
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
CLIENT_URL=http://localhost:5173
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - User logout

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Budget
- `GET /api/budget` - Get user budget
- `POST /api/budget` - Set/Update budget

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile

## Database Schema

### User Schema
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  budget: Number,
  preferences: {
    darkMode: Boolean,
    currency: String
  }
}
```

### Transaction Schema
```javascript
{
  user: ObjectId (ref: User),
  type: String (income/expense),
  amount: Number,
  category: String,
  description: String,
  date: Date,
  receipt: String (optional)
}
```

## Folder Structure
```
expense-tracker/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── utils/
│   │   └── App.jsx
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License