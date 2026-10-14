import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { PROGRESS_EVENT, readProgress, replaceProgress, resetProgress, type Progress } from './progress';
import { saveExplorer, clearExplorer } from './explorer';

/** Undefined until known, then the session or null. */
export function useSession() {
  const [s, setS] = useState<Session | null | undefined>(undefined);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setS(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, session) => setS(session));
    return () => data.subscription.unsubscribe();
  }, []);
  return s;
}

let userId: string | null = null;
let pulling = false;
let timer: ReturnType<typeof setTimeout> | undefined;

async function pull(uid: string) {
  pulling = true;
  try {
    const [{ data: prof }, { data: row }] = await Promise.all([
      supabase.from('profiles').select('display_name').eq('id', uid).maybeSingle(),
      supabase.from('player_progress').select('data').eq('user_id', uid).maybeSingle(),
    ]);
    if (prof?.display_name) saveExplorer(prof.display_name);
    if (row?.data && Object.keys(row.data as object).length) replaceProgress({ ...readProgress(), ...(row.data as Progress) });
    else await push(uid); // first sign-in: upload this device's progress
  } finally { pulling = false; }
}

async function push(uid: string) {
  const p = readProgress();
  await Promise.all([
    supabase.from('player_progress').upsert({ user_id: uid, data: p as never, updated_at: new Date().toISOString() }),
    supabase.from('profiles').update({ points: p.points, updated_at: new Date().toISOString() }).eq('id', uid),
  ]);
}

/** Wire once from the root: loads cloud progress on sign-in and saves every change. */
export function startCloudSync() {
  const onChange = () => {
    if (!userId || pulling) return;
    clearTimeout(timer);
    const uid = userId;
    timer = setTimeout(() => { void push(uid); }, 1200);
  };
  window.addEventListener(PROGRESS_EVENT, onChange);
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') { userId = null; clearExplorer(); resetProgress(); return; }
    if (session && session.user.id !== userId && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
      userId = session.user.id;
      setTimeout(() => { void pull(session.user.id); }, 0);
    }
  });
  return () => { window.removeEventListener(PROGRESS_EVENT, onChange); data.subscription.unsubscribe(); };
}

export type Ranked = { name: string; pts: number; id: string };
export async function fetchLeaderboard(): Promise<Ranked[]> {
  const { data } = await supabase.from('profiles').select('id, display_name, points').order('points', { ascending: false }).limit(50);
  return (data ?? []).map(r => ({ id: r.id, name: r.display_name, pts: r.points }));
}
