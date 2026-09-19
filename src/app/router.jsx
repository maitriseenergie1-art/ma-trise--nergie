import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';

// Browser visitors receive only the active route, with every other page split
// into its own chunk. The static generator uses ServerRoutes instead.
const clientLoaders = {
  '../pages/Home.jsx': () => import('../pages/Home.jsx'),
  '../pages/Solutions.jsx': () => import('../pages/Solutions.jsx'),
  '../pages/SolutionDetail.jsx': () => import('../pages/SolutionDetail.jsx'),
  '../pages/Sectors.jsx': () => import('../pages/Sectors.jsx'),
  '../pages/SectorDetail.jsx': () => import('../pages/SectorDetail.jsx'),
  '../pages/Financing.jsx': () => import('../pages/Financing.jsx'),
  '../features/eligibility/EligibilityForm.jsx': () => import('../features/eligibility/EligibilityForm.jsx'),
  '../pages/CaseStudies.jsx': () => import('../pages/CaseStudies.jsx'),
  '../pages/CaseStudyDetail.jsx': () => import('../pages/CaseStudyDetail.jsx'),
  '../pages/Blog.jsx': () => import('../pages/Blog.jsx'),
  '../pages/BlogPost.jsx': () => import('../pages/BlogPost.jsx'),
  '../pages/About.jsx': () => import('../pages/About.jsx'),
  '../pages/Contact.jsx': () => import('../pages/Contact.jsx'),
  '../pages/Faq.jsx': () => import('../pages/Faq.jsx'),
  '../pages/SiteMap.jsx': () => import('../pages/SiteMap.jsx'),
  '../pages/Legal.jsx': () => import('../pages/Legal.jsx'),
  '../pages/NotFound.jsx': () => import('../pages/NotFound.jsx'),
};

function routeComponent(path, exportName = 'default') {
  return lazy(() => clientLoaders[path]().then((module) => ({ default: module[exportName] })));
}

const Home = routeComponent('../pages/Home.jsx');
const Solutions = routeComponent('../pages/Solutions.jsx');
const SolutionDetail = routeComponent('../pages/SolutionDetail.jsx');
const Sectors = routeComponent('../pages/Sectors.jsx');
const SectorDetail = routeComponent('../pages/SectorDetail.jsx');
const Financing = routeComponent('../pages/Financing.jsx');
const EligibilityPage = routeComponent('../features/eligibility/EligibilityForm.jsx', 'EligibilityPage');
const CaseStudies = routeComponent('../pages/CaseStudies.jsx');
const CaseStudyDetail = routeComponent('../pages/CaseStudyDetail.jsx');
const Blog = routeComponent('../pages/Blog.jsx');
const BlogPost = routeComponent('../pages/BlogPost.jsx');
const About = routeComponent('../pages/About.jsx');
const Contact = routeComponent('../pages/Contact.jsx');
const Faq = routeComponent('../pages/Faq.jsx');
const SiteMap = routeComponent('../pages/SiteMap.jsx');
const Legal = routeComponent('../pages/Legal.jsx');
const NotFound = routeComponent('../pages/NotFound.jsx');

function RedirectToResourcePost() {
  const { slug } = useParams();
  return <Navigate to={`/ressources/${slug}`} replace />;
}

function Page({ Component, ...props }) {
  return <Suspense fallback={<main id="main-content" className="route-loading" aria-busy="true" />}><Component {...props}/></Suspense>;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Page Component={Home}/>} />
      <Route path="/solutions" element={<Page Component={Solutions}/>} />
      <Route path="/solutions/:slug" element={<Page Component={SolutionDetail}/>} />
      <Route path="/secteurs" element={<Page Component={Sectors}/>} />
      <Route path="/secteurs/:slug" element={<Page Component={SectorDetail}/>} />
      <Route path="/financement-cee" element={<Page Component={Financing}/>} />
      <Route path="/eligibilite" element={<Page Component={EligibilityPage}/>} />
      <Route path="/realisations" element={<Page Component={CaseStudies}/>} />
      <Route path="/realisations/:slug" element={<Page Component={CaseStudyDetail}/>} />
      <Route path="/ressources" element={<Page Component={Blog}/>} />
      <Route path="/ressources/:slug" element={<Page Component={BlogPost}/>} />
      <Route path="/blog" element={<Navigate to="/ressources" replace />} />
      <Route path="/blog/:slug" element={<RedirectToResourcePost />} />
      <Route path="/a-propos" element={<Page Component={About}/>} />
      <Route path="/contact" element={<Page Component={Contact}/>} />
      <Route path="/faq" element={<Page Component={Faq}/>} />
      <Route path="/plan-du-site" element={<Page Component={SiteMap}/>} />
      <Route path="/mentions-legales" element={<Page Component={Legal} pageKey="mentions-legales"/>} />
      <Route path="/politique-de-confidentialite" element={<Page Component={Legal} pageKey="politique-de-confidentialite"/>} />
      <Route path="/gestion-des-cookies" element={<Page Component={Legal} pageKey="gestion-des-cookies"/>} />
      <Route path="*" element={<Page Component={NotFound}/>} />
    </Routes>
  );
}
