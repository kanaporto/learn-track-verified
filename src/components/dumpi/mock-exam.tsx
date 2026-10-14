import { useEffect, useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowLeft, ArrowRight, Clock3, Flag, Trophy, RotateCcw, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useText, usePreferences } from '@/lib/dumpi';
import { useCourses, type Course } from '@/lib/courses';
import { drawMock, mockReward, sameAnswer, PASS_RATIO, SECONDS_PER_QUESTION, MOCK_SIZE } from '@/lib/mock-exam';
import { updateProgress } from '@/lib/progress';
import { useExplorer } from '@/lib/explorer';
import { SignInGate as RegisterCard } from './register';
import { brandLogos } from './logos';
import { Options, Explanation } from './practice';
import dumpiImg from '@/assets/dumpi.png';
import glitchImg from '@/assets/glitch.png';
import { playLose, playWin } from '@/lib/sound';

function MockOutro({ passed }: { passed: boolean }) {
  const t = useText();
  return passed
    ? <div className="victory-stage mock-outro">
        <div className="victory-dumpi-wrap"><img src={dumpiImg} alt={t('DUMPI bailando', 'DUMPI dancing')} className="victory-dumpi" /><span className="spark s1">✦</span><span className="spark s2">✦</span><span className="spark s3">✦</span></div>
        <div className="victory-glitch"><span className="glitch-bubble">{t('«¡Nooo! Has aprobado… Tu conocimiento es superior. Me rindo, ¡enhorabuena!»', '"Nooo! You passed… Your knowledge is superior. I give up, congratulations!"')}</span><img src={glitchImg} alt={t('Glitch llorando', 'Glitch crying')} /><span className="glitch-tear t1" /><span className="glitch-tear t2" /></div>
      </div>
    : <div className="nolives-stage mock-outro">
        <div className="nolives-glitch"><span className="glitch-bubble">{t('«¡JA, JA! Te voy a castigar repasando la lección toda la tarde. Empieza por los dominios en rojo 👾📚»', '"HA HA! I\'m going to punish you by reviewing the lesson all afternoon. Start with the red domains 👾📚"')}</span><img src={glitchImg} alt={t('Glitch riéndose', 'Glitch laughing')} /></div>
        <div className="nolives-dumpi"><img src={dumpiImg} alt={t('DUMPI triste', 'Sad DUMPI')} /><span className="nolives-tear" /></div>
      </div>;
}

export function MockExamPage({ courseId }: { courseId?: string | undefined }) {
  const t = useText();
  const explorer = useExplorer();
  const courses = useCourses();
  const course = courses.find(c => c.id === courseId);
  const [run, setRun] = useState(0);
  if (!explorer) return <div className="page-content"><RegisterCard /></div>;
  if (!course) return <div className="page-content">
    <Button asChild variant="ghost" className="back-link"><Link to="/"><ArrowLeft />{t('Aventura', 'Adventure')}</Link></Button>
    <h1 className="text-3xl font-black mb-2">{t('Simulacro de examen', 'Mock exam')}</h1>
    <p className="text-muted-foreground mb-6">{t(`Elige tu certificación. ${MOCK_SIZE} preguntas repartidas por todos los dominios, con tiempo y nota final. Aquí Glitch no puede entrar.`, `Choose your certification. ${MOCK_SIZE} questions across every domain, timed and scored. Glitch can't get in here.`)}</p>
    <div className="grid gap-3 sm:grid-cols-2">{courses.map(c => { const Logo = brandLogos[c.icon]; return <Link key={c.id} to="/mock-exam" search={{ course: c.id }} className="cert-card">
      <span className="cert-icon cert-logo">{Logo ? <Logo /> : <FileSpreadsheet size={25} />}</span>
      <h3>{c.name}</h3><p>{Math.min(MOCK_SIZE, c.questions.length)} {t('preguntas', 'questions')} · {Math.round(Math.min(MOCK_SIZE, c.questions.length) * SECONDS_PER_QUESTION / 60)} min</p>
    </Link>; })}</div>
  </div>;
  return <Exam key={`${course.id}-${run}`} course={course} onRetry={() => setRun(r => r + 1)} />;
}

function Exam({ course, onRetry }: { course: Course; onRetry: () => void }) {
  const t = useText(); const { language } = usePreferences();
  const set = useMemo(() => drawMock(course.questions), [course]);
  const [started, setStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [left, setLeft] = useState(set.length * SECONDS_PER_QUESTION);
  const [done, setDone] = useState<null | { correct: number; reward: number }>(null);

  function finish() {
    if (done) return;
    const correct = set.filter(q => sameAnswer(answers[q.id] ?? [], q.answer)).length;
    const reward = mockReward(correct, set.length);
    updateProgress(p => ({ ...p, points: p.points + reward, mocks: [...(p.mocks ?? []), { course: course.id, correct, total: set.length, at: Date.now(), ids: set.map(q => q.id), wrong: set.filter(q => !sameAnswer(answers[q.id] ?? [], q.answer)).map(q => q.id), seconds: set.length * SECONDS_PER_QUESTION - left }], mistakes: { ...p.mistakes, [course.id]: Array.from(new Set([...(p.mistakes?.[course.id] ?? []), ...set.filter(q => !sameAnswer(answers[q.id] ?? [], q.answer)).map(q => q.id)])) } }));
    setDone({ correct, reward });
    if (reward > 0) playWin(); else playLose();
  }
  useEffect(() => {
    if (!started || done) return;
    if (left <= 0) { finish(); return; }
    const id = setTimeout(() => setLeft(l => l - 1), 1000);
    return () => clearTimeout(id);
  });

  if (!started) return <div className="page-content">
    <Button asChild variant="ghost" className="back-link"><Link to="/mock-exam"><ArrowLeft />{t('Simulacros', 'Mock exams')}</Link></Button>
    <div className="pending-layout"><img src={dumpiImg} alt="DUMPI" width={200} height={200} /><div>
      <span className="status-tag status-ready"><Clock3 size={13} />{t('Listo', 'Ready')}</span>
      <h2>{course.name}</h2>
      <p>{t(`${set.length} preguntas · ${Math.round(set.length * SECONDS_PER_QUESTION / 60)} minutos · aprobado con ${PASS_RATIO * 100} %. Aprobar suma 500 puntos; con 95 % o más, 650. No gastas vidas y Glitch no aparece. Es preparación, no una certificación oficial.`, `${set.length} questions · ${Math.round(set.length * SECONDS_PER_QUESTION / 60)} minutes · pass mark ${PASS_RATIO * 100} %. Passing earns 500 points; 95 % or more earns 650. No lives spent and no Glitch. This is preparation, not an official certification.`)}</p>
      <Button className="h-14 px-8" onClick={() => setStarted(true)}>{t('Iniciar simulacro', 'Start mock exam')}<ArrowRight /></Button>
    </div></div>
  </div>;

  if (done) {
    const pct = Math.round((done.correct / set.length) * 100);
    const passed = done.reward > 0;
    const wrong = set.filter(q => !sameAnswer(answers[q.id] ?? [], q.answer));
    const byRegion = course.regions.map(r => { const qs = set.filter(q => q.region === r.n); const ok = qs.filter(q => sameAnswer(answers[q.id] ?? [], q.answer)).length; return { r, ok, total: qs.length }; }).filter(x => x.total > 0);
    return <div className="page-content pb-16">
      <MockOutro passed={passed} />
      <div className="text-center my-6">
        <h1 className="text-3xl font-black">{passed ? t('¡Simulacro aprobado!', 'Mock exam passed!') : t('Aún no lo tienes', 'Not quite yet')}</h1>
        <p className="text-5xl font-black my-3">{pct}%</p>
        <p className="text-muted-foreground">{done.correct}/{set.length} {t('correctas', 'correct')}{passed ? ` · +${done.reward} pts` : ` · ${t('necesitas', 'you need')} ${PASS_RATIO * 100} %`}</p>
      </div>
      <section className="mock-breakdown">
        <h2 className="text-xl font-bold mb-4">{t('Desglose por dominio', 'Breakdown by domain')}</h2>
        <div className="grid gap-3">{byRegion.map(({ r, ok, total }) => { const p = Math.round((ok / total) * 100); return <div key={r.n}>
          <div className="flex justify-between gap-3 text-sm mb-1"><b>{language === 'es' ? r.es : r.en}</b><span className={p >= PASS_RATIO * 100 ? 'text-primary font-bold' : 'text-destructive font-bold'}>{ok}/{total} · {p}%</span></div>
          <div className="h-2.5 rounded-full bg-muted overflow-hidden"><div className="h-full rounded-full" style={{ width: `${p}%`, background: r.color }} /></div>
        </div>; })}</div>
      </section>
      <div className="flex flex-wrap justify-center gap-3 mt-6">
        <Button onClick={onRetry}><RotateCcw />{t('Otro simulacro', 'Another mock exam')}</Button>
        <Button asChild variant="outline"><Link to="/review">{t('Repasar errores', 'Review mistakes')}</Link></Button>
        <Button asChild variant="outline"><Link to="/practice" search={{ course: course.id }}>{t('Practicar en la aventura', 'Practise in the adventure')}</Link></Button>
      </div>
      {wrong.length > 0 && <><h2 className="text-xl font-bold mt-8 mb-4">{t('Revisa tus fallos', 'Review your misses')} ({wrong.length})</h2>
        <div className="grid gap-6">{wrong.map(q => { const text = language === 'es' ? q.es : q.en; return <div key={q.id}>
          <p className="font-semibold mb-3">{text.q}</p>
          <Options q={q} text={text} picked={answers[q.id] ?? []} result={false} toggle={() => {}} />
          <Explanation q={q} />
        </div>; })}</div></>}
    </div>;
  }

  const q = set[idx]!; const text = language === 'es' ? q.es : q.en;
  const picked = answers[q.id] ?? [];
  const toggle = (l: string) => setAnswers(a => ({ ...a, [q.id]: q.multi ? (picked.includes(l) ? picked.filter(x => x !== l) : [...picked, l]) : [l] }));
  const answered = set.filter(x => (answers[x.id] ?? []).length).length;
  const mm = String(Math.floor(left / 60)).padStart(2, '0'), ss = String(left % 60).padStart(2, '0');
  return <div className="page-content pb-32">
    <div className="flex items-center justify-between gap-3 mb-3">
      <b>{course.name}</b>
      <span className={`hud-pill hud-sm ${left < 300 ? 'text-destructive' : ''}`}><Clock3 size={15} /><b>{mm}:{ss}</b></span>
    </div>
    <div className="h-2 rounded-full bg-muted overflow-hidden mb-2"><div className="h-full bg-primary transition-all" style={{ width: `${(answered / set.length) * 100}%` }} /></div>
    <div className="flex flex-wrap gap-1.5 mb-5" aria-label={t('Preguntas', 'Questions')}>{set.map((x, i) => <button key={x.id} onClick={() => setIdx(i)} aria-label={`${t('Pregunta', 'Question')} ${i + 1}`} className={`w-7 h-7 rounded-md text-xs font-bold border ${i === idx ? 'border-primary bg-primary text-primary-foreground' : flags[x.id] ? 'border-amber-500' : (answers[x.id] ?? []).length ? 'bg-secondary border-border' : 'border-border'}`}>{i + 1}</button>)}</div>
    <p className="text-sm text-muted-foreground">{t('Pregunta', 'Question')} {idx + 1}/{set.length}{q.multi ? ` · ${t(`Selecciona ${q.answer.length}`, `Select ${q.answer.length}`)}` : ''}</p>
    <h2 className="text-lg font-semibold my-4 leading-snug">{text.q}</h2>
    <Options q={q} text={text} picked={picked} result={null} toggle={toggle} />
    <Button variant="ghost" className="mt-3" onClick={() => setFlags(f => ({ ...f, [q.id]: !f[q.id] }))}><Flag />{flags[q.id] ? t('Quitar marca', 'Unflag') : t('Marcar para revisar', 'Flag for review')}</Button>
    <div className="check-bar"><div className="max-w-2xl mx-auto flex gap-2">
      <Button variant="outline" className="h-14" disabled={idx === 0} onClick={() => setIdx(i => i - 1)}><ArrowLeft /></Button>
      {idx < set.length - 1
        ? <Button className="flex-1 h-14 text-base" onClick={() => setIdx(i => i + 1)}>{t('Siguiente', 'Next')}<ArrowRight /></Button>
        : <Button className="flex-1 h-14 text-base" onClick={() => { if (answered === set.length || confirm(t(`Te faltan ${set.length - answered} preguntas. ¿Entregar igualmente?`, `${set.length - answered} questions unanswered. Submit anyway?`))) finish(); }}>{t('Entregar examen', 'Submit exam')}</Button>}
    </div></div>
  </div>;
}
