import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { EligibilityPage } from '../features/eligibility/EligibilityForm';
import Home from '../pages/Home';
import Solutions from '../pages/Solutions';
import SolutionDetail from '../pages/SolutionDetail';
import Sectors from '../pages/Sectors';
import SectorDetail from '../pages/SectorDetail';
import Financing from '../pages/Financing';
import CaseStudies from '../pages/CaseStudies';
import CaseStudyDetail from '../pages/CaseStudyDetail';
import Blog from '../pages/Blog';
import BlogPost from '../pages/BlogPost';
import About from '../pages/About';
import Contact from '../pages/Contact';
import Faq from '../pages/Faq';
import SiteMap from '../pages/SiteMap';
import Legal from '../pages/Legal';
import NotFound from '../pages/NotFound';

function RedirectToResourcePost() {
  const { slug } = useParams();
  return <Navigate to={`/ressources/${slug}`} replace />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/solutions" element={<Solutions />} />
      <Route path="/solutions/:slug" element={<SolutionDetail />} />
      <Route path="/secteurs" element={<Sectors />} />
      <Route path="/secteurs/:slug" element={<SectorDetail />} />
      <Route path="/financement-cee" element={<Financing />} />
      <Route path="/eligibilite" element={<EligibilityPage />} />
      <Route path="/realisations" element={<CaseStudies />} />
      <Route path="/realisations/:slug" element={<CaseStudyDetail />} />
      <Route path="/ressources" element={<Blog />} />
      <Route path="/ressources/:slug" element={<BlogPost />} />
      <Route path="/blog" element={<Navigate to="/ressources" replace />} />
      <Route path="/blog/:slug" element={<RedirectToResourcePost />} />
      <Route path="/a-propos" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/faq" element={<Faq />} />
      <Route path="/plan-du-site" element={<SiteMap />} />
      <Route path="/mentions-legales" element={<Legal pageKey="mentions-legales" />} />
      <Route path="/politique-de-confidentialite" element={<Legal pageKey="politique-de-confidentialite" />} />
      <Route path="/gestion-des-cookies" element={<Legal pageKey="gestion-des-cookies" />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
