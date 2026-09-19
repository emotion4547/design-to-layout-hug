import { useEffect } from 'react';

/**
 * Head-теги проставляются напрямую через DOM, без react-helmet-async.
 *
 * Причина: в production-сборке Helmet не отрабатывал внутри страниц,
 * подгружаемых через React.lazy — а так грузятся все страницы, кроме главной.
 * Теги не появлялись вовсе, и каждый адрес отдавал мету из index.html:
 * одинаковые title и description на весь сайт, canonical на главную.
 * В dev проблема не воспроизводится, поэтому её долго не было видно.
 *
 * Публичный интерфейс компонентов не изменился — места вызова трогать не нужно.
 */

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
  };
  product?: {
    price?: number;
    currency?: string;
    availability?: 'InStock' | 'OutOfStock';
  };
  noindex?: boolean;
}

const BASE_URL = 'https://vezubuket23.ru';
const SITE_NAME = 'Везу букет';
const DEFAULT_DESCRIPTION = 'Доставка свежих цветов и букетов в Новороссийске. Розы, авторские композиции, букеты в шляпных коробках. Доставка от 1 часа. Заказ онлайн и по телефону.';
const DEFAULT_IMAGE = `${BASE_URL}/og-image.jpg`;

/** Описание одного тега: чем его искать и что в него положить. */
interface HeadTag {
  tag: 'meta' | 'link';
  keyAttr: 'name' | 'property' | 'rel';
  keyValue: string;
  valueAttr: 'content' | 'href';
  value: string;
}

/**
 * Проставляет теги в <head>. Уже существующий тег (например, из index.html)
 * переиспользуется и восстанавливается при уходе со страницы — так рядом не
 * появляется второй og:url или canonical с адресом предыдущей страницы.
 */
function useHeadTags(tags: HeadTag[], title?: string) {
  // Значения примитивны, поэтому сериализация — достаточный ключ зависимостей.
  const key = JSON.stringify([tags, title]);

  useEffect(() => {
    const restores: Array<() => void> = [];

    if (title !== undefined) {
      const prevTitle = document.title;
      document.title = title;
      restores.push(() => {
        document.title = prevTitle;
      });
    }

    for (const t of tags) {
      const selector = `${t.tag}[${t.keyAttr}="${t.keyValue}"]`;
      const existing = document.head.querySelector<HTMLElement>(selector);

      if (existing) {
        const prev = existing.getAttribute(t.valueAttr);
        existing.setAttribute(t.valueAttr, t.value);
        restores.push(() => {
          if (prev === null) existing.removeAttribute(t.valueAttr);
          else existing.setAttribute(t.valueAttr, prev);
        });
      } else {
        const el = document.createElement(t.tag);
        el.setAttribute(t.keyAttr, t.keyValue);
        el.setAttribute(t.valueAttr, t.value);
        el.setAttribute('data-seo', '');
        document.head.appendChild(el);
        restores.push(() => el.remove());
      }
    }

    return () => {
      // В обратном порядке, чтобы вложенные правки снимались корректно.
      for (let i = restores.length - 1; i >= 0; i--) restores[i]();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}

/** Вставляет блок JSON-LD и убирает его при размонтировании. */
function useJsonLd(schema: unknown) {
  const json = JSON.stringify(schema);

  useEffect(() => {
    const el = document.createElement('script');
    el.type = 'application/ld+json';
    el.setAttribute('data-seo', '');
    el.textContent = json;
    document.head.appendChild(el);
    return () => el.remove();
  }, [json]);
}

export const SEO = ({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords,
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  article,
  product,
  noindex = false,
}: SEOProps) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Доставка цветов и букетов`;
  const fullUrl = url ? `${BASE_URL}${url}` : BASE_URL;
  const fullImage = image.startsWith('http') ? image : `${BASE_URL}${image}`;

  const meta = (
    keyAttr: 'name' | 'property',
    keyValue: string,
    value: string
  ): HeadTag => ({ tag: 'meta', keyAttr, keyValue, valueAttr: 'content', value });

  const tags: HeadTag[] = [
    meta('name', 'title', fullTitle),
    meta('name', 'description', description),
    ...(keywords ? [meta('name', 'keywords', keywords)] : []),
    meta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow'),

    { tag: 'link', keyAttr: 'rel', keyValue: 'canonical', valueAttr: 'href', value: fullUrl },

    meta('property', 'og:type', type),
    meta('property', 'og:url', fullUrl),
    meta('property', 'og:title', fullTitle),
    meta('property', 'og:description', description),
    meta('property', 'og:image', fullImage),
    meta('property', 'og:site_name', SITE_NAME),
    meta('property', 'og:locale', 'ru_RU'),

    ...(article?.publishedTime ? [meta('property', 'article:published_time', article.publishedTime)] : []),
    ...(article?.modifiedTime ? [meta('property', 'article:modified_time', article.modifiedTime)] : []),
    ...(article?.author ? [meta('property', 'article:author', article.author)] : []),
    ...(article?.section ? [meta('property', 'article:section', article.section)] : []),

    ...(product
      ? [
          meta('property', 'product:price:amount', String(product.price)),
          meta('property', 'product:price:currency', product.currency || 'RUB'),
          meta('property', 'product:availability', product.availability || 'InStock'),
        ]
      : []),

    meta('name', 'twitter:card', 'summary_large_image'),
    meta('name', 'twitter:url', fullUrl),
    meta('name', 'twitter:title', fullTitle),
    meta('name', 'twitter:description', description),
    meta('name', 'twitter:image', fullImage),
  ];

  useHeadTags(tags, fullTitle);

  return null;
};
// Product structured data component
interface ProductSchemaProps {
  name: string;
  description?: string;
  image: string;
  price: number;
  oldPrice?: number;
  inStock?: boolean;
  url: string;
  /** Средняя оценка и число отзывов — с ними в выдаче появляются звёзды. */
  rating?: number;
  reviewCount?: number;
}

export const ProductSchema = ({
  name,
  description,
  image,
  price,
  oldPrice,
  inStock = true,
  url,
  rating,
  reviewCount,
}: ProductSchemaProps) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image: image.startsWith('http') ? image : `${BASE_URL}${image}`,
    url: `${BASE_URL}${url}`,
    offers: {
      '@type': 'Offer',
      price,
      priceCurrency: 'RUB',
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      ...(oldPrice && {
        priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      }),
    },
    brand: {
      '@type': 'Brand',
      name: SITE_NAME,
    },
    // Без отзывов блок не добавляем: разметка с нулевым рейтингом считается
    // разметкой без данных и может быть признана недостоверной.
    ...(rating && reviewCount
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: rating,
            reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };

  useJsonLd(schema);
  return null;
};

// Breadcrumb structured data component
interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

export const BreadcrumbSchema = ({ items }: BreadcrumbSchemaProps) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${BASE_URL}${item.url}`,
    })),
  };

  useJsonLd(schema);
  return null;
};

// Article structured data component
interface ArticleSchemaProps {
  title: string;
  description?: string;
  image: string;
  publishedTime?: string;
  modifiedTime?: string;
  url: string;
}

export const ArticleSchema = ({
  title,
  description,
  image,
  publishedTime,
  modifiedTime,
  url,
}: ArticleSchemaProps) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    image: image.startsWith('http') ? image : `${BASE_URL}${image}`,
    url: `${BASE_URL}${url}`,
    datePublished: publishedTime,
    dateModified: modifiedTime || publishedTime,
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/og-image.jpg`,
      },
    },
  };

  useJsonLd(schema);
  return null;
};

// FAQ structured data component
interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSchemaProps {
  items: FAQItem[];
}

export const FAQSchema = ({ items }: FAQSchemaProps) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  useJsonLd(schema);
  return null;
};
