import prisma from '../config/database';
import { Prisma, User } from '@prisma/client';
class UserRepository {
  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    const user = await prisma.user.create({
      data,
    });
    return user;
  }

  async getUser(data: Prisma.UserWhereInput): Promise<User | null> {
    const user = await prisma.user.findFirst({
      where: data,
    });
    return user;
  }

  async updateUser(userId: number, data: Prisma.UserUpdateInput): Promise<User | null> {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
    });
    return user;
  }
}

export default new UserRepository();
