import { ChatType, Prisma } from '@prisma/client';
import prisma from '../config/database';
import { chatListData, MessageData, MessageStatus, SendMessagePayload } from '../types/chat';
import userService from './user.service';
import { NotFoundError, ValidationError } from '../utils/errors';
import { ChatDetailsResponse } from '../types/chat';

class ChatService {
  async createChat(
    chatName: string,
    chatImage: string,
    participants: number[],
    chatType: ChatType,
    userId: number,
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
    const statusPromises = participants.map((participant) =>
      prisma.messageStatus.create({
        data: {
          message_id: messageId,
          user_id: participant.user_id,
          status:
            participant.user.status === 'ONLINE' ? MessageStatus.DELIVERED : MessageStatus.SENT,
        },
      }),
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

  async processSendMessage(payload: SendMessagePayload, senderId: number) {
    const { chatId, content, mediaUrl, mediaType } = payload;

    // 1. Fetch Chat and Participants
    const chatParticipants = await prisma.chatParticipant.findMany({
      where: {
        chat_id: chatId,
        is_active: true,
      },
      include: {
        user: true,
        chat: {
          include: {
            created_by_user: true,
          },
        },
      },
    });

    // 2. Validate Sender
    const senderParticipant = chatParticipants.find((p) => p.user_id === senderId);
    // Find the chat details (can be taken from any participant)
    const chat = chatParticipants[0]?.chat;

    if (!senderParticipant || !chat) {
      throw new ValidationError('User not authorized in this chat');
    }

    // 3. Transaction for Message Creation and Updates
    const message = await prisma.$transaction(async (tx) => {
      // Create Message
      const newMessage = await tx.message.create({
        data: {
          chat_id: chatId,
          sender_id: senderId,
          content,
          media_url: mediaUrl,
          media_type: mediaType as any,
        },
      });

      // Update Chat's Last Message
      await tx.chat.update({
        where: { id: chatId },
        data: { last_message_id: newMessage.id },
      });

      // Identify recipients (everyone except sender)
      const recipients = chatParticipants.filter((p) => p.user_id !== senderId);

      if (recipients.length > 0) {
        // Create Statuses (Batch)
        await tx.messageStatus.createMany({
          data: recipients.map((p) => ({
            message_id: newMessage.id,
            user_id: p.user_id,
            status:
              p.user.status === 'ONLINE'
                ? (MessageStatus.DELIVERED as any)
                : (MessageStatus.SENT as any),
          })),
        });

        // Increment Unread Counts (Batch)
        await tx.chatParticipant.updateMany({
          where: {
            chat_id: chatId,
            user_id: { in: recipients.map((p) => p.user_id) },
          },
          data: {
            unread_count: { increment: 1 },
          },
        });
      }

      return newMessage;
    });

    return {
      message,
      chat,
      participants: chatParticipants,
      sender: senderParticipant.user,
    };
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
      chatList.map(async (participant) => {
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
              (status) => status.user_id !== userId,
            );

            // Determine overall status based on other participants
            if (otherStatuses.length === 0) {
              messageStatus = MessageStatus.SENT;
            } else if (otherStatuses.every((s) => s.status === MessageStatus.READ)) {
              messageStatus = MessageStatus.READ;
            } else if (otherStatuses.some((s) => s.status === MessageStatus.DELIVERED)) {
              messageStatus = MessageStatus.DELIVERED;
            } else {
              messageStatus = MessageStatus.SENT;
            }
          } else {
            // Current user is receiver - check their own status
            const userStatus = chat.last_message.message_statuses.find(
              (status) => status.user_id === userId,
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
      }),
    );

    return chatHistoryList;
  }

  async getChatHistory(
    chatId: number,
    userId: number,
    cursor?: number,
    limit: number = 20,
  ): Promise<{ messages: MessageData[]; nextCursor: number | null }> {
    const chatParticipant = await this.findChatParticipants({
      chat_id: chatId,
      user_id: userId,
      is_active: true,
    });

    if (!chatParticipant.length) {
      throw new NotFoundError('Chat participant not found');
    }

    const messages = await prisma.message.findMany({
      take: limit + 1,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      where: {
        chat_id: chatId,
      },
      include: {
        sender: true,
        message_statuses: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    let nextCursor: number | null = null;
    if (messages.length > limit) {
      const nextItem = messages.pop();
      nextCursor = nextItem?.id || null;
    }

    const formattedMessages = messages.reverse().map((message) => {
      let messageStatus: MessageStatus;

      if (message.sender_id === userId) {
        // Current user is sender - check if OTHER participants have read it
        const otherStatuses = message.message_statuses.filter(
          (status) => status.user_id !== userId,
        );

        if (otherStatuses.length === 0) {
          messageStatus = MessageStatus.SENT;
        } else if (otherStatuses.every((s) => s.status === MessageStatus.READ)) {
          messageStatus = MessageStatus.READ;
        } else if (otherStatuses.some((s) => s.status === MessageStatus.DELIVERED)) {
          messageStatus = MessageStatus.DELIVERED;
        } else {
          messageStatus = MessageStatus.SENT;
        }
      } else {
        // Current user is receiver - check their own status
        const userStatus = message.message_statuses.find((status) => status.user_id === userId);
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

    return {
      messages: formattedMessages,
      nextCursor,
    };
  }

  async getChatDetails(chatId: number, currentUserId: number): Promise<ChatDetailsResponse> {
    const chat = await prisma.chat.findUnique({
      where: {
        id: chatId,
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                profile_image: true,
                about: true,
                last_seen: true,
              },
            },
          },
        },
        created_by_user: {
          select: {
            id: true,
            name: true,
            username: true,
            profile_image: true,
          },
        },
        group: true,
      },
    });

    if (!chat) {
      throw new NotFoundError('Chat not found');
    }

    const isParticipant = chat.participants.some((p) => p.user_id === currentUserId);
    if (!isParticipant) {
      throw new ValidationError('User not authorized to view this chat');
    }

    let chatName = chat.chat_name;
    let chatImage = chat.chat_image;
    let description = chat.group?.description || null;

    // For Personal chats, use the other user's details
    if (chat.chat_type === ChatType.PERSONAL) {
      const otherParticipant = chat.participants.find((p) => p.user_id !== currentUserId);
      if (otherParticipant) {
        chatName = otherParticipant.user.name; // Or username, depending on preference
        chatImage = otherParticipant.user.profile_image;
        description = otherParticipant.user.about;
      }
    }

    return {
      id: chat.id,
      chatId: chat.id,
      type: chat.chat_type,
      name: chatName,
      image: chatImage,
      description,
      createdAt: chat.created_at,
      createdBy: chat.created_by_user
        ? {
            id: chat.created_by_user.id,
            name: chat.created_by_user.name,
            username: chat.created_by_user.username,
            profile_image: chat.created_by_user.profile_image,
          }
        : undefined,
      participants: chat.participants.map((p) => ({
        id: p.user.id,
        name: p.user.name,
        username: p.user.username,
        profile_image: p.user.profile_image,
        about: p.user.about,
        last_seen: p.user.last_seen,
        role: p.role,
        joinedAt: p.joined_at,
      })),
    };
  }
}

export default new ChatService();
