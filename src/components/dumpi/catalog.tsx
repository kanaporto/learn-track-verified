import { Link } from '@tanstack/react-router';
import { ArrowRight, Clock3, Play, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { certifications, useText } from '@/lib/dumpi';
import { useCourses } from '@/lib/courses';
import { brandLogos } from './logos';

export function Catalog({ compact = false }: { compact?: boolean }) {
  const t = useText();
  const courses = useCourses();
  const customs = courses.filter(c => c.custom).map(c => ({ id: c.id, name: c.name, category: c.category, icon: 'custom' }));
  const list = [...certifications, ...customs].slice(0, compact ? 3 + customs.length : undefined);
  return <div className="cert-grid">{list.map(c => {
    const course = courses.find(x => x.id === c.id);
    const ready = !!course;
    const Logo = brandLogos[c.icon];
    return <article className="cert-card" key={c.id}>
      <div className="flex items-center justify-between">
        <span className="cert-icon cert-logo">{Logo ? <Logo /> : <FileSpreadsheet size={25} />}</span>
        {ready ? <span className="status-tag status-ready"><Play size={12} />{t('Disponible', 'Available')}</span> : <span className="status-tag"><Clock3 size={12} />{t('Próximamente', 'Coming soon')}</span>}
      </div>
      <div className="cert-category">{c.category}</div>
      <h3>{c.name}</h3>
      <p>{course ? `${course.regions.length} ${t('regiones', 'regions')} · ${course.questions.length} ${t('preguntas bilingües listas para practicar.', 'bilingual questions ready to practise.')}` : c.id === 'python' ? t('Nombre de certificación por confirmar.', 'Certification name to be confirmed.') : t('Contenido y formato por verificar.', 'Content and format awaiting verification.')}</p>
      <Button asChild variant="ghost" className="cert-link"><Link to="/certifications/$id" params={{ id: c.id }}>{ready ? t('Entrar', 'Enter') : t('Ver certificación', 'View certification')}<ArrowRight /></Link></Button>
    </article>;
  })}</div>;
}
