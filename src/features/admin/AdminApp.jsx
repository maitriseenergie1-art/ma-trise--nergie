import { useCallback, useEffect, useState } from 'react';
import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import {
  BarChart3,
  BriefcaseBusiness,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  Newspaper,
  Users,
  X,
} from 'lucide-react';
import './admin.css';
import { checkCode, clearToken, getToken, setToken } from './adminClient';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import CaseStudiesAdmin from './pages/CaseStudiesAdmin';
import BlogAdmin from './pages/BlogAdmin';
import Stats from './pages/Stats';

const NAV = [
  { to: '/admin', end: true, label: 'Vue d’ensemble', icon: LayoutDashboard },
  { to: '/admin/leads', label: 'Leads', icon: Users },
  { to: '/admin/realisations', label: 'Réalisations', icon: BriefcaseBusiness },
  { to: '/admin/blog', label: 'Contenus', icon: Newspaper },
  { to: '/admin/statistiques', label: 'Statistiques', icon: BarChart3 },
];

function Gate({ onUnlock }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const ok = await checkCode(code.trim());
    setBusy(false);
    if (ok) {
      setToken(code.trim());
      onUnlock();
    } else {
      setError('Code refusé ou serveur indisponible.');
    }
  };

  return (
    <div className="admin">
      <div className="admin-login-screen">
        <form className="admin-login" onSubmit={submit}>
          <span className="admin-login-brand"><span className="admin-brand-mark">M</span>Maîtrise Énergie</span>
          <span className="admin-login-kicker">Portail sécurisé</span>
          <h2>Espace d’administration</h2>
          <p className="hint">Saisissez le code d’accès pour piloter les leads, le contenu et les statistiques.</p>
          {error && <p className="admin-error">{error}</p>}
          <div className="admin-field">
            <label htmlFor="admin-code">Code d’accès</label>
            <input
              id="admin-code"
              type="password"
              autoComplete="off"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              autoFocus
            />
          </div>
          <button className="admin-btn" type="submit" disabled={busy || !code.trim()}>
            {busy ? 'Vérification…' : 'Entrer'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminApp() {
  const [status, setStatus] = useState(getToken() ? 'checking' : 'locked');
  const [navOpen, setNavOpen] = useState(false);
  const location = useLocation();

  const verify = useCallback(async () => {
    if (!getToken()) {
      setStatus('locked');
      return;
    }
    const ok = await checkCode(getToken());
    setStatus(ok ? 'unlocked' : 'locked');
    if (!ok) clearToken();
  }, []);

  useEffect(() => {
    if (status === 'checking') verify();
  }, [status, verify]);

  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!navOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setNavOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [navOpen]);

  if (status === 'checking') {
    return (
      <div className="admin">
        <div className="admin-login-screen">
          <p className="hint">Connexion…</p>
        </div>
      </div>
    );
  }

  if (status !== 'unlocked') {
    return <Gate onUnlock={() => setStatus('unlocked')} />;
  }

  const logout = () => {
    clearToken();
    setStatus('locked');
  };

  return (
    <div className="admin">
      <div className={`admin-shell ${navOpen ? 'nav-is-open' : ''}`}>
        <button className="admin-nav-backdrop" type="button" aria-label="Fermer le menu" onClick={() => setNavOpen(false)} />
        <aside className="admin-sidebar" aria-label="Navigation d’administration">
          <div className="admin-brand">
            <span className="admin-brand-mark" aria-hidden="true">M</span>
            <span><strong>Maîtrise Énergie</strong><small>Pilotage d’activité</small></span>
            <button className="admin-sidebar-close" type="button" aria-label="Fermer le menu" onClick={() => setNavOpen(false)}>
              <X size={20} />
            </button>
          </div>
          <nav className="admin-nav">
            <span className="admin-nav-label">Espace de travail</span>
            {NAV.map(({ icon: Icon, ...item }) => (
              <NavLink key={item.to} to={item.to} end={item.end}>
                <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="admin-sidebar-footer">
            <a href="/" target="_blank" rel="noreferrer">
              <ExternalLink size={17} aria-hidden="true" /> Voir le site
            </a>
            <button type="button" onClick={logout}>
              <LogOut size={17} aria-hidden="true" /> Se déconnecter
            </button>
          </div>
        </aside>
        <section className="admin-workspace">
          <header className="admin-appbar">
            <button
              className="admin-menu-button"
              type="button"
              aria-label="Ouvrir le menu"
              aria-expanded={navOpen}
              onClick={() => setNavOpen(true)}
            >
              <Menu size={21} />
            </button>
            <div>
              <strong>Administration</strong>
              <span>Maîtrise Énergie</span>
            </div>
            <span className="admin-status"><i aria-hidden="true" /> Système opérationnel</span>
          </header>
          <main className="admin-main">
          <Routes>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/leads" element={<Leads />} />
            <Route path="/admin/realisations" element={<CaseStudiesAdmin />} />
            <Route path="/admin/blog" element={<BlogAdmin />} />
            <Route path="/admin/statistiques" element={<Stats />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
          </main>
        </section>
      </div>
    </div>
  );
}
