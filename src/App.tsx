import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { SettingsProvider } from "./context/SettingsContext";
import { Toaster } from "./components/ui/sonner";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import AIChatBot from "./components/AIChatBot";
import ScrollToTop from "./components/ScrollToTop";
import { Skeleton } from "./components/ui/skeleton";

// Lazy load pages
const Home = lazy(() => import("./pages/Home"));
const Shop = lazy(() => import("./pages/Shop"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AuthPage = lazy(() => import("./pages/AuthPage"));

const Profile = lazy(() => import("./pages/Profile"));

const PageLoader = () => (
  <div className="max-w-7xl mx-auto px-6 py-20 space-y-8">
    <Skeleton className="h-20 w-3/4 rounded-2xl bg-ink/5" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <Skeleton className="aspect-[4/5] rounded-3xl bg-ink/5" />
      <Skeleton className="aspect-[4/5] rounded-3xl bg-ink/5" />
      <Skeleton className="aspect-[4/5] rounded-3xl bg-ink/5" />
    </div>
  </div>
);

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, loading } = useAuth();
  if (loading) return <PageLoader />;
  return isAdmin ? <>{children}</> : <Navigate to="/" />;
};

const UserRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  return user ? <>{children}</> : <Navigate to="/auth" />;
};

import { ErrorBoundary } from "./components/ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <SettingsProvider>
          <AuthProvider>
            <CartProvider>
              <div className="min-h-screen bg-paper text-ink selection:bg-royal-red selection:text-white font-sans">
                <ScrollToTop />
                <Navbar />
                <main className="pt-20">
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/shop" element={<Shop />} />
                      <Route path="/product/:id" element={<ProductDetail />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/profile" element={<UserRoute><Profile /></UserRoute>} />
                      <Route path="/checkout" element={<UserRoute><Checkout /></UserRoute>} />
                      <Route path="/admin/*" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                      <Route path="/auth" element={<AuthPage />} />
                    </Routes>
                  </Suspense>
                </main>
                <Footer />
                <AIChatBot />
                <Toaster position="bottom-right" richColors />
              </div>
            </CartProvider>
          </AuthProvider>
        </SettingsProvider>
      </Router>
    </ErrorBoundary>
  );
}
