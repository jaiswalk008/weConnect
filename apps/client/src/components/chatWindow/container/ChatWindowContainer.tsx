import { useEffect, useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Users, MessageSquare } from 'lucide-react';

import type { ChatHistoryResponse } from '@/types/socket';
import { chatActions, type RootState } from '@/context/store';
import { chatAPI } from '@/api/chat';
import { TABS } from '@/constants/tabs';
import axiosInstance from '@/utils/axiosInstance';

import { useFetch } from '@/hooks/useFetch';
import { useMessages } from '@/hooks/useMessages';
import { useCloudFrontSession } from '@/hooks/useCloudFrontSession';
import { useFileUpload } from '@/hooks/useFileUpload';

import { ChatWindowSkeleton } from '../../ui/ChatSkeletonLoader';
import { ChatHeader } from '../components/ChatHeader';
import { MessageList } from '../components/MessageList';
import { MessageInput } from '../components/MessageInput';
import { ChatDetails } from '@/types/socket';
import ChatDetailsComponent from '../ChatDetails';

export interface ChatWindowContainerProps {
  chatDetails: ChatDetails;
  isMobile: boolean;
  showChatWindow: boolean;
  onBack: () => void;
  activeTab: TABS;
}

export const ChatWindowContainer = ({
  chatDetails,
  isMobile,
  showChatWindow,
  onBack,
  activeTab,
}: ChatWindowContainerProps) => {
  const { data, loading, fetchData } = useFetch<ChatHistoryResponse>();
  const dispatch = useDispatch();
  const { chatData, draftMessages } = useSelector((state: RootState) => state.chat);
  const [messageInput, setMessageInput] = useState(draftMessages[chatDetails.chatId] || '');

  // Refs for the messages container and tracking
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const [initialLoad, setInitialLoad] = useState(true);
  const lastMessageCountRef = useRef(0);
  const previousChatIdRef = useRef<number>(0);

  const hasScrolledInitiallyRef = useRef(false);
  const [showDetails, setShowDetails] = useState(false);

  // CloudFront Session Management
  useCloudFrontSession();

  // File Upload
  const { uploadFile, isUploading } = useFileUpload();
  const { sendMessage } = useMessages(chatDetails.chatId);

  // Pagination states
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const isPaginationRef = useRef(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Determine media type roughly
    let mediaType = 'OTHER';
    if (file.type.startsWith('image/')) mediaType = 'IMAGE';
    else if (file.type.startsWith('video/')) mediaType = 'VIDEO';
    else if (file.type.startsWith('audio/')) mediaType = 'AUDIO';
    else if (file.type === 'application/pdf') mediaType = 'DOCUMENT';

    const result = await uploadFile(file);

    if (result) {
      // Send message with media
      sendMessage(undefined, result.publicUrl, mediaType);
      // Clear input happens in MessageInput via ref, strictly we passed ref but
      // MessageInput handles the click and change.
      // Reuse ref here if needed or just let it consist.
      // Actually we passed handleFileSelect which gets the event.
      // We need to clear the input value manually if we want to allow selecting same file again.
      e.target.value = '';
    }
  };

  const handleAudioSubmit = async (file: File) => {
    const result = await uploadFile(file);
    if (result) {
      sendMessage(undefined, result.publicUrl, 'AUDIO');
    }
  };

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
    if (!messagesEndRef.current) return;
    messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
    setIsAtBottom(true);
    setNewMessageCount(0);
  }, []);

  // Load more messages (pagination)
  const loadMoreMessages = useCallback(async () => {
    if (!nextCursor || isFetchingMore) return;

    setIsFetchingMore(true);
    const container = messagesContainerRef.current;

    // Capture curent scroll height and scroll top
    const previousScrollHeight = container ? container.scrollHeight : 0;
    const previousScrollTop = container ? container.scrollTop : 0;

    try {
      const response = await axiosInstance.get(
        `${chatAPI.fetchChatHistory}?chatId=${chatDetails.chatId}&cursor=${nextCursor}`,
      );

      if (response.data.success) {
        const { chatHistory, nextCursor: newCursor } = response.data;

        if (chatHistory.length > 0) {
          // Prepend messages to redux store
          isPaginationRef.current = true;
          dispatch(chatActions.prependChatData(chatHistory));
          setNextCursor(newCursor ?? null);

          // Maintain scroll position after render
          setTimeout(() => {
            if (messagesContainerRef.current) {
              const newScrollHeight = messagesContainerRef.current.scrollHeight;
              messagesContainerRef.current.scrollTop =
                newScrollHeight - previousScrollHeight + previousScrollTop;
            }
          }, 0);
        } else {
          setNextCursor(null);
        }
      }
    } catch (error) {
      console.error('Failed to load more messages:', error);
    } finally {
      setIsFetchingMore(false);
    }
  }, [chatDetails.chatId, nextCursor, isFetchingMore, dispatch]);

  // Handle scroll events
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    // Check if near top to load more
    if (container.scrollTop < 50 && nextCursor && !isFetchingMore) {
      loadMoreMessages();
    }

    const atBottom = checkIfAtBottom();
    setIsAtBottom(atBottom);

    // If user scrolls back to bottom manually, clear new message count
    if (atBottom && newMessageCount > 0) {
      setNewMessageCount(0);
    }
  }, [checkIfAtBottom, newMessageCount, nextCursor, isFetchingMore, loadMoreMessages]);

  useEffect(() => {
    setMessageInput(draftMessages[chatDetails.chatId] || '');
  }, [draftMessages, chatDetails.chatId]);

  // Reset states when chat changes
  useEffect(() => {
    if (previousChatIdRef.current !== chatDetails.chatId) {
      setIsAtBottom(true);
      setNewMessageCount(0);
      setInitialLoad(true);
      setNextCursor(null);
      setIsFetchingMore(false);
      lastMessageCountRef.current = 0;
      previousChatIdRef.current = chatDetails.chatId;
      hasScrolledInitiallyRef.current = false;
      setShowDetails(false);
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
      setNextCursor(data.nextCursor ?? null);
    }
  }, [chatDetails.chatId, dispatch, data]);

  // Handle initial scroll position after messages are loaded
  useEffect(() => {
    if (chatData.length > 0 && initialLoad && !hasScrolledInitiallyRef.current) {
      setTimeout(() => {
        scrollToRecent();
        setInitialLoad(false);
        lastMessageCountRef.current = chatData.length;
        hasScrolledInitiallyRef.current = true;
      }, 100);
    }
  }, [chatData.length, initialLoad, scrollToRecent]);

  // Handle new messages
  useEffect(() => {
    if (chatData.length > 0 && !initialLoad && hasScrolledInitiallyRef.current) {
      if (isPaginationRef.current) {
        lastMessageCountRef.current = chatData.length;
        isPaginationRef.current = false;
        return;
      }

      const actualNewMessages = chatData.length - lastMessageCountRef.current;

      if (actualNewMessages > 0) {
        if (isAtBottom) {
          setTimeout(() => scrollToBottom('auto'), 50);
        } else {
          setNewMessageCount((prev) => prev + actualNewMessages);
        }
      }
      lastMessageCountRef.current = chatData.length;
    }
  }, [chatData.length, isAtBottom, scrollToBottom, initialLoad]);

  const handleSendMessage = () => {
    if (messageInput.trim() === '' && !isUploading) return;
    sendMessage(messageInput.trim());
    dispatch(chatActions.clearDraftMessage(chatDetails.chatId));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageInput(e.target.value);
    dispatch(
      chatActions.setDraftMessage({
        chatId: chatDetails.chatId,
        message: e.target.value,
      }),
    );
  };

  if (isMobile && !showChatWindow) return null;
  if (loading) return <ChatWindowSkeleton />;

  if (!chatDetails.chatId) {
    return (
      <div className='flex-1 flex items-center justify-center bg-background'>
        {activeTab === 'chats' ? (
          <div className='text-center text-muted-foreground'>
            <MessageSquare className='w-16 h-16 mx-auto mb-4 opacity-20' />
            <p className='text-lg'>Select a chat to start messaging</p>
          </div>
        ) : (
          <div className='text-center text-muted-foreground'>
            <Users className='w-16 h-16 mx-auto mb-4 opacity-20' />
            <p className='text-lg font-semibold mb-2'>Connect with Friends</p>
            <p className='text-sm max-w-sm mx-auto'>
              View your friends, manage connections, and stay in touch with your network
            </p>
          </div>
        )}
      </div>
    );
  }

  if (showDetails) {
    return (
      <div className='flex-1 flex flex-col h-full min-w-0 bg-background'>
        <ChatDetailsComponent chatId={chatDetails.chatId} onBack={() => setShowDetails(false)} />
      </div>
    );
  }

  return (
    <div className='flex-1 flex flex-col h-full w-full bg-background'>
      <ChatHeader
        chatDetails={chatDetails}
        isMobile={isMobile}
        onBack={onBack}
        onShowDetails={() => setShowDetails(true)}
      />

      <MessageList
        messages={chatData}
        chatDetails={chatDetails}
        messagesContainerRef={messagesContainerRef}
        messagesEndRef={messagesEndRef}
        handleScroll={handleScroll}
        isFetchingMore={isFetchingMore}
        newMessageCount={newMessageCount}
        scrollToBottom={scrollToBottom}
      />

      <MessageInput
        messageInput={messageInput}
        handleInputChange={handleInputChange}
        handleKeyPress={handleKeyPress}
        handleSendMessage={handleSendMessage}
        handleFileSelect={handleFileSelect}
        handleAudioSubmit={handleAudioSubmit}
        isUploading={isUploading}
      />
    </div>
  );
};
