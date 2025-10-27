import { MessageSquare, Users, Settings, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/theme/ThemeProvider'

interface SidebarProps {
  activeTab: 'chats' | 'friends';
  onTabChange: (tab: 'chats' | 'friends') => void;
}

export const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
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
          onClick={() => onTabChange('chats')}
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
            activeTab === 'chats' 
              ? 'bg-primary text-primary-foreground' 
              : 'hover:bg-accent text-muted-foreground'
          }`}
          aria-label="Chats"
        >
          <MessageSquare className="w-5 h-5" />
        </button>

        <button
          onClick={() => onTabChange('friends')}
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
            activeTab === 'friends' 
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
        <button
          className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-accent transition-colors"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};
