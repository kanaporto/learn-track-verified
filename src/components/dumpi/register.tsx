import { useState } from 'react';
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
  const [mode, setMode] = useState<'up' | 'in'>('up');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const valid = /\S+@\S+\.\S+/.test(email) && password.length >= 6 && (mode === 'in' || cleanName(name).length >= 2);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    setBusy(true);
    if (mode === 'up') {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/practice`, data: { display_name: cleanName(name) } } });
      setBusy(false);
      if (error) return void toast.error(error.message);
      if (data.session) navigate({ to: '/practice' }); else setSent(true);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) return void toast.error(t('Email o contraseña incorrectos, o cuenta sin confirmar.', 'Wrong email or password, or account not confirmed.'));
      navigate({ to: '/practice' });
    }
  }

  return (
    <div className="register-card">
      <img src={forest} alt="" className="register-bg" />
      <div className="register-shade" />
      <div className="register-body">
        <img src={dumpi} alt="DUMPI" className="register-dumpi" width={140} height={140} />
        <span className="medieval-banner"><Shield size={14} />{t('Registro del fundador', 'Founder registry')}</span>
        {sent ? <>
          <h1 className="medieval-title">{t('¡Revisa tu correo!', 'Check your inbox!')}</h1>
          <p>{t(`Te hemos enviado un enlace a ${email}. Púlsalo para activar tu cuenta y empezar a jugar.`, `We sent a link to ${email}. Click it to activate your account and start playing.`)}</p>
        </> : <>
          <h1 className="medieval-title">{mode === 'up' ? t('¿Cómo te llamas, explorador?', 'What is your name, explorer?') : t('Bienvenido de nuevo', 'Welcome back')}</h1>
          <form onSubmit={submit} className="register-form flex-col">
            {mode === 'up' && <input aria-label={t('Tu nombre', 'Your name')} value={name} onChange={e => setName(e.target.value)} maxLength={24} autoComplete="nickname" placeholder={t('Tu nombre de explorador', 'Explorer name')} className="register-input" />}
            <input aria-label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" placeholder="tu@email.com" className="register-input" />
            <input aria-label={t('Contraseña', 'Password')} type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete={mode === 'up' ? 'new-password' : 'current-password'} placeholder={t('Contraseña (mín. 6)', 'Password (min. 6)')} className="register-input" />
            <button type="submit" disabled={!valid || busy} className="btn-chunky btn-gold register-go">{mode === 'up' ? t('¡Crear cuenta!', 'Create account!') : t('Entrar', 'Sign in')}<ArrowRight /></button>
          </form>
          <button type="button" className="underline text-sm mt-2" onClick={() => setMode(m => m === 'up' ? 'in' : 'up')}>{mode === 'up' ? t('¿Ya tienes cuenta? Entra', 'Have an account? Sign in') : t('¿Nuevo? Crea tu cuenta', 'New? Create an account')}</button>
        </>}
      </div>
    </div>
  );
}
