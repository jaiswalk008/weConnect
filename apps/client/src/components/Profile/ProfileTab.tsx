import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Camera, Eye, EyeOff } from 'lucide-react';
import { authActions, type RootState } from '@/context/store';
import ProfileImage from './ProfileImage';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { Label } from '@workspace/ui/components/label';
import { Separator } from '@workspace/ui/components/separator';
import { getCachedAvatars } from '@workspace/ui/components/avatars';
import { cn } from '@workspace/ui/lib/utils';
import axiosInstance from '@/utils/axiosInstance';
import { userAPIs } from '@/api/user';
import { toast } from 'sonner';
import type { userAuthState } from '@/types/user';

interface ProfileTabProps {
  onClose: () => void;
}
interface updateProfileResponse {
  user: userAuthState;
  message: string;
  success: boolean;
}

export default function ProfileTab({ onClose }: ProfileTabProps) {
  const user = useSelector((state: RootState) => state.auth.userData);
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    username: user.username || user.name || '',
    about: user.about || '',
    newPassword: '',
    confirmPassword: '',
  });

  const [selectedImage, setSelectedImage] = useState(user.profile_image || '');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [avatars, setAvatars] = useState<Array<{ seed: string; dataUri: string }>>([]);
  const [isLoadingAvatars, setIsLoadingAvatars] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageSelect = (avatarSeed: string) => {
    setSelectedImage(avatarSeed);
    setShowAvatarPicker(false);
  };

  const validateProfileForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateProfileForm()) return;

    setIsLoadingProfile(true);
    try {
      // Simulate API call
      const response = await axiosInstance.patch<updateProfileResponse>(userAPIs.updateProfile, {
        username: formData.username,
        about: formData.about,
      });

      // Update user data in store
      dispatch(authActions.setUserData(response.data.user));
      toast.success(response.data.message);
    } catch (error) {
      // console.error('Failed to update profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Load avatars when component mounts
  useEffect(() => {
    const loadAvatars = async () => {
      try {
        setIsLoadingAvatars(true);
        // Try to get cached avatars first
        try {
          const cached = getCachedAvatars();
          setAvatars(cached);
        } catch (error) {
          // If not cached, load them asynchronously
          const loadedAvatars = await import('@workspace/ui/components/avatars').then((module) =>
            module.dicebearAvatars(),
          );
          setAvatars(loadedAvatars);
        }
      } catch (error) {
        // console.error('Failed to load avatars:', error);
      } finally {
        setIsLoadingAvatars(false);
      }
    };

    if (showAvatarPicker && avatars.length === 0) {
      loadAvatars();
    }
  }, [showAvatarPicker]);

  const handleSavePassword = async () => {
    if (!validatePasswordForm()) return;

    setIsLoadingPassword(true);
    try {
      // Simulate API call
      await axiosInstance.patch(userAPIs.updatePassword, { newPassword: formData.newPassword });
      setFormData((prev) => ({
        ...prev,
        newPassword: '',
        confirmPassword: '',
      }));

      toast.success('Password updated successfully!');
    } catch (error) {
      // console.error('Failed to update password:', error);
      toast.error('Failed to update password. Please try again.');
    } finally {
      setIsLoadingPassword(false);
    }
  };

  return (
    <div className='flex flex-col h-full bg-background'>
      {/* Content */}
      <div className='flex-1 overflow-y-auto'>
        <div className='p-6 flex flex-col gap-6 max-w-2xl mx-auto w-full'>
          {/* Profile Image Section */}
          <div className='flex flex-col items-center gap-4'>
            <div className='relative'>
              <ProfileImage
                size='large'
                image={selectedImage}
                chatName={formData.username || user.name}
                className='ring-4 ring-border'
              />
              <button
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className='absolute top-10 left-10 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors shadow-lg'
                aria-label='Change profile picture'
              >
                <Camera className='w-5 h-5' />
              </button>
            </div>
            {showAvatarPicker && (
              <div className='w-full p-4 border border-border rounded-lg bg-card'>
                <p className='text-sm font-medium mb-3'>Choose an avatar</p>
                {isLoadingAvatars ? (
                  <div className='grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3'>
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className='w-12 h-12 rounded-full bg-muted animate-pulse' />
                    ))}
                  </div>
                ) : (
                  <div className='grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3'>
                    {avatars.map((avatar) => (
                      <button
                        key={avatar.seed}
                        onClick={() => handleImageSelect(avatar.seed)}
                        className={cn(
                          'w-12 h-12 rounded-full overflow-hidden hover:ring-2 hover:ring-primary transition-all',
                          selectedImage === avatar.seed && 'ring-2 ring-primary',
                        )}
                      >
                        <img
                          src={avatar.dataUri}
                          alt={avatar.seed}
                          className='w-full h-full object-cover'
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Profile Information Section */}
          <div className='flex flex-col gap-4'>
            <h3 className='text-sm font-semibold'>Profile Information</h3>

            {/* Username Section */}
            <div className='flex flex-col gap-2'>
              <Label htmlFor='username' className='text-sm font-medium'>
                Username
              </Label>
              <Input
                id='username'
                name='username'
                type='text'
                value={formData.username}
                onChange={handleInputChange}
                placeholder='Enter your username'
                className={cn(
                  errors.username && 'border-destructive focus-visible:ring-destructive',
                )}
              />
              {errors.username && <p className='text-sm text-destructive'>{errors.username}</p>}
            </div>

            {/* About Section */}
            <div className='flex flex-col gap-2'>
              <Label htmlFor='about' className='text-sm font-medium'>
                About
              </Label>
              <Textarea
                id='about'
                name='about'
                value={formData.about}
                onChange={handleInputChange}
                placeholder='Write something about yourself...'
                className='resize-none min-h-[100px]'
                maxLength={200}
              />
              <p className='text-xs text-muted-foreground text-right'>
                {formData.about.length}/200
              </p>
            </div>

            {/* Save Profile Button */}
            <div className='flex justify-end'>
              <Button
                onClick={handleSaveProfile}
                disabled={isLoadingProfile}
                className='w-full sm:w-auto'
              >
                {isLoadingProfile ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Password Section */}
          <div className='flex flex-col gap-4'>
            <h3 className='text-sm font-semibold'>Change Password</h3>

            {/* New Password */}
            <div className='flex flex-col gap-2'>
              <Label htmlFor='newPassword' className='text-sm font-medium'>
                New Password
              </Label>
              <div className='relative'>
                <Input
                  id='newPassword'
                  name='newPassword'
                  type={showPasswords.new ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  placeholder='Enter new password'
                  className={cn(
                    'pr-10',
                    errors.newPassword && 'border-destructive focus-visible:ring-destructive',
                  )}
                />
                <button
                  type='button'
                  onClick={() => setShowPasswords((prev) => ({ ...prev, new: !prev.new }))}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                  aria-label='Toggle password visibility'
                >
                  {showPasswords.new ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
                </button>
              </div>
              {errors.newPassword && (
                <p className='text-sm text-destructive'>{errors.newPassword}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className='flex flex-col gap-2'>
              <Label htmlFor='confirmPassword' className='text-sm font-medium'>
                Confirm New Password
              </Label>
              <div className='relative'>
                <Input
                  id='confirmPassword'
                  name='confirmPassword'
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder='Confirm new password'
                  className={cn(
                    'pr-10',
                    errors.confirmPassword && 'border-destructive focus-visible:ring-destructive',
                  )}
                />
                <button
                  type='button'
                  onClick={() => setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                  aria-label='Toggle password visibility'
                >
                  {showPasswords.confirm ? (
                    <EyeOff className='w-4 h-4' />
                  ) : (
                    <Eye className='w-4 h-4' />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className='text-sm text-destructive'>{errors.confirmPassword}</p>
              )}
            </div>

            {/* Save Password Button */}
            <div className='flex justify-end'>
              <Button
                onClick={handleSavePassword}
                disabled={isLoadingPassword}
                className='w-full sm:w-auto'
              >
                {isLoadingPassword ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className='flex items-center justify-end gap-3 p-4 border-t border-border shrink-0'>
        <Button variant='outline' onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}
