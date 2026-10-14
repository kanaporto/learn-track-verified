import { createFileRoute } from '@tanstack/react-router';
import { LivesPage } from '@/components/dumpi/screens';
import { pageHead } from '@/lib/dumpi';

export const Route = createFileRoute('/no-lives')({ staticData: { sitemap: false },
  head: () => pageHead('Mis vidas', 'Estado de vidas en Dumpi Learn: recuperación por hora y opción de pruebas del hackatón.'),
  component: function NoLivesRoute() { return <LivesPage />; },
});
