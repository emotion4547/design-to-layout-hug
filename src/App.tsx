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
import Catalog from "./pages/Catalog";
import Product from "./pages/Product";
import CollectionPage from "./pages/Collection";
import Promotions from "./pages/Promotions";
import PromotionDetail from "./pages/PromotionDetail";
import NewsPage from "./pages/News";
import NewsDetail from "./pages/NewsDetail";
import DeliveryPage from "./pages/Delivery";
import ContactsPage from "./pages/Contacts";
import Cart from "./pages/Cart";
import Favorites from "./pages/Favorites";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse";
import ReturnPolicy from "./pages/ReturnPolicy";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminNews from "./pages/admin/AdminNews";
import AdminPromotions from "./pages/admin/AdminPromotions";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminCollections from "./pages/admin/AdminCollections";
import AdminGlobalAddons from "./pages/admin/AdminGlobalAddons";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminDesign from "./pages/admin/AdminDesign";
import AdminIntegrations from "./pages/admin/AdminIntegrations";
import { ThemeProvider } from "./components/ThemeProvider";

const queryClient = new QueryClient();

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
              </BrowserRouter>
            </FavoritesProvider>
          </CartProvider>
        </ThemeProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
