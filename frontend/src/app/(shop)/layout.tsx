import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Header />
      <main id="main-content">
        {children}
      </main>
      <Footer />
    </>
  );
}
