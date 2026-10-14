import { createFileRoute } from '@tanstack/react-router';
import { LeaderboardsPage } from '@/components/dumpi/pages';
import { pageHead } from '@/lib/dumpi';

export const Route = createFileRoute('/leaderboards')({ staticData: { sitemap: true },
  head: () => pageHead('Clasificaciones', 'Clasificaciones global y por certificación de Dumpi Learn, disponibles cuando haya participantes.', '/leaderboards'),
  component: LeaderboardsPage,
});
