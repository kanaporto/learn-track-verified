import { useEffect, useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { ArrowRight, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useText } from '@/lib/dumpi';
import { cleanName } from '@/lib/explorer';
import { supabase } from '@/integrations/supabase/client';
import dumpi from '@/assets/dumpi.png';
import forest from '@/assets/region-1.jpg';

/** Shown on game screens when nobody is signed in. */
export function SignInGate() {
  const t = useText();
  return (
    <div className="register-card">
      <img src={forest} alt="" className="register-bg" />
      <div className="register-shade" />
      <div className="register-body">
        <img src={dumpi} alt="DUMPI" className="register-dumpi" width={140} height={140} />
        <span className="medieval-banner"><Shield size={14} />{t('Registro del fundador', 'Founder registry')}</span>
        <h1 className="medieval-title">{t('Crea tu cuenta para jugar', 'Create your account to play')}</h1>
        <p>{t('Tu progreso se guarda en la nube y lo retomas en cualquier dispositivo.', 'Your progress is saved in the cloud and follows you to any device.')}</p>
        <Link to="/auth" className="btn-chunky btn-gold register-go">{t('Registrarme o entrar', 'Sign up or sign in')}<ArrowRight /></Link>
      </div>
    </div>
  );
}

export function RegisterCard() {
  const t = useText();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'up' | 'in' | 'forgot'>('up');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<false | 'signup' | 'reset'>(false);
  const emailOk = /\S+@\S+\.\S+/.test(email);
  const valid = mode === 'forgot' ? emailOk : emailOk && password.length >= 6 && (mode === 'in' || cleanName(name).length >= 2);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    setBusy(true);
    if (mode === 'forgot') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
      setBusy(false);
      if (error) return void toast.error(error.message);
      setSent('reset');
    } else if (mode === 'up') {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/practice`, data: { display_name: cleanName(name) } } });
      setBusy(false);
      if (error) return void toast.error(error.message);
      if (data.session) navigate({ to: '/practice' }); else setSent('signup');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) return void toast.error(t('Email o contraseña incorrectos, o cuenta sin confirmar.', 'Wrong email or password, or account not confirmed.'));
      navigate({ to: '/practice' });
    }
  }

  const title = mode === 'up' ? t('¿Cómo te llamas, explorador?', 'What is your name, explorer?') : mode === 'in' ? t('Bienvenido de nuevo', 'Welcome back') : t('Recupera tu acceso', 'Recover your access');
  return (
    <div className="register-card">
      <img src={forest} alt="" className="register-bg" />
      <div className="register-shade" />
      <div className="register-body">
        <img src={dumpi} alt="DUMPI" className="register-dumpi" width={140} height={140} />
        <span className="medieval-banner"><Shield size={14} />{t('Registro del fundador', 'Founder registry')}</span>
        {sent ? <>
          <h1 className="medieval-title">{t('¡Revisa tu correo!', 'Check your inbox!')}</h1>
          <p>{sent === 'reset'
            ? t(`Si ${email} tiene cuenta, te hemos enviado un enlace para crear una contraseña nueva.`, `If ${email} has an account, we sent a link to set a new password.`)
            : t(`Te hemos enviado un enlace a ${email}. Púlsalo para activar tu cuenta y empezar a jugar.`, `We sent a link to ${email}. Click it to activate your account and start playing.`)}</p>
          {sent === 'reset' && <button type="button" className="underline text-sm mt-2" onClick={() => { setSent(false); setMode('in'); }}>{t('Volver a entrar', 'Back to sign in')}</button>}
        </> : <>
          <h1 className="medieval-title">{title}</h1>
          {mode === 'forgot' && <p>{t('Escribe tu email y te mandamos un enlace para cambiar la contraseña.', 'Enter your email and we will send you a link to change your password.')}</p>}
          <form onSubmit={submit} className="register-form flex-col">
            {mode === 'up' && <input aria-label={t('Tu nombre', 'Your name')} value={name} onChange={e => setName(e.target.value)} maxLength={24} autoComplete="nickname" placeholder={t('Tu nombre de explorador', 'Explorer name')} className="register-input" />}
            <input aria-label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" placeholder="tu@email.com" className="register-input" />
            {mode !== 'forgot' && <input aria-label={t('Contraseña', 'Password')} type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete={mode === 'up' ? 'new-password' : 'current-password'} placeholder={t('Contraseña (mín. 6)', 'Password (min. 6)')} className="register-input" />}
            <button type="submit" disabled={!valid || busy} className="btn-chunky btn-gold register-go">{mode === 'up' ? t('¡Crear cuenta!', 'Create account!') : mode === 'in' ? t('Entrar', 'Sign in') : t('Enviar enlace', 'Send link')}<ArrowRight /></button>
          </form>
          {mode === 'in' && <button type="button" className="underline text-sm mt-2" onClick={() => setMode('forgot')}>{t('¿Has olvidado tu contraseña?', 'Forgot your password?')}</button>}
          <button type="button" className="underline text-sm mt-2" onClick={() => setMode(m => m === 'up' ? 'in' : m === 'in' ? 'up' : 'in')}>{mode === 'up' ? t('¿Ya tienes cuenta? Entra', 'Have an account? Sign in') : mode === 'in' ? t('¿Nuevo? Crea tu cuenta', 'New? Create an account') : t('Volver a entrar', 'Back to sign in')}</button>
        </>}
      </div>
    </div>
  );
}

export function ResetPasswordCard() {
  const t = useText();
  const navigate = useNavigate();
  const [ready, setReady] = useState<boolean | null>(null);
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) setReady(true);
    });
    supabase.auth.getSession().then(({ data: d }) => setReady(r => r ?? (d.session ? true : null)));
    const id = setTimeout(() => setReady(r => r ?? false), 4000);
    return () => { data.subscription.unsubscribe(); clearTimeout(id); };
  }, []);
  const valid = pw.length >= 6 && pw === pw2;
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return void toast.error(error.message);
    toast.success(t('¡Contraseña cambiada! Ya puedes seguir jugando.', 'Password changed! You can keep playing.'));
    navigate({ to: '/practice' });
  }
  return (
    <div className="register-card">
      <img src={forest} alt="" className="register-bg" />
      <div className="register-shade" />
      <div className="register-body">
        <img src={dumpi} alt="DUMPI" className="register-dumpi" width={140} height={140} />
        <span className="medieval-banner"><Shield size={14} />{t('Nueva contraseña', 'New password')}</span>
        {ready === false ? <>
          <h1 className="medieval-title">{t('Enlace no válido o caducado', 'Invalid or expired link')}</h1>
          <p>{t('Pide un enlace nuevo desde la pantalla de entrar.', 'Request a new link from the sign-in screen.')}</p>
          <Link to="/auth" className="btn-chunky btn-gold register-go">{t('Ir a entrar', 'Go to sign in')}<ArrowRight /></Link>
        </> : <>
          <h1 className="medieval-title">{t('Elige tu nueva contraseña', 'Choose your new password')}</h1>
          <form onSubmit={submit} className="register-form flex-col">
            <input aria-label={t('Nueva contraseña', 'New password')} type="password" value={pw} onChange={e => setPw(e.target.value)} autoComplete="new-password" placeholder={t('Nueva contraseña (mín. 6)', 'New password (min. 6)')} className="register-input" />
            <input aria-label={t('Repite la contraseña', 'Repeat password')} type="password" value={pw2} onChange={e => setPw2(e.target.value)} autoComplete="new-password" placeholder={t('Repite la contraseña', 'Repeat password')} className="register-input" />
            {pw2.length > 0 && pw !== pw2 && <small className="text-destructive">{t('Las contraseñas no coinciden.', 'Passwords do not match.')}</small>}
            <button type="submit" disabled={!valid || busy || !ready} className="btn-chunky btn-gold register-go">{t('Guardar contraseña', 'Save password')}<ArrowRight /></button>
          </form>
        </>}
      </div>
    </div>
  );
}
