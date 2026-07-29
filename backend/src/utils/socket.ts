import { Server } from 'socket.io';
import type { Server as HTTPServer } from 'http';

let io: Server | null = null;

export function initSocket(server: HTTPServer, options?: ConstructorParameters<typeof Server>[1]) {
  if (io) return io;
  io = new Server(server, options as any);
  return io;
}

export function getIO(): Server {
  if (!io) throw new Error('Socket.io not initialized. Call initSocket first.');
  return io;
}
