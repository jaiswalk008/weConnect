import { ArrowLeft, User, Users, Calendar } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';

import { Separator } from '@workspace/ui/components/separator';
import { ChatDetailsResponse } from '@/types/chat'; // We will need to define this or reuse existing types
import ProfileImage from '../Profile/ProfileImage';
import { useEffect, useState } from 'react';
import { useFetch } from '@/hooks/useFetch';
import { format } from 'date-fns';
import { Skeleton } from '@workspace/ui/components/skeleton';

interface ChatDetailsProps {
  chatId: number;
  onBack: () => void;
}

export const ChatDetails = ({ chatId, onBack }: ChatDetailsProps) => {
  const { data, loading, error, fetchData } = useFetch<{ data: ChatDetailsResponse }>();
  const [chatDetails, setChatDetails] = useState<ChatDetailsResponse | null>(null);

  useEffect(() => {
    if (chatId) {
      fetchData(`/api/chat/${chatId}/details`);
    }
  }, [chatId, fetchData]);

  useEffect(() => {
    if (data?.data) {
      setChatDetails(data.data);
    }
  }, [data]);

  if (loading) {
    return (
      <div className='flex flex-col h-full w-full bg-background'>
        {/* Header Skeleton */}
        <div className='flex items-center gap-3 p-4 border-b border-border bg-card'>
          <Skeleton className='w-8 h-8 rounded-md' />
          <Skeleton className='w-32 h-6' />
        </div>

        <div className='flex-1 overflow-y-auto min-h-0'>
          <div className='flex flex-col items-center p-6 gap-4'>
            {/* Profile Skeleton */}
            <div className='flex flex-col items-center gap-4 w-full'>
              <Skeleton className='w-20 h-20 rounded-full' />
              <div className='flex flex-col items-center gap-2'>
                <Skeleton className='w-48 h-8' />
                <Skeleton className='w-32 h-4' />
              </div>
            </div>

            <Separator className='w-full max-w-md bg-border/50' />

            <div className='w-full max-w-2xl flex flex-col gap-4'>
              {/* Description Skeleton */}
              <div className='bg-card rounded-xl p-5 border border-border shadow-sm'>
                <Skeleton className='w-24 h-4 mb-3' />
                <Skeleton className='w-full h-4 mb-2' />
                <Skeleton className='w-2/3 h-4' />
              </div>

              {/* Group Info Skeleton */}
              <div className='bg-card rounded-xl p-4 border border-border shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div className='flex items-center gap-3'>
                  <Skeleton className='w-8 h-8 rounded-full' />
                  <div className='space-y-1'>
                    <Skeleton className='w-16 h-3' />
                    <Skeleton className='w-24 h-4' />
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <Skeleton className='w-8 h-8 rounded-full' />
                  <div className='space-y-1'>
                    <Skeleton className='w-16 h-3' />
                    <Skeleton className='w-24 h-4' />
                  </div>
                </div>
              </div>

              {/* Participants Skeleton */}
              <div className='bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col'>
                <div className='p-4 border-b border-border bg-muted/30 flex items-center justify-between'>
                  <Skeleton className='w-24 h-5' />
                  <Skeleton className='w-8 h-5 rounded-full' />
                </div>
                <div className='p-2 space-y-2'>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className='flex items-center gap-3 p-3'>
                      <Skeleton className='w-10 h-10 rounded-full' />
                      <div className='flex-1 space-y-2'>
                        <Skeleton className='w-32 h-4' />
                        <Skeleton className='w-24 h-3' />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !chatDetails) {
    return (
      <div className='flex flex-col items-center justify-center h-full bg-background gap-4'>
        <p className='text-muted-foreground'>Failed to load chat details</p>
        <Button onClick={onBack} variant='outline'>
          Go Back
        </Button>
      </div>
    );
  }

  const isGroup = chatDetails.type === 'GROUP';

  return (
    <div className='flex flex-col h-full w-full max-w-full bg-background animate-in fade-in slide-in-from-right-4 duration-300 overflow-hidden'>
      {/* Header */}
      <div className='flex items-center gap-3 p-4 border-b border-border bg-card'>
        <Button onClick={onBack} variant='ghost' size='icon' className='shrink-0'>
          <ArrowLeft className='w-5 h-5 text-foreground' />
        </Button>
        <h2 className='font-semibold text-foreground text-lg'>Contact Info</h2>
      </div>

      <div className='flex-1 overflow-y-auto min-h-0'>
        <div className='flex flex-col items-center p-6 gap-4'>
          {/* Profile Header */}
          <div className='flex flex-col items-center gap-4 w-full'>
            <ProfileImage
              size='large'
              image={chatDetails.image || ''}
              chatName={chatDetails.name || 'Chat'}
              className='w-20 h-20 text-3xl shadow-md'
            />
            <div className='text-center'>
              <h1 className='text-2xl font-bold text-foreground'>{chatDetails.name}</h1>
              <p className='text-muted-foreground text-sm mt-1'>
                {chatDetails.type === 'PERSONAL'
                  ? chatDetails.participants.find((p) => p.username === chatDetails.name)?.username // Try to find handle
                  : `${chatDetails.participants.length} participants`}
              </p>
            </div>
          </div>

          <Separator className='w-full max-w-md bg-border/50' />

          {/* About / Description */}
          <div className='w-full max-w-2xl flex flex-col gap-4'>
            {(chatDetails.description || !isGroup) && (
              <div className='bg-card rounded-xl p-5 border border-border shadow-sm'>
                <h3 className='text-xs font-semibold text-primary uppercase tracking-wider mb-3'>
                  {isGroup ? 'Description' : 'About'}
                </h3>
                <p className='text-foreground text-sm leading-relaxed whitespace-pre-wrap'>
                  {chatDetails.description ||
                    (isGroup ? 'No description available.' : 'Hey there! I am using weConnect.')}
                </p>
              </div>
            )}

            {/* Group Info - Moved to Top */}
            {isGroup && (
              <div className='bg-card rounded-xl p-4 border border-border shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div className='flex items-center gap-3'>
                  <div className='p-2 bg-primary/10 rounded-full'>
                    <Calendar className='w-4 h-4 text-primary' />
                  </div>
                  <div>
                    <p className='text-xs text-muted-foreground font-medium'>Created on</p>
                    <p className='text-sm text-foreground'>
                      {format(new Date(chatDetails.createdAt), 'MMMM d, yyyy')}
                    </p>
                  </div>
                </div>
                {chatDetails.createdBy && (
                  <div className='flex items-center gap-3'>
                    <div className='p-2 bg-primary/10 rounded-full'>
                      <User className='w-4 h-4 text-primary' />
                    </div>
                    <div>
                      <p className='text-xs text-muted-foreground font-medium'>Created by</p>
                      <p className='text-sm text-foreground'>{chatDetails.createdBy.name}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!isGroup && chatDetails.createdAt && (
              <div className='bg-card rounded-xl p-4 border border-border shadow-sm flex items-center gap-3'>
                <div className='p-2 bg-primary/10 rounded-full'>
                  <Calendar className='w-4 h-4 text-primary' />
                </div>
                <div>
                  <p className='text-xs text-muted-foreground font-medium'>Joined</p>
                  <p className='text-sm text-foreground'>
                    {format(new Date(chatDetails.createdAt), 'MMMM d, yyyy')}
                  </p>
                </div>
              </div>
            )}

            {/* Participants (Group Only) */}
            {isGroup && (
              <div className='bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col'>
                <div className='p-4 border-b border-border bg-muted/30 flex items-center justify-between'>
                  <h3 className='text-sm font-semibold text-foreground flex items-center gap-2'>
                    <Users className='w-4 h-4 text-primary' />
                    Participants
                  </h3>
                  <span className='text-xs bg-background px-2 py-1 rounded-full border border-border text-muted-foreground'>
                    {chatDetails.participants.length}
                  </span>
                </div>
                <div className='flex-1 overflow-visible'>
                  {chatDetails.participants.map((participant, index) => (
                    <div
                      key={participant.id}
                      className={`flex items-center gap-3 p-3 hover:bg-muted/50 transition-all cursor-pointer ${index !== chatDetails.participants.length - 1 ? 'border-b border-border/50' : ''}`}
                    >
                      <ProfileImage
                        size='medium'
                        image={participant.profile_image || ''}
                        chatName={participant.name}
                        className='w-10 h-10'
                      />
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center justify-between'>
                          <p className='font-medium text-sm text-foreground truncate'>
                            {participant.name}
                          </p>
                          {participant.role === 'ADMIN' && (
                            <span className='text-[10px] uppercase font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20'>
                              Admin
                            </span>
                          )}
                        </div>
                        <p className='text-xs text-muted-foreground truncate max-w-[180px]'>
                          {participant.about || 'Available'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatDetails;
