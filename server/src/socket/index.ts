import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { CustomServer, CustomSocket, ServerToClientEvents } from '../types/socket';
import { socketAuthMiddleware } from '../middlewares/socket.auth.middleware';
import { MessageHandler } from './handlers/message.handler';
// import { ChatHandler } from './handlers/chat.handler';
// import { TypingHandler } from './handlers/typing.handler';
// import { PresenceHandler } from './handlers/presence.handler';
import { SOCKET_EVENTS } from './events';
import { ChatHandler } from './handlers/chat.handler';
import logger from '../config/logger';
import { chatListData } from '../types/chat';
import { NotificationType } from '../types/notification';

export class SocketService {
  private io: CustomServer;
  private static instance: SocketService;

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        credentials: true,
      },
      pingTimeout: 60000,
      pingInterval: 25000,
    });
    this.io.engine.on('initial_headers', headers => {
      headers['Access-Control-Allow-Origin'] = process.env.FRONTEND_URL || 'http://localhost:5173';
    });
    this.io.engine.on('headers', headers => {
      headers['Access-Control-Allow-Origin'] = process.env.FRONTEND_URL || 'http://localhost:5173';
    });
    this.initializeMiddleware();
    this.initializeHandlers();
  }
  public static getInstance(server?: HTTPServer): SocketService {
    if (!SocketService.instance) {
      if (!server) {
        throw new Error('Server instance required for first initialization');
      }
      SocketService.instance = new SocketService(server);
    }
    return SocketService.instance;
  }
  private initializeMiddleware() {
    this.io.use(socketAuthMiddleware);
  }

  private initializeHandlers() {
    this.io.on(SOCKET_EVENTS.CONNECTION, (socket: CustomSocket) => {
      logger.info(`User connected: ${socket.data.user.id}`);
      logger.info(socket.id);
      socket.join(`user:${socket.data.user.id}`);
      const messageHandler = new MessageHandler(this.io, socket);
      const chatHandler = new ChatHandler(this.io, socket);
      // const typingHandler = new TypingHandler(this.io, socket);
      // const presenceHandler = new PresenceHandler(this.io, socket);
      messageHandler.markPendingMessagesAsDelivered(socket.data.user.id);
      messageHandler.registerEvents();
      chatHandler.registerEvents();
      // typingHandler.registerEvents();
      // presenceHandler.registerEvents();

      // presenceHandler.handleUserOnline();

      socket.on(SOCKET_EVENTS.DISCONNECT, () => {
        logger.info(`User disconnected: ${socket.data.user.id}`);
      });
    });
  }

  public getIO(): CustomServer {
    return this.io;
  }

  // Type-safe helper method to emit to specific user
  public emitToUser<K extends keyof ServerToClientEvents>(
    userId: number,
    event: K,
    ...args: Parameters<ServerToClientEvents[K]>
  ): boolean {
    return this.io.to(`user:${userId}`).emit(event, ...args);
  }

  // Type-safe helper method to emit to chat
  public emitToChat<K extends keyof ServerToClientEvents>(
    chatId: number,
    event: K,
    ...args: Parameters<ServerToClientEvents[K]>
  ): boolean {
    return this.io.to(`chat:${chatId}`).emit(event, ...args);
  }

  // Generic emit method (less type-safe but more flexible)
  public emitToRoom(room: string, event: keyof ServerToClientEvents, data: any) {
    this.io.to(room).emit(event, data);
  }
}

export let socketService: SocketService;

// Initialize using singleton pattern
export const initializeSocket = (server: HTTPServer): SocketService => {
  return SocketService.getInstance(server);
};

// Get the singleton instance
export const getSocketService = (): SocketService => {
  return SocketService.getInstance();
};
export const getIO = (): CustomServer => {
  return SocketService.getInstance().getIO();
};
