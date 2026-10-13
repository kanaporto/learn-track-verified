import { createFileRoute } from '@tanstack/react-router';
import { PendingPage } from '@/components/dumpi/pages';
import { pageHead } from '@/lib/dumpi';

export const Route = createFileRoute('/no-lives')({
  head: () => pageHead('Sin vidas', 'Estado de vidas en Dumpi Learn: recuperación por hora y opción de pruebas del hackatón.'),
  component: function NoLivesRoute() { return <PendingPage kind="no-lives" />; },
});
