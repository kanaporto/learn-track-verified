import { createFileRoute } from '@tanstack/react-router';
import { PendingPage } from '@/components/dumpi/pages';
import { pageHead } from '@/lib/dumpi';

export const Route = createFileRoute('/review')({
  head: () => pageHead('Repaso de errores', 'Repaso de errores en Dumpi Learn, sin vidas ni puntos, disponible cuando haya errores guardados.'),
  component: function ReviewRoute() { return <PendingPage kind="review" />; },
});
