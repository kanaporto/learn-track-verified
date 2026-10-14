import { useEffect, useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowLeft, ArrowRight, Clock3, Flag, RotateCcw, FileSpreadsheet, TriangleAlert, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useText, usePreferences } from '@/lib/dumpi';
import { useCourses, type Course } from '@/lib/courses';
import { drawMockPlan, mockConfigFor, domainOf, mockReward, sameAnswer, type MockConfig } from '@/lib/mock-exam';
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
    <p className="text-muted-foreground mb-6">{t('Elige tu certificación. Cada simulacro sigue el número de preguntas, el tiempo y el reparto por materias de su guía oficial. Aquí Glitch no puede entrar.', 'Choose your certification. Each mock follows the question count, time and topic split of its official guide. Glitch can\'t get in here.')}</p>
    <div className="grid gap-3 sm:grid-cols-2">{courses.map(c => { const Logo = brandLogos[c.icon]; return <Link key={c.id} to="/mock-exam" search={{ course: c.id }} className="cert-card">
      <span className="cert-icon cert-logo">{Logo ? <Logo /> : <FileSpreadsheet size={25} />}</span>
      <h3>{mockConfigFor(c.id, c.questions).name === c.id ? c.name : mockConfigFor(c.id, c.questions).name}</h3><p>{mockConfigFor(c.id, c.questions).questions} {t('preguntas', 'questions')} · {mockConfigFor(c.id, c.questions).minutes} min · {statusLabel(mockConfigFor(c.id, c.questions), t)}</p>
    </Link>; })}</div>
  </div>;
  return <Exam key={`${course.id}-${run}`} course={course} onRetry={() => setRun(r => r + 1)} />;
}

function statusLabel(cfg: MockConfig, t: (es: string, en: string) => string) {
  return cfg.status === 'aligned' ? t('Alineado con la guía oficial', 'Aligned with the official guide')
    : cfg.status === 'partial' ? t('Cobertura en revisión', 'Coverage under review')
    : t('Práctica de conocimientos', 'Knowledge practice');
}

function Exam({ course, onRetry }: { course: Course; onRetry: () => void }) {
  const t = useText(); const { language } = usePreferences();
  const cfg = useMemo(() => mockConfigFor(course.id, course.questions), [course]);
  const draw = useMemo(() => drawMockPlan(course.questions, cfg), [course, cfg]);
  const set = draw.questions;
  const SECONDS = cfg.minutes * 60;
  const equivalent = cfg.status === 'aligned' && !draw.shortfall;
  const dn = (x: { es: string; en: string }) => language === 'es' ? x.es : x.en;
  const passPct = `${Math.round(cfg.pass * 1000) / 10} %`;
  const [started, setStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [left, setLeft] = useState(SECONDS);
  const [done, setDone] = useState<null | { correct: number; reward: number }>(null);

  function finish() {
    if (done) return;
    const correct = set.filter(q => sameAnswer(answers[q.id] ?? [], q.answer)).length;
    const reward = mockReward(correct, set.length, cfg.pass);
    updateProgress(p => ({ ...p, points: p.points + reward, mocks: [...(p.mocks ?? []), { course: course.id, correct, total: set.length, at: Date.now(), ids: set.map(q => q.id), wrong: set.filter(q => !sameAnswer(answers[q.id] ?? [], q.answer)).map(q => q.id), seconds: SECONDS - left }], mistakes: { ...p.mistakes, [course.id]: Array.from(new Set([...(p.mistakes?.[course.id] ?? []), ...set.filter(q => !sameAnswer(answers[q.id] ?? [], q.answer)).map(q => q.id)])) } }));
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
      <h2>{cfg.name === course.id ? course.name : cfg.name}</h2>
      <p>{t(`${set.length} preguntas · ${cfg.minutes} minutos · aprobado con ${passPct}${cfg.officialPass ? ' (oficial)' : ' (orientativo Dumpi Learn)'}. Aprobar suma 500 puntos; con 95 % o más, 650. No gastas vidas y Glitch no aparece.`, `${set.length} questions · ${cfg.minutes} minutes · pass mark ${passPct}${cfg.officialPass ? ' (official)' : ' (Dumpi Learn guideline)'}. Passing earns 500 points; 95 % or more earns 650. No lives spent and no Glitch.`)}</p>
      <p className="text-sm text-muted-foreground my-3">{t(cfg.noteEs, cfg.noteEn)}</p>
      {!equivalent && <p className="text-sm font-semibold text-destructive flex gap-2 my-3"><TriangleAlert size={18} className="shrink-0" />{t('Simulacro de práctica no equivalente al examen oficial.', 'Practice mock, not equivalent to the official exam.')}</p>}
      <BlueprintTable cfg={cfg} plan={draw.plan} dn={dn} />
      {cfg.source && <a href={cfg.source} target="_blank" rel="noreferrer" className="text-sm text-primary underline inline-flex items-center gap-1 my-3">{cfg.guide}<ExternalLink size={13} /></a>}
      <div />
      <Button className="h-14 px-8" onClick={() => setStarted(true)}>{t('Iniciar simulacro', 'Start mock exam')}<ArrowRight /></Button>
    </div></div>
  </div>;

  if (done) {
    const pct = Math.round((done.correct / set.length) * 100);
    const passed = done.reward > 0;
    const wrong = set.filter(q => !sameAnswer(answers[q.id] ?? [], q.answer));
    const byRegion = draw.plan.map((p, i) => { const qs = set.filter(q => domainOf(cfg, q) === p.domain); const ok = qs.filter(q => sameAnswer(answers[q.id] ?? [], q.answer)).length; return { r: { n: i, es: p.domain.es, en: p.domain.en, color: course.regions[i % course.regions.length]?.color ?? 'var(--primary)' }, ok, total: qs.length }; }).filter(x => x.total > 0);
    const answeredCount = set.filter(q => (answers[q.id] ?? []).length).length;
    const used = SECONDS - left; const usedTxt = `${Math.floor(used / 60)} min ${used % 60} s`;
    const weakest = [...byRegion].sort((x, y) => x.ok / x.total - y.ok / y.total)[0];
    return <div className="page-content pb-16">
      <MockOutro passed={passed} />
      <div className="text-center my-6">
        <h1 className="text-3xl font-black">{passed ? t('¡Simulacro aprobado!', 'Mock exam passed!') : t('Aún no lo tienes', 'Not quite yet')}</h1>
        <p className="text-5xl font-black my-3">{pct}%</p>
        <p className="text-muted-foreground">{done.correct}/{set.length} {t('correctas', 'correct')}{passed ? ` · +${done.reward} pts` : ` · ${t('necesitas', 'you need')} ${passPct}`}</p>
        <p className="text-sm text-muted-foreground mt-1">{t(`${answeredCount}/${set.length} respondidas · tiempo ${usedTxt} de ${cfg.minutes} min · criterio ${cfg.officialPass ? 'oficial' : 'orientativo Dumpi Learn'}`, `${answeredCount}/${set.length} answered · time ${usedTxt} of ${cfg.minutes} min · ${cfg.officialPass ? 'official' : 'Dumpi Learn guideline'} criterion`)}</p>
        {!equivalent && <p className="text-sm font-semibold text-destructive mt-2">{t('Simulacro de práctica no equivalente al examen oficial', 'Practice mock, not equivalent to the official exam')}</p>}
      </div>
      <section className="mock-breakdown">
        <h2 className="text-xl font-bold mb-4">{t('Desglose por dominio', 'Breakdown by domain')}</h2>
        <div className="grid gap-3">{byRegion.map(({ r, ok, total }) => { const p = Math.round((ok / total) * 100); return <div key={r.n}>
          <div className="flex justify-between gap-3 text-sm mb-1"><b>{language === 'es' ? r.es : r.en}</b><span className={p >= cfg.pass * 100 ? 'text-primary font-bold' : 'text-destructive font-bold'}>{ok}/{total} · {p}%</span></div>
          <div className="h-2.5 rounded-full bg-muted overflow-hidden"><div className="h-full rounded-full" style={{ width: `${p}%`, background: r.color }} /></div>
        </div>; })}</div>
        {weakest && weakest.ok < weakest.total && <p className="mt-4 font-semibold">🤖 {t('DUMPI te recomienda repasar:', 'DUMPI recommends reviewing:')} {dn(weakest.r)}</p>}
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
    <div className="flex flex-wrap gap-1.5 mb-5" aria-label={t('Preguntas', 'Questions')}>{set.map((x, i) => <button key={x.id} onClick={() => setIdx(i)} aria-label={`${t('Pregunta', 'Question')} ${i + 1}`} className={`q-dot ${i === idx ? 'is-current' : flags[x.id] ? 'is-flagged' : (answers[x.id] ?? []).length ? 'is-answered' : ''}`}>{i + 1}</button>)}</div>
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

function BlueprintTable({ cfg, plan, dn }: { cfg: MockConfig; plan: { domain: { es: string; en: string; weight: number }; target: number; available: number; drawn: number }[]; dn: (x: { es: string; en: string }) => string }) {
  const t = useText();
  const sum = cfg.domains.reduce((a, x) => a + x.weight, 0);
  return <div className="my-3 overflow-x-auto">
    <p className="text-xs text-muted-foreground mb-1">{cfg.officialWeights ? t('Reparto según pesos oficiales (normalizados)', 'Split by official weights (normalised)') : t('Reparto equilibrado: estimación de Dumpi Learn', 'Balanced split: Dumpi Learn estimate')}</p>
    <table className="w-full text-xs"><thead><tr className="text-left text-muted-foreground"><th>{t('Dominio', 'Domain')}</th><th>%</th><th>{t('Obj.', 'Target')}</th><th>{t('Banco', 'Bank')}</th></tr></thead>
      <tbody>{plan.map(p => <tr key={p.domain.es} className={p.drawn < p.target ? 'text-destructive font-semibold' : ''}>
        <td className="pr-2 py-0.5">{dn(p.domain)}</td><td>{Math.round((p.domain.weight / sum) * 1000) / 10}</td><td>{p.drawn < p.target ? `${p.drawn}/${p.target}` : p.target}</td><td>{p.available}</td>
      </tr>)}</tbody></table>
    {plan.some(p => p.drawn < p.target) && <p className="text-xs text-destructive mt-1">{t('Cobertura insuficiente en los dominios en rojo: no se compensan con otras materias.', 'Insufficient coverage in red domains: not back-filled with other topics.')}</p>}
  </div>;
}
