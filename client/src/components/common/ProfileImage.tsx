import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useMemo } from 'react';
import { dicebearAvatars } from '../ui/avatars';

export default function ProfileImage({ image, chatName }: { image: string; chatName: string }) {
  const chatImage = useMemo(() => {
    if (image?.includes('profile')) {
      return dicebearAvatars.find(avatar => avatar.seed === image)?.dataUri;
    }
    return image;
  }, [image]);

  return (
    <Avatar className="w-12 h-12 shrink-0">
      <AvatarImage src={chatImage} alt={chatName} />
      <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
        {chatName[0]}
      </AvatarFallback>
    </Avatar>
  );
}
