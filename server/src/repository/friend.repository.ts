import prisma from '../config/database';
import { Prisma, Friend, User } from '@prisma/client';

type FriendWithUsers = Friend & {
  user: User;
  friend_user: User;
  status: 'SENT' | 'ACCEPTED' | 'RECEIVED';
};
class FriendRepository {
  async findFriends(
    data: Prisma.FriendWhereInput,
    include?: Prisma.FriendInclude
  ): Promise<FriendWithUsers[]> {
    const friends = (await prisma.friend.findMany({
      where: data,
      include,
    })) as FriendWithUsers[];
    return friends;
  }
  async createFriend(data: Prisma.FriendCreateInput) {
    const friend = await prisma.friend.create({
      data,
    });
    return friend;
  }
  async deleteFriend(data: Prisma.FriendWhereUniqueInput) {
    const friend = await prisma.friend.delete({
      where: data,
    });
    return friend;
  }
  async updateFriendshipStatus(id: Prisma.FriendWhereUniqueInput, data: Prisma.FriendUpdateInput) {
    const friend = await prisma.friend.update({
      where: id,
      data,
    });
    return friend;
  }
}

export default new FriendRepository();
