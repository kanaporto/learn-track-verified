import { createFileRoute } from '@tanstack/react-router';
import { ResetPasswordCard } from '@/components/dumpi/register';
import { pageHead } from '@/lib/dumpi';

export const Route = createFileRoute('/reset-password')({ staticData: { sitemap: false },
  head: () => pageHead('Nueva contraseña', 'Crea una contraseña nueva para recuperar tu cuenta de explorador en Dumpi Learn.'),
  component: () => <div className="page-content"><ResetPasswordCard /></div>,
});
