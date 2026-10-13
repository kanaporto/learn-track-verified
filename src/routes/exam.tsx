import { createFileRoute } from '@tanstack/react-router';
import { PendingPage } from '@/components/dumpi/pages';
import { pageHead } from '@/lib/dumpi';

export const Route = createFileRoute('/exam')({
  head: () => pageHead('Examen de simulacro', 'Pantalla de examen de simulacro en Dumpi Learn, pendiente de contenido verificado.'),
  component: function ExamRoute() { return <PendingPage kind="exam" />; },
});
