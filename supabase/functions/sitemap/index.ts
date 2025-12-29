import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BASE_URL = "https://butonvton.ru";

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
}

function generateSitemapXml(urls: SitemapUrl[]): string {
  const urlEntries = urls
    .map((url) => {
      let entry = `  <url>\n    <loc>${url.loc}</loc>`;
      if (url.lastmod) {
        entry += `\n    <lastmod>${url.lastmod}</lastmod>`;
      }
      if (url.changefreq) {
        entry += `\n    <changefreq>${url.changefreq}</changefreq>`;
      }
      if (url.priority !== undefined) {
        entry += `\n    <priority>${url.priority.toFixed(1)}</priority>`;
      }
      entry += "\n  </url>";
      return entry;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

function formatDate(dateString: string | null): string {
  if (!dateString) return new Date().toISOString().split("T")[0];
  return new Date(dateString).toISOString().split("T")[0];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const urls: SitemapUrl[] = [];

    // Static pages
    urls.push(
      { loc: BASE_URL, changefreq: "daily", priority: 1.0 },
      { loc: `${BASE_URL}/catalog`, changefreq: "daily", priority: 0.9 },
      { loc: `${BASE_URL}/promotions`, changefreq: "weekly", priority: 0.8 },
      { loc: `${BASE_URL}/news`, changefreq: "weekly", priority: 0.7 },
      { loc: `${BASE_URL}/delivery`, changefreq: "monthly", priority: 0.6 },
      { loc: `${BASE_URL}/contacts`, changefreq: "monthly", priority: 0.6 }
    );

    // Fetch products
    const { data: products } = await supabase
      .from("products")
      .select("id, updated_at")
      .eq("in_stock", true)
      .order("created_at", { ascending: false });

    if (products) {
      for (const product of products) {
        urls.push({
          loc: `${BASE_URL}/catalog/${product.id}`,
          lastmod: formatDate(product.updated_at),
          changefreq: "weekly",
          priority: 0.8,
        });
      }
    }

    // Fetch collections
    const { data: collections } = await supabase
      .from("collections")
      .select("slug, updated_at")
      .eq("is_active", true)
      .order("sort_order");

    if (collections) {
      for (const collection of collections) {
        urls.push({
          loc: `${BASE_URL}/collection/${collection.slug}`,
          lastmod: formatDate(collection.updated_at),
          changefreq: "weekly",
          priority: 0.7,
        });
      }
    }

    // Fetch promotions
    const { data: promotions } = await supabase
      .from("promotions")
      .select("slug, updated_at")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (promotions) {
      for (const promotion of promotions) {
        urls.push({
          loc: `${BASE_URL}/promotions/${promotion.slug}`,
          lastmod: formatDate(promotion.updated_at),
          changefreq: "weekly",
          priority: 0.6,
        });
      }
    }

    // Fetch news
    const { data: news } = await supabase
      .from("news")
      .select("slug, updated_at, published_at")
      .eq("is_published", true)
      .order("published_at", { ascending: false });

    if (news) {
      for (const item of news) {
        urls.push({
          loc: `${BASE_URL}/news/${item.slug}`,
          lastmod: formatDate(item.updated_at || item.published_at),
          changefreq: "monthly",
          priority: 0.5,
        });
      }
    }

    // Fetch categories for catalog filtering
    const { data: categories } = await supabase
      .from("categories")
      .select("id, updated_at")
      .eq("is_active", true)
      .order("sort_order");

    if (categories) {
      for (const category of categories) {
        urls.push({
          loc: `${BASE_URL}/catalog?category=${category.id}`,
          lastmod: formatDate(category.updated_at),
          changefreq: "weekly",
          priority: 0.7,
        });
      }
    }

    const sitemap = generateSitemapXml(urls);

    return new Response(sitemap, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate sitemap" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
