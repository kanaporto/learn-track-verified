import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { FileSpreadsheet, Trash2, Upload, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageTitle } from '@/components/dumpi/pages';
import { pageHead, useText } from '@/lib/dumpi';
import { deleteCourse, parseDumpFile, saveCourse, slug, useCourses, type ParseResult } from '@/lib/courses';

export const Route = createFileRoute('/admin')({
  head: () => pageHead('Admin de cursos', 'Añade nuevas certificaciones a Dumpi Learn subiendo dumps de preguntas en Excel.'),
  component: AdminPage,
});

function AdminPage() {
  const t = useText();
  const courses = useCourses();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [parsed, setParsed] = useState<ParseResult | null>(null);
  const [file, setFile] = useState('');
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);

  async function onFile(f: File | undefined) {
    if (!f) return;
    setBusy(true); setSaved(null); setFile(f.name);
    try {
      const r = await parseDumpFile(await f.arrayBuffer());
      setParsed(r);
      if (!name && r.certification) setName(r.certification);
    } catch { setParsed({ questions: [], certification: '', errors: [t('No se ha podido leer el archivo.', 'Could not read the file.')] }); }
    setBusy(false);
  }
  const domains = parsed ? [...new Set(parsed.questions.sort((a, b) => a.region - b.region).map(q => q.domain))] : [];
  const canSave = !!parsed?.questions.length && name.trim().length > 1;
  function save() {
    if (!parsed || !canSave) return;
    const id = slug(name);
    if (id === 'workspace') return;
    saveCourse({ id, name: name.trim(), category: category.trim() || name.trim(), questions: parsed.questions });
    setSaved(id); setParsed(null); setName(''); setCategory(''); setFile('');
  }

  return <div className="page-content">
    <PageTitle eyebrow={t('SALA DEL MAESTRO', "MASTER'S ROOM")} title="Admin" subtitle={t('Añade cursos y sube dumps de preguntas en Excel con el mismo formato que el de Google Workspace.', 'Add courses and upload Excel question dumps in the same format as the Google Workspace one.')} />
    <div className="admin-card">
      <h2 className="font-bold text-lg mb-3">{t('1. Datos del curso', '1. Course details')}</h2>
      <label className="field-label" htmlFor="cname">{t('Nombre de la certificación', 'Certification name')}</label>
      <Input id="cname" value={name} onChange={e => setName(e.target.value)} placeholder="Microsoft Windows Administrator" />
      <label className="field-label mt-3" htmlFor="ccat">{t('Categoría (opcional)', 'Category (optional)')}</label>
      <Input id="ccat" value={category} onChange={e => setCategory(e.target.value)} placeholder="Microsoft" />
      <h2 className="font-bold text-lg mt-6 mb-2">{t('2. Dump de preguntas (.xlsx)', '2. Question dump (.xlsx)')}</h2>
      <p className="text-sm text-muted-foreground mb-3">{t('Hojas «Test ES», «Test EN» y «Respuestas». Columnas: ID, Certificación, Nivel, Dominio, Tipo, Pregunta, A–D; en Respuestas: Respuestas correctas, Explicación ES, Explanation EN, Referencia oficial. Cada dominio se convierte en una región.', 'Sheets "Test ES", "Test EN" and "Respuestas". Columns: ID, Certification, Level, Domain, Type, Question, A–D; in Respuestas: correct answers, explanation ES, explanation EN, official reference. Each domain becomes a region.')}</p>
      <label className="admin-drop"><Upload />{busy ? t('Leyendo…', 'Reading…') : file || t('Elegir archivo Excel', 'Choose Excel file')}<input type="file" accept=".xlsx,.xls" className="sr-only" onChange={e => onFile(e.target.files?.[0])} /></label>
      {parsed && <div className="mt-4">
        {parsed.questions.length > 0 && <div className="notice block"><p className="font-semibold flex items-center gap-2"><CheckCircle2 size={18} />{parsed.questions.length} {t('preguntas válidas', 'valid questions')} · {domains.length} {t('regiones', 'regions')}</p><ol className="list-decimal ml-5 mt-2 text-sm">{domains.map(d => <li key={d}>{d} ({parsed.questions.filter(q => q.domain === d).length})</li>)}</ol></div>}
        {parsed.errors.length > 0 && <div className="notice block mt-3"><p className="font-semibold flex items-center gap-2"><AlertTriangle size={18} />{parsed.errors.length} {t('avisos', 'warnings')}</p><ul className="text-sm mt-1">{parsed.errors.slice(0, 8).map(e => <li key={e}>{e}</li>)}</ul></div>}
      </div>}
      <Button className="mt-5 h-12 w-full" disabled={!canSave} onClick={save}>{t('Publicar curso', 'Publish course')}</Button>
      {saved && <p className="mt-3 text-green-400 font-semibold">{t('¡Curso publicado!', 'Course published!')} <Link className="underline" to="/certifications/$id" params={{ id: saved }}>{t('Abrirlo', 'Open it')}</Link></p>}
    </div>
    <h2 className="font-bold text-lg mt-8 mb-3">{t('Cursos', 'Courses')}</h2>
    <div className="grid gap-2">{courses.map(c => <div key={c.id} className="admin-row"><FileSpreadsheet size={20} /><div className="flex-1"><b>{c.name}</b><small className="block text-muted-foreground">{c.regions.length} {t('regiones', 'regions')} · {c.questions.length} {t('preguntas', 'questions')}{c.custom ? '' : ` · ${t('incluido', 'built-in')}`}</small></div><Button asChild size="sm" variant="ghost"><Link to="/certifications/$id" params={{ id: c.id }}><ArrowRight /></Link></Button>{c.custom && <Button size="sm" variant="ghost" aria-label={t('Eliminar', 'Delete')} onClick={() => confirm(t('¿Eliminar este curso?', 'Delete this course?')) && deleteCourse(c.id)}><Trash2 /></Button>}</div>)}</div>
    <p className="text-xs text-muted-foreground mt-4">{t('Edición hackatón: los cursos subidos se guardan en este dispositivo. Para compartirlos con todos los jugadores y proteger el acceso de admin habrá que activar las cuentas en la nube.', 'Hackathon edition: uploaded courses are saved on this device. Sharing them with all players and protecting admin access requires enabling cloud accounts.')}</p>
  </div>;
}
