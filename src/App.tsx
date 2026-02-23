import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import { ThemeProvider } from "./components/ThemeProvider";
import { CookieConsent } from "./components/CookieConsent";
import { ScrollToTop } from "./components/ScrollToTop";

// Lazy-loaded pages
const Catalog = lazy(() => import("./pages/Catalog"));
const Product = lazy(() => import("./pages/Product"));
const CollectionPage = lazy(() => import("./pages/Collection"));
const Promotions = lazy(() => import("./pages/Promotions"));
const PromotionDetail = lazy(() => import("./pages/PromotionDetail"));
const NewsPage = lazy(() => import("./pages/News"));
const NewsDetail = lazy(() => import("./pages/NewsDetail"));
const DeliveryPage = lazy(() => import("./pages/Delivery"));
const ContactsPage = lazy(() => import("./pages/Contacts"));
const Cart = lazy(() => import("./pages/Cart"));
const Favorites = lazy(() => import("./pages/Favorites"));
const Auth = lazy(() => import("./pages/Auth"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfUse = lazy(() => import("./pages/TermsOfUse"));
const ReturnPolicy = lazy(() => import("./pages/ReturnPolicy"));

// Admin pages
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminNews = lazy(() => import("./pages/admin/AdminNews"));
const AdminPromotions = lazy(() => import("./pages/admin/AdminPromotions"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminCollections = lazy(() => import("./pages/admin/AdminCollections"));
const AdminGlobalAddons = lazy(() => import("./pages/admin/AdminGlobalAddons"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminDesign = lazy(() => import("./pages/admin/AdminDesign"));
const AdminIntegrations = lazy(() => import("./pages/admin/AdminIntegrations"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ThemeProvider>
          <CartProvider>
            <FavoritesProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <ScrollToTop />
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/catalog" element={<Catalog />} />
                    <Route path="/catalog/:id" element={<Product />} />
                    <Route path="/collection/:slug" element={<CollectionPage />} />
                    <Route path="/promotions" element={<Promotions />} />
                    <Route path="/promotions/:id" element={<PromotionDetail />} />
                    <Route path="/news" element={<NewsPage />} />
                    <Route path="/news/:id" element={<NewsDetail />} />
                    <Route path="/delivery" element={<DeliveryPage />} />
                    <Route path="/contacts" element={<ContactsPage />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/favorites" element={<Favorites />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<TermsOfUse />} />
                    <Route path="/return" element={<ReturnPolicy />} />
                    {/* Admin Routes - Protected */}
                    <Route path="/admin" element={
                      <ProtectedRoute requireAdmin>
                        <AdminLayout />
                      </ProtectedRoute>
                    }>
                      <Route index element={<AdminDashboard />} />
                      <Route path="products" element={<AdminProducts />} />
                      <Route path="orders" element={<AdminOrders />} />
                      <Route path="news" element={<AdminNews />} />
                      <Route path="promotions" element={<AdminPromotions />} />
                      <Route path="categories" element={<AdminCategories />} />
                      <Route path="global-addons" element={<AdminGlobalAddons />} />
                      <Route path="collections" element={<AdminCollections />} />
                      <Route path="design" element={<AdminDesign />} />
                      <Route path="integrations" element={<AdminIntegrations />} />
                      <Route path="settings" element={<AdminSettings />} />
                    </Route>
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
                <CookieConsent />
              </BrowserRouter>
            </FavoritesProvider>
          </CartProvider>
        </ThemeProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
