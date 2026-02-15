import { v4 as uuidv4 } from 'uuid';
import chatService from './chat.service';
import prisma from '../config/database';
import { ChatType, User } from '@prisma/client';
import { chatListData } from '../types/chat';
import userService from './user.service';
import { getIO } from '../socket';
import { SOCKET_EVENTS } from '../socket/events';
import { NotificationType } from '../types/notification';


class GroupService {
  async createGroup(
    user: User,
    groupName: string,
    description: string,
    users: string[],
  ): Promise<chatListData> {
    const userIdsMap = await prisma.user.findMany({
      where: {
        username: {
          in: users,
        },
      },
      select: {
        id: true,
      },
    });

    const userIds = userIdsMap.map((user) => user.id);
    const newChat = await chatService.createChat(groupName, '', userIds, ChatType.GROUP, user.id);
    const group = await prisma.group.create({
      data: {
        description,
        chat_id: newChat.id,
        group_id: uuidv4(),
      },
    });
    const chatListData = {
      id: group.id,
      chatName: groupName,
      chatImage: '',
      chatType: ChatType.GROUP,
      description,
      createdByUser: userService.getUserProfile(user),
      chatId: newChat.id,
      chatCreatedAt: group.created_at,
    };
    const io = getIO();
    userIds.forEach((userId) => {
      io.to(`user:${userId}`).emit(SOCKET_EVENTS.NOTIFICATION, {
        type: NotificationType.NEW_GROUP,
        chatListData: chatListData,
      });
    });
    return chatListData;
  }
}

export default new GroupService();
