// Forme canonique des URLs internes : toujours AVEC slash final
// (c'est ce que sert Netlify en 200 ; la version sans slash répond 301).
// Les fichiers (dernier segment avec extension) restent inchangés.
export function withTrailingSlash(path) {
  if (typeof path !== 'string' || !path.startsWith('/') || path.startsWith('//')) return path;
  const match = path.match(/^([^?#]*)(.*)$/);
  const pathname = match[1];
  if (pathname.endsWith('/') || /\.[a-z0-9]+$/i.test(pathname)) return path;
  return `${pathname}/${match[2]}`;
}
