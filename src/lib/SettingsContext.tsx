import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'bm' | 'en';
type Theme = 'dark' | 'light';

interface SettingsContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const SettingsContext = createContext<SettingsContextType>({
  lang: 'bm',
  setLang: () => {},
  theme: 'dark',
  setTheme: () => {}
});

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('appLang') as Language) || 'bm';
  });
  
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('appTheme') as Theme) || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('appLang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('appTheme', theme);
    const bodyClass = document.body.classList;
    if (theme === 'light') {
      bodyClass.add('light-theme');
    } else {
      bodyClass.remove('light-theme');
    }
  }, [theme]);

  return (
    <SettingsContext.Provider value={{ lang, setLang, theme, setTheme }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
