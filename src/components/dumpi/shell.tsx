import { Link, useRouterState } from '@tanstack/react-router';
import { Compass, BookOpen, Trophy, UserRound, ChartNoAxesCombined, Volume2, VolumeX, ArrowUpRight, FlaskConical, Bot, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePreferences, useText } from '@/lib/dumpi';
import dumpi from '@/assets/dumpi.png';
import type { ReactNode } from 'react';
import { useExplorer } from '@/lib/explorer';
import { useEffect } from 'react';
import { startMenuMusic, stopMenuMusic } from '@/lib/sound';

export function AppShell({ children }: { children: ReactNode }) {
  const t = useText();
  const { language, setLanguage, sound, setSound } = usePreferences();
  const explorer = useExplorer();
  const path = useRouterState({ select: s => s.location.pathname });
  const inGame = /^\/(practice|mock-exam|exam|review)/.test(path);
  useEffect(() => {
    if (!sound || inGame) { stopMenuMusic(); return; }
    startMenuMusic();
    // Browsers block audio until the first tap; retry on interaction.
    const kick = () => startMenuMusic();
    window.addEventListener('pointerdown', kick, { once: true });
    return () => { window.removeEventListener('pointerdown', kick); stopMenuMusic(); };
  }, [sound, inGame]);
  const nav = [{ to: '/', icon: Compass, label: t('Mi aventura', 'My adventure') }, { to: '/certifications', icon: BookOpen, label: t('Certificaciones', 'Certifications') }, { to: '/leaderboards', icon: Trophy, label: t('Clasificaciones', 'Leaderboards') }, { to: '/statistics', icon: ChartNoAxesCombined, label: t('Mis estadísticas', 'My statistics') }, { to: '/profile', icon: UserRound, label: t('Mi perfil', 'My profile') }] as const;
  return <div className="app-layout">
    <aside className="sidebar">
      <Link to="/" className="brand"><span className="brand-icon"><Bot size={25} /></span><span>dumpi<span className="text-primary">learn</span><small>{t('UN PASO MÁS CERCA', 'ONE STEP CLOSER')}</small></span></Link>
      <div className="sidebar-label">{t('TU CAMINO', 'YOUR JOURNEY')}</div>
      <nav>{nav.map(({ to, icon: Icon, label }) => <Button asChild variant="ghost" key={to} className={`nav-item ${path === to ? 'active' : ''}`}><Link to={to}><Icon size={20} /><span>{label}</span>{path === to && <span className="nav-dot" />}</Link></Button>)}</nav>
      <div className="sidebar-bottom"><img src={dumpi} alt="DUMPI" width={100} height={100} /><strong>{t('Pequeños pasos.', 'Small steps.')}<br />{t('Grandes aventuras.', 'Great adventures.')}</strong><div className="mt-4 text-xs text-muted-foreground">{t('DUMPI te acompaña en el camino.', 'DUMPI is with you on the journey.')}</div></div>
      <div className="trial-label"><FlaskConical size={15} />{t('Edición hackatón', 'Hackathon edition')}</div>
    </aside>
    <div className="app-main"><header className="topbar"><span className="topbar-note"><Compass size={17} />{t('Tu próxima aventura empieza aquí', 'Your next adventure starts here')}</span><div className="topbar-actions"><Button variant="ghost" size="sm" onClick={() => setLanguage(language === 'es' ? 'en' : 'es')} aria-label={t('Cambiar idioma', 'Change language')}><Globe />{language.toUpperCase()}</Button><Button variant="ghost" size="icon" title={t('Sonido', 'Sound')} aria-label={t('Alternar sonido', 'Toggle sound')} onClick={() => setSound(!sound)}>{sound ? <Volume2 /> : <VolumeX />}</Button><span className="topbar-divider" />{explorer ? <span className="explorer-chip">⚔ {explorer}</span> : <Button asChild variant="outline" size="sm"><Link to="/auth">{t('Registrarse', 'Sign up')}<ArrowUpRight /></Link></Button>}</div></header><main>{children}</main><footer>Dumpi Learn <span>·</span> {t('Edición hackatón · Recursos visuales en revisión', 'Hackathon edition · Visual assets under review')}</footer></div>
    <nav className="mobile-nav">{[{ to: '/', icon: Compass, label: t('Aventura', 'Adventure') }, { to: '/certifications', icon: BookOpen, label: t('Mundos', 'Worlds') }, { to: '/leaderboards', icon: Trophy, label: t('Ránking', 'Ranking') }, { to: '/profile', icon: UserRound, label: t('Perfil', 'Profile') }].map(({ to, icon: Icon, label }) => <Link key={to} to={to} className={path === to ? 'text-primary' : ''}><Icon size={20} /><span className="truncate">{label}</span></Link>)}</nav>
  </div>;
}