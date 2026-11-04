import { createFileRoute } from '@tanstack/react-router';
import { MockExamPage } from '@/components/dumpi/mock-exam';
import { pageHead } from '@/lib/dumpi';

export const Route = createFileRoute('/mock-exam')({ staticData: { sitemap: false },
  validateSearch: (s: Record<string, unknown>): { course?: string } => (typeof s['course'] === 'string' ? { course: s['course'] } : {}),
  head: () => pageHead('Simulacro', 'Simulacros cronometrados de Dumpi Learn con estructura y reparto por dominios según cada certificación.', '/mock-exam'),
  component: function MockExamRoute() {
    const { course } = Route.useSearch();
    return <MockExamPage courseId={course} />;
  },
});
