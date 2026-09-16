import { Suspense, lazy, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { PageMotion } from '../components/PageMotion';
import { Header, Footer, ScrollToTop } from '../components/Layout';
import { MobileEligibilityCta } from '../components/sections';
import { Seo } from '../components/Seo';
import { captureInitialAcquisition } from '../services/acquisition';
import { initTrafficTracking, trackPageView } from '../services/trafficTracking';
import { AppRoutes } from './router';

const AdminApp = lazy(() => import('../features/admin/AdminApp'));

function AcquisitionCapture() {
  useEffect(() => {
    captureInitialAcquisition();
    initTrafficTracking();
  }, []);
  return null;
}

function RouteAnalytics() {
  const { pathname } = useLocation();
  const first = useRef(true);
  useEffect(() => {
    if (pathname.startsWith('/admin')) return;
    const id = setTimeout(() => trackPageView(pathname), first.current ? 300 : 120);
    first.current = false;
    return () => clearTimeout(id);
  }, [pathname]);
  return null;
}

// Router-agnostic application tree. Wrapped in BrowserRouter for the browser
// (App) and StaticRouter for the build-time prerender (entry-server).
export function AppShell() {
  const { pathname } = useLocation();

  // The back office is a standalone app: no public header, footer or motion.
  if (pathname.startsWith('/admin')) {
    return (
      <>
        <Seo title="Administration" description="Espace d’administration sécurisé de Maîtrise Énergie." canonicalPath="/admin" noindex />
        <Suspense fallback={<div style={{ padding: '4rem', textAlign: 'center' }}>Chargement…</div>}>
          <AdminApp />
        </Suspense>
      </>
    );
  }

  return (
    <div className="public-shell">
      <AcquisitionCapture />
      <RouteAnalytics />
      <ScrollToTop />
      <a className="skip-link" href="#main-content">Aller au contenu principal</a>
      <Header />
      <div className="public-stage">
        <PageMotion>
          <AppRoutes />
        </PageMotion>
        <MobileEligibilityCta />
        <Footer />
      </div>
    </div>
  );
}
