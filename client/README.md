# MetaTrader 5-Style Trading Platform

A comprehensive full-stack trading platform built with React, Node.js, and MongoDB, featuring real-time price feeds, secure authentication, and professional trading interface inspired by MetaTrader 5.

## 🚀 Tech Stack

**Frontend:**
- React 18 with TypeScript
- Tailwind CSS for styling
- React Router for navigation
- Axios for API calls
- Lucide React for icons
- Context API for state management

**Backend:**
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- bcryptjs for password hashing
- CORS for cross-origin requests

**External APIs:**
- CoinGecko API for real-time BTC/USDT prices

## 📦 Project Structure

```
/
├── client/                   # Frontend React application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── Navbar.tsx
│   │   │   ├── PriceChart.tsx
│   │   │   ├── TradePanel.tsx
│   │   │   ├── OrderHistory.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── context/          # React Context for state management
│   │   │   └── AuthContext.tsx
│   │   ├── pages/            # Main application pages
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   └── Dashboard.tsx
│   │   └── App.tsx
│   └── package.json
├── server/                   # Backend Node.js application
│   ├── controllers/          # Route handlers
│   │   ├── authController.js
│   │   └── tradeController.js
│   ├── models/              # Database schemas
│   │   ├── User.js
│   │   └── Order.js
│   ├── routes/              # API route definitions
│   │   ├── authRoutes.js
│   │   └── tradeRoutes.js
│   ├── middleware/          # Custom middleware
│   │   └── auth.js
│   ├── config/              # Configuration files
│   │   └── db.js
│   ├── server.js            # Main server file
│   └── package.json
└── README.md
```

## 🔧 Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd metatrader-trading-platform
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

4. **Configure environment variables**
   
   Create a `.env` file in the `server` directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/trading_platform
   JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
   JWT_EXPIRE=7d
   ```

5. **Start MongoDB**
   
   Make sure MongoDB is running on your system:
   ```bash
   # For local MongoDB installation
   mongod
   
   # Or use MongoDB Atlas cloud service
   # Update MONGODB_URI in .env with your Atlas connection string
   ```

6. **Run the application**
   
   From the root directory:
   ```bash
   npm run dev
   ```
   
   This will start both the frontend (http://localhost:5173) and backend (http://localhost:5000) servers concurrently.

## 🎯 Core Features

### Authentication System
- **User Registration**: Secure account creation with email validation
- **User Login**: JWT-based authentication with password hashing
- **Protected Routes**: Middleware protection for authenticated endpoints
- **Session Management**: Persistent login state with token validation

### Trading Dashboard
- **Real-time Price Feed**: Live BTC/USDT prices from CoinGecko API
- **Market Data Visualization**: Professional price display with 24h changes
- **Balance Management**: Real-time balance updates after trades
- **Responsive Design**: Optimized for desktop and mobile trading

### Trade Execution System
- **Buy/Sell Orders**: Toggle between buy and sell operations
- **Order Validation**: Balance checking and input validation
- **Instant Execution**: Simulated immediate order execution
- **Transaction Feedback**: Real-time status updates and error handling

### Order Management
- **Order History**: Complete transaction history with timestamps
- **Order Status Tracking**: Visual status indicators for each order
- **Trade Analytics**: Amount, price, and total calculations
- **Persistent Storage**: MongoDB storage for all trading data

## 🔐 Authentication Flow

1. **Registration**: New users create accounts with name, email, and password
2. **Login**: Existing users authenticate with email/password
3. **JWT Token**: Server issues JWT token for authenticated sessions
4. **Protected Access**: Token validation for all trading operations
5. **Session Persistence**: Local storage maintains login state

## 💰 Trading Logic

### Order Processing
1. **Price Fetching**: Real-time BTC price from CoinGecko API
2. **Balance Validation**: Sufficient funds check for buy orders
3. **Order Creation**: Database record with user, type, amount, and price
4. **Balance Update**: Automatic balance adjustment post-execution
5. **History Recording**: Complete audit trail of all transactions

### Demo Trading Environment
- Starting balance: $10,000 USDT
- Instant order execution (no market delays)
- Real-time price feeds for accurate simulation
- Complete transaction history tracking

## 🛡️ Security Features

- **Password Hashing**: bcryptjs for secure password storage
- **JWT Authentication**: Stateless authentication with secure tokens
- **Input Validation**: Comprehensive data validation on frontend and backend
- **CORS Protection**: Configured cross-origin resource sharing
- **Protected Routes**: Middleware authentication for sensitive endpoints

## 🎨 Design Philosophy

The platform follows MetaTrader 5's professional aesthetic with:
- **Dark Theme**: Professional trading environment
- **Color Coding**: Green for buy orders, red for sell orders
- **Real-time Updates**: Live price feeds with smooth animations
- **Responsive Layout**: Optimized for various screen sizes
- **Intuitive UX**: Clean, focused interface for efficient trading

## 🚀 Future Enhancements

- Multiple cryptocurrency pairs (ETH/USDT, etc.)
- Advanced charting with technical indicators
- Order types (limit orders, stop-loss)
- Portfolio analytics and performance tracking
- Real-time WebSocket price updates
- Mobile app development
- Advanced trading features (margin trading, etc.)

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (protected)

### Trading
- `POST /api/trades/order` - Create new order (protected)
- `GET /api/trades/orders` - Get user order history (protected)
- `GET /api/trades/positions` - Get user positions summary (protected)

## 🔧 Development

### Frontend Development
```bash
npm run client  # Start frontend development server
```

### Backend Development
```bash
npm run server  # Start backend development server
```

### Full Stack Development
```bash
npm run dev     # Start both frontend and backend
```

## 📄 License

This project is developed for educational and demonstration purposes.