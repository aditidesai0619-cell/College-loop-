import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

// index.html sets data-theme before React loads; we start from that value
const initialTheme = () => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(initialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0F241D' : '#183D32');
    try {
      localStorage.setItem('theme', theme);
    } catch {
      /* storage unavailable: theme still works for this session */
    }
  }, [theme]);

  const toggleTheme = () => {
    // Briefly enable colour transitions so the switch feels smooth (not on first load)
    const root = document.documentElement;
    root.classList.add('theme-anim');
    window.setTimeout(() => root.classList.remove('theme-anim'), 350);
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  };

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
