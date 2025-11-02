import { ArrowLeft, Phone, Video, MoreVertical, Smile, Paperclip, Mic, Send } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { MessageSquare } from 'lucide-react';
import { Users } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import type { ChatHistoryResponse } from '@/types/socket';
import { useFetch } from '@/hooks/useFetch';
import { ChatWindowSkeleton } from '../ui/ChatSkeletonLoader';
import ProfileImage from '../common/ProfileImage';
import { Input } from '../ui/input';
import { useMessages } from '@/hooks/useMessages';
import { useDispatch, useSelector } from 'react-redux';
import { chatActions, type RootState } from '@/context/store';

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
  activeTab: 'chats' | 'friends';
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

  // Ref for the messages container
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Function to scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll to bottom when chat is first opened or chatId changes
  useEffect(() => {
    if (chatDetails.chatId && chatData.length > 0) {
      // Use setTimeout to ensure DOM has updated
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [chatDetails.chatId, chatData.length]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatData.length > 0) {
      scrollToBottom();
    }
  }, [chatData.length]);

  useEffect(() => {
    if (chatDetails.chatId) {
      fetchData(`/api/chat/history?chatId=${chatDetails.chatId}`);
    }
  }, [fetchData, chatDetails.chatId]);

  useEffect(() => {
    if (chatDetails.chatId) {
      dispatch(chatActions.setChatData(data?.chatHistory || []));
    }
  }, [chatDetails.chatId, dispatch, data?.chatHistory]);

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

        <ProfileImage image={chatDetails.chatImage} chatName={chatDetails.chatName} />

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

      {/* Messages Area - Fixed padding for mobile */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-3 py-4 md:px-4 bg-secondary/30"
      >
        <div className="flex flex-col gap-2 w-full max-w-full">
          {chatData?.map(message => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {/* Invisible element to scroll to */}
          <div ref={messagesEndRef} />
        </div>
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
