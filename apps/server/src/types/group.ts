import { UserInterface } from './user';

export interface GroupData {
  id: number;
  group_id: string;
  chatName: string;
  description: string;
  chatImage: string;
  chatType: string;
  createdByUser: UserInterface;
  chatId: number;
  createdAt: Date;
  updatedAt: Date;
}
