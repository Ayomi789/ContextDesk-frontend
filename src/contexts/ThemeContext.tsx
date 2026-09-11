import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';
type Density = 'compact' | 'default' | 'comfortable';

interface ThemeContextType {
  theme: Theme;
  toggle: () => void;
  density: Density;
  setDensity: (density: Density) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggle: () => {},
  density: 'default',
  setDensity: () => {},
});

function storedDensity(): Density {
  if (typeof window === 'undefined') return 'default';
  const saved = localStorage.getItem('nexus-density');
  return saved === 'compact' || saved === 'comfortable'
    ? saved
    : 'default';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('nexus-theme') as Theme) || 'light';
    }
    return 'light';
  });
  const [density, setDensityState] = useState<Density>(storedDensity);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('nexus-theme', theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.density = density;
    localStorage.setItem('nexus-density', density);
  }, [density]);

  const toggle = () => setTheme(t => (t === 'light' ? 'dark' : 'light'));
  const setDensity = (next: Density) => setDensityState(next);

  return (
    <ThemeContext.Provider value={{ theme, toggle, density, setDensity }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
