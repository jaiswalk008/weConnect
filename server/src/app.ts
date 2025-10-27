import express from 'express';
import morgan from 'morgan';
import session from 'express-session';
import passport from './config/passport';
import { stream } from './config/logger';
import { errorMiddleware } from './middlewares/error.middleware';
import cors from 'cors';
import router from './routes';

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream }));

// Session configuration


// Initialize Passport
// const passportInstance = passport();
// app.use(passportInstance.initialize());
// app.use(passportInstance.session());

// Routes
app.use(router);

// Error handling middleware
app.use(errorMiddleware);

export default app;