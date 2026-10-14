import { useEffect, useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { ArrowRight, Compass, Eye, EyeOff, KeyRound, LogOut, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/lib/cloud';
import { useText } from '@/lib/dumpi';
import { saveExplorer } from '@/lib/explorer';
import { deleteMyAccount } from '@/lib/account.functions';

export function AccountPanel() {
  const t = useText();
  const session = useSession();
  const navigate = useNavigate();
  const del = useServerFn(deleteMyAccount);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [confirmDel, setConfirmDel] = useState('');
  const [busy, setBusy] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const uid = session?.user.id;

  useEffect(() => {
    if (!uid) return;
    void supabase.from('profiles').select('display_name, age').eq('id', uid).maybeSingle().then(({ data }) => {
      if (data) { setName(data.display_name); setAge(data.age ? String(data.age) : ''); }
    });
  }, [uid]);

  if (session === undefined) return <div className="profile-account"><p>{t('Cargando…', 'Loading…')}</p></div>;
  if (!session) return <div className="profile-account"><span className="profile-avatar"><Compass size={28} /></span><div><h2>{t('Tu perfil de explorador', 'Your explorer profile')}</h2><p>{t('Aún no has iniciado sesión.', 'You are not signed in yet.')}</p></div><Button asChild variant="outline"><Link to="/auth">{t('Iniciar sesión', 'Sign in')}<ArrowRight /></Link></Button></div>;

  async function saveData() {
    const n = name.trim().slice(0, 24);
    const a = age.trim() ? Number(age) : null;
    if (!n) { toast.error(t('El nombre no puede estar vacío.', 'Name cannot be empty.')); return; }
    if (a !== null && (!Number.isInteger(a) || a < 10 || a > 120)) { toast.error(t('La edad debe estar entre 10 y 120.', 'Age must be between 10 and 120.')); return; }
    setBusy(true);
    const { error } = await supabase.from('profiles').update({ display_name: n, age: a, updated_at: new Date().toISOString() }).eq('id', uid!);
    setBusy(false);
    if (error) { toast.error(t('No se pudo guardar.', 'Could not save.')); return; }
    saveExplorer(n); toast.success(t('Datos guardados', 'Details saved'));
  }
  async function changePw() {
    if (pw.length < 6) { toast.error(t('Mínimo 6 caracteres.', 'At least 6 characters.')); return; }
    if (pw !== pw2) { toast.error(t('Las contraseñas no coinciden.', 'Passwords do not match.')); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    setPw(''); setPw2(''); toast.success(t('Contraseña cambiada', 'Password changed'));
  }
  async function signOut() { await supabase.auth.signOut(); navigate({ to: '/' }); }
  async function removeAccount() {
    setBusy(true);
    try { await del(); await supabase.auth.signOut(); toast.success(t('Cuenta borrada', 'Account deleted')); navigate({ to: '/' }); }
    catch { toast.error(t('No se pudo borrar la cuenta.', 'Could not delete the account.')); }
    finally { setBusy(false); }
  }

  return <div className="grid gap-4 mb-6">
    <div className="profile-account"><span className="profile-avatar"><Compass size={28} /></span><div><h2>{name || t('Explorador', 'Explorer')}</h2><p className="flex items-center gap-2"><span>{showEmail ? session.user.email : maskEmail(session.user.email ?? '')}</span><button type="button" className="inline-flex items-center gap-1 text-xs font-bold underline" onClick={() => setShowEmail(s => !s)}>{showEmail ? <EyeOff size={14} /> : <Eye size={14} />}{showEmail ? t('Ocultar email', 'Hide email') : t('Mostrar email', 'Show email')}</button></p></div><Button variant="outline" onClick={signOut}><LogOut />{t('Cerrar sesión', 'Sign out')}</Button></div>

    <section className="preference-row flex-col items-stretch gap-3">
      <strong>{t('Tus datos', 'Your details')}</strong>
      <label className="grid gap-1 text-sm">{t('Nombre de explorador', 'Explorer name')}<Input value={name} maxLength={24} onChange={e => setName(e.target.value)} /></label>
      <label className="grid gap-1 text-sm">{t('Edad (opcional)', 'Age (optional)')}<Input type="number" inputMode="numeric" min={10} max={120} value={age} onChange={e => setAge(e.target.value)} /></label>
      <Button disabled={busy} onClick={saveData}><Save />{t('Guardar', 'Save')}</Button>
    </section>

    <section className="preference-row flex-col items-stretch gap-3">
      <strong>{t('Cambiar contraseña', 'Change password')}</strong>
      <Input type="password" autoComplete="new-password" placeholder={t('Nueva contraseña', 'New password')} value={pw} onChange={e => setPw(e.target.value)} />
      <Input type="password" autoComplete="new-password" placeholder={t('Repite la contraseña', 'Repeat password')} value={pw2} onChange={e => setPw2(e.target.value)} />
      <Button variant="outline" disabled={busy} onClick={changePw}><KeyRound />{t('Cambiar contraseña', 'Change password')}</Button>
    </section>

    <section className="preference-row flex-col items-stretch gap-3 border-destructive/40">
      <strong className="text-destructive">{t('Borrar cuenta', 'Delete account')}</strong>
      <p className="text-sm text-muted-foreground">{t('Se borrarán tu cuenta, tus puntos y tu progreso para siempre. Escribe BORRAR para confirmar.', 'Your account, points and progress will be deleted forever. Type DELETE to confirm.')}</p>
      <Input value={confirmDel} onChange={e => setConfirmDel(e.target.value)} placeholder={t('BORRAR', 'DELETE')} />
      <Button variant="destructive" disabled={busy || confirmDel.trim().toUpperCase() !== t('BORRAR', 'DELETE')} onClick={removeAccount}><Trash2 />{t('Borrar mi cuenta', 'Delete my account')}</Button>
    </section>
  </div>;
}

function maskEmail(e: string) {
  const [u = '', d = ''] = e.split('@');
  return `${u.slice(0, 1)}•••••@${d ? '••••' + d.slice(d.lastIndexOf('.')) : ''}`;
}
