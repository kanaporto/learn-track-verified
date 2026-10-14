import { createFileRoute } from '@tanstack/react-router';
import { PracticeGame } from '@/components/dumpi/practice';
import { pageHead } from '@/lib/dumpi';

export const Route = createFileRoute('/practice')({ staticData: { sitemap: false },
  validateSearch: (s: Record<string, unknown>): { region?: number; course?: string } => {
    const n = Number(s['region']);
    const c = typeof s['course'] === 'string' ? s['course'] : undefined;
    return { ...(Number.isInteger(n) && n >= 1 && n <= 20 ? { region: n } : {}), ...(c ? { course: c } : {}) };
  },
  head: () => pageHead('Práctica de región', 'Practica por regiones las preguntas de tu certificación con DUMPI.'),
  component: function PracticeRoute() {
    const { region, course } = Route.useSearch();
    return <PracticeGame initialRegion={region} courseId={course} />;
  },
});
