import { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, ArrowRight, Upload, X, Search, Loader2 } from 'lucide-react';
import type { RootState } from '@/context/store';
import ProfileImage from '../common/ProfileImage';
import axiosInstance from '@/utils/axiosInstance';
import { toast } from 'sonner';

interface GroupFormData {
  groupName: string;
  description: string;
  chatImage: string;
  users: string[];
}
interface CreateGroupModalProps {
  open: boolean;
  onOpenChange: (_open: boolean) => void;
}
export default function CreateGroupModal({ open, onOpenChange }: CreateGroupModalProps) {
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const user = useSelector((state: RootState) => state.auth.userData);
  const [formData, setFormData] = useState<GroupFormData>({
    groupName: '',
    description: '',
    chatImage: '',
    users: [user?.username || user.name],
  });
  const [loading, setLoading] = useState(false);
  // Get all friends from Redux (combine online and offline)
  const { onlineFriends, offlineFriends } = useSelector((state: RootState) => state.friend);
  const allFriends = useMemo(
    () => [...onlineFriends, ...offlineFriends],
    [onlineFriends, offlineFriends]
  );

  // Get selected friend objects for display
  const selectedFriendObjects = useMemo(() => {
    return allFriends.filter(friend => formData.users.includes(friend.username));
  }, [allFriends, formData.users]);

  // Filter friends based on search query
  const filteredFriends = useMemo(() => {
    if (!searchQuery.trim()) return allFriends;
    const query = searchQuery.toLowerCase();
    return allFriends.filter(
      friend =>
        friend.name.toLowerCase().includes(query) || friend.username.toLowerCase().includes(query)
    );
  }, [allFriends, searchQuery]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      console.log(imageUrl);
      setFormData(prev => ({
        ...prev,
        chatImage: imageUrl,
      }));
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      chatImage: '',
    }));
  };

  const toggleFriendSelection = (username: string) => {
    setFormData(prev => ({
      ...prev,
      users: prev.users.includes(username)
        ? prev.users.filter(u => u !== username)
        : [...prev.users, username],
    }));
  };

  const removeFriendFromSelection = (username: string) => {
    setFormData(prev => ({
      ...prev,
      users: prev.users.filter(u => u !== username),
    }));
  };

  const handleNext = () => {
    if (step === 1 && formData.groupName.trim()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const resetModal = () => {
    setStep(1);
    setSearchQuery('');
    setFormData({
      groupName: '',
      description: '',
      chatImage: '',
      users: [],
    });
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await axiosInstance.post('/api/group', formData);
      resetModal();
    } catch (error) {
      console.log(error);
      toast.error('Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  const isStep1Valid = formData.groupName.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{/* Trigger handled externally */}</DialogTrigger>
      <DialogContent className="max-w-md w-full p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-border">
          <DialogTitle className="text-foreground">
            {step === 1 ? 'Create New Group' : 'Add Members'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {step === 1
              ? 'Enter group details'
              : `${formData.users.length} member${formData.users.length !== 1 ? 's' : ''} selected`}
          </DialogDescription>
        </DialogHeader>

        {/* Content - Fixed Height */}
        <div className="flex flex-col gap-4 px-6 py-4 h-[400px] overflow-y-auto">
          {step === 1 ? (
            // Step 1: Group Details Form
            <>
              {/* Image Upload */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="group-image" className="text-foreground">
                  Group Image
                </Label>
                {formData.chatImage ? (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted">
                    <img
                      src={formData.chatImage}
                      alt="Group preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={removeImage}
                      className="absolute top-1 right-1 p-1 rounded-full bg-destructive hover:bg-destructive/90 transition-colors"
                      aria-label="Remove image"
                    >
                      <X className="w-3 h-3 text-destructive-foreground" />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="group-image"
                    className="flex items-center justify-center gap-2 w-24 h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary hover:bg-accent transition-colors"
                  >
                    <Upload className="w-5 h-5 text-muted-foreground" />
                  </label>
                )}
                <input
                  id="group-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              {/* Group Name */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="group-name" className="text-foreground">
                  Group Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="group-name"
                  placeholder="Enter group name"
                  value={formData.groupName}
                  onChange={e => setFormData(prev => ({ ...prev, groupName: e.target.value }))}
                  className="bg-background text-foreground border-border"
                />
              </div>

              {/* Group Description */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="group-description" className="text-foreground">
                  Description
                </Label>
                <Textarea
                  id="group-description"
                  placeholder="Enter group description (optional)"
                  value={formData.description}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="bg-background text-foreground border-border resize-none"
                  rows={3}
                />
              </div>
            </>
          ) : (
            // Step 2: Friend Selection
            // Step 2: Friend Selection
            <>
              {/* Selected Members Display - No duplicate label */}
              {selectedFriendObjects.length > 0 && (
                <div className="flex flex-wrap gap-3 pb-2 border-b border-border">
                  {selectedFriendObjects.map(friend => (
                    <div
                      key={friend.username}
                      className="flex flex-col items-center gap-1 relative"
                    >
                      <div className="relative">
                        <ProfileImage image={friend.profile_image} chatName={friend.name} />
                        <button
                          onClick={() => removeFriendFromSelection(friend.username)}
                          className="absolute -top-1 -right-1 p-0.5 rounded-full bg-destructive hover:bg-destructive/90 transition-colors"
                          aria-label={`Remove ${friend.name}`}
                        >
                          <X className="w-3 h-3 text-destructive-foreground" />
                        </button>
                      </div>
                      <span className="text-xs text-foreground max-w-[60px] truncate">
                        {friend.username}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Search Box */}
              <div className="flex items-center gap-2 px-3 border border-border rounded-md bg-background">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search friends..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 text-foreground bg-transparent"
                />
              </div>

              {/* Friends List - Scrollable */}
              <div className="flex flex-col gap-1 flex-1 overflow-y-auto">
                {filteredFriends.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    {searchQuery.trim() ? 'No friends found' : 'No friends to add'}
                  </p>
                ) : (
                  filteredFriends.map(friend => (
                    <label
                      key={friend.username}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    >
                      <Checkbox
                        checked={formData.users.includes(friend.username)}
                        onCheckedChange={() => toggleFriendSelection(friend.username)}
                        className="border-border"
                      />
                      <ProfileImage image={friend.profile_image} chatName={friend.name} />
                      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {friend.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">@{friend.username}</p>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border">
          {step === 1 ? (
            <>
              <Button variant="outline" onClick={resetModal} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleNext}
                disabled={!isStep1Valid}
                className="flex-1 flex items-center gap-2"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={formData.users.length === 0}
                className="flex-1"
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Create Group'}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
