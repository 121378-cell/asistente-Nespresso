import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Intentar obtener tema guardado
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme) {
      return savedTheme;
    }

    // Si no hay tema guardado, usar preferencia del sistema
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  });

  useEffect(() => {
    console.log('Theme changed to:', theme);
    // Aplicar clase al documento
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      console.log('Added dark class to html');
    } else {
      document.documentElement.classList.remove('dark');
      console.log('Removed dark class from html');
    }

    // Guardar en localStorage
    localStorage.setItem('theme', theme);
    console.log('Saved theme to localStorage:', theme);
  }, [theme]);

  const toggleTheme = () => {
    console.log('Toggle theme called, current theme:', theme);
    setTheme((prev) => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      console.log('Changing theme to:', newTheme);
      return newTheme;
    });
  };

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
