import { createFileRoute } from '@tanstack/react-router';
import { ProfilePage } from '@/components/dumpi/pages';
import { pageHead } from '@/lib/dumpi';

export const Route = createFileRoute('/profile')({ staticData: { sitemap: false },
  head: () => pageHead('Mi perfil', 'Perfil y preferencias de idioma, sonido y movimiento en Dumpi Learn.'),
  component: ProfilePage,
});
