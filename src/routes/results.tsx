import { createFileRoute } from '@tanstack/react-router';
import { PendingPage } from '@/components/dumpi/pages';
import { pageHead } from '@/lib/dumpi';

export const Route = createFileRoute('/results')({
  head: () => pageHead('Resultados y revisión', 'Resultados y revisión de intentos en Dumpi Learn, disponibles tras finalizar un simulacro.'),
  component: function ResultsRoute() { return <PendingPage kind="results" />; },
});
