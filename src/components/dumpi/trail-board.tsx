import { Castle, Gem, Lock, Star } from 'lucide-react';
import dumpi from '@/assets/dumpi.png';

const pos = (i: number) => ({ x: 6 + i * 9.8, y: 52 + 28 * Math.sin(i * 1.1) });

export function TrailBoard({ total, done, color, label }: { total: number; done: number; color: string; label: string }) {
  const pts = Array.from({ length: total }, (_, i) => pos(i));
  const at = pts[Math.min(done, total - 1)]!;
  return (
    <div className="trail-board" style={{ ['--region' as string]: color }} role="img" aria-label={label}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="trail-path" aria-hidden>
        <polyline points={pts.map(p => `${p.x},${p.y}`).join(' ')} />
      </svg>
      {pts.map((p, i) => {
        const state = i < done ? 'done' : i === done ? 'active' : 'locked';
        const special = i === 4 ? <Gem size={14} /> : i === total - 1 ? <Castle size={16} /> : null;
        return (
          <span key={i} className={`trail-stone ${state}`} style={{ left: `${p.x}%`, top: `${p.y}%` }}>
            {state === 'done' ? <Star size={14} fill="currentColor" /> : state === 'locked' && !special ? <Lock size={11} /> : special ?? i + 1}
          </span>
        );
      })}
      <img key={done} src={dumpi} alt="" className="trail-dumpi" style={{ left: `${at.x}%`, top: `${at.y}%` }} />
    </div>
  );
}
