import { createFileRoute } from '@tanstack/react-router';
import { CertificationPage } from '@/components/dumpi/pages';
import { certifications, pageHead } from '@/lib/dumpi';

export const Route = createFileRoute('/certifications/$id')({ staticData: { sitemap: false },
  head: ({ params }) => {
    const c = certifications.find(c => c.id === params.id);
    return pageHead(c?.name ?? 'Certificación', `Aventura, repaso y simulacro de ${c?.name ?? 'certificación'} en Dumpi Learn, pendiente de verificación oficial.`);
  },
  component: function CertificationRoute() {
    const { id } = Route.useParams();
    return <CertificationPage id={id} />;
  },
});
