import express from 'express';
import morgan from 'morgan';
import session from 'express-session';
import passport from 'passport';
import { stream } from './config/logger';
import { errorMiddleware } from './middlewares/error.middleware';
import cors from 'cors';
import router from './routes';
import configurePassport from './config/passport';

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
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

// Session configuration

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

export default app;
