import { createFileRoute } from '@tanstack/react-router';
import { ReviewPage } from '@/components/dumpi/screens';
import { pageHead } from '@/lib/dumpi';

export const Route = createFileRoute('/review')({ staticData: { sitemap: false },
  head: () => pageHead('Repaso de errores', 'Repaso de errores en Dumpi Learn, sin vidas ni puntos, disponible cuando haya errores guardados.', '/review'),
  component: function ReviewRoute() { return <ReviewPage />; },
});
