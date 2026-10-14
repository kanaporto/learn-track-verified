import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { setSoundEnabled } from './sound';

type Language = 'es' | 'en';
const Preferences = createContext({ language: 'es' as Language, setLanguage: (_: Language) => {}, motion: true, setMotion: (_: boolean) => {}, sound: false, setSound: (_: boolean) => {} });
export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('es');
  const [motion, setMotion] = useState(true);
  const [sound, setSoundState] = useState(false);
  useEffect(() => { if (localStorage.getItem('dumpi-sound') === '1') setSoundState(true); }, []);
  useEffect(() => { setSoundEnabled(sound); }, [sound]);
  const setSound = (v: boolean) => { localStorage.setItem('dumpi-sound', v ? '1' : '0'); setSoundEnabled(v); setSoundState(v); };
  return <Preferences.Provider value={{ language, setLanguage, motion, setMotion, sound, setSound }}><div className={motion ? '' : 'reduce-motion'}>{children}</div></Preferences.Provider>;
}
export function usePreferences() { return useContext(Preferences); }
export function useText() { const { language } = usePreferences(); return (es: string, en: string) => language === 'es' ? es : en; }
export const certifications = [
  { id: 'workspace', name: 'Google Workspace Administrator', category: 'Google Workspace', icon: 'workspace' },
  { id: 'cloud', name: 'Google Cloud Digital Leader', category: 'Google Cloud', icon: 'cloud' },
  { id: 'okta', name: 'Okta Certified Administrator', category: 'Identity & Access', icon: 'okta' },
  { id: 'itil', name: 'ITIL Foundation v5', category: 'IT Service Management', icon: 'itil' },
  { id: 'apple', name: 'Apple Device Support', category: 'Apple', icon: 'apple' },
] as const;
export function pageHead(title: string, description: string) {
  return { meta: [{ title: `${title} · Dumpi Learn` }, { name: 'description', content: description }, { property: 'og:title', content: `${title} · Dumpi Learn` }, { property: 'og:description', content: description }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] };
}