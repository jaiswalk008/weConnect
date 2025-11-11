import {
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  Smile,
  Paperclip,
  Mic,
  Send,
  ChevronDown,
} from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { MessageSquare } from 'lucide-react';
import { Users } from 'lucide-react';
import { useEffect, useState, useRef, useCallback } from 'react';
import type { ChatHistoryResponse } from '@/types/socket';
import { useFetch } from '@/hooks/useFetch';
import { ChatWindowSkeleton } from '../ui/ChatSkeletonLoader';
import ProfileImage from '../Profile/ProfileImage';
import { Input } from '../ui/input';
import { useMessages } from '@/hooks/useMessages';
import { useDispatch, useSelector } from 'react-redux';
import { chatActions, type RootState } from '@/context/store';
import { getMessageDateLabel, isSameDay } from '@/utils/dateUtils';
import { DateDivider } from './DateDivider';
import { chatAPI } from '@/api/chat';
import { TABS } from '@/constants/tabs';

export interface ChatDetails {
  chatId: number;
  chatImage: string;
  chatName: string;
  chatType: string;
}

interface ChatWindowProps {
  chatDetails: ChatDetails;
  isMobile: boolean;
  showChatWindow: boolean;
  onBack: () => void;
  activeTab: TABS;
}

export const ChatWindow = ({
  chatDetails,
  isMobile,
  showChatWindow,
  onBack,
  activeTab,
}: ChatWindowProps) => {
  const { data, loading, fetchData } = useFetch<ChatHistoryResponse>();
  const [messageInput, setMessageInput] = useState('');
  const dispatch = useDispatch();
  const chatData = useSelector((state: RootState) => state.chat.chatData);
  // Refs for the messages container and tracking
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const [initialLoad, setInitialLoad] = useState(true);
  const lastMessageCountRef = useRef(0);
  const previousChatIdRef = useRef<number>(0);
  const hasScrolledInitiallyRef = useRef(false);

  // Check if user is scrolled to bottom
  const checkIfAtBottom = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return true;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    return distanceFromBottom <= 100; // 100px threshold
  }, []);

  // Scroll to bottom function
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
    setIsAtBottom(true);
    setNewMessageCount(0);
  }, []);

  // Scroll to show recent messages (not necessarily bottom)
  const scrollToRecent = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container || !messagesEndRef.current) return;

    // Scroll to show the last few messages, not necessarily all the way to bottom
    messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
    setIsAtBottom(true);
    setNewMessageCount(0);
  }, []);

  // Handle scroll events
  const handleScroll = useCallback(() => {
    const atBottom = checkIfAtBottom();
    setIsAtBottom(atBottom);

    // If user scrolls back to bottom manually, clear new message count
    if (atBottom && newMessageCount > 0) {
      setNewMessageCount(0);
    }
  }, [checkIfAtBottom, newMessageCount]);

  // Reset states when chat changes
  useEffect(() => {
    if (previousChatIdRef.current !== chatDetails.chatId) {
      setIsAtBottom(true);
      setNewMessageCount(0);
      setInitialLoad(true);
      lastMessageCountRef.current = 0;
      previousChatIdRef.current = chatDetails.chatId;
      hasScrolledInitiallyRef.current = false;
    }
  }, [chatDetails.chatId]);

  // Fetch chat history when chatId changes
  useEffect(() => {
    if (chatDetails.chatId) {
      fetchData(`${chatAPI.fetchChatHistory}?chatId=${chatDetails.chatId}`);
    }
  }, [fetchData, chatDetails.chatId]);

  // Set chat data when history is loaded
  useEffect(() => {
    if (chatDetails.chatId && data?.chatHistory) {
      dispatch(chatActions.setChatData(data.chatHistory));
    }
  }, [chatDetails.chatId, dispatch, data?.chatHistory]);

  // Handle initial scroll position after messages are loaded
  useEffect(() => {
    if (chatData.length > 0 && initialLoad && !hasScrolledInitiallyRef.current) {
      // Use setTimeout to ensure DOM has updated with messages
      setTimeout(() => {
        scrollToRecent();
        setInitialLoad(false);
        lastMessageCountRef.current = chatData.length;
        hasScrolledInitiallyRef.current = true;
      }, 100);
    }
  }, [chatData.length, initialLoad, scrollToRecent]);

  // Handle new messages - only count actual new messages, not initial load
  useEffect(() => {
    if (chatData.length > 0 && !initialLoad && hasScrolledInitiallyRef.current) {
      const actualNewMessages = chatData.length - lastMessageCountRef.current;

      if (actualNewMessages > 0) {
        if (isAtBottom) {
          // User is at bottom, auto-scroll to show new message
          setTimeout(() => scrollToBottom('auto'), 50);
        } else {
          // User is scrolled up, show new message indicator
          setNewMessageCount(prev => prev + actualNewMessages);
        }
      }

      // Update the reference after processing
      lastMessageCountRef.current = chatData.length;
    }
  }, [chatData.length, isAtBottom, scrollToBottom, initialLoad]);

  const { sendMessage } = useMessages(chatDetails.chatId);

  if (isMobile && !showChatWindow) return null;
  if (loading) return <ChatWindowSkeleton />;

  const handleSendMessage = () => {
    if (messageInput.trim() === '') return;
    sendMessage(messageInput.trim());
    setMessageInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!chatDetails.chatId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        {activeTab === 'chats' ? (
          <div className="text-center text-muted-foreground">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg">Select a chat to start messaging</p>
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-semibold mb-2">Connect with Friends</p>
            <p className="text-sm max-w-sm mx-auto">
              View your friends, manage connections, and stay in touch with your network
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full w-full bg-background">
      {/* Chat Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-card">
        {isMobile && (
          <button onClick={onBack} className="mr-2 shrink-0" aria-label="Back">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
        )}

        <ProfileImage size="medium" image={chatDetails.chatImage} chatName={chatDetails.chatName} />

        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-foreground truncate">{chatDetails.chatName}</h2>
          <p className="text-xs text-muted-foreground">Online</p>
        </div>

        <div className="flex items-center gap-1 md:gap-2 shrink-0">
          <button className="w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center hover:bg-accent transition-colors">
            <Phone className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
          </button>
          <button className="w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center hover:bg-accent transition-colors">
            <Video className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
          </button>
          <button className="w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center hover:bg-accent transition-colors">
            <MoreVertical className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden relative bg-secondary/30">
        <div
          ref={messagesContainerRef}
          className="h-full overflow-y-auto px-3 py-4 md:px-4"
          onScroll={handleScroll}
        >
          <div className="flex flex-col gap-2 w-full max-w-full">
            {chatData?.map((message, index) => {
              // Check if we need to show a date divider
              const showDateDivider =
                index === 0 || !isSameDay(message.createdAt, chatData[index - 1].createdAt);

              return (
                <div key={message.id}>
                  {showDateDivider && (
                    <DateDivider label={getMessageDateLabel(message.createdAt)} />
                  )}
                  <MessageBubble message={message} />
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* New Messages Indicator - ADDED BACK */}
        {newMessageCount > 0 && (
          <button
            onClick={() => scrollToBottom()}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg flex items-center gap-2 hover:bg-primary/90 transition-colors z-10"
          >
            <ChevronDown className="w-4 h-4" />
            <span className="text-sm font-medium">
              {newMessageCount} new message{newMessageCount > 1 ? 's' : ''}
            </span>
          </button>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 md:p-4 border-t border-border bg-card">
        <div className="flex items-center gap-1 md:gap-2">
          <button className="w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center hover:bg-accent transition-colors shrink-0">
            <Smile className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
          </button>
          <button className="w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center hover:bg-accent transition-colors shrink-0">
            <Paperclip className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
          </button>

          <Input
            onChange={e => setMessageInput(e.target.value)}
            onKeyPress={handleKeyPress}
            value={messageInput}
            type="text"
            placeholder="Type a message..."
            className="flex-1 min-w-0 px-3 py-2 md:px-4 bg-secondary rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />

          <button className="w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center hover:bg-accent transition-colors shrink-0">
            <Mic className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
          </button>
          <button
            onClick={handleSendMessage}
            className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity shrink-0"
          >
            <Send className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
