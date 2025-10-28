import { createContext, useContext } from 'react';

type ThemeProviderState = {
  theme: 'dark' | 'light';
  setTheme: (_theme: 'dark' | 'light') => void;
};

export const initialState: ThemeProviderState = {
  theme: 'dark',
  setTheme: () => null,
};

export const ThemeProviderContext = createContext<ThemeProviderState>(initialState);
export function useTheme() {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider');

  return context;
}