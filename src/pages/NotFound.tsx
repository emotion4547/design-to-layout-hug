import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { PageLayout } from "@/components/PageLayout";
import { SEO } from "@/components/SEO";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <PageLayout>
      <SEO title="Страница не найдена" noindex />
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold">404</h1>
          <p className="mb-4 text-xl text-muted-foreground">Страница не найдена</p>
          <a href="/" className="text-primary underline hover:text-primary/90">
            Вернуться на главную
          </a>
        </div>
      </div>
    </PageLayout>
  );
};

export default NotFound;
