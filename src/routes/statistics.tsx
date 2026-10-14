import { createFileRoute } from '@tanstack/react-router';
import { StatisticsPage } from '@/components/dumpi/pages';
import { pageHead } from '@/lib/dumpi';

export const Route = createFileRoute('/statistics')({ staticData: { sitemap: false },
  head: () => pageHead('Mis estadísticas', 'Estadísticas personales de aprendizaje en Dumpi Learn: aciertos, regiones y simulacros.', '/statistics'),
  component: StatisticsPage,
});
