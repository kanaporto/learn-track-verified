import { createFileRoute } from '@tanstack/react-router';
import { MockExamPage } from '@/components/dumpi/mock-exam';
import { pageHead } from '@/lib/dumpi';

export const Route = createFileRoute('/mock-exam')({ staticData: { sitemap: false },
  validateSearch: (s: Record<string, unknown>): { course?: string } => (typeof s['course'] === 'string' ? { course: s['course'] } : {}),
  head: () => pageHead('Simulacro', 'Simulacro cronometrado de tu certificación en Dumpi Learn: 50 preguntas por dominios, nota final y puntos.', '/mock-exam'),
  component: function MockExamRoute() {
    const { course } = Route.useSearch();
    return <MockExamPage courseId={course} />;
  },
});
