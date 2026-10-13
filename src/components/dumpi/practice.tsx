import { useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowLeft, Check, ExternalLink, Heart, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useText, usePreferences } from '@/lib/dumpi';
import bank from '@/data/workspace-questions.json';

type Q = { id: string; level: number; domain: string; region: number; multi: boolean; es: { q: string; o: string[] }; en: { q: string; o: string[] }; answer: string[]; expEs: string; expEn: string; ref: string };
const questions = bank as Q[];
const regions = [
  { n: 1, es: 'El Bosque de los Caminos', en: 'The Forest of Paths', color: '#2563EB' },
  { n: 2, es: 'La Ribera y el Molino', en: 'The Riverside Mill', color: '#0284C7' },
  { n: 3, es: 'El Monasterio de los Pergaminos', en: 'The Scroll Monastery', color: '#0D9488' },
  { n: 4, es: 'El Castillo del Foso', en: 'The Moat Castle', color: '#6366F1' },
  { n: 5, es: 'El Faro del Vigía', en: 'The Watchtower', color: '#D97706' },
  { n: 6, es: 'La Calzada del Maestro', en: "The Master's Road", color: '#E11D48' },
];
const LETTERS = ['A', 'B', 'C', 'D'];
const GOAL = 10;
const MAX_LIVES = 10;
function shuffle<T>(a: T[]) { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j]!, b[i]!]; } return b; }

export function PracticeGame() {
  const t = useText();
  const { language } = usePreferences();
  const [region, setRegion] = useState<number | null>(null);
  if (region === null) {
    return <div className="page-content">
      <Button asChild variant="ghost" className="back-link"><Link to="/certifications/$id" params={{ id: 'workspace' }}><ArrowLeft />Google Workspace</Link></Button>
      <h1 className="text-2xl font-bold mb-1">{t('Elige una región', 'Choose a region')}</h1>
      <p className="text-muted-foreground mb-5">{t('Banco de prueba: 110 preguntas de Google Workspace Administrator.', 'Test bank: 110 Google Workspace Administrator questions.')}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {regions.map(r => { const count = questions.filter(q => q.region === r.n).length; return (
          <button key={r.n} onClick={() => setRegion(r.n)} className="text-left rounded-2xl border-2 bg-card p-4 min-h-20 active:translate-y-0.5 transition" style={{ borderColor: r.color }}>
            <span className="text-xs font-bold uppercase" style={{ color: r.color }}>{t('Región', 'Region')} {r.n}</span>
            <div className="font-bold text-lg">{language === 'es' ? r.es : r.en}</div>
            <div className="text-sm text-muted-foreground">{count} {t('preguntas', 'questions')}</div>
          </button>); })}
      </div>
    </div>;
  }
  return <RegionRun key={region} region={region} onExit={() => setRegion(null)} />;
}

function RegionRun({ region, onExit }: { region: number; onExit: () => void }) {
  const t = useText();
  const { language } = usePreferences();
  const meta = regions[region - 1]!;
  const pool = useMemo(() => shuffle(questions.filter(q => q.region === region)), [region]);
  const [idx, setIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [picked, setPicked] = useState<string[]>([]);
  const [result, setResult] = useState<null | boolean>(null);
  const [recent, setRecent] = useState<boolean[]>([]);
  const q = pool[idx % pool.length]!;
  const text = language === 'es' ? q.es : q.en;
  const needed = q.answer.length;
  const glitch = recent.slice(-5).filter(x => !x).length >= 3;

  if (correct >= GOAL) return <End title={t('¡Región completada!', 'Region complete!')} body={t('Has conseguido 10 aciertos.', 'You got 10 correct answers.')} onExit={onExit} />;
  if (lives <= 0) return <End title={t('Sin vidas', 'Out of lives')} body={t('Se recupera 1 vida por hora. Vuelve más tarde o repasa.', '1 life recovers per hour. Come back later or review.')} onExit={onExit} />;

  function toggle(l: string) {
    if (result !== null) return;
    setPicked(p => p.includes(l) ? p.filter(x => x !== l) : needed === 1 ? [l] : p.length < needed ? [...p, l] : p);
  }
  function check() {
    const ok = picked.length === needed && picked.every(p => q.answer.includes(p));
    setResult(ok);
    setRecent(r => [...r, ok]);
    if (ok) setCorrect(c => c + 1); else setLives(l => l - 1);
  }
  function next() { setIdx(i => i + 1); setPicked([]); setResult(null); }

  return <div className="page-content pb-32">
    <div className="flex items-center justify-between gap-3 mb-4">
      <Button variant="ghost" onClick={onExit}><ArrowLeft />{t('Regiones', 'Regions')}</Button>
      <span className="flex items-center gap-1 font-bold"><Heart className="text-destructive" size={18} fill="currentColor" />{lives}/{MAX_LIVES}</span>
    </div>
    <div className="text-xs font-bold uppercase" style={{ color: meta.color }}>{t('Región', 'Region')} {region} · {language === 'es' ? meta.es : meta.en}</div>
    <div className="flex gap-1 my-3" aria-label={t('Progreso', 'Progress')}>
      {Array.from({ length: GOAL }, (_, i) => <span key={i} className="h-2.5 flex-1 rounded-full bg-muted" style={i < correct ? { background: meta.color } : undefined} />)}
    </div>
    <p className="text-sm text-muted-foreground">{correct}/{GOAL} {t('aciertos', 'correct')} · {t('Nivel', 'Level')} {q.level}{q.multi ? ` · ${t('Selecciona 2', 'Select 2')}` : ''}</p>
    {glitch && result === null && <div className="glitch-band my-3 rounded-xl p-3 text-sm">{t('⚠ Glitch acecha: 3 fallos en las últimas 5. ¡Concéntrate!', '⚠ Glitch is lurking: 3 misses in the last 5. Focus!')}</div>}
    <h2 className="text-lg font-semibold my-4 leading-snug">{text.q}</h2>
    <div className="grid gap-2.5">
      {text.o.map((o, i) => { const l = LETTERS[i]!; const sel = picked.includes(l); const isAns = q.answer.includes(l);
        const state = result === null ? (sel ? 'border-primary bg-primary/15' : 'border-border') : isAns ? 'border-green-500 bg-green-500/15' : sel ? 'border-destructive bg-destructive/10' : 'border-border opacity-60';
        return <button key={l} onClick={() => toggle(l)} className={`flex items-start gap-3 text-left rounded-xl border-2 p-3.5 min-h-14 ${state}`} style={{ background: result !== null && isAns ? 'rgba(34,197,94,.18)' : result !== null && sel ? 'rgba(239,68,68,.15)' : sel ? 'rgba(37,99,235,.25)' : 'rgba(255,255,255,.06)', color: 'inherit' }}>
          <span className="font-bold w-6 shrink-0">{l}</span><span className="flex-1">{o}</span>
          {result !== null && isAns && <Check className="text-green-600 shrink-0" size={20} />}
          {result !== null && sel && !isAns && <X className="text-destructive shrink-0" size={20} />}
        </button>; })}
    </div>
    {result === false && <div className="notice mt-5 block">
      <p className="font-semibold mb-1">{t('Explicación', 'Explanation')}</p>
      <p>{language === 'es' ? q.expEs : q.expEn}</p>
      {q.ref && <a href={q.ref} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-2 text-primary underline">{t('Documentación oficial', 'Official documentation')}<ExternalLink size={14} /></a>}
    </div>}
    {result === true && <p className="mt-5 font-bold text-green-400">{t('¡Correcto! DUMPI avanza una casilla.', 'Correct! DUMPI moves forward one tile.')}</p>}
    <div className="fixed bottom-16 md:bottom-4 inset-x-0 px-4 z-30">
      <div className="max-w-2xl mx-auto">
        {result === null
          ? <Button className="w-full h-14 text-base" disabled={picked.length !== needed} onClick={check}>{t('Comprobar', 'Check')}</Button>
          : <Button className="w-full h-14 text-base" onClick={next}>{t('Siguiente', 'Next')}</Button>}
      </div>
    </div>
  </div>;
}

function End({ title, body, onExit }: { title: string; body: string; onExit: () => void }) {
  const t = useText();
  return <div className="page-content text-center py-16"><h1 className="text-3xl font-bold mb-2">{title}</h1><p className="text-muted-foreground mb-6">{body}</p><Button onClick={onExit}>{t('Volver a las regiones', 'Back to regions')}</Button></div>;
}
