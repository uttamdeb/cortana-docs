import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDarkMode } from '@/hooks/useDarkMode';
import { cn } from '@/lib/utils';

interface DarkModeToggleProps {
  className?: string;
  variant?: 'default' | 'icon';
}

export function DarkModeToggle({ className, variant = 'icon' }: DarkModeToggleProps) {
  const { isDark, toggleDarkMode } = useDarkMode();

  if (variant === 'icon') {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleDarkMode}
        className={cn("transition-all hover:scale-110", className)}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? (
          <Sun className="h-5 w-5 text-yellow-500 transition-all" />
        ) : (
          <Moon className="h-5 w-5 text-slate-700 transition-all" />
        )}
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      onClick={toggleDarkMode}
      className={cn("w-full justify-start", className)}
    >
      {isDark ? (
        <>
          <Sun className="h-4 w-4 mr-2 text-yellow-500" />
          <span>Light Mode</span>
        </>
      ) : (
        <>
          <Moon className="h-4 w-4 mr-2 text-slate-700" />
          <span>Dark Mode</span>
        </>
      )}
    </Button>
  );
}
