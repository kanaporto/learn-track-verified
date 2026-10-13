import { createFileRoute } from '@tanstack/react-router';
import { LeaderboardsPage } from '@/components/dumpi/pages';
import { pageHead } from '@/lib/dumpi';

export const Route = createFileRoute('/leaderboards')({
  head: () => pageHead('Clasificaciones', 'Clasificaciones global y por certificación de Dumpi Learn, disponibles cuando haya participantes.'),
  component: LeaderboardsPage,
});
