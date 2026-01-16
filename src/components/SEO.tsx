import { Helmet } from 'react-helmet-async';

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

const BASE_URL = 'https://example.com';
const SITE_NAME = 'Ваше название';
const DEFAULT_DESCRIPTION = 'Доставка воздушных шаров с гелием. Латексные и фольгированные шары, фигуры, цифры. Оформление праздников. Быстрая доставка по городу.';
const DEFAULT_IMAGE = `${BASE_URL}/og-image.jpg`;

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
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Воздушные шары с гелием`;
  const fullUrl = url ? `${BASE_URL}${url}` : BASE_URL;
  const fullImage = image.startsWith('http') ? image : `${BASE_URL}${image}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Robots */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}
      
      {/* Canonical */}
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="ru_RU" />

      {/* Article specific */}
      {article && (
        <>
          {article.publishedTime && (
            <meta property="article:published_time" content={article.publishedTime} />
          )}
          {article.modifiedTime && (
            <meta property="article:modified_time" content={article.modifiedTime} />
          )}
          {article.author && <meta property="article:author" content={article.author} />}
          {article.section && <meta property="article:section" content={article.section} />}
        </>
      )}

      {/* Product specific */}
      {product && (
        <>
          <meta property="product:price:amount" content={String(product.price)} />
          <meta property="product:price:currency" content={product.currency || 'RUB'} />
          <meta property="product:availability" content={product.availability || 'InStock'} />
        </>
      )}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
    </Helmet>
  );
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
}

export const ProductSchema = ({
  name,
  description,
  image,
  price,
  oldPrice,
  inStock = true,
  url,
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
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
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

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
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

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
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

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};
