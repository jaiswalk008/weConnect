import { CustomSocket, CustomServer } from '../../types/socket';
import { SOCKET_EVENTS } from '../events';
import { MessageData, SendMessagePayload } from '../../types/chat';
import chatService from '../../services/chat.service';
import prisma from '../../config/database';
import userService from '../../services/user.service';
import logger from '../../config/logger';
export class MessageHandler {
  constructor(
    private io: CustomServer,
    private socket: CustomSocket
  ) {}

  async handleSendMessage(data: SendMessagePayload, callback?: (response: any) => void) {
    try {
      const { chatId, content, mediaUrl, mediaType } = data;
      const senderId = this.socket.data.user.id;
      if (!chatId || !senderId) {
        const error = { success: false, error: 'Invalid message data' };
        logger.error(error.error);
        callback?.(error);
        return;
      }
      // Verify user is participant in chat
      const chatParticipants = await chatService.findChatParticipants({
        chat_id: chatId,
        user_id: senderId,
        is_active: true,
      });

      if (chatParticipants.length === 0) {
        const error = { success: false, error: 'User not authorized in this chat' };
        logger.error(error.error);
        callback?.(error);
        return;
      }

      // Create message
      const message = await chatService.createMessage({
        chat: { connect: { id: chatId } },
        sender: { connect: { id: senderId } },
        content,
        media_url: mediaUrl,
        media_type: mediaType as any,
      });

      // Update chat's last message
      await prisma.chat.update({
        where: { id: chatId },
        data: { last_message_id: message.id },
      });

      // Update message status and unread counts for participants
      await chatService.updateMessageStatusAndUnreadCount(message.id, chatId, senderId);

      const messageData: MessageData = {
        id: message.id,
        chatId: message.chat_id,
        senderId: message.sender_id,
        content: message.content || '',
        mediaUrl: message.media_url || '',
        mediaType: message.media_type || '',
        createdAt: message.created_at,
        sender: userService.getUserProfile(this.socket.data.user),
      };
      const roomName = `chat:${chatId}`;
      this.io.to(roomName).emit(SOCKET_EVENTS.MESSAGE_NEW, messageData);

      // Send success callback
      callback?.({
        success: true,
        message: messageData,
      });
    } catch (error) {
      logger.error('Error sending message:', error);
      callback?.({
        success: false,
        error: 'Failed to send message',
      });
    }
  }

  //   async handleMarkAsRead(data: { messageId: number; chatId: number }) {
  //     try {
  //       const userId = this.socket.data.userId;

  //       // Update message status
  //       await prisma.messageStatus.updateMany({
  //         where: {
  //           messageId: data.messageId,
  //           userId,
  //         },
  //         data: {
  //           status: 'READ',
  //           statusTimestamp: new Date(),
  //         },
  //       });

  //       // Update last read message and reset unread count
  //       await prisma.chatParticipant.updateMany({
  //         where: {
  //           chatId: data.chatId,
  //           userId,
  //         },
  //         data: {
  //           lastReadMessageId: data.messageId,
  //           unreadCount: 0,
  //         },
  //       });

  //       // Notify sender
  //       const message = await prisma.message.findUnique({
  //         where: { id: data.messageId },
  //         select: { senderId: true },
  //       });

  //       if (message) {
  //         this.io.to(`user:${message.senderId}`).emit(SOCKET_EVENTS.MESSAGE_READ, {
  //           messageId: data.messageId,
  //           userId,
  //         });
  //       }
  //     } catch (error) {
  //       logger.error('Error marking message as read:', error);
  //     }
  //   }

  //   async handleMarkAsDelivered(data: { messageId: number }) {
  //     try {
  //       const userId = this.socket.data.userId;

  //       await prisma.messageStatus.updateMany({
  //         where: {
  //           messageId: data.messageId,
  //           userId,
  //           status: 'SENT',
  //         },
  //         data: {
  //           status: 'DELIVERED',
  //           statusTimestamp: new Date(),
  //         },
  //       });

  //       // Notify sender
  //       const message = await prisma.message.findUnique({
  //         where: { id: data.messageId },
  //         select: { senderId: true },
  //       });

  //       if (message) {
  //         this.io.to(`user:${message.senderId}`).emit(SOCKET_EVENTS.MESSAGE_DELIVERED, {
  //           messageId: data.messageId,
  //           userId,
  //         });
  //       }
  //     } catch (error) {
  //       logger.error('Error marking message as delivered:', error);
  //     }
  //   }

  registerEvents() {
    this.socket.on(SOCKET_EVENTS.MESSAGE_SEND, (data, callback) =>
      this.handleSendMessage(data, callback)
    );
    // this.socket.on(SOCKET_EVENTS.MESSAGE_MARK_READ, (data) => this.handleMarkAsRead(data));
    // this.socket.on(SOCKET_EVENTS.MESSAGE_MARK_DELIVERED, (data) =>
    //   this.handleMarkAsDelivered(data)
    // );
  }
}
