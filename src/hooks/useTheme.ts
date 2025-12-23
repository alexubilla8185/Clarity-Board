
import * as React from 'react';
import { UserSettings } from '../types';

export function useTheme(userSettings: UserSettings) {
  React.useEffect(() => {
    const root = window.document.documentElement;
    const applyCurrentTheme = () => {
      root.classList.remove('dark', 'true-dark');
      let finalTheme: 'light' | 'dark' | 'true-dark' = 'light';

      if (userSettings.theme === 'dark' || userSettings.theme === 'true-dark') {
        finalTheme = userSettings.theme;
      } else if (userSettings.theme === 'system') {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          finalTheme = 'dark';
        }
      }

      if (finalTheme === 'dark') {
        root.classList.add('dark');
      } else if (finalTheme === 'true-dark') {
        root.classList.add('dark', 'true-dark');
      }
    };

    applyCurrentTheme();
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    if (userSettings.theme === 'system') {
      mediaQuery.addEventListener('change', applyCurrentTheme);
    }
    return () => mediaQuery.removeEventListener('change', applyCurrentTheme);
  }, [userSettings.theme]);

  React.useEffect(() => {
    document.documentElement.style.setProperty('--color-primary', userSettings.accentColor);
  }, [userSettings.accentColor]);
}
