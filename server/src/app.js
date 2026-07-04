import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes.js';
import habitRoutes from './routes/habitRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import connectDB from './config/db.js';

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.CORS_ORIGIN,
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173'
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || /https:\/\/.*\.vercel\.app$/i.test(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
   app.set("trust proxy",1);
app.use(helmet());
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '10kb' }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

app.get("/api/debug", (req, res) => {
  res.json({
    trustProxy: app.get("trust proxy"),
    nodeEnv: process.env.NODE_ENV,
  });
});
app.get('/api/health', (req, res) => res.json({ success: true, status: 'ok' }));

// Ensure a DB connection exists before any route that needs one runs. This makes
// the connection independent of which file the deployment platform uses as its
// entry point (e.g. Vercel invoking this app directly instead of server.js).
const ensureDB = async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
};

app.use('/api/auth', ensureDB, authRoutes);
app.use('/api/habits', ensureDB, habitRoutes);
app.use('/api/dashboard', ensureDB, dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
