import { useEffect, useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowRight, BookOpen, CheckCircle2, Clock3, GraduationCap, Heart, Trophy, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePreferences, useText } from '@/lib/dumpi';
import { useCourses } from '@/lib/courses';
import { MAX_LIVES, clearMistake, msToNextLife, recordMistake, setLives, useProgress } from '@/lib/progress';
import { sameAnswer, PASS_RATIO } from '@/lib/mock-exam';
import { useExplorer } from '@/lib/explorer';
import { PageTitle } from './pages';
import { Options, Explanation } from './practice';
import { SignInGate } from './register';
import dumpiImg from '@/assets/dumpi.png';

function Empty({ title, text, to, cta }: { title: string; text: string; to: '/practice' | '/mock-exam'; cta: string }) {
  return <div className="pending-layout"><img src={dumpiImg} alt="DUMPI" width={180} height={180} /><div><h2>{title}</h2><p>{text}</p><Button asChild><Link to={to}>{cta}<ArrowRight /></Link></Button></div></div>;
}

/* ---------- Mistake review ---------- */
export function ReviewPage() {
  const t = useText(); const { language } = usePreferences(); const p = useProgress(); const courses = useCourses(); const explorer = useExplorer();
  const [courseId, setCourseId] = useState<string | null>(null);
  const [idx, setIdx] = useState(0); const [picked, setPicked] = useState<string[]>([]); const [result, setResult] = useState<null | boolean>(null);
  const withMistakes = courses.filter(c => (p?.mistakes?.[c.id] ?? []).length > 0);
  const course = courses.find(c => c.id === courseId) ?? withMistakes[0];
  // Freeze the queue when a session starts so solved questions don't vanish mid-answer.
  const queue = useMemo(() => course ? course.questions.filter(q => (p?.mistakes?.[course.id] ?? []).includes(q.id)) : [], [course?.id, courseId]); // eslint-disable-line react-hooks/exhaustive-deps
  if (explorer === null) return <div className="page-content"><SignInGate /></div>;
  if (!p) return null;
  const head = <PageTitle eyebrow={t('APRENDE DE CADA FALLO', 'LEARN FROM EVERY MISS')} title={t('Repaso de errores', 'Mistake review')} subtitle={t('Sin vidas ni puntos: solo tú y las preguntas que se te resistieron.', 'No lives, no points: just you and the questions that resisted.')} />;
  if (!course || queue.length === 0) return <div className="page-content">{head}<Empty title={t('¡Nada que repasar!', 'Nothing to review!')} text={t('Cuando falles una pregunta en la aventura o en un simulacro, aparecerá aquí.', 'When you miss a question in the adventure or a mock exam, it shows up here.')} to="/practice" cta={t('Ir a la aventura', 'Go to the adventure')} /></div>;
  const q = queue[idx % queue.length]!; const text = language === 'es' ? q.es : q.en;
  const left = (p.mistakes?.[course.id] ?? []).length;
  const toggle = (l: string) => result === null && setPicked(x => q.multi ? (x.includes(l) ? x.filter(y => y !== l) : [...x, l]) : [l]);
  const check = () => { const ok = sameAnswer(picked, q.answer); setResult(ok); if (ok) clearMistake(course.id, q.id); else recordMistake(course.id, q.id); };
  const next = () => { setIdx(i => i + 1); setPicked([]); setResult(null); };
  return <div className="page-content pb-32">{head}
    {withMistakes.length > 1 && <div className="flex flex-wrap gap-2 mb-4">{withMistakes.map(c => <Button key={c.id} size="sm" variant={c.id === course.id ? 'default' : 'outline'} onClick={() => { setCourseId(c.id); setIdx(0); setPicked([]); setResult(null); }}>{c.name} · {(p.mistakes?.[c.id] ?? []).length}</Button>)}</div>}
    <p className="text-sm text-muted-foreground"><BookOpen size={14} className="inline mr-1" />{course.name} · {t(`${left} pendientes`, `${left} pending`)}</p>
    <h2 className="text-lg font-semibold my-4 leading-snug">{text.q}</h2>
    <Options q={q} text={text} picked={picked} result={result} toggle={toggle} />
    {result !== null && <div className="mt-4">{result ? <p className="font-bold text-primary flex items-center gap-2"><CheckCircle2 />{t('¡Dominada! Sale de tu lista.', 'Mastered! Removed from your list.')}</p> : <><p className="font-bold text-destructive flex items-center gap-2 mb-2"><XCircle />{t('Sigue en tu lista.', 'Stays on your list.')}</p><Explanation q={q} /></>}</div>}
    <div className="check-bar"><div className="max-w-2xl mx-auto flex gap-2">
      {result === null ? <Button className="flex-1 h-14 text-base" disabled={!picked.length} onClick={check}>{t('Comprobar', 'Check')}</Button> : <Button className="flex-1 h-14 text-base" onClick={next}>{t('Siguiente', 'Next')}<ArrowRight /></Button>}
    </div></div>
  </div>;
}

/* ---------- Mock exam results ---------- */
export function ResultsPage() {
  const t = useText(); const { language } = usePreferences(); const p = useProgress(); const courses = useCourses(); const explorer = useExplorer();
  const [sel, setSel] = useState(0);
  if (explorer === null) return <div className="page-content"><SignInGate /></div>;
  if (!p) return null;
  const mocks = [...(p.mocks ?? [])].reverse();
  const head = <PageTitle eyebrow={t('TU HISTORIAL', 'YOUR HISTORY')} title={t('Resultados', 'Results')} subtitle={t('Cada simulacro, desglosado por dominio para saber dónde reforzar.', 'Every mock exam, broken down by domain so you know where to improve.')} />;
  if (!mocks.length) return <div className="page-content">{head}<Empty title={t('Aún no hay simulacros', 'No mock exams yet')} text={t('Haz tu primer simulacro y verás aquí tu nota y el desglose.', 'Take your first mock exam and your score and breakdown will appear here.')} to="/mock-exam" cta={t('Hacer simulacro', 'Take a mock exam')} /></div>;
  const m = mocks[Math.min(sel, mocks.length - 1)]!;
  const course = courses.find(c => c.id === m.course);
  const pct = Math.round((m.correct / m.total) * 100); const passed = m.correct / m.total >= PASS_RATIO;
  const byId = new Map(course?.questions.map(q => [q.id, q]) ?? []);
  const wrongSet = new Set(m.wrong ?? []);
  const domains = course?.regions.map(r => {
    const qs = (m.ids ?? []).map(id => byId.get(id)).filter(q => q && q.region === r.n);
    const ok = qs.filter(q => !wrongSet.has(q!.id)).length;
    return { r, total: qs.length, ok };
  }).filter(d => d.total > 0) ?? [];
  const wrong = (m.wrong ?? []).map(id => byId.get(id)).filter(Boolean);
  return <div className="page-content pb-16">{head}
    <div className="flex flex-wrap gap-2 mb-5">{mocks.slice(0, 10).map((x, i) => <Button key={x.at} size="sm" variant={i === sel ? 'default' : 'outline'} onClick={() => setSel(i)}>{new Date(x.at).toLocaleDateString()} · {Math.round(x.correct / x.total * 100)}%</Button>)}</div>
    <div className="tech-board p-6 text-center">
      <Trophy size={44} className="mx-auto mb-2 text-primary" />
      <p className="text-white/80 text-sm">{course?.name ?? m.course}</p>
      <p className="text-5xl font-black text-white my-2">{pct}%</p>
      <p className={passed ? 'text-emerald-300 font-bold' : 'text-red-300 font-bold'}>{passed ? t('APROBADO', 'PASSED') : t('SUSPENSO', 'FAILED')} · {m.correct}/{m.total}</p>
      {m.seconds != null && <p className="text-white/70 text-sm mt-1"><Clock3 size={14} className="inline mr-1" />{Math.floor(m.seconds / 60)} min {m.seconds % 60} s</p>}
    </div>
    {domains.length > 0 && <><h2 className="text-xl font-bold mt-8 mb-3">{t('Por dominio', 'By domain')}</h2>
      <div className="grid gap-3">{domains.map(({ r, total, ok }) => { const v = Math.round(ok / total * 100); return <div key={r.n}>
        <div className="flex justify-between text-sm mb-1"><span>{language === 'es' ? r.es : r.en}</span><b>{ok}/{total}</b></div>
        <div className="h-2.5 rounded-full bg-muted overflow-hidden"><div className="h-full" style={{ width: `${v}%`, background: r.color }} /></div>
      </div>; })}</div></>}
    {!m.ids && <p className="text-sm text-muted-foreground mt-6">{t('Este simulacro es anterior al desglose detallado.', 'This mock exam predates the detailed breakdown.')}</p>}
    {wrong.length > 0 && <><h2 className="text-xl font-bold mt-8 mb-4">{t('Preguntas falladas', 'Missed questions')} ({wrong.length})</h2>
      <div className="grid gap-6">{wrong.map(q => { const text = language === 'es' ? q!.es : q!.en; return <div key={q!.id}><p className="font-semibold mb-3">{text.q}</p><Options q={q!} text={text} picked={[]} result={false} toggle={() => {}} /><Explanation q={q!} /></div>; })}</div>
      <Button asChild className="mt-6"><Link to="/review">{t('Repasar mis errores', 'Review my mistakes')}<ArrowRight /></Link></Button></>}
  </div>;
}

/* ---------- Lives ---------- */
export function LivesPage() {
  const t = useText(); const p = useProgress(); const explorer = useExplorer();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);
  if (explorer === null) return <div className="page-content"><SignInGate /></div>;
  if (!p) return null;
  const ms = msToNextLife(p, now);
  const mm = ms == null ? '' : `${String(Math.floor(ms / 60000)).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}`;
  const empty = p.lives <= 0;
  return <div className="page-content">
    <PageTitle eyebrow={t('ENERGÍA DE DUMPI', "DUMPI'S ENERGY")} title={t('Mis vidas', 'My lives')} subtitle={t('Cada fallo en la aventura cuesta una vida. Se recupera 1 por hora.', 'Every miss in the adventure costs a life. You regain 1 per hour.')} />
    <div className="pending-layout"><img src={dumpiImg} alt="DUMPI" width={180} height={180} className={empty ? 'grayscale opacity-70' : ''} /><div>
      <div className="flex flex-wrap gap-1.5 mb-4" aria-label={t(`${p.lives} de ${MAX_LIVES} vidas`, `${p.lives} of ${MAX_LIVES} lives`)}>{Array.from({ length: MAX_LIVES }, (_, i) => <Heart key={i} size={26} className={i < p.lives ? 'text-destructive' : 'text-muted-foreground/40'} fill={i < p.lives ? 'currentColor' : 'none'} />)}</div>
      <h2>{p.lives}/{MAX_LIVES} {t('vidas', 'lives')}</h2>
      <p>{ms == null ? t('¡Energía al máximo! DUMPI está listo para la aventura.', 'Full energy! DUMPI is ready for the adventure.') : <>{t('Siguiente vida en', 'Next life in')} <b className="text-2xl tabular-nums">{mm}</b></>}</p>
      <div className="flex flex-wrap gap-3 mt-4">
        <Button asChild><Link to="/practice">{empty ? <><GraduationCap />{t('Reto de aprendizaje: gana vidas', 'Learning challenge: earn lives')}</> : <>{t('Seguir jugando', 'Keep playing')}<ArrowRight /></>}</Link></Button>
        {p.lives < MAX_LIVES && <Button variant="outline" onClick={() => setLives(MAX_LIVES)}><Heart />{t('Recarga de prueba (10 vidas)', 'Test refill (10 lives)')}</Button>}
      </div>
      <p className="text-xs text-muted-foreground mt-3">{t('Retos de aprendizaje: acierta preguntas de repaso para ganar vidas extra (+1, y +2 de bonus al tercer acierto). La recarga es solo para el hackatón.', 'Learning challenges: answer review questions to earn extra lives (+1, plus a +2 bonus on the third hit). The refill is for the hackathon only.')}</p>
    </div></div>
  </div>;
}
