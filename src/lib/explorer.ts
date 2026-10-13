import { useEffect, useState } from 'react';

const KEY = 'dumpi-explorer-name';
const EVT = 'dumpi-explorer';

export function cleanName(raw: string) {
  return raw.replace(/\s+/g, ' ').trim().slice(0, 24);
}

export function saveExplorer(name: string) {
  const n = cleanName(name);
  if (n.length < 2) return false;
  localStorage.setItem(KEY, n);
  window.dispatchEvent(new Event(EVT));
  return true;
}

export function clearExplorer() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(EVT));
}

/** Returns undefined until hydrated, then the stored name or null. */
export function useExplorer() {
  const [name, setName] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    const read = () => setName(localStorage.getItem(KEY));
    read();
    window.addEventListener(EVT, read);
    return () => window.removeEventListener(EVT, read);
  }, []);
  return name;
}
