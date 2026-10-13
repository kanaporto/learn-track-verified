import { createFileRoute, Link } from '@tanstack/react-router';
import { Heart, Trophy, Star, Swords, Map as MapIcon, Play, Zap, ChevronRight, Shield } from 'lucide-react';
import { Catalog } from '@/components/dumpi/catalog';
import { useText, pageHead } from '@/lib/dumpi';
import { useProgress, playerLevel, courseOf } from '@/lib/progress';
import landscape from '@/assets/silicon-hero.jpg';
import dumpi from '@/assets/dumpi.png';
import glitch from '@/assets/glitch.png';

export const Route = createFileRoute('/')({ head: () => pageHead('Mi aventura', 'Tu aventura de aprendizaje IT con DUMPI, rumbo a Silicon Valley, el corazón del mundo tech.'), component: Index });

import { workspaceCourse } from '@/lib/courses';
const regions = workspaceCourse.regions.map(r => ({ ...r, n: String(r.n).padStart(2, '0') }));

function Index() {
  const t = useText();
  const p = useProgress();
  const ws = p ? courseOf(p, 'workspace') : null;
  return <div className="page-content home-page game-home">
    <div className="hud">
      <span className="hud-pill hud-lives"><span className="hud-gem"><Heart size={16} fill="currentColor" /></span><b>{p ? p.lives : '—'}</b><small>/10</small></span>
      <span className="hud-pill hud-points"><span className="hud-gem"><Star size={16} fill="currentColor" /></span><b>{p ? p.points : '—'}</b><small>PTS</small></span>
      <span className="hud-pill hud-rank"><span className="hud-gem"><Shield size={16} /></span><b>LV.{p ? playerLevel(p.points) : '—'}</b></span>
    </div>

    <section className="arena">
      <img className="arena-bg" src={landscape} width={1536} height={1024} alt={t('Camino fantástico hacia la aventura tech', 'A fantasy trail towards the tech adventure')} />
      <div className="arena-shade" />
      <div className="arena-tag"><span>/// {t('TEMPORADA', 'SEASON')} 01</span><span className="hazard" /></div>
      <div className="arena-copy">
        <span className="kicker">{t('RUMBO A SILICON VALLEY', 'ROAD TO SILICON VALLEY')}</span>
        <h1 className="game-title">{t('Mi aventura', 'My adventure')}</h1>
        <p>{t('Elige tu certificación para estar más cerca del corazón del mundo tech.', 'Choose your certification to get closer to the heart of the tech world.')}</p>
      </div>
      <img className="arena-dumpi" src={dumpi} width={1024} height={1024} alt="DUMPI" />
      <span className="speech">{t('¡A por ello!', "Let's go!")}</span>
      <div className="arena-cta">
        <Link to="/certifications" className="btn-chunky btn-gold"><Play size={22} fill="currentColor" />{t('JUGAR', 'PLAY')}</Link>
        <Link to="/mock-exam" className="btn-chunky btn-blue"><Swords size={20} />{t('Simulacro', 'Mock exam')}</Link>
      </div>
    </section>

    <section>
      <div className="zzz-heading"><span className="zzz-index">// 01</span><h2>{t('Regiones', 'Regions')}</h2><span className="zzz-line" /><Link to="/certifications" className="zzz-link">{t('Ver mapa', 'View map')}<ChevronRight size={16} /></Link></div>
      <div className="region-rail">
        {regions.map((r, i) => { const n = i + 1; const done = !!ws?.completed.includes(n); const tile = ws?.tiles[n] ?? 0; return <Link key={r.n} to="/practice" search={{ region: n }} className={`region-tile ${done ? 'is-done' : tile > 0 || (i === 0 && !done) ? 'is-next' : ''}`} style={{ ['--rc' as string]: r.color }}>
          <span className="region-num">{r.n}</span>
          <strong>{t(r.es, r.en)}</strong>
          <span className="region-stars">{[0, 1, 2].map(k => <Star key={k} size={13} fill={done ? 'currentColor' : 'none'} />)}</span>
          <span className="region-bar"><i style={{ width: `${done ? 100 : tile * 10}%` }} /></span>
          <span className="region-state">{done ? <>{t('¡COMPLETADA!', 'COMPLETED!')}</> : <><MapIcon size={13} />{tile}/10</>}</span>
        </Link>; })}
      </div>
    </section>

    <section>
      <div className="zzz-heading"><span className="zzz-index">// 02</span><h2>{t('Certificaciones', 'Certifications')}</h2><span className="zzz-line" /><Link to="/certifications" className="zzz-link">{t('Ver todas', 'View all')}<ChevronRight size={16} /></Link></div>
      <Catalog compact />
    </section>

    <section className="villain-card">
      <span className="villain-stripes" />
      <img src={glitch} alt="Glitch" width={1024} height={1024} loading="lazy" />
      <div><span className="kicker kicker-hot"><Zap size={13} />{t('AMENAZA DETECTADA', 'THREAT DETECTED')}</span><h3 className="game-title">Glitch</h3><p>{t('Tres fallos en tus últimas cinco preguntas y aparecerá. Repasa para vencerlo.', 'Miss three of your last five questions and he shows up. Review to beat him.')}</p></div>
      <Link to="/review" className="btn-chunky btn-red"><Trophy size={18} />{t('Mi repaso', 'My review')}</Link>
    </section>
  </div>;
}
