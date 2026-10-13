import { createFileRoute } from '@tanstack/react-router';
import { PendingPage } from '@/components/dumpi/pages';
import { pageHead } from '@/lib/dumpi';

export const Route = createFileRoute('/practice')({
  head: () => pageHead('Práctica de región', 'Práctica por regiones en Dumpi Learn, pendiente del banco de preguntas verificado.'),
  component: function PracticeRoute() { return <PendingPage kind="practice" />; },
});
