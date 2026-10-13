import { useEffect, useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowLeft, Check, ExternalLink, Heart, Star, X, GraduationCap, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useText, usePreferences } from '@/lib/dumpi';
import { TrailBoard } from './trail-board';
import { RegisterCard } from './register';
import { useExplorer } from '@/lib/explorer';
import { useCourses, workspaceCourse, type Course, type Question } from '@/lib/courses';
import { MAX_LIVES, courseOf, patchCourse, pointsFor, setLives, updateProgress, useProgress } from '@/lib/progress';
import dumpiImg from '@/assets/dumpi.png';
import glitchImg from '@/assets/glitch.png';
import r1 from '@/assets/region-1.jpg';
import r2 from '@/assets/region-2.jpg';
import r3 from '@/assets/region-3.jpg';
import r4 from '@/assets/region-4.jpg';
import r5 from '@/assets/region-5.jpg';
import r6 from '@/assets/region-6.jpg';
const regionArt = [r1, r2, r3, r4, r5, r6];
const art = (n: number) => regionArt[(n - 1) % regionArt.length]!;

const LETTERS = ['A', 'B', 'C', 'D'];
const GOAL = 10;
function shuffle<T>(a: T[]) { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j]!, b[i]!]; } return b; }
const isRight = (q: Question, picked: string[]) => picked.length === q.answer.length && picked.every(p => q.answer.includes(p));

export const practiceRegions = workspaceCourse.regions;

export function PracticeGame({ initialRegion, courseId = 'workspace' }: { initialRegion?: number | undefined; courseId?: string | undefined } = {}) {
  const t = useText();
  const { language } = usePreferences();
  const courses = useCourses();
  const course = courses.find(c => c.id === courseId);
  const progress = useProgress();
  const [region, setRegion] = useState<number | null>(initialRegion ?? null);
  const [training, setTraining] = useState(false);
  const explorer = useExplorer();
  if (explorer === undefined || !progress) return <div className="page-content" />;
  if (!explorer) return <div className="page-content"><RegisterCard /></div>;
  if (!course) return <div className="page-content"><p className="text-muted-foreground">{t('Curso no encontrado.', 'Course not found.')}</p><Button asChild className="mt-4"><Link to="/certifications">{t('Ver mundos', 'View worlds')}</Link></Button></div>;
  if (training) return <Training course={course} onDone={() => setTraining(false)} />;
  const cp = courseOf(progress, course.id);
  if (region === null) {
    return <div className="page-content">
      <Button asChild variant="ghost" className="back-link"><Link to="/certifications/$id" params={{ id: course.id }}><ArrowLeft />{course.name}</Link></Button>
      <h1 className="text-2xl font-bold mb-1">{t('Elige una región', 'Choose a region')}</h1>
      <p className="text-muted-foreground mb-4">{course.questions.length} {t('preguntas', 'questions')} · {cp.completed.length}/{course.regions.length} {t('regiones completadas', 'regions completed')}</p>
      {progress.lives < MAX_LIVES && <button className="train-cta mb-5" onClick={() => setTraining(true)}><GraduationCap size={22} /><span><b>{t('Reto de aprendizaje', 'Learning challenge')}</b><small>{t('Gana vidas respondiendo sin riesgo', 'Earn lives answering risk-free')}</small></span><span className="train-lives"><Heart size={14} fill="currentColor" />{progress.lives}/{MAX_LIVES}</span></button>}
      <div className="grid gap-3 sm:grid-cols-2">
        {course.regions.map(r => { const count = course.questions.filter(q => q.region === r.n).length; const done = cp.completed.includes(r.n); const tile = cp.tiles[r.n] ?? 0; return (
          <button key={r.n} onClick={() => { patchCourse(course.id, c => ({ ...c, lastRegion: r.n })); setRegion(r.n); }} className={`region-pick ${done ? 'is-done' : ''}`} style={{ ['--rc' as string]: r.color }}>
            <img src={art(r.n)} alt="" className="region-pick-bg" loading="lazy" />
            {done && <span className="done-ribbon">{t('¡COMPLETADA!', 'COMPLETED!')} <Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /></span>}
            <span className="medieval-banner">{t('Región', 'Region')} {r.n}</span>
            <div className="medieval-title region-pick-name">{language === 'es' ? r.es : r.en}</div>
            <div className="region-pick-count">{count} {t('preguntas', 'questions')}{!done && tile > 0 ? ` · ${t('casilla', 'tile')} ${tile}/${GOAL}` : ''}</div>
          </button>); })}
      </div>
    </div>;
  }
  return <RegionRun key={region} course={course} region={region} onExit={() => setRegion(null)} onTrain={() => setTraining(true)} />;
}

function RegionRun({ course, region, onExit, onTrain }: { course: Course; region: number; onExit: () => void; onTrain: () => void }) {
  const t = useText();
  const { language } = usePreferences();
  const meta = course.regions[region - 1]!;
  const progress = useProgress();
  const pool = useMemo(() => shuffle(course.questions.filter(q => q.region === region)), [course, region]);
  const [correct, setCorrect] = useState(() => 0);
  const [loaded, setLoaded] = useState(false);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [result, setResult] = useState<null | boolean>(null);
  const [recent, setRecent] = useState<boolean[]>([]);
  const [sinceGlitch, setSinceGlitch] = useState(5);
  const [glitchOn, setGlitchOn] = useState(false);
  const [gain, setGain] = useState<number | null>(null);
  const [justWon, setJustWon] = useState(false);

  useEffect(() => { if (progress && !loaded) { setCorrect(courseOf(progress, course.id).tiles[region] ?? 0); setLoaded(true); } }, [progress, loaded, course.id, region]);
  if (!progress || !loaded || !pool.length) return <div className="page-content" />;
  const lives = progress.lives;
  const q = pool[idx % pool.length]!;
  const text = language === 'es' ? q.es : q.en;
  const needed = q.answer.length;

  if (justWon || correct >= GOAL) return <Victory regionName={language === 'es' ? meta.es : meta.en} onExit={onExit} onReplay={() => { patchCourse(course.id, c => ({ ...c, tiles: { ...c.tiles, [region]: 0 } })); setCorrect(0); setJustWon(false); }} />;
  if (lives <= 0) return <NoLives onTrain={onTrain} onRefill={() => { setLives(MAX_LIVES); setRecent([]); next(); }} onExit={onExit} />;

  function toggle(l: string) {
    if (result !== null) return;
    setPicked(p => p.includes(l) ? p.filter(x => x !== l) : needed === 1 ? [l] : p.length < needed ? [...p, l] : p);
  }
  function check() {
    const ok = isRight(q, picked);
    setResult(ok);
    const r = [...recent, ok];
    setRecent(r);
    const since = sinceGlitch + 1;
    if (ok) {
      const pts = pointsFor(q.level);
      const c = correct + 1;
      setCorrect(c); setGain(pts); setTimeout(() => setGain(null), 1400);
      updateProgress(p => {
        const cp = courseOf(p, course.id);
        const done = c >= GOAL && !cp.completed.includes(region) ? [...cp.completed, region] : cp.completed;
        return { ...p, points: p.points + pts, courses: { ...p.courses, [course.id]: { ...cp, completed: done, tiles: { ...cp.tiles, [region]: c >= GOAL ? 0 : c } } } };
      });
      if (c >= GOAL) setTimeout(() => setJustWon(true), 900);
      setSinceGlitch(since);
    } else {
      setLives(lives - 1);
      if (r.slice(-5).filter(x => !x).length >= 3 && since >= 5) { setGlitchOn(true); setSinceGlitch(0); } else setSinceGlitch(since);
    }
  }
  function next() { setIdx(i => i + 1); setPicked([]); setResult(null); }

  return <div className="page-content pb-32">
    {glitchOn && <GlitchAttack onClose={() => setGlitchOn(false)} onTrain={onTrain} />}
    <div className="flex items-center justify-between gap-3 mb-4">
      <Button variant="ghost" onClick={onExit}><ArrowLeft />{t('Regiones', 'Regions')}</Button>
      <div className="flex items-center gap-2">
        <span className="hud-pill hud-points hud-sm"><span className="hud-gem"><Star size={13} fill="currentColor" /></span><b>{progress.points}</b>{gain && <span className="points-float">+{gain}</span>}</span>
        <span className="hud-pill hud-lives hud-sm"><span className="hud-gem"><Heart size={13} fill="currentColor" /></span><b>{lives}</b><small>/{MAX_LIVES}</small></span>
      </div>
    </div>
    <div className="region-banner"><span className="medieval-banner" style={{ ['--rc' as string]: meta.color }}>{t('Región', 'Region')} {region}</span><h1 className="medieval-title">{language === 'es' ? meta.es : meta.en}</h1></div>
    <TrailBoard art={art(region)} total={GOAL} done={correct} color={meta.color} label={`${t('Casilla', 'Tile')} ${Math.min(correct + 1, GOAL)} / ${GOAL}`} />
    <p className="text-sm text-muted-foreground">{t('Nivel', 'Level')} {q.level} · +{pointsFor(q.level)} pts{q.multi ? ` · ${t('Selecciona 2', 'Select 2')}` : ''}</p>
    <h2 className="text-lg font-semibold my-4 leading-snug">{text.q}</h2>
    <Options q={q} text={text} picked={picked} result={result} toggle={toggle} />
    {result === false && <Explanation q={q} />}
    {result === true && <p className="mt-5 font-bold text-green-400">{t(`¡Correcto! +${pointsFor(q.level)} puntos. DUMPI avanza una casilla.`, `Correct! +${pointsFor(q.level)} points. DUMPI moves forward one tile.`)}</p>}
    <div className="check-bar"><div className="max-w-2xl mx-auto">
      {result === null
        ? <Button className="w-full h-14 text-base" disabled={picked.length !== needed} onClick={check}>{t('Comprobar', 'Check')}</Button>
        : <Button className="w-full h-14 text-base" onClick={next}>{t('Siguiente', 'Next')}</Button>}
    </div></div>
  </div>;
}

function Options({ q, text, picked, result, toggle }: { q: Question; text: { o: string[] }; picked: string[]; result: null | boolean; toggle: (l: string) => void }) {
  return <div className="grid gap-2.5">
    {text.o.map((o, i) => { const l = LETTERS[i]!; const sel = picked.includes(l); const isAns = q.answer.includes(l);
      const state = result === null ? (sel ? 'border-primary' : 'border-border') : isAns ? 'border-green-500' : sel ? 'border-destructive' : 'border-border opacity-60';
      return <button key={l} onClick={() => toggle(l)} className={`flex items-start gap-3 text-left rounded-xl border-2 p-3.5 min-h-14 ${state}`} style={{ background: result !== null && isAns ? 'rgba(34,197,94,.18)' : result !== null && sel ? 'rgba(239,68,68,.15)' : sel ? 'rgba(37,99,235,.25)' : 'rgba(255,255,255,.06)', color: 'inherit' }}>
        <span className="font-bold w-6 shrink-0">{l}</span><span className="flex-1">{o}</span>
        {result !== null && isAns && <Check className="text-green-600 shrink-0" size={20} />}
        {result !== null && sel && !isAns && <X className="text-destructive shrink-0" size={20} />}
      </button>; })}
  </div>;
}

function Explanation({ q }: { q: Question }) {
  const t = useText(); const { language } = usePreferences();
  return <div className="notice mt-5 block">
    <p className="font-semibold mb-1">{t('Explicación', 'Explanation')}</p>
    <p>{language === 'es' ? q.expEs : q.expEn}</p>
    {q.ref && <a href={q.ref} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-2 text-primary underline">{t('Documentación oficial', 'Official documentation')}<ExternalLink size={14} /></a>}
  </div>;
}

/** Learning challenge: 3 risk-free questions. +1 life per correct answer, +2 bonus for 3/3. No points. */
function Training({ course, onDone }: { course: Course; onDone: () => void }) {
  const t = useText(); const { language } = usePreferences();
  const set = useMemo(() => shuffle(course.questions).slice(0, 3), [course]);
  const [i, setI] = useState(0);
  const [hits, setHits] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [result, setResult] = useState<null | boolean>(null);
  const progress = useProgress();
  const q = set[i];
  if (!q) {
    const reward = hits + (hits === 3 ? 2 : 0);
    return <div className="page-content text-center py-10">
      <img src={dumpiImg} alt="DUMPI" className="mx-auto w-36 victory-dumpi" />
      <h1 className="game-title text-3xl my-3">{t('¡Reto superado!', 'Challenge done!')}</h1>
      <p className="text-muted-foreground mb-2">{hits}/3 {t('aciertos', 'correct')}{hits === 3 ? t(' · ¡racha perfecta, +2 de bonus!', ' · perfect streak, +2 bonus!') : ''}</p>
      <p className="text-2xl font-bold mb-6 flex items-center justify-center gap-2"><Heart className="text-destructive" fill="currentColor" />+{reward} {t('vidas', 'lives')} · {progress?.lives ?? '—'}/{MAX_LIVES}</p>
      <Button className="h-14 px-8 text-base" onClick={onDone}>{t('Volver a la aventura', 'Back to the adventure')}</Button>
    </div>;
  }
  const text = language === 'es' ? q.es : q.en;
  const needed = q.answer.length;
  function check() {
    const ok = isRight(q!, picked);
    setResult(ok);
    if (ok) { setHits(h => h + 1); const bonus = hits + 1 === 3 ? 2 : 0; updateProgress(p => ({ ...p, lives: Math.min(MAX_LIVES, p.lives + 1 + bonus) })); }
  }
  return <div className="page-content pb-32">
    <div className="flex items-center justify-between mb-4"><Button variant="ghost" onClick={onDone}><ArrowLeft />{t('Salir', 'Exit')}</Button><span className="hud-pill hud-lives hud-sm"><span className="hud-gem"><Heart size={13} fill="currentColor" /></span><b>{progress?.lives ?? '—'}</b><small>/{MAX_LIVES}</small></span></div>
    <div className="train-head"><GraduationCap /><div><b>{t('Reto de aprendizaje', 'Learning challenge')} · {i + 1}/3</b><small>{t('Sin riesgo: +1 vida por acierto, +2 extra si aciertas las 3.', 'Risk-free: +1 life per correct answer, +2 extra for 3/3.')}</small></div></div>
    <h2 className="text-lg font-semibold my-4 leading-snug">{text.q}</h2>
    <Options q={q} text={text} picked={picked} result={result} toggle={l => result === null && setPicked(p => p.includes(l) ? p.filter(x => x !== l) : needed === 1 ? [l] : p.length < needed ? [...p, l] : p)} />
    {result === false && <Explanation q={q} />}
    {result === true && <p className="mt-5 font-bold text-green-400">{t('¡Correcto! +1 vida.', 'Correct! +1 life.')}</p>}
    <div className="check-bar"><div className="max-w-2xl mx-auto">
      {result === null ? <Button className="w-full h-14 text-base" disabled={picked.length !== needed} onClick={check}>{t('Comprobar', 'Check')}</Button>
        : <Button className="w-full h-14 text-base" onClick={() => { setI(x => x + 1); setPicked([]); setResult(null); }}>{t('Siguiente', 'Next')}</Button>}
    </div></div>
  </div>;
}

function GlitchAttack({ onClose, onTrain }: { onClose: () => void; onTrain: () => void }) {
  const t = useText();
  return <div className="glitch-attack" role="dialog" aria-modal="true">
    <div className="glitch-attack-card">
      <span className="kicker kicker-hot"><Zap size={13} />{t('¡INTRUSIÓN DETECTADA!', 'INTRUSION DETECTED!')}</span>
      <img src={glitchImg} alt="Glitch" className="glitch-attack-img" />
      <h2 className="game-title text-3xl glitch-text" data-text="GLITCH">GLITCH</h2>
      <p className="glitch-speech">{t('«¡Tres fallos! He encontrado una brecha en tu sistema… ¿Crees que puedes superarme?»', '"Three misses! I found a breach in your system… Think you can beat me?"')}</p>
      <div className="grid gap-2 mt-4">
        <Button className="h-12" onClick={onClose}>{t('¡Acepto el reto!', 'Challenge accepted!')}</Button>
        <Button variant="secondary" onClick={() => { onClose(); onTrain(); }}><GraduationCap />{t('Entrenar y ganar vidas', 'Train and earn lives')}</Button>
      </div>
    </div>
  </div>;
}

function Victory({ regionName, onExit, onReplay }: { regionName: string; onExit: () => void; onReplay: () => void }) {
  const t = useText();
  return <div className="page-content text-center py-8">
    <span className="medieval-banner victory-banner">{regionName}</span>
    <h1 className="medieval-title victory-title">{t('¡Región completada!', 'Region complete!')}</h1>
    <div className="victory-stars"><Star fill="currentColor" /><Star fill="currentColor" /><Star fill="currentColor" /></div>
    <div className="victory-stage">
      <div className="victory-dumpi-wrap"><img src={dumpiImg} alt={t('DUMPI bailando', 'DUMPI dancing')} className="victory-dumpi" /><span className="spark s1">✦</span><span className="spark s2">✦</span><span className="spark s3">✦</span></div>
      <div className="victory-glitch"><span className="glitch-bubble">{t('«¡Grrr…! No he encontrado ni una brecha. Admito que vuestro conocimiento es superior… ¡Enhorabuena, DUMPI y explorador!»', '"Grrr…! Not a single breach. I admit your knowledge is superior… Congratulations, DUMPI and explorer!"')}</span><img src={glitchImg} alt={t('Glitch llorando', 'Glitch crying')} /><span className="glitch-tear t1" /><span className="glitch-tear t2" /></div>
    </div>
    <p className="text-muted-foreground mb-6">10/10 {t('casillas conquistadas', 'tiles conquered')}</p>
    <div className="grid gap-3 max-w-sm mx-auto">
      <Button className="h-14 text-base" onClick={onExit}>{t('Volver a las regiones', 'Back to regions')}</Button>
      <Button variant="secondary" onClick={onReplay}>{t('Jugar otra vez', 'Play again')}</Button>
    </div>
  </div>;
}

function NoLives({ onRefill, onExit, onTrain }: { onRefill: () => void; onExit: () => void; onTrain: () => void }) {
  const t = useText();
  return <div className="page-content text-center py-8">
    <div className="nolives-stage">
      <div className="nolives-glitch"><span className="nolives-laugh">{t('¡JA, JA, JA!', 'HA HA HA!')}</span><img src={glitchImg} alt={t('Glitch riéndose', 'Glitch laughing')} /></div>
      <div className="nolives-dumpi"><img src={dumpiImg} alt={t('DUMPI triste', 'Sad DUMPI')} /><span className="nolives-tear" /></div>
    </div>
    <h1 className="game-title text-3xl mb-2">{t('¡Sin vidas!', 'Out of lives!')}</h1>
    <p className="text-muted-foreground mb-6">{t('Glitch te ha ganado esta vez. Se recupera 1 vida por hora.', 'Glitch got you this time. 1 life recovers per hour.')}</p>
    <div className="grid gap-3 max-w-sm mx-auto">
      <Button className="h-14 text-base" onClick={onTrain}><GraduationCap />{t('Reto de aprendizaje: gana vidas', 'Learning challenge: earn lives')}</Button>
      <Button variant="outline" onClick={onRefill}><Heart fill="currentColor" />{t('Recarga completa (prueba)', 'Full refill (testing)')}</Button>
      <p className="text-xs text-muted-foreground">{t('Edición hackatón: recarga gratuita de 10 vidas para pruebas.', 'Hackathon edition: free 10-life refill for testing.')}</p>
      <Button variant="secondary" onClick={onExit}>{t('Volver a las regiones', 'Back to regions')}</Button>
    </div>
  </div>;
}
