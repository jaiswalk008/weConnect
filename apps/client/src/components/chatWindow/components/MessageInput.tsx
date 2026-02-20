import { useRef, useState, useEffect } from 'react';
import { Smile, Paperclip, Mic, Send, Loader2, Square, Trash2 } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Textarea } from '@workspace/ui/components/textarea';

interface MessageInputProps {
  messageInput: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleKeyPress: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  handleSendMessage: () => void;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleAudioSubmit?: (file: File) => Promise<void>;
  isUploading: boolean;
}

export const MessageInput = ({
  messageInput,
  handleInputChange,
  handleKeyPress,
  handleSendMessage,
  handleFileSelect,
  handleAudioSubmit,
  isUploading,
}: MessageInputProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Audio recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [, setAudioChunks] = useState<Blob[]>([]);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const handlePaperclipClick = () => {
    fileInputRef.current?.click();
  };

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      setAudioChunks([]);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
          setAudioChunks((prev) => [...prev, e.data]);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Could not access microphone.');
    }
  };

  const stopAndSendRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const file = new File([audioBlob], 'voice-message.webm', { type: 'audio/webm' });
        
        if (handleAudioSubmit) {
          await handleAudioSubmit(file);
        }
        
        // Cleanup
        mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop());
        setIsRecording(false);
        setRecordingDuration(0);
        chunksRef.current = [];
        setAudioChunks([]);
      };
      
      mediaRecorderRef.current.stop();
    }
  };

  const cancelRecording = () => {
     if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.onstop = () => {
          // Cleanup without sending
          mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop());
          setIsRecording(false);
          setRecordingDuration(0);
          chunksRef.current = [];
          setAudioChunks([]);
        };
        mediaRecorderRef.current.stop();
     }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className='p-3 md:p-4 border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='flex items-center gap-1 md:gap-2'>
        <Button
          variant='ghost'
          className='w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center hover:bg-accent transition-colors shrink-0'
        >
          <Smile className='w-4 h-4 md:w-5 md:h-5 text-muted-foreground' />
        </Button>
        <input type='file' ref={fileInputRef} onChange={handleFileSelect} className='hidden' />
        <Button
          variant='ghost'
          onClick={handlePaperclipClick}
          disabled={isUploading}
          className='w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center hover:bg-accent transition-colors shrink-0'
        >
          {isUploading ? (
            <Loader2 className='w-4 h-4 animate-spin text-muted-foreground' />
          ) : (
            <Paperclip className='w-4 h-4 md:w-5 md:h-5 text-muted-foreground' />
          )}
        </Button>

        {isRecording ? (
          <div className='flex-1 flex items-center justify-between px-4 bg-secondary/50 rounded-lg h-10'>
            <div className='flex items-center gap-3'>
              <div className='w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse' />
              <span className='text-sm font-medium text-foreground'>{formatDuration(recordingDuration)}</span>
            </div>
            
             <Button
                variant='ghost'
                size='icon'
                onClick={cancelRecording}
                className='h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10'
              >
                <Trash2 className='h-4 w-4' />
              </Button>
          </div>
        ) : (
          <Textarea
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            value={messageInput}
            placeholder='Type a message...'
            rows={1}
            className='flex-1 min-w-0 min-h-[40px] px-3 py-2 break-all whitespace-pre-wrap md:px-4 bg-secondary rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none'
          />
        )}

        {!isRecording ? (
          <Button 
            variant='ghost' 
            onClick={startRecording}
            disabled={isUploading || messageInput.trim().length > 0}
            className='w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center hover:bg-accent transition-colors shrink-0 disabled:opacity-50'
          >
            <Mic className='w-4 h-4 md:w-5 md:h-5 text-muted-foreground' />
          </Button>
        ) : (
           <Button 
            variant='ghost' 
            onClick={stopAndSendRecording}
            className='w-8 h-8 md:w-10 md:h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center hover:bg-primary/20 transition-colors shrink-0'
          >
            <Square className='w-4 h-4 md:w-5 md:h-5 fill-current' />
          </Button>
        )}
        
        {!isRecording && (
          <Button
            onClick={handleSendMessage}
            disabled={isUploading || messageInput.trim().length === 0}
            className='w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity shrink-0 disabled:opacity-50'
          >
            <Send className='w-4 h-4 md:w-5 md:h-5' />
          </Button>
        )}
      </div>
    </div>
  );
};
