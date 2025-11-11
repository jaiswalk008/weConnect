import { Prisma } from '@prisma/client';
import prisma from '../config/database';

class ChatRepository {
  async findChatParticipants(
    data: Prisma.ChatParticipantWhereInput,
    include?: Prisma.ChatParticipantInclude
  ) {
    return await prisma.chatParticipant.findMany({
      where: {
        ...data,
      },
      include,
    });
  }
}
export default new ChatRepository();
