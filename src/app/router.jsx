import { Route, Routes } from 'react-router-dom';
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
import Resources from '../pages/Resources';
import ResourceDetail from '../pages/ResourceDetail';
import About from '../pages/About';
import Contact from '../pages/Contact';
import Faq from '../pages/Faq';
import SiteMap from '../pages/SiteMap';
import Legal from '../pages/Legal';
import NotFound from '../pages/NotFound';

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
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:slug" element={<BlogPost />} />
      <Route path="/ressources" element={<Resources />} />
      <Route path="/ressources/:slug" element={<ResourceDetail />} />
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
