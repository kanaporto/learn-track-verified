import { createFileRoute, redirect } from '@tanstack/react-router';
import { pageHead } from '@/lib/dumpi';

export const Route = createFileRoute('/exam')({ staticData: { sitemap: false },
  head: () => pageHead('Examen de simulacro', 'Accede al simulacro de examen de tu certificación en Dumpi Learn.'),
  beforeLoad: () => { throw redirect({ to: '/mock-exam' }); },
});
