import { createFileRoute } from '@tanstack/react-router';
import { AuthPage } from '@/components/dumpi/pages';
import { pageHead } from '@/lib/dumpi';

export const Route = createFileRoute('/auth')({
  head: () => pageHead('Acceso', 'Inicio de sesión, registro y recuperación de cuenta en Dumpi Learn, disponibles en la próxima etapa.'),
  component: AuthPage,
});
