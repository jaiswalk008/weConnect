import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@weconnect/ui';
import { Plus, Users, MessageCircle, CheckSquare } from 'lucide-react';
import { useState } from 'react';
import CreateGroupModal from './CreateGroupModal';
import { TABS } from '@/constants/tabs';

export default function ChatDropdownMenu({ setActiveTab }: { setActiveTab: (_tab: TABS) => void }) {
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="default"
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary/50 transition-all"
            aria-label="Open chat actions"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-56 border border-border bg-popover shadow-lg rounded-md space-y-1"
          align="end"
        >
          <DropdownMenuLabel className="px-3 py-2 text-xs text-muted-foreground">
            New Chat Actions
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="border-b border-border" />
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => setShowCreateGroupModal(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent rounded cursor-pointer transition-colors"
            >
              <Users className="w-4 h-4 text-primary" />
              Create Group
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setActiveTab(TABS.FRIENDS)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent rounded cursor-pointer transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-primary" />
              Start a new Chat
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent rounded cursor-pointer transition-colors">
              <CheckSquare className="w-4 h-4 text-primary" />
              Select chats
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <CreateGroupModal open={showCreateGroupModal} onOpenChange={setShowCreateGroupModal} />
    </>
  );
}
