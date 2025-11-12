import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import { useEffect, useState } from 'react';
import { cn } from '@workspace/ui/lib/utils';
import { getCachedAvatars } from '@workspace/ui/components/avatars';

const sizeClasses = {
  small: 'w-8 h-8',
  medium: 'w-12 h-12',
  large: 'w-16 h-16',
};

export default function ProfileImage({
  size,
  image,
  chatName,
  className,
}: {
  size: 'small' | 'medium' | 'large';
  image: string;
  chatName: string;
  className?: string;
}) {
  const [chatImage, setChatImage] = useState(image);

  useEffect(() => {
    const updateAvatar = () => {
      try {
        if (image?.includes('profile')) {
          const avatars = getCachedAvatars();
          const avatar = avatars.find((a) => a.seed === image);
          if (avatar) {
            setChatImage(avatar.dataUri);
            return;
          }
        }
        setChatImage(image);
      } catch (error) {
        // console.error('Error loading avatar:', error);
        setChatImage(image);
      }
    };

    updateAvatar();
  }, [image]);

  return (
    <Avatar className={cn(sizeClasses[size], 'shrink-0', className)}>
      <AvatarImage src={chatImage} alt={chatName} />
      <AvatarFallback
        className={cn(
          'bg-primary text-primary-foreground font-semibold flex items-center justify-center w-full h-full rounded-full',
          className,
        )}
      >
        {chatName[0]}
      </AvatarFallback>
    </Avatar>
  );
}
