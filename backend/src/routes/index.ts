import { Router } from 'express';
import {
  login, logout, refresh, me, forgotPassword, resetPassword, changePassword,
} from '../controllers/authController.js';
import { getDashboard, globalSearch } from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/auth.js';
import { moduleRoutes } from './moduleRoutes.js';

export const apiRouter = Router();

apiRouter.post('/auth/login', login);
apiRouter.post('/auth/refresh', refresh);
apiRouter.post('/auth/forgot-password', forgotPassword);
apiRouter.post('/auth/reset-password', resetPassword);
apiRouter.post('/auth/logout', authenticate, logout);
apiRouter.get('/auth/me', authenticate, me);
apiRouter.post('/auth/change-password', authenticate, changePassword);

apiRouter.get('/dashboard', authenticate, getDashboard);
apiRouter.get('/search', authenticate, globalSearch);

apiRouter.use('/', moduleRoutes);
