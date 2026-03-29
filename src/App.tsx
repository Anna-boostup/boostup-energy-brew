
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";

// Lazy-loaded pages
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const PaymentError = lazy(() => import("./pages/PaymentError"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Logout = lazy(() => import("./pages/Logout"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

// Account pages
const AccountLayout = lazy(() => import("./pages/account/AccountLayout"));
const AccountOrders = lazy(() => import("./pages/account/Orders"));
const AccountProfile = lazy(() => import("./pages/account/Profile"));
const CompanyProfile = lazy(() => import("./pages/account/CompanyProfile"));
const Subscriptions = lazy(() => import("./pages/account/Subscriptions"));
const CompanyAccountLayout = lazy(() => import("./pages/account/CompanyAccountLayout"));

// Admin pages
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const Inventory = lazy(() => import("./pages/admin/Inventory"));
const ManufactureInventory = lazy(() => import("./pages/admin/ManufactureInventory"));
const AdminProfile = lazy(() => import("./pages/admin/AdminProfile"));
const Orders = lazy(() => import("./pages/admin/Orders"));
const ContentManagement = lazy(() => import("./pages/admin/ContentManagement"));
const AdminHelp = lazy(() => import("./pages/admin/AdminHelp"));

// Legal pages
const TermsOfService = lazy(() => import("./pages/legal/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/legal/PrivacyPolicy"));
const CookiesPolicy = lazy(() => import("./pages/legal/CookiesPolicy"));
const Returns = lazy(() => import("./pages/legal/Returns"));
const RecurringPaymentTerms = lazy(() => import("./pages/legal/RecurringPaymentTerms"));
const ShippingAndPayment = lazy(() => import("./pages/legal/ShippingAndPayment"));

import ProtectedRoute from "./components/ProtectedRoute";

import { useAuth } from "./context/AuthContext";
import { Loader2 } from "lucide-react";

// Guard to enforce account type separation
const RoleGuard = ({ children, allowedType }: { children: React.ReactNode, allowedType: 'personal' | 'company' }) => {
  // TEMPORARY: Bypass for security audit
  return <>{children}</>;
  /*
  const { profile, loading } = useAuth();
  ...
  return <>{children}</>;
  */
};

import { CartProvider } from "./context/CartContext";
import { InventoryProvider } from "./context/InventoryContext";
import { ManufactureProvider } from "./context/ManufactureContext";
import { AuthProvider } from "./context/AuthContext";
import { ContentProvider } from "./context/ContentContext";
import { CookieProvider } from "./context/CookieContext";
import { CookieBanner } from "./components/CookieBanner";

import { HelmetProvider } from 'react-helmet-async';
import ScrollToTop from './components/ScrollToTop';
import { useDynamicFonts } from './hooks/useDynamicFonts';

// Applies typography CSS variables from the CMS content
const FontLoader = () => { useDynamicFonts(); return null; };

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <HelmetProvider>
        <AuthProvider>
          <ContentProvider>
            <FontLoader />
            <CookieProvider>
              <InventoryProvider>
                <ManufactureProvider>
                  <CartProvider>
                    <Toaster />
                    <Sonner />
                    <BrowserRouter>
                      <ScrollToTop />
                      <CookieBanner />
                      <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>}>
                        <Routes>
                          <Route path="/" element={<Index />} />
                          <Route path="/login" element={<Login />} />
                          <Route path="/register" element={<Register />} />
                          <Route path="/logout" element={<Logout />} />
                          <Route path="/reset-password" element={<ResetPassword />} />

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
                            <Route path="profile" element={<AdminProfile />} />
                            <Route path="help" element={<AdminHelp />} />
                          </Route>

                          {/* Legal Routes */}
                          <Route path="/obchodni-podminky" element={<TermsOfService />} />
                          <Route path="/ochrana-osobnich-udaju" element={<PrivacyPolicy />} />
                          <Route path="/cookies" element={<CookiesPolicy />} />
                          <Route path="/doprava-a-platba" element={<ShippingAndPayment />} />
                          <Route path="/reklamace" element={<Returns />} />
                          <Route path="/podminky-opakovane-platby" element={<RecurringPaymentTerms />} />

                          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </Suspense>
                    </BrowserRouter>
                  </CartProvider>
                </ManufactureProvider>
              </InventoryProvider>
            </CookieProvider>
          </ContentProvider>
        </AuthProvider>
      </HelmetProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
