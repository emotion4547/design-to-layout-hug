import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { FloatingContactButton } from '@/components/FloatingContactButton';

interface PageLayoutProps {
  children: React.ReactNode;
}

export const PageLayout = ({ children }: PageLayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <FloatingContactButton />
    </div>
  );
};
