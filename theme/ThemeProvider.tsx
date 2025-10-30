// Simple light theme only - no theme switching
import React from 'react';

export function CustomThemeProvider({ children }: { children: React.ReactNode }) {
  // Force light theme always
  React.useEffect(() => {
    document.documentElement.setAttribute('data-appearance', 'light');
    document.documentElement.classList.remove('dark');
    document.body.style.backgroundColor = '#ffffff';
    document.body.style.color = '#000000';
    
    // Clear any localStorage theme
    localStorage.removeItem('theme');
  }, []);

  return <>{children}</>;
}