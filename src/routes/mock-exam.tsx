import { createFileRoute } from '@tanstack/react-router';
import { PendingPage } from '@/components/dumpi/pages';
import { pageHead } from '@/lib/dumpi';

export const Route = createFileRoute('/mock-exam')({
  head: () => pageHead('Simulacro', 'Inicio de simulacro en Dumpi Learn, pendiente de formato y criterio de evaluación verificados.'),
  component: function MockExamRoute() { return <PendingPage kind="mock-exam" />; },
});
