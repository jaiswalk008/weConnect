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

export interface GroupDetailsResponse {
  id: number;
  groupId: string;
  name: string | null;
  description: string | null;
  image: string | null;
  createdAt: Date;
  createdBy: {
    id: number;
    name: string;
    username: string;
    profile_image: string | null;
  };
  participants: Array<{
    id: number;
    name: string;
    username: string;
    profile_image: string | null;
    about: string | null;
    last_seen: Date | null;
    role: string;
    joinedAt: Date;
  }>;
}
