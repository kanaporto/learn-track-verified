import { createFileRoute } from '@tanstack/react-router';
import { CertificationsPage } from '@/components/dumpi/pages';
import { pageHead } from '@/lib/dumpi';

export const Route = createFileRoute('/certifications')({
  head: () => pageHead('Certificaciones', 'Catálogo de certificaciones IT de Dumpi Learn, en preparación con contenido verificado.'),
  component: CertificationsPage,
});
