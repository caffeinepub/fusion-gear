import { RouterProvider, createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import CustomerProfilePage from './pages/CustomerProfilePage';
import CreateBillPage from './pages/CreateBillPage';
import InvoiceViewPage from './pages/InvoiceViewPage';
import ServiceHistoryPage from './pages/ServiceHistoryPage';
import LoginPage from './pages/LoginPage';
import ProfileSetupPage from './pages/ProfileSetupPage';

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardPage,
});

const customersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/customers',
  component: CustomerProfilePage,
});

const createBillRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/create-bill',
  component: CreateBillPage,
});

const createBillWithCustomerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/create-bill/$customerId',
  component: CreateBillPage,
});

const invoiceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/invoice/$invoiceId',
  component: InvoiceViewPage,
});

const historyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/history',
  component: ServiceHistoryPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

const profileSetupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile-setup',
  component: ProfileSetupPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  customersRoute,
  createBillRoute,
  createBillWithCustomerRoute,
  invoiceRoute,
  historyRoute,
  loginRoute,
  profileSetupRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark">
      <RouterProvider router={router} />
      <Toaster richColors position="top-center" />
    </ThemeProvider>
  );
}
