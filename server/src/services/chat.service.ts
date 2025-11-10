import { ChatType, Prisma } from '@prisma/client';
import prisma from '../config/database';
import { chatListData, MessageData, MessageStatus } from '../types/chat';
import userService from './user.service';
import { NotFoundError } from '../utils/errors';

class ChatService {
  async createChat(
    chatName: string,
    chatImage: string,
    participants: number[],
    chatType: ChatType,
    userId: number
  ) {
    const newChat = await prisma.chat.create({
      data: {
        chat_name: chatName,
        chat_image: chatImage,
        chat_type: chatType,
        created_by_user: {
          connect: {
            id: userId,
          },
        },
      },
      include: {
        created_by_user: true,
      },
    });
    await this.createParticipants(newChat.id, userId, participants);
    return newChat;
  }
  async createParticipants(chatId: number, userId: number, participants: number[]) {
    await prisma.chatParticipant.createMany({
      data: participants.map((participantId: number) => ({
        chat_id: chatId,
        user_id: participantId,
        role: participantId === userId ? 'ADMIN' : 'MEMBER',
        is_active: true,
      })),
    });
  }
  async findChatParticipants(data: Prisma.ChatParticipantWhereInput) {
    return await prisma.chatParticipant.findMany({
      where: {
        ...data,
      },
      include: {
        user: true,
      },
    });
  }
  async createMessage(data: Prisma.MessageCreateInput, include?: Prisma.MessageInclude) {
    return await prisma.message.create({
      data,
      include,
    });
  }

  async updateMessageStatusAndUnreadCount(messageId: number, chatId: number, senderId: number) {
    // Get all participants except the sender
    const participants = await this.findChatParticipants({
      chat_id: chatId,
      is_active: true,
      user_id: { not: senderId },
    });

    // Create message status entries for all participants
    const statusPromises = participants.map(participant =>
      prisma.messageStatus.create({
        data: {
          message_id: messageId,
          user_id: participant.user_id,
          status:
            participant.user.status === 'ONLINE' ? MessageStatus.DELIVERED : MessageStatus.SENT,
        },
      })
    );

    // Increment unread count for all participants except sender
    const unreadCountPromise = prisma.chatParticipant.updateMany({
      where: {
        chat_id: chatId,
        user_id: { not: senderId },
        is_active: true,
      },
      data: {
        unread_count: { increment: 1 },
      },
    });

    await Promise.all([...statusPromises, unreadCountPromise]);
    return;
  }
  async getUserChatHistoryList(userId: number): Promise<chatListData[]> {
    const chatList = await prisma.chatParticipant.findMany({
      where: {
        user_id: userId,
        is_active: true,
        chat: {
          OR: [
            // Include all groups
            {
              chat_type: 'GROUP',
            },
            // Include personal chats with no last message
            {
              AND: [{ chat_type: 'PERSONAL' }, { last_message_id: { not: null } }],
            },
          ],
        },
      },
      include: {
        chat: {
          include: {
            last_message: {
              include: {
                sender: true,
                message_statuses: true,
              },
            },
            created_by_user: true,
            participants: {
              where: {
                user_id: { not: userId },
                is_active: true,
              },
              include: {
                user: true,
              },
            },
          },
        },
        user: true,
      },
      orderBy: {
        chat: {
          updated_at: 'desc',
        },
      },
    });

    const chatHistoryList = await Promise.all(
      chatList.map(async participant => {
        const chat = participant.chat;
        let chatName = '';
        let chatImage = '';

        if (chat.chat_type === ChatType.PERSONAL) {
          const otherParticipant = chat.participants[0];
          if (otherParticipant) {
            chatName = otherParticipant.user.username;
            chatImage = otherParticipant.user.profile_image || '';
          }
        } else {
          chatName = chat.chat_name || '';
          chatImage = chat.chat_image || '';
        }

        const result: chatListData = {
          id: participant.id,
          chatId: chat.id,
          chatType: chat.chat_type,
          chatName,
          chatImage,
          lastReadMessageId: participant.last_read_message_id || undefined,
          unreadCount: participant.unread_count || 0,
          createdByUser: userService.getUserProfile(chat.created_by_user),
          chatCreatedAt: chat.created_at,
        };

        if (chat.last_message) {
          const sender = userService.getUserProfile(chat.last_message.sender);

          // If current user sent the message, check if OTHER participants have read it
          let messageStatus: MessageStatus;

          if (chat.last_message.sender_id === userId) {
            // Current user is sender - check if others have read it
            const otherStatuses = chat.last_message.message_statuses.filter(
              status => status.user_id !== userId
            );

            // Determine overall status based on other participants
            if (otherStatuses.length === 0) {
              messageStatus = MessageStatus.SENT;
            } else if (otherStatuses.every(s => s.status === MessageStatus.READ)) {
              messageStatus = MessageStatus.READ;
            } else if (otherStatuses.some(s => s.status === MessageStatus.DELIVERED)) {
              messageStatus = MessageStatus.DELIVERED;
            } else {
              messageStatus = MessageStatus.SENT;
            }
          } else {
            // Current user is receiver - check their own status
            const userStatus = chat.last_message.message_statuses.find(
              status => status.user_id === userId
            );
            messageStatus = (userStatus?.status as MessageStatus) || MessageStatus.SENT;
          }

          result.lastMessage = {
            id: chat.last_message.id,
            chatId: chat.last_message.chat_id,
            senderId: chat.last_message.sender_id,
            content: chat.last_message.content || undefined,
            mediaUrl: chat.last_message.media_url || undefined,
            mediaType: chat.last_message.media_type || undefined,
            createdAt: chat.last_message.created_at,
            sender: sender,
            status: messageStatus,
          };
        }

        return result;
      })
    );

    return chatHistoryList;
  }

  async getChatHistory(chatId: number, userId: number): Promise<MessageData[]> {
    const chatParticipant = await this.findChatParticipants({
      chat_id: chatId,
      user_id: userId,
      is_active: true,
    });

    if (!chatParticipant.length) {
      throw new NotFoundError('Chat participant not found');
    }

    const messages = await prisma.message.findMany({
      where: {
        chat_id: chatId,
      },
      include: {
        sender: true,
        message_statuses: true,
      },
      orderBy: {
        created_at: 'asc',
      },
    });

    const formattedMessages = messages.map(message => {
      let messageStatus: MessageStatus;

      if (message.sender_id === userId) {
        // Current user is sender - check if OTHER participants have read it
        const otherStatuses = message.message_statuses.filter(status => status.user_id !== userId);

        if (otherStatuses.length === 0) {
          messageStatus = MessageStatus.SENT;
        } else if (otherStatuses.every(s => s.status === MessageStatus.READ)) {
          messageStatus = MessageStatus.READ;
        } else if (otherStatuses.some(s => s.status === MessageStatus.DELIVERED)) {
          messageStatus = MessageStatus.DELIVERED;
        } else {
          messageStatus = MessageStatus.SENT;
        }
      } else {
        // Current user is receiver - check their own status
        const userStatus = message.message_statuses.find(status => status.user_id === userId);
        messageStatus = (userStatus?.status as MessageStatus) || MessageStatus.SENT;
      }

      return {
        id: message.id,
        chatId: message.chat_id,
        senderId: message.sender_id,
        content: message?.content || '',
        mediaUrl: message?.media_url || '',
        mediaType: message?.media_type || '',
        createdAt: message.created_at,
        sender: userService.getUserProfile(message.sender),
        status: messageStatus,
      };
    });

    return formattedMessages;
  }
}

export default new ChatService();
