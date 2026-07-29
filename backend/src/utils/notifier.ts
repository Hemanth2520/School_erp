import { getIO } from './socket.js';
import { logger } from './logger.js';

export const notifyUser = async (userId: string, event: string, data: any) => {
  try {
    const io = getIO();
    io.to(`user:${userId}`).emit(event, data);
    logger.info(`Notification sent to user ${userId}: ${event}`);
  } catch (error) {
    logger.error(`Failed to send notification to user ${userId}:`, error);
  }
};

export const notifyAll = async (event: string, data: any) => {
  try {
    const io = getIO();
    io.emit(event, data);
    logger.info(`Notification sent to all: ${event}`);
  } catch (error) {
    logger.error(`Failed to send notification to all:`, error);
  }
};
