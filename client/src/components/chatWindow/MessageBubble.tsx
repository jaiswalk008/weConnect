interface Message {
  id: string;
  text: string;
  timestamp: string;
  isSender: boolean;
}

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  return (
    <div 
      className={`flex w-full ${message.isSender ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[75%] md:max-w-[70%] px-3 py-2 md:px-4 rounded-2xl ${
          message.isSender
            ? 'bg-primary text-primary-foreground rounded-br-sm'
            : 'bg-card text-card-foreground rounded-bl-sm'
        }`}
      >
        <p className="text-sm break-words whitespace-pre-wrap">{message.text}</p>
        <p className={`text-xs mt-1 ${
          message.isSender ? 'text-primary-foreground/70' : 'text-muted-foreground'
        }`}>
          {message.timestamp}
        </p>
      </div>
    </div>
  );
};
