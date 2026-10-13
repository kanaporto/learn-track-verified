import { createFileRoute } from '@tanstack/react-router';
import { AuthPage } from '@/components/dumpi/pages';
import { pageHead } from '@/lib/dumpi';

export const Route = createFileRoute('/auth')({
  head: () => pageHead('Registro', 'Regístrate en Dumpi Learn solo con tu nombre y empieza a jugar.'),
  component: AuthPage,
});
