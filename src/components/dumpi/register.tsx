import { useState } from 'react';
import { ArrowRight, Shield } from 'lucide-react';
import { useText } from '@/lib/dumpi';
import { saveExplorer, cleanName } from '@/lib/explorer';
import dumpi from '@/assets/dumpi.png';
import forest from '@/assets/region-1.jpg';

export function RegisterCard({ onDone }: { onDone?: () => void }) {
  const t = useText();
  const [name, setName] = useState('');
  const valid = cleanName(name).length >= 2;
  return (
    <div className="register-card">
      <img src={forest} alt="" className="register-bg" />
      <div className="register-shade" />
      <div className="register-body">
        <img src={dumpi} alt="DUMPI" className="register-dumpi" width={140} height={140} />
        <span className="medieval-banner"><Shield size={14} />{t('Registro del peregrino', 'Pilgrim registry')}</span>
        <h1 className="medieval-title">{t('¿Cómo te llamas, explorador?', 'What is your name, explorer?')}</h1>
        <p>{t('Escribe tu nombre y empieza a jugar.', 'Type your name and start playing.')}</p>
        <form onSubmit={e => { e.preventDefault(); if (saveExplorer(name)) onDone?.(); }} className="register-form">
          <label htmlFor="explorer-name" className="sr-only">{t('Tu nombre', 'Your name')}</label>
          <input id="explorer-name" value={name} onChange={e => setName(e.target.value)} maxLength={24} autoComplete="nickname" placeholder={t('Tu nombre', 'Your name')} className="register-input" autoFocus />
          <button type="submit" disabled={!valid} className="btn-chunky btn-gold register-go">{t('¡A jugar!', "Let's play!")}<ArrowRight /></button>
        </form>
        <small>{t('Tu nombre se guarda solo en este dispositivo por ahora.', 'Your name is only stored on this device for now.')}</small>
      </div>
    </div>
  );
}
