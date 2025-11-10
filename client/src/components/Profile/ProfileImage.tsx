import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useMemo } from 'react';
import { dicebearAvatars } from '../ui/avatars';
import { cn } from '@/lib/utils';

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
  const chatImage = useMemo(() => {
    if (image?.includes('profile')) {
      return dicebearAvatars.find(avatar => avatar.seed === image)?.dataUri;
    }
    return image;
  }, [image]);

  return (
    <Avatar className={cn(sizeClasses[size], 'shrink-0', className)}>
      <AvatarImage src={chatImage} alt={chatName} />
      <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
        {chatName[0]}
      </AvatarFallback>
    </Avatar>
  );
}
