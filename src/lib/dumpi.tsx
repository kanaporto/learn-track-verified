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
export const SITE_URL = 'https://learn-track-verified.lovable.app';
export function pageHead(title: string, description: string, path?: string) {
  const full = `${title} · Dumpi Learn`;
  const image = `${SITE_URL}/og-image.jpg`;
  const meta: Array<Record<string, string>> = [{ title: full }, { name: 'description', content: description }, { property: 'og:title', content: full }, { property: 'og:description', content: description }, { property: 'og:type', content: 'website' }, { property: 'og:image', content: image }, { name: 'twitter:card', content: 'summary_large_image' }, { name: 'twitter:image', content: image }];
  if (path) meta.push({ property: 'og:url', content: `${SITE_URL}${path}` });
  return { meta };
}
