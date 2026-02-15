import { CustomSocket, CustomServer } from '../../types/socket';
import { SOCKET_EVENTS } from '../events';
import { MessageData, MessageStatus, SendMessagePayload } from '../../types/chat';
import chatService from '../../services/chat.service';
import prisma from '../../config/database';
import userService from '../../services/user.service';
import logger from '../../config/logger';
import { NotificationData, NotificationType } from '../../types/notification';
export class MessageHandler {
  constructor(
    private io: CustomServer,
    private socket: CustomSocket,
  ) {}

  async handleSendMessage(data: SendMessagePayload, callback?: (response: any) => void) {
    try {
      const { chatId } = data;
      const senderId = this.socket.data.user.id;

      if (!chatId || !senderId) {
        const error = { success: false, error: 'Invalid message data' };
        logger.error(error.error);
        callback?.(error);
        return;
      }

      // Use the modularized service method (1 read query + 1 transaction)
      const { message, participants, sender } = await chatService.processSendMessage(
        data,
        senderId,
      );

      const messageData: MessageData = {
        id: message.id,
        chatId: message.chat_id,
        senderId: message.sender_id,
        content: message.content || '',
        mediaUrl: message.media_url || '',
        mediaType: message.media_type || '',
        createdAt: message.created_at,
        sender: userService.getUserProfile(sender),
        status: MessageStatus.SENT,
      };

      const roomName = `chat:${chatId}`;
      // Emit new message in room
      this.socket.to(roomName).emit(SOCKET_EVENTS.MESSAGE_NEW, messageData);

      // Emit notifications to other participants
      // Filter out sender
      const recipients = participants.filter((p) => p.user_id !== senderId);

      if (recipients.length > 0) {
        for (const participant of recipients) {
          const notification: NotificationData = {
            type: NotificationType.NEW_MESSAGE,
            chatData: {
              id: participant.id,
              chatId: participant.chat_id,
              chatName:
                participant.chat.chat_type === 'GROUP'
                  ? participant.chat.chat_name || 'Group Chat'
                  : sender.name,
              chatImage:
                participant.chat.chat_type === 'GROUP'
                  ? participant.chat.chat_image || ''
                  : sender.profile_image || '',
              chatType: participant.chat.chat_type,
              lastReadMessageId: participant.last_read_message_id || undefined,
              unreadCount: (participant.unread_count || 0) + 1, // Increment locally for display
              lastMessage: messageData,
              createdByUser: userService.getUserProfile(participant.chat.created_by_user),
              chatCreatedAt: participant.chat.created_at,
            },
          };

          this.io.to(`user:${participant.user_id}`).emit(SOCKET_EVENTS.NOTIFICATION, notification);
        }
      }

      callback?.({ success: true, message: messageData });
    } catch (error: any) {
      logger.error('Error sending message:', error);
      callback?.({ success: false, error: error.message || 'Failed to send message' });
    }
  }

  async handleMarkAsRead(data: { chatId: number }) {
    try {
      const userId = this.socket.data.user.id;

      // Get the participant's current last_read_message_id
      const participant = await prisma.chatParticipant.findUnique({
        where: {
          chat_id_user_id: {
            chat_id: data.chatId,
            user_id: userId,
          },
        },
        select: {
          last_read_message_id: true,
        },
      });

      // Find the latest message in this chat
      const latestMessage = await prisma.message.findFirst({
        where: {
          chat_id: data.chatId,
        },
        orderBy: {
          id: 'desc',
        },
        select: {
          id: true,
        },
      });
      // If no messages exist in chat or no new messages to read
      if (!latestMessage) {
        return;
      }

      // If user has already read the latest message, nothing to do
      if (participant?.last_read_message_id === latestMessage.id) {
        logger.info('User has already read the latest message');
        return;
      }

      // Get all message IDs that need to be marked as read
      // (messages between last_read_message_id and the latest message)
      const messagesToMarkAsRead = await prisma.message.findMany({
        where: {
          chat_id: data.chatId,
          id: {
            ...(participant?.last_read_message_id && {
              gt: participant.last_read_message_id, // Greater than last read
            }),
            lte: latestMessage.id, // Less than or equal to latest message
          },
          sender_id: {
            not: userId, // Don't mark own messages as read
          },
        },
        select: {
          id: true,
          sender_id: true,
        },
        orderBy: {
          id: 'asc',
        },
      });

      if (messagesToMarkAsRead.length === 0) {
        // No unread messages from others, but still update last_read_message_id
        await prisma.chatParticipant.update({
          where: {
            chat_id_user_id: {
              chat_id: data.chatId,
              user_id: userId,
            },
          },
          data: {
            last_read_message_id: latestMessage.id,
            unread_count: 0,
          },
        });
        return;
      }

      const messageIds = messagesToMarkAsRead.map((m) => m.id);
      // Update message statuses for all unread messages
      await prisma.messageStatus.updateMany({
        where: {
          message_id: {
            in: messageIds,
          },
          user_id: userId,
          status: {
            in: ['SENT', 'DELIVERED'], // Only update if not already READ
          },
        },
        data: {
          status: 'READ',
          status_timestamp: new Date(),
        },
      });

      // Update last read message and reset unread count
      await prisma.chatParticipant.update({
        where: {
          chat_id_user_id: {
            chat_id: data.chatId,
            user_id: userId,
          },
        },
        data: {
          last_read_message_id: latestMessage.id,
          unread_count: 0,
        },
      });

      // Notify all unique senders about read receipts
      const uniqueSenderIds = [...new Set(messagesToMarkAsRead.map((m) => m.sender_id))];

      uniqueSenderIds.forEach((senderId) => {
        const senderMessages = messagesToMarkAsRead
          .filter((m) => m.sender_id === senderId)
          .map((m) => m.id);
        this.io.to(`chat:${data.chatId}`).emit(SOCKET_EVENTS.MESSAGE_READ, {
          messageIds: senderMessages,
          chatId: data.chatId,
          user: userService.getUserProfile(this.socket.data.user),
          timestamp: new Date(),
        });
      });

      logger.info(
        `Marked ${messageIds.length} messages as read for user ${userId} in chat ${data.chatId} (latest: ${latestMessage.id})`,
      );
    } catch (error) {
      logger.error('Error marking messages as read:', error);
      throw error;
    }
  }

  async handleMarkAsDelivered(data: { messageId: number }) {
    try {
      const userId = this.socket.data.user.id;

      await prisma.messageStatus.updateMany({
        where: {
          message_id: data.messageId,
          user_id: userId,
          status: 'SENT',
        },
        data: {
          status: 'DELIVERED',
          status_timestamp: new Date(),
        },
      });

      // Notify sender
      const message = await prisma.message.findUnique({
        where: { id: data.messageId },
        select: { sender_id: true },
      });

      if (message) {
        this.io.to(`user:${message.sender_id}`).emit(SOCKET_EVENTS.MESSAGE_DELIVERED, {
          messageIds: [data.messageId],
          userId,
          timestamp: new Date(),
        });
      }
    } catch (error) {
      logger.error('Error marking message as delivered:', error);
    }
  }
  async markPendingMessagesAsDelivered(userId: number) {
    try {
      // Find all messages that are SENT but not yet DELIVERED for this user
      const pendingStatuses = await prisma.messageStatus.findMany({
        where: {
          user_id: userId,
          status: 'SENT',
        },
        select: {
          message_id: true,
          message: {
            select: {
              sender_id: true,
              chat_id: true,
            },
          },
        },
      });

      if (pendingStatuses.length === 0) {
        return;
      }

      const messageIds = pendingStatuses.map((s) => s.message_id);

      // Update all to DELIVERED
      await prisma.messageStatus.updateMany({
        where: {
          message_id: {
            in: messageIds,
          },
          user_id: userId,
          status: 'SENT',
        },
        data: {
          status: 'DELIVERED',
          status_timestamp: new Date(),
        },
      });

      // Group by sender and notify
      const senderGroups = new Map<number, number[]>();

      pendingStatuses.forEach((status) => {
        const senderId = status.message.sender_id;
        if (!senderGroups.has(senderId)) {
          senderGroups.set(senderId, []);
        }
        senderGroups.get(senderId)!.push(status.message_id);
      });

      // Notify each sender
      senderGroups.forEach((messageIds, senderId) => {
        this.io.to(`user:${senderId}`).emit(SOCKET_EVENTS.MESSAGE_DELIVERED, {
          messageIds,
          userId,
          timestamp: new Date(),
        });
      });

      logger.info(`Auto-marked ${messageIds.length} messages as delivered for user ${userId}`);
    } catch (error) {
      logger.error('Error auto-marking messages as delivered:', error);
    }
  }

  registerEvents() {
    this.socket.on(SOCKET_EVENTS.MESSAGE_SEND, (data, callback) =>
      this.handleSendMessage(data, callback),
    );
    this.socket.on(SOCKET_EVENTS.MESSAGE_MARK_READ, (data) => this.handleMarkAsRead(data));
    this.socket.on(SOCKET_EVENTS.MESSAGE_MARK_DELIVERED, (data) =>
      this.handleMarkAsDelivered(data),
    );
  }
}
