import express from 'express';
import morgan from 'morgan';
import session from 'express-session';
import passport from 'passport';
import { stream } from './config/logger';
import { errorMiddleware } from './middlewares/error.middleware';
import cors from 'cors';
import router from './routes';
import configurePassport from './config/passport';
import http from 'http';
import { initializeSocket } from './socket';

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const socketService = initializeSocket(server);

// Make socket service available globally in the app
app.set('socketService', socketService);
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true, // ✅ Enable this if you're using cookies/sessions
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Session middleware (required for passport)
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream }));

configurePassport();
// Initialize Passport
app.use(passport.initialize());

// Routes
app.use(router);

// Error handling middleware
app.use(errorMiddleware);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Export both server and socketService
export { socketService };
export default server;
