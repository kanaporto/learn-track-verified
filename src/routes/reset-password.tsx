import { createFileRoute } from '@tanstack/react-router';
import { ResetPasswordCard } from '@/components/dumpi/register';
import { pageHead } from '@/lib/dumpi';

export const Route = createFileRoute('/reset-password')({ staticData: { sitemap: false },
  head: () => { const h = pageHead('Nueva contraseña', 'Crea una contraseña nueva para recuperar tu cuenta de explorador en Dumpi Learn.'); return { meta: [...h.meta, { name: 'robots', content: 'noindex' }] }; },
  component: () => <div className="page-content"><ResetPasswordCard /></div>,
});
