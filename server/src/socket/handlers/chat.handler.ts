// server/socket/handlers/chat.handler.ts
import { CustomSocket, CustomServer } from '../../types/socket';
import { SOCKET_EVENTS } from '../events';
import chatService from '../../services/chat.service';
import logger from '../../config/logger';
import { NotificationType } from '../../types/notification';
import { chatListData } from '../../types/chat';

export class ChatHandler {
  constructor(
    private io: CustomServer,
    private socket: CustomSocket
  ) {}

  async handleJoinChat(data: { chatId: number }) {
    try {
      const { chatId } = data;
      const userId = this.socket.data.user.id;

      logger.info(`User ${userId} attempting to join chat ${chatId}`);

      // Verify user is participant in chat
      const chatParticipants = await chatService.findChatParticipants({
        chat_id: chatId,
        user_id: userId,
        is_active: true,
      });

      if (chatParticipants.length === 0) {
        logger.info(`User ${userId} not authorized for chat ${chatId}`);
        this.socket.emit(SOCKET_EVENTS.ERROR, {
          message: 'Not authorized to join this chat',
        });
        return;
      }

      // Join the chat room
      const roomName = `chat:${chatId}`;
      await this.socket.join(roomName);

      logger.info(`User ${userId} joined chat room: ${roomName}`);
      logger.info(`Socket rooms: ${Array.from(this.socket.rooms)}`);
    } catch (error) {
      logger.error('Error joining chat:', error);
      this.socket.emit(SOCKET_EVENTS.ERROR, {
        message: 'Failed to join chat',
      });
    }
  }

  async handleLeaveChat(data: { chatId: number }) {
    try {
      const { chatId } = data;
      const userId = this.socket.data.user.id;
      const roomName = `chat:${chatId}`;

      await this.socket.leave(roomName);
      logger.info(`User ${userId} left chat room: ${roomName}`);
    } catch (error) {
      logger.error('Error leaving chat:', error);
    }
  }

  registerEvents() {
    this.socket.on(SOCKET_EVENTS.CHAT_JOIN, data => this.handleJoinChat(data));

    this.socket.on(SOCKET_EVENTS.CHAT_LEAVE, data => this.handleLeaveChat(data));
  }
}
