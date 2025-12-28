import { useParams, Link } from 'react-router-dom';
import { PageLayout } from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Loader2 } from 'lucide-react';
import { useNewsItem } from '@/hooks/useNews';

import news1 from '@/assets/news/news-1.jpg';

const fallbackImages: Record<string, string> = {
  '/news/news-1.jpg': news1,
};

const NewsDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: newsItem, isLoading, error } = useNewsItem(id);

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
    if (!imageUrl) return news1;
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

  if (error || !newsItem) {
    return (
      <PageLayout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Новость не найдена</h1>
          <Link to="/news">
            <Button>Вернуться к новостям</Button>
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {/* Header */}
      <section className="py-6 border-b border-border">
        <div className="container">
          <div className="flex items-center justify-between">
            <Link 
              to="/news" 
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Все новости</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Content */}
      <article className="py-8 md:py-12">
        <div className="container max-w-3xl">
          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            {newsItem.title}
          </h1>

          {/* Main Image */}
          <div className="aspect-[16/10] rounded-2xl overflow-hidden mb-8">
            <img 
              src={getImageUrl(newsItem.image_url)} 
              alt={newsItem.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            {newsItem.content ? (
              <div dangerouslySetInnerHTML={{ __html: newsItem.content }} />
            ) : newsItem.excerpt ? (
              <p className="text-lg leading-relaxed text-foreground/80">
                {newsItem.excerpt}
              </p>
            ) : null}
          </div>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Flowers & Toys</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(newsItem.published_at || newsItem.created_at)}
              </span>
            </div>
            {newsItem.category && (
              <span className="px-3 py-1 bg-secondary rounded-full text-sm">
                {newsItem.category}
              </span>
            )}
          </div>
        </div>
      </article>
    </PageLayout>
  );
};

export default NewsDetail;
