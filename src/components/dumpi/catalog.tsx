import { Link } from '@tanstack/react-router';
import { ArrowRight, Cloud, Code2, Layers3, ShieldCheck, PanelsTopLeft, Clock3, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { certifications, useText } from '@/lib/dumpi';
const icons = { workspace: PanelsTopLeft, itil: Layers3, python: Code2, cloud: Cloud, okta: ShieldCheck };
export function Catalog({ compact = false }: { compact?: boolean }) {
 const t = useText();
 return <div className="cert-grid">{certifications.slice(0, compact ? 3 : 5).map(c => { const Icon = icons[c.icon]; const ready = c.id === 'workspace'; return <article className="cert-card" key={c.id}><div className="flex items-center justify-between"><span className="cert-icon"><Icon size={25} /></span>{ready ? <span className="status-tag status-ready"><Play size={12} />{t('Disponible', 'Available')}</span> : <span className="status-tag"><Clock3 size={12} />{t('Próximamente', 'Coming soon')}</span>}</div><div className="cert-category">{c.category}</div><h3>{c.name}</h3><p>{ready ? t('6 regiones · 110 preguntas bilingües listas para practicar.', '6 regions · 110 bilingual questions ready to practise.') : c.id === 'python' ? t('Nombre de certificación por confirmar.', 'Certification name to be confirmed.') : t('Contenido y formato por verificar.', 'Content and format awaiting verification.')}</p><Button asChild variant="ghost" className="cert-link"><Link to="/certifications/$id" params={{ id: c.id }}>{ready ? t('Entrar', 'Enter') : t('Ver certificación', 'View certification')}<ArrowRight /></Link></Button></article>; })}</div>;
}
