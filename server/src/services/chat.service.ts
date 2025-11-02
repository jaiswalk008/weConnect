import { ChatType, Prisma } from '@prisma/client';
import prisma from '../config/database';
import { chatListData, MessageData } from '../types/chat';
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
    });
    await this.createParticipants(newChat.id, participants);
    return newChat;
  }
  async createParticipants(chatId: number, participants: number[]) {
    await prisma.chatParticipant.createMany({
      data: participants.map((participantId: number) => ({
        chat_id: chatId,
        user_id: participantId,
        role: participantId === chatId ? 'ADMIN' : 'MEMBER',
        is_active: true,
      })),
    });
  }
  async findChatParticipants(data: Prisma.ChatParticipantWhereInput) {
    return await prisma.chatParticipant.findMany({
      where: {
        ...data,
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
          status: 'SENT',
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

    return participants;
  }
  async getUserChatHistoryList(userId: number): Promise<chatListData[]> {
    const chatList = await prisma.chatParticipant.findMany({
      where: {
        user_id: userId,
        is_active: true,
        chat: {
          last_message_id: {
            not: null,
          },
        },
      },
      include: {
        chat: {
          include: {
            last_message: {
              include: {
                sender: true,
              },
            },
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

    // Use Promise.all to handle async map properly
    const chatHistoryList = await Promise.all(
      chatList.map(async participant => {
        const chat = participant.chat;
        let chatName = '';
        let chatImage = '';

        if (chat.chat_type === ChatType.PERSONAL) {
          // Use the already fetched participants from include
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
        };

        if (chat.last_message) {
          const sender = userService.getUserProfile(chat.last_message.sender);
          result.lastMessage = {
            id: chat.last_message.id,
            chatId: chat.last_message.chat_id,
            senderId: chat.last_message.sender_id,
            content: chat.last_message.content || undefined,
            mediaUrl: chat.last_message.media_url || undefined,
            mediaType: chat.last_message.media_type || undefined,
            createdAt: chat.last_message.created_at,
            sender: sender,
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
      },
      orderBy: {
        created_at: 'asc', // Changed to asc to show messages in chronological order
      },
    });

    // Transform to camelCase and format the response
    const formattedMessages = messages.map(message => ({
      id: message.id,
      chatId: message.chat_id,
      senderId: message.sender_id,
      content: message?.content || '',
      mediaUrl: message?.media_url || '',
      mediaType: message?.media_type || '',
      createdAt: message.created_at,
      sender: userService.getUserProfile(message.sender),
    }));

    return formattedMessages;
  }
}

export default new ChatService();
