import { createFileRoute, Link } from '@tanstack/react-router';
import { Heart, Trophy, Star, Swords, Map as MapIcon, Lock, Play, Zap, ChevronRight, Shield } from 'lucide-react';
import { Catalog } from '@/components/dumpi/catalog';
import { useText, pageHead } from '@/lib/dumpi';
import landscape from '@/assets/compostela.jpg';
import dumpi from '@/assets/dumpi.png';
import glitch from '@/assets/glitch.png';

export const Route = createFileRoute('/')({ head: () => pageHead('Mi aventura', 'Tu aventura de aprendizaje IT con DUMPI, rumbo a una Compostela imaginaria.'), component: Index });

const regions = [
  { n: '01', es: 'Bosque de los Caminos', en: 'Forest of Paths', color: 'var(--region-1)' },
  { n: '02', es: 'Ribera del Molino', en: 'Mill Riverside', color: 'var(--region-2)' },
  { n: '03', es: 'Monasterio de Pergaminos', en: 'Scroll Monastery', color: 'var(--region-3)' },
  { n: '04', es: 'Castillo del Foso', en: 'Moat Castle', color: 'var(--region-4)' },
  { n: '05', es: 'Faro del Vigía', en: 'Watchtower Beacon', color: 'var(--region-5)' },
  { n: '06', es: 'Calzada del Maestro', en: "Master's Road", color: 'var(--region-6)' },
];

function Index() {
  const t = useText();
  return <div className="page-content home-page game-home">
    <div className="hud">
      <span className="hud-pill hud-lives"><span className="hud-gem"><Heart size={16} fill="currentColor" /></span><b>—</b><small>/10</small></span>
      <span className="hud-pill hud-points"><span className="hud-gem"><Star size={16} fill="currentColor" /></span><b>—</b><small>PTS</small></span>
      <span className="hud-pill hud-rank"><span className="hud-gem"><Shield size={16} /></span><b>LV.—</b></span>
    </div>

    <section className="arena">
      <img className="arena-bg" src={landscape} width={1536} height={1024} alt={t('Camino fantástico hacia una Compostela imaginaria', 'A fantasy trail towards imaginary Compostela')} />
      <div className="arena-shade" />
      <div className="arena-tag"><span>/// {t('TEMPORADA', 'SEASON')} 01</span><span className="hazard" /></div>
      <div className="arena-copy">
        <span className="kicker">{t('RUMBO A COMPOSTELA', 'ROAD TO COMPOSTELA')}</span>
        <h1 className="game-title">{t('Mi aventura', 'My adventure')}</h1>
        <p>{t('Elige tu certificación y avanza casilla a casilla con DUMPI.', 'Pick your certification and advance tile by tile with DUMPI.')}</p>
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
        {regions.map((r, i) => <div key={r.n} className={`region-tile ${i === 0 ? 'is-next' : ''}`} style={{ ['--rc' as string]: r.color }}>
          <span className="region-num">{r.n}</span>
          <strong>{t(r.es, r.en)}</strong>
          <span className="region-stars"><Star size={13} /><Star size={13} /><Star size={13} /></span>
          <span className="region-bar"><i style={{ width: '0%' }} /></span>
          <span className="region-state">{i === 0 ? <><MapIcon size={13} />0/10</> : <><Lock size={13} />{t('Bloqueada', 'Locked')}</>}</span>
        </div>)}
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
