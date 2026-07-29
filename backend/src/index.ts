import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { initSocket } from './utils/socket.js';
import { env } from './config/env.js';
import { connectDatabase } from './config/database.js';
import { apiRouter } from './routes/index.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';
import { rejectMongoOperators } from './middleware/mongoSanitize.js';
import { verifyAccessToken } from './utils/jwt.js';
import { User } from './models/User.js';

const app = express();
const httpServer = createServer(app);

const io = initSocket(httpServer, {
  cors: { origin: env.clientUrl, credentials: true },
});

app.set('io', io);

io.use(async (socket, next) => {
  try {
    const authHeader = socket.handshake.headers.authorization;
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
    const cookieToken = socket.handshake.headers.cookie
      ?.split(';')
      .map(part => part.trim().split('='))
      .find(([key]) => key === 'accessToken')?.[1];
    const token = socket.handshake.auth?.token || bearerToken || cookieToken;
    if (!token || typeof token !== 'string') return next(new Error('Authentication required'));

    const payload = verifyAccessToken(decodeURIComponent(token));
    const user = await User.findById(payload.userId).select('_id isActive');
    if (!user?.isActive) return next(new Error('Invalid or inactive user'));
    socket.data.userId = user._id.toString();
    next();
  } catch {
    next(new Error('Invalid or expired token'));
  }
});

app.use(helmet());
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(compression());
app.use(morgan(env.nodeEnv === 'development' ? 'dev' : 'combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(rejectMongoOperators);

app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
}));

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'EduERP API is running' });
});

app.use('/api/v1', apiRouter);

app.use(notFound);
app.use(errorHandler);

io.on('connection', (socket) => {
  logger.info('Socket connected:', socket.id);
  socket.join(`user:${socket.data.userId}`);
  socket.on('disconnect', () => {
    logger.info('Socket disconnected:', socket.id);
  });
});

async function start() {
  await connectDatabase();
  httpServer.listen(env.port, () => {
    logger.info(`Server running on port ${env.port}`);
  });
}

start().catch(err => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});

export { app, io };
