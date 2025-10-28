import { ArrowLeft, Phone, Video, MoreVertical, Smile, Paperclip, Mic, Send } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { MessageSquare } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  timestamp: string;
  isSender: boolean;
}

interface ChatWindowProps {
  chatId?: string;
  isMobile: boolean;
  showChatWindow: boolean;
  onBack: () => void;
}

const MOCK_MESSAGES: Message[] = [
  { id: '1', text: 'Hey! How are you doing?', timestamp: '10:25 AM', isSender: false },
  {
    id: '2',
    text: "I'm good! Thanks for asking. How about you?",
    timestamp: '10:26 AM',
    isSender: true,
  },
  { id: '3', text: 'Doing great! Want to catch up later?', timestamp: '10:27 AM', isSender: false },
  { id: '4', text: 'Sure! What time works for you?', timestamp: '10:28 AM', isSender: true },
  { id: '5', text: 'How about 3 PM?', timestamp: '10:29 AM', isSender: false },
  { id: '6', text: 'Perfect! See you then 👍', timestamp: '10:30 AM', isSender: true },
];

export const ChatWindow = ({ chatId, isMobile, showChatWindow, onBack }: ChatWindowProps) => {
  if (isMobile && !showChatWindow) return null;

  if (!chatId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center text-muted-foreground">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg">Select a chat to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full w-full bg-background">
      {/* Chat Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-card">
        {isMobile && (
          <button onClick={onBack} className="mr-2 flex-shrink-0" aria-label="Back">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
        )}

        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold flex-shrink-0">
          J
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-foreground truncate">John Doe</h2>
          <p className="text-xs text-muted-foreground">Online</p>
        </div>

        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
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
      <div className="flex-1 overflow-y-auto px-3 py-4 md:px-4 bg-secondary/30">
        <div className="flex flex-col gap-2 w-full max-w-full">
          {MOCK_MESSAGES.map(message => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-3 md:p-4 border-t border-border bg-card">
        <div className="flex items-center gap-1 md:gap-2">
          <button className="w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center hover:bg-accent transition-colors flex-shrink-0">
            <Smile className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
          </button>
          <button className="w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center hover:bg-accent transition-colors flex-shrink-0">
            <Paperclip className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
          </button>

          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 min-w-0 px-3 py-2 md:px-4 bg-secondary rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />

          <button className="w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center hover:bg-accent transition-colors flex-shrink-0">
            <Mic className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
          </button>
          <button className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity flex-shrink-0">
            <Send className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
