import { forwardRef } from 'react';
import { Link as BaseLink, NavLink as BaseNavLink } from 'react-router-dom';
import { withTrailingSlash } from '../lib/url';

// Link / NavLink qui émettent toujours des href avec slash final, afin
// d'éviter une redirection 301 à chaque clic ou crawl.
function normalizeTo(to) {
  if (typeof to === 'string') return withTrailingSlash(to);
  if (to && typeof to.pathname === 'string') return { ...to, pathname: withTrailingSlash(to.pathname) };
  return to;
}

export const Link = forwardRef(function Link({ to, ...props }, ref) {
  return <BaseLink ref={ref} to={normalizeTo(to)} {...props} />;
});

export const NavLink = forwardRef(function NavLink({ to, ...props }, ref) {
  return <BaseNavLink ref={ref} to={normalizeTo(to)} {...props} />;
});
