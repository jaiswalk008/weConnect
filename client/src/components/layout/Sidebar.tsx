// Sidebar.tsx
import { MessageSquare, Users, Settings, Moon, Sun, User, LogOut } from 'lucide-react';
import { useTheme } from '@/theme/theme-context';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { useDispatch } from 'react-redux';
import { authActions } from '@/context/store';
import { TABS } from '@/constants/tabs';
interface SidebarProps {
  activeTab: TABS;
  onTabChange: (_tab: TABS) => void;
}

export const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  const { theme, setTheme } = useTheme();
  const dispatch = useDispatch();
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleMyAccount = () => {
    console.log('My Account');
  };

  const handleLogout = () => {
    dispatch(authActions.logout());
  };

  return (
    <div className="flex flex-col h-full w-16 bg-card border-r border-border">
      {/* Theme Toggle */}
      <div className="p-3 border-b border-border">
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-accent transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? (
            <Moon className="w-5 h-5 text-foreground" />
          ) : (
            <Sun className="w-5 h-5 text-foreground" />
          )}
        </button>
      </div>

      {/* Navigation Icons */}
      <div className="flex-1 flex flex-col gap-2 p-3">
        <button
          onClick={() => onTabChange(TABS.CHATS)}
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
            activeTab === TABS.CHATS
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-accent text-muted-foreground'
          }`}
          aria-label="Chats"
        >
          <MessageSquare className="w-5 h-5" />
        </button>

        <button
          onClick={() => onTabChange(TABS.FRIENDS)}
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
            activeTab === TABS.FRIENDS
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-accent text-muted-foreground'
          }`}
          aria-label="Friends"
        >
          <Users className="w-5 h-5" />
        </button>
      </div>

      {/* Profile Settings */}
      <div className="p-3 border-t border-border">
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-accent transition-colors"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5 text-muted-foreground" />
            </button>
          </PopoverTrigger>
          <PopoverContent side="right" align="end" className="w-56 p-2">
            <div className="flex flex-col gap-1">
              <button
                onClick={handleMyAccount}
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors text-left w-full"
              >
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">My Account</span>
              </button>

              <Separator className="my-1" />

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-destructive/10 text-destructive transition-colors text-left w-full"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
