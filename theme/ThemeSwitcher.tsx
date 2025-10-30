import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();

  const handleToggle = () => {
    console.log('Theme switcher clicked, current theme:', theme);
    toggleTheme();
  };

  return (
    <button
      onClick={handleToggle}
      className="p-2 text-gray-900 dark:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-200 hover:scale-105"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon size={20} />
      ) : (
        <Sun size={20} />
      )}
    </button>
  );
}