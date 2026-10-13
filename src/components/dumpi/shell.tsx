import { Link, useRouterState } from '@tanstack/react-router';
import { Compass, BookOpen, Trophy, UserRound, ChartNoAxesCombined, Volume2, VolumeX, ArrowUpRight, FlaskConical, Bot, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePreferences, useText } from '@/lib/dumpi';
import dumpi from '@/assets/dumpi.png';
import type { ReactNode } from 'react';

export function AppShell({ children }: { children: ReactNode }) {
  const t = useText();
  const { language, setLanguage, sound, setSound } = usePreferences();
  const path = useRouterState({ select: s => s.location.pathname });
  const nav = [{ to: '/', icon: Compass, label: t('Mi aventura', 'My adventure') }, { to: '/certifications', icon: BookOpen, label: t('Certificaciones', 'Certifications') }, { to: '/leaderboards', icon: Trophy, label: t('Clasificaciones', 'Leaderboards') }, { to: '/statistics', icon: ChartNoAxesCombined, label: t('Mis estadísticas', 'My statistics') }, { to: '/profile', icon: UserRound, label: t('Mi perfil', 'My profile') }] as const;
  return <div className="app-layout">
    <aside className="sidebar">
      <Link to="/" className="brand"><span className="brand-icon"><Bot size={25} /></span><span>dumpi<span className="text-primary">learn</span><small>{t('UN PASO MÁS CERCA', 'ONE STEP CLOSER')}</small></span></Link>
      <div className="sidebar-label">{t('TU CAMINO', 'YOUR JOURNEY')}</div>
      <nav>{nav.map(({ to, icon: Icon, label }) => <Button asChild variant="ghost" key={to} className={`nav-item ${path === to ? 'active' : ''}`}><Link to={to}><Icon size={20} /><span>{label}</span>{path === to && <span className="nav-dot" />}</Link></Button>)}</nav>
      <div className="sidebar-bottom"><img src={dumpi} alt="DUMPI" width={100} height={100} /><strong>{t('Pequeños pasos.', 'Small steps.')}<br />{t('Grandes aventuras.', 'Great adventures.')}</strong><div className="mt-4 text-xs text-muted-foreground">{t('DUMPI te acompaña en el camino.', 'DUMPI is with you on the journey.')}</div></div>
      <div className="trial-label"><FlaskConical size={15} />{t('Edición hackatón', 'Hackathon edition')}</div>
    </aside>
    <div className="app-main"><header className="topbar"><span className="topbar-note"><Compass size={17} />{t('Tu próxima aventura empieza aquí', 'Your next adventure starts here')}</span><div className="topbar-actions"><Button variant="ghost" size="sm" onClick={() => setLanguage(language === 'es' ? 'en' : 'es')} aria-label={t('Cambiar idioma', 'Change language')}><Globe />{language.toUpperCase()}</Button><Button variant="ghost" size="icon" title={t('Sonido', 'Sound')} aria-label={t('Alternar sonido', 'Toggle sound')} onClick={() => setSound(!sound)}>{sound ? <Volume2 /> : <VolumeX />}</Button><span className="topbar-divider" /><Button asChild variant="outline" size="sm"><Link to="/auth">{t('Iniciar sesión', 'Sign in')}<ArrowUpRight /></Link></Button></div></header><main>{children}</main><footer>Dumpi Learn <span>·</span> {t('Edición hackatón · Recursos visuales en revisión', 'Hackathon edition · Visual assets under review')}</footer></div>
    <nav className="mobile-nav">{nav.filter(n => n.to !== '/statistics').map(({ to, icon: Icon, label }) => <Button asChild variant="ghost" key={to} className={path === to ? 'text-primary' : ''}><Link to={to}><Icon /><span>{label}</span></Link></Button>)}</nav>
  </div>;
}