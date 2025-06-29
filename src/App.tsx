import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { Layout } from '@/components/layout/Layout';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Dashboard } from '@/pages/Dashboard';
import { Services } from '@/pages/Services';
import { OperatorPortal } from '@/pages/OperatorPortal';
import { TowTrucks } from '@/pages/TowTrucks';
import { Operators } from '@/pages/Operators';
import { Clients } from '@/pages/Clients';
import { Reports } from '@/pages/Reports';
import { Settings } from '@/pages/Settings';
import { Billing } from '@/pages/Billing';
import { Calendar } from '@/pages/Calendar';
import { ClientPortal } from '@/pages/ClientPortal';
import { useAuth } from '@/hooks/useAuth';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

function AppContent() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/portal-cliente" element={<Navigate to="/login" replace />} />
        <Route path="/portal-operador" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Si el usuario es cliente, redirigir al portal cliente
  if (user?.role === 'client') {
    return (
      <Routes>
        <Route path="/login" element={<Navigate to="/portal-cliente" replace />} />
        <Route path="/register" element={<Navigate to="/portal-cliente" replace />} />
        <Route path="/portal-cliente" element={<ClientPortal />} />
        <Route path="*" element={<Navigate to="/portal-cliente" replace />} />
      </Routes>
    );
  }

  // Si el usuario es operador, redirigir al portal operador
  if (user?.role === 'operator') {
    return (
      <Routes>
        <Route path="/login" element={<Navigate to="/portal-operador" replace />} />
        <Route path="/register" element={<Navigate to="/" replace />} />
        <Route path="/portal-operador" element={<OperatorPortal />} />
        <Route path="*" element={<Navigate to="/portal-operador" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/register" element={<Navigate to="/" replace />} />
      <Route path="/portal-cliente" element={<Navigate to="/" replace />} />
      <Route path="/portal-operador" element={<Navigate to="/" replace />} />
      <Route path="/" element={<Layout />}>
        <Route index element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="services" element={
          <ProtectedRoute>
            <Services />
          </ProtectedRoute>
        } />
        <Route path="billing" element={
          <ProtectedRoute>
            <Billing />
          </ProtectedRoute>
        } />
        <Route path="calendar" element={
          <ProtectedRoute>
            <Calendar />
          </ProtectedRoute>
        } />
        <Route path="operator" element={
          <ProtectedRoute requiredRole="operator">
            <OperatorPortal />
          </ProtectedRoute>
        } />
        <Route path="clients" element={
          <ProtectedRoute requiredRole="admin">
            <Clients />
          </ProtectedRoute>
        } />
        <Route path="tow-trucks" element={
          <ProtectedRoute>
            <TowTrucks />
          </ProtectedRoute>
        } />
        <Route path="operators" element={
          <ProtectedRoute requiredRole="admin">
            <Operators />
          </ProtectedRoute>
        } />
        <Route path="reports" element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        } />
        <Route path="settings" element={
          <ProtectedRoute requiredRole="admin">
            <Settings />
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Router>
          <AppContent />
          <Toaster position="top-right" />
        </Router>
        <ReactQueryDevtools initialIsOpen={false} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}