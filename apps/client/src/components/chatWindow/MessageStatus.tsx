import type { MessageStatus as MessageStatusType } from '@/types/socket';
import { Check, CheckCheck } from 'lucide-react';

interface MessageStatusProps {
  status: MessageStatusType;
  isSentByMe: boolean;
}

export const MessageStatus = ({ status, isSentByMe }: MessageStatusProps) => {
  // Only show status for messages sent by current user
  if (!isSentByMe) return null;

  switch (status) {
    case 'SENT':
      return <Check className='w-4 h-4 text-muted-foreground' />;
    case 'DELIVERED':
      return <CheckCheck className='w-4 h-4 text-muted-foreground' />;
    case 'READ':
      return <CheckCheck className='w-4 h-4 text-foreground' />;
    default:
      return null;
  }
};
