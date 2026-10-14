import { createFileRoute } from '@tanstack/react-router';
import { AuthPage } from '@/components/dumpi/pages';
import { pageHead } from '@/lib/dumpi';

export const Route = createFileRoute('/auth')({
  head: () => pageHead('Registro', 'Crea tu cuenta de Dumpi Learn con nombre y email y guarda tu progreso en la nube.'),
  component: AuthPage,
});
