import { useEffect, useState } from 'react';

const KEY = 'dumpi-reminders';
const LAST = 'dumpi-last-visit';
const DAY = 86_400_000;

export const remindersSupported = () => typeof window !== 'undefined' && 'Notification' in window;

function notify(title: string, body: string) {
  try { new Notification(title, { body, icon: '/icons/icon-192.png' }); } catch { /* some mobile browsers only allow SW notifications */ }
}

export function useReminders() {
  const [on, setOn] = useState(false);
  const [supported, setSupported] = useState(false);
  useEffect(() => {
    setSupported(remindersSupported());
    setOn(localStorage.getItem(KEY) === '1' && remindersSupported() && Notification.permission === 'granted');
  }, []);
  async function toggle(next: boolean, es: boolean): Promise<'ok' | 'denied' | 'unsupported'> {
    if (!next) { localStorage.removeItem(KEY); setOn(false); return 'ok'; }
    if (!remindersSupported()) return 'unsupported';
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') return 'denied';
    localStorage.setItem(KEY, '1'); setOn(true);
    notify(es ? '¡Recordatorios activados!' : 'Reminders on!', es ? 'DUMPI te avisará para mantener tu ritmo de estudio.' : 'DUMPI will nudge you to keep your study streak.');
    return 'ok';
  }
  return { on, supported, toggle };
}

/** Call once on app start: greets returning players after 24h away. */
export function checkStudyReminder(es: boolean) {
  if (!remindersSupported()) return;
  const last = Number(localStorage.getItem(LAST) ?? 0);
  localStorage.setItem(LAST, String(Date.now()));
  if (localStorage.getItem(KEY) !== '1' || Notification.permission !== 'granted') return;
  if (last && Date.now() - last > DAY) notify(es ? '¡DUMPI te echaba de menos!' : 'DUMPI missed you!', es ? 'Vuelve al camino: 10 aciertos más y otra región conquistada.' : 'Back on track: 10 more correct answers to conquer a region.');
}
