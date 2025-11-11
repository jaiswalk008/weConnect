import { Skeleton } from '@weconnect/ui';
import { useMediaQuery } from '@/hooks/useMediaQuery';

// ============================================
// SIDEBAR SKELETON
// ============================================
export const SidebarSkeleton = () => {
  return (
    <div className="flex flex-col h-full w-16 bg-card border-r border-border">
      {/* Theme Toggle Skeleton */}
      <div className="p-3 border-b border-border">
        <Skeleton className="w-10 h-10 rounded-full" />
      </div>

      {/* Navigation Icons Skeleton */}
      <div className="flex-1 flex flex-col gap-2 p-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <Skeleton className="w-10 h-10 rounded-full" />
      </div>

      {/* Profile Settings Skeleton */}
      <div className="p-3 border-t border-border">
        <Skeleton className="w-10 h-10 rounded-full" />
      </div>
    </div>
  );
};

// ============================================
// CHAT ITEM SKELETON
// ============================================
const ChatItemSkeleton = () => {
  return (
    <div className="w-full p-4 flex items-center gap-3">
      {/* Avatar Skeleton */}
      <Skeleton className="w-12 h-12 rounded-full shrink-0" />

      {/* Chat Info Skeleton */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-12 ml-2" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-48" />
          <Skeleton className="w-5 h-5 rounded-full ml-2" />
        </div>
      </div>
    </div>
  );
};

// ============================================
// CHAT LIST SKELETON
// ============================================
export const ChatListSkeleton = () => {
  return (
    <div className="flex flex-col h-full  w-full md:w-96 bg-background border-r border-border">
      {/* Header Skeleton */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="w-10 h-10 rounded-full" />
        </div>

        {/* Search Bar Skeleton */}
        <Skeleton className="w-full h-10 rounded-lg" />
      </div>

      {/* Chat List Items Skeleton */}
      <div className="flex-1 overflow-hidden">
        {Array.from({ length: 8 }).map((_, index) => (
          <ChatItemSkeleton key={index} />
        ))}
      </div>
    </div>
  );
};

// ============================================
// MESSAGE BUBBLE SKELETON
// ============================================
const MessageSkeleton = ({ isSender }: { isSender: boolean }) => {
  return (
    <div className={`flex w-full ${isSender ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[75%] md:max-w-[70%]`}>
        <Skeleton
          className={`h-16 ${isSender ? 'w-48' : 'w-56'} rounded-2xl ${
            isSender ? 'rounded-br-sm' : 'rounded-bl-sm'
          }`}
        />
      </div>
    </div>
  );
};

// ============================================
// CHAT WINDOW SKELETON
// ============================================
export const ChatWindowSkeleton = ({ isMobile }: { isMobile?: boolean }) => {
  return (
    <div className="flex-1 flex flex-col h-full w-full bg-background">
      {/* Chat Header Skeleton */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-card">
        {isMobile && <Skeleton className="w-5 h-5 rounded mr-2 shrink-0" />}

        <Skeleton className="w-10 h-10 rounded-full shrink-0" />

        <div className="flex-1 min-w-0">
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-3 w-16" />
        </div>

        <div className="flex items-center gap-1 md:gap-2 shrink-0">
          <Skeleton className="w-8 h-8 md:w-10 md:h-10 rounded-lg" />
          <Skeleton className="w-8 h-8 md:w-10 md:h-10 rounded-lg" />
          <Skeleton className="w-8 h-8 md:w-10 md:h-10 rounded-lg" />
        </div>
      </div>

      {/* Messages Area Skeleton */}
      <div className="flex-1 overflow-y-auto px-3 py-4 md:px-4 bg-secondary/30">
        <div className="flex flex-col gap-2 w-full max-w-full">
          <MessageSkeleton isSender={false} />
          <MessageSkeleton isSender={true} />
          <MessageSkeleton isSender={false} />
          <MessageSkeleton isSender={true} />
          <MessageSkeleton isSender={false} />
          <MessageSkeleton isSender={true} />
        </div>
      </div>

      {/* Input Area Skeleton */}
      <div className="p-3 md:p-4 border-t border-border bg-card">
        <div className="flex items-center gap-1 md:gap-2">
          <Skeleton className="w-8 h-8 md:w-10 md:h-10 rounded-lg shrink-0" />
          <Skeleton className="w-8 h-8 md:w-10 md:h-10 rounded-lg shrink-0" />
          <Skeleton className="flex-1 h-10 rounded-lg" />
          <Skeleton className="w-8 h-8 md:w-10 md:h-10 rounded-lg shrink-0" />
          <Skeleton className="w-8 h-8 md:w-10 md:h-10 rounded-full shrink-0" />
        </div>
      </div>
    </div>
  );
};

// ============================================
// EMPTY CHAT WINDOW SKELETON
// ============================================
export const EmptyChatWindowSkeleton = () => {
  return (
    <div className="flex-1 flex items-center justify-center bg-background">
      <div className="text-center">
        <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
        <Skeleton className="h-6 w-64 mx-auto" />
      </div>
    </div>
  );
};

// ============================================
// COMPLETE LAYOUT SKELETON
// ============================================
export const ChatLayoutSkeleton = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar Skeleton - Hidden on mobile */}
      {!isMobile && <SidebarSkeleton />}

      {/* Chat List Skeleton */}
      <ChatListSkeleton />

      {/* Chat Window Skeleton - Hidden on mobile */}
      {!isMobile && <ChatWindowSkeleton isMobile={false} />}
    </div>
  );
};

// ============================================
// MOBILE CHAT WINDOW SKELETON
// ============================================
export const MobileChatWindowSkeleton = () => {
  return <ChatWindowSkeleton isMobile={true} />;
};
