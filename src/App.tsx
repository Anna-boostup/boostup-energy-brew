
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CheckoutPage from "./pages/CheckoutPage";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentError from "./pages/PaymentError";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Logout from "./pages/Logout";
// import Profile from "./pages/Profile"; // Deprecated
import ProtectedRoute from "./components/ProtectedRoute";
import AccountLayout from "./pages/account/AccountLayout";
import AccountOrders from "./pages/account/Orders";
import AccountProfile from "./pages/account/Profile";
import CompanyProfile from "./pages/account/CompanyProfile";
import Subscriptions from "./pages/account/Subscriptions";
import CompanyAccountLayout from "./pages/account/CompanyAccountLayout";
import { useAuth } from "./context/AuthContext";
import { Loader2 } from "lucide-react";

// Guard to enforce account type separation
const RoleGuard = ({ children, allowedType }: { children: React.ReactNode, allowedType: 'personal' | 'company' }) => {
  const { profile, loading } = useAuth();

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  if (!profile) return <Navigate to="/login" replace />;

  const currentType = profile.account_type || 'personal';

  // Admin should have access to everything or be redirected to admin
  if (currentType === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  if (currentType !== allowedType) {
    // Redirect to the correct dashboard
    return <Navigate to={currentType === 'company' ? "/company-account" : "/account"} replace />;
  }

  return <>{children}</>;
};


import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Inventory from "./pages/admin/Inventory";
import ManufactureInventory from "./pages/admin/ManufactureInventory";
import Orders from "./pages/admin/Orders";
import ContentManagement from "./pages/admin/ContentManagement";

import TermsOfService from "./pages/legal/TermsOfService";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import Returns from "./pages/legal/Returns";

import { CartProvider } from "./context/CartContext";
import { InventoryProvider } from "./context/InventoryContext";
import { ManufactureProvider } from "./context/ManufactureContext";
import { AuthProvider } from "./context/AuthContext";
import { ContentProvider } from "./context/ContentContext";

import { HelmetProvider } from 'react-helmet-async';
import ScrollToTop from './components/ScrollToTop';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <HelmetProvider>
        <AuthProvider>
          <ContentProvider>
            <InventoryProvider>
              <ManufactureProvider>
                <CartProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <ScrollToTop />
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/logout" element={<Logout />} />

                      {/* Account Routes */}
                      {/* Account Routes (Personal) */}
                      <Route path="/account" element={
                        <ProtectedRoute>
                          <RoleGuard allowedType="personal">
                            <AccountLayout />
                          </RoleGuard>
                        </ProtectedRoute>
                      }>
                        <Route index element={<Navigate to="/account/profile" replace />} />
                        <Route path="profile" element={<AccountProfile />} />
                        <Route path="orders" element={<AccountOrders />} />
                        <Route path="subscriptions" element={<Subscriptions />} />
                      </Route>

                      {/* Company Account Routes */}
                      <Route path="/company-account" element={
                        <ProtectedRoute>
                          <RoleGuard allowedType="company">
                            <CompanyAccountLayout />
                          </RoleGuard>
                        </ProtectedRoute>
                      }>
                        <Route index element={<Navigate to="/company-account/profile" replace />} />
                        <Route path="profile" element={<CompanyProfile />} />
                        {/* Reusing Orders component but it will need to context aware or just show same orders */}
                        <Route path="orders" element={<AccountOrders />} />
                        <Route path="subscriptions" element={<Subscriptions />} />
                      </Route>

                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/payment/success" element={<PaymentSuccess />} />
                      <Route path="/payment/error" element={<PaymentError />} />

                      {/* Admin Routes */}
                      <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<AdminDashboard />} />
                        <Route path="orders" element={<Orders />} />
                        <Route path="inventory" element={<Inventory />} />
                        <Route path="manufacture" element={<ManufactureInventory />} />
                        <Route path="content" element={<ContentManagement />} />
                      </Route>

                      {/* Legal Routes */}
                      <Route path="/obchodni-podminky" element={<TermsOfService />} />
                      <Route path="/ochrana-osobnich-udaju" element={<PrivacyPolicy />} />
                      <Route path="/reklamace" element={<Returns />} />

                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                </CartProvider>
              </ManufactureProvider>
            </InventoryProvider>
          </ContentProvider>
        </AuthProvider>
      </HelmetProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
