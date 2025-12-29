import { useParams, Link } from 'react-router-dom';
import { PageLayout } from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Percent, Loader2 } from 'lucide-react';
import { usePromotion } from '@/hooks/usePromotions';
import { SEO, BreadcrumbSchema } from '@/components/SEO';

import promoCombo from '@/assets/promo-combo.jpg';

const fallbackImages: Record<string, string> = {
  '/promotions/combo.jpg': promoCombo,
};

const PromotionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: promotion, isLoading, error } = usePromotion(id);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) return promoCombo;
    return fallbackImages[imageUrl] || imageUrl;
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="container py-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  if (error || !promotion) {
    return (
      <PageLayout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Акция не найдена</h1>
          <Link to="/promotions">
            <Button>Вернуться к акциям</Button>
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <SEO
        title={promotion.title}
        description={promotion.description || promotion.title}
        image={getImageUrl(promotion.image_url)}
        url={`/promotions/${promotion.slug}`}
      />
      <BreadcrumbSchema items={[
        { name: 'Главная', url: '/' },
        { name: 'Акции', url: '/promotions' },
        { name: promotion.title, url: `/promotions/${promotion.slug}` },
      ]} />
      {/* Header */}
      <section className="py-6 border-b border-border">
        <div className="container">
          <div className="flex items-center justify-between">
            <Link 
              to="/promotions" 
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Все акции</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Content */}
      <article className="py-8 md:py-12">
        <div className="container max-w-3xl">
          {/* Badge */}
          {promotion.badge && (
            <div className="inline-flex items-center gap-1 px-4 py-2 bg-accent text-accent-foreground rounded-full text-sm font-bold mb-4">
              <Percent className="h-4 w-4" />
              -{promotion.badge}
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            {promotion.title}
          </h1>

          {/* Main Image */}
          <div className="aspect-[16/10] rounded-2xl overflow-hidden mb-8">
            <img 
              src={getImageUrl(promotion.image_url)} 
              alt={promotion.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Description */}
          {promotion.description && (
            <p className="text-xl text-muted-foreground mb-8">
              {promotion.description}
            </p>
          )}

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            {promotion.content ? (
              <div dangerouslySetInnerHTML={{ __html: promotion.content }} />
            ) : null}
          </div>

          {/* Dates */}
          {(promotion.start_date || promotion.end_date) && (
            <div className="mt-8 p-6 bg-secondary/50 rounded-xl">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Срок действия акции
              </h3>
              <p className="text-muted-foreground">
                {promotion.start_date && `С ${formatDate(promotion.start_date)}`}
                {promotion.start_date && promotion.end_date && ' '}
                {promotion.end_date && `по ${formatDate(promotion.end_date)}`}
              </p>
            </div>
          )}

          {/* CTA */}
          <div className="mt-8">
            <Link to="/catalog">
              <Button size="lg" className="w-full sm:w-auto">
                Перейти в каталог
              </Button>
            </Link>
          </div>
        </div>
      </article>
    </PageLayout>
  );
};

export default PromotionDetail;
