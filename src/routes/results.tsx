import { createFileRoute } from '@tanstack/react-router';
import { ResultsPage } from '@/components/dumpi/screens';
import { pageHead } from '@/lib/dumpi';

export const Route = createFileRoute('/results')({ staticData: { sitemap: false },
  head: () => pageHead('Resultados y revisión', 'Resultados y revisión de intentos en Dumpi Learn, disponibles tras finalizar un simulacro.'),
  component: function ResultsRoute() { return <ResultsPage />; },
});
