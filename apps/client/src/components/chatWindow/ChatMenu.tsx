import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { MoreVertical, LogOut, Trash2 } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { ChatMenuConfirmationDialog } from './ChatMenuConfiramtion';
import { useState } from 'react';
import logger from '@/lib/logger';
import { toast } from 'sonner';
import axiosInstance from '@/utils/axiosInstance';
import { groupAPIs } from '@/api/group';

type DialogType = 'leave' | 'clear' | null;

export default function ChatMenu({ chatId }: { chatId: number }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<DialogType>(null);

  const handleLeaveGroup = () => {
    setDialogType('leave');
    setDialogOpen(true);
  };

  const handleClearChat = () => {
    setDialogType('clear');
    setDialogOpen(true);
  };

  async function handleLeaveGroupConfirmation() {
    try {
      await axiosInstance.patch(groupAPIs.leaveGroup, {
        chatId,
      });
    } catch (error) {
      logger.error('Error leaving group:', error);
      toast.error('Failed to leave group');
    }
  }
  const handleConfirm = async () => {
    if (dialogType === 'leave') {
      // Add your leave group logic here
      await handleLeaveGroupConfirmation();
      // await leaveGroupAPI();
    } else if (dialogType === 'clear') {
      // Add your clear chat logic here
      // await clearChatAPI();
    }
  };

  const dialogConfig = {
    leave: {
      title: 'Leave Group?',
      description:
        'Are you sure you want to leave this group? You will need to be added back by an admin to rejoin.',
      confirmText: 'Leave Group',
      variant: 'destructive' as const,
    },
    clear: {
      title: 'Clear Chat?',
      description: 'Are you sure you want to clear all messages? This action cannot be undone.',
      confirmText: 'Clear Chat',
      variant: 'destructive' as const,
    },
  };

  const currentConfig = dialogType ? dialogConfig[dialogType] : null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center hover:bg-accent transition-colors'
            aria-label='Chat menu'
          >
            <MoreVertical className='w-4 h-4 md:w-5 md:h-5 text-muted-foreground' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className='w-48 border border-border bg-popover shadow-lg rounded-md'
          align='end'
        >
          <DropdownMenuGroup>
            <DropdownMenuItem
              className='flex items-center gap-3 px-3 py-2.5 text-sm text-foreground hover:bg-accent rounded-sm cursor-pointer transition-colors'
              onClick={handleLeaveGroup}
            >
              <LogOut className='w-4 h-4 text-muted-foreground' />
              <span>Leave Group</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className='flex items-center gap-3 px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 rounded-sm cursor-pointer transition-colors'
              onClick={handleClearChat}
            >
              <Trash2 className='w-4 h-4' />
              <span>Clear Chat</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {currentConfig && (
        <ChatMenuConfirmationDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title={currentConfig.title}
          description={currentConfig.description}
          confirmText={currentConfig.confirmText}
          onConfirm={handleConfirm}
          variant={currentConfig.variant}
        />
      )}
    </>
  );
}
