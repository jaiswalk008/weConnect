import type { RootState } from '@/context/store';
import type { MessageData } from '@/types/socket';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { formatTime } from '@/utils/dateUtils';
import { MessageStatus } from './MessageStatus';
import type { MessageStatus as MessageStatusType } from '@/types/socket';
import Linkify from 'linkify-react';
import { FileIcon, Download, Play, Pause } from 'lucide-react';
import { ImageViewer } from './components/ImageViewer';
import { AudioPlayer } from './components/AudioPlayer';

interface MessageBubbleProps {
  message: MessageData;
}

const getFileNameFromUrl = (url: string) => {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    const pathname = urlObj.pathname;
    const segments = pathname.split('/');
    const lastSegment = segments.pop() || '';
    return decodeURIComponent(lastSegment);
  } catch (e) {
    return 'File';
  }
};

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const userData = useSelector((state: RootState) => state.auth.userData);
  const isSender = useMemo(
    () => message.sender.username === userData?.username,
    [message, userData],
  );

  const [isImageOpen, setIsImageOpen] = useState(false);

  const linkifyOptions = {
    className: 'underline hover:opacity-80 transition-opacity',
    target: '_blank',
    rel: 'noopener noreferrer',
  };

  const renderMedia = () => {
    if (!message.mediaUrl) return null;

    const mediaType = message.mediaType || 'OTHER';
    let mediaUrl = message.mediaUrl;

    if (mediaUrl && !mediaUrl.startsWith('http')) {
      mediaUrl = `https://${mediaUrl}`;
    }

    if (mediaType === 'IMAGE') {
      return (
        <div className='mb-2 rounded-lg overflow-hidden max-w-full'>
          <img
            src={mediaUrl}
            alt='Shared image'
            className='max-h-60 md:max-h-96 w-auto object-cover cursor-pointer hover:opacity-90 transition-opacity'
            onClick={() => setIsImageOpen(true)}
          />

          <ImageViewer
            isOpen={isImageOpen}
            onClose={() => setIsImageOpen(false)}
            imageUrl={mediaUrl}
          />
        </div>
      );
    }

    if (mediaType === 'VIDEO') {
      return (
        <div className='mb-2 rounded-lg overflow-hidden max-w-full bg-black/10'>
          <video controls className='max-h-60 w-auto' src={mediaUrl}>
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }
    
    if (mediaType === 'AUDIO') {
      return (
        <div className='mb-2 overflow-hidden w-full'>
          <AudioPlayer src={mediaUrl} isSender={isSender} />
        </div>
      );
    }

    // For other files (PDF, Audio fallback, etc.)
    const fileName = getFileNameFromUrl(mediaUrl);

    return (
      <a
        href={mediaUrl}
        target='_blank'
        rel='noopener noreferrer'
        className={`flex items-center gap-3 p-3 mb-2 rounded-lg border ${
          isSender
            ? 'border-primary-foreground/20 bg-primary-foreground/10'
            : 'border-border bg-background/50'
        } transition-colors hover:bg-black/5`}
      >
        <div
          className={`p-2 rounded-full ${isSender ? 'bg-primary-foreground/20' : 'bg-background/80'}`}
        >
          <FileIcon
            className={`w-4 h-4 ${isSender ? 'text-primary-foreground' : 'text-primary'}`}
          />
        </div>
        <div className='flex-1 min-w-0'>
          <p className='text-sm font-medium truncate opacity-90'>{fileName}</p>
          <p className='text-xs opacity-70 uppercase'>{mediaType}</p>
        </div>
        <Download className='w-4 h-4 opacity-70' />
      </a>
    );
  };

  return (
    <div className={`flex w-full ${isSender ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] md:max-w-[70%] px-3 py-2 md:px-4 rounded-2xl ${
          isSender
            ? 'bg-primary text-primary-foreground rounded-br-sm'
            : 'bg-card text-card-foreground rounded-bl-sm'
        }`}
      >
        {renderMedia()}

        {message.content && (
          <Linkify options={linkifyOptions}>
            <p className='text-sm break-all whitespace-pre-wrap'>{message.content}</p>
          </Linkify>
        )}

        <div className='flex items-center justify-end gap-1 mt-1'>
          <span
            className={`text-xs ${
              isSender ? 'text-primary-foreground/70' : 'text-muted-foreground'
            }`}
          >
            {formatTime(message.createdAt)}
          </span>
          {isSender && message.status && (
            <MessageStatus status={message.status as MessageStatusType} isSentByMe={isSender} />
          )}
        </div>
      </div>
    </div>
  );
};
