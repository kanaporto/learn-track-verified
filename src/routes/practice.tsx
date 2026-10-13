import { createFileRoute } from '@tanstack/react-router';
import { PracticeGame } from '@/components/dumpi/practice';
import { pageHead } from '@/lib/dumpi';

export const Route = createFileRoute('/practice')({
  head: () => pageHead('Práctica de región', 'Practica por regiones las preguntas de Google Workspace Administrator con DUMPI.'),
  component: PracticeGame,
});
