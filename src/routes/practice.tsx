import { createFileRoute } from '@tanstack/react-router';
import { PracticeGame } from '@/components/dumpi/practice';
import { pageHead } from '@/lib/dumpi';

export const Route = createFileRoute('/practice')({
  validateSearch: (s: Record<string, unknown>): { region?: number } => {
    const n = Number(s.region);
    return Number.isInteger(n) && n >= 1 && n <= 6 ? { region: n } : {};
  },
  head: () => pageHead('Práctica de región', 'Practica por regiones las preguntas de Google Workspace Administrator con DUMPI.'),
  component: function PracticeRoute() {
    const { region } = Route.useSearch();
    return <PracticeGame initialRegion={region} />;
  },
});
