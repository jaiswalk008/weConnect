import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Button,
  Input,
  Label,
  dicebearAvatars,
} from '@weconnect/ui';
import { Upload, Check } from 'lucide-react';
import axiosInstance from '@/utils/axiosInstance';
import { userAPIs } from '@/api/user';
import { updateUsername, updateProfileImage } from '@/services/user';
import { useDispatch } from 'react-redux';
import { authActions } from '@/context/store';
import { toast } from 'sonner';

export function ProfileSetupModal({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (_open: boolean) => void;
}) {
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string>('profile-0');
  const [uploadedImage, setUploadedImage] = useState<string>('');
  const [useUpload, setUseUpload] = useState(false);
  const [avatars, setAvatars] = useState<Array<{id: string; seed: string; styleName: string; dataUri: string}>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();

  // Load avatars when component mounts
  useEffect(() => {
    const loadAvatars = async () => {
      try {
        const loadedAvatars = await dicebearAvatars();
        setAvatars(loadedAvatars);
      } catch (error) {
        console.error('Failed to load avatars:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAvatars();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setUseUpload(true);
        setSelectedAvatar('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarSelect = (seed: string) => {
    setSelectedAvatar(seed);
    setUseUpload(false);
  };

  const handleSubmit = async () => {
    try {
      const [, response2] = await Promise.all([
        updateUsername(username),
        updateProfileImage(useUpload ? uploadedImage : selectedAvatar),
        axiosInstance.get(userAPIs.me),
      ]);
      dispatch(authActions.setUserData(response2.data.user));

      setOpen(false);
    } catch (error: any) {
      toast.error(error.response.data.message || 'Failed to update profile');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild></DialogTrigger>
      <DialogContent
        className="max-w-[90%] [&>button]:hidden md:max-w-[600px] max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Setup Your Profile</DialogTitle>
          <DialogDescription>
            Enter your username and choose a professional profile picture
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Username Input */}
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* Upload Photo Section */}
          <div className="space-y-2">
            <Label>Profile Photo</Label>
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md cursor-pointer hover:bg-secondary/80 transition"
                >
                  <Upload className="w-4 h-4" />
                  Upload Photo
                </label>
              </div>
              {uploadedImage && (
                <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-primary">
                  <img src={uploadedImage} alt="Uploaded" className="w-full h-full object-cover" />
                  {useUpload && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <Check className="w-6 h-6 text-primary" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Avatar Selection */}
          <div className="space-y-3">
            <Label>Or Choose an Avatar</Label>
            {isLoading ? (
              <div className="grid grid-cols-4 gap-3">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="w-full aspect-square rounded-full bg-muted animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-3">
                {avatars.map((avatar) => (
                  <button
                    key={avatar.id}
                    onClick={() => handleAvatarSelect(avatar.seed)}
                    className={`relative w-full aspect-square rounded-full overflow-hidden border-2 transition-all hover:scale-105 ${
                      selectedAvatar === avatar.seed && !useUpload
                        ? 'border-primary ring-2 ring-primary ring-offset-2'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <img
                      src={avatar.dataUri}
                      alt={`Avatar ${avatar.id}`}
                      className="w-full h-full object-cover bg-linear-to-br from-blue-50 to-purple-50"
                    />
                    {selectedAvatar === avatar.seed && !useUpload && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <Check className="w-5 h-5 text-primary" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!username || (!selectedAvatar && !uploadedImage)}
          >
            Save Profile
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
