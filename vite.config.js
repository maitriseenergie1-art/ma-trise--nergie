import { defineConfig, loadEnv } from 'vite';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

// Runs the Netlify Functions as dev-server middleware so `npm run dev` alone
// serves the /admin back office, the lead endpoint and the tracking beacon —
// no `netlify dev` required for local work.
function netlifyFunctionsDev(env) {
  const routes = [
    { test: (p) => p.startsWith('/api/admin'), file: 'netlify/functions/admin-api.mjs' },
    { test: (p) => p === '/api/track', file: 'netlify/functions/track.mjs' },
    { test: (p) => p === '/api/lead', file: 'netlify/functions/lead.mjs' },
  ];

  return {
    name: 'netlify-functions-dev',
    apply: 'serve',
    configResolved() {
      // Make .env values available to the function modules (they read process.env).
      for (const [k, v] of Object.entries(env)) {
        if (process.env[k] === undefined) process.env[k] = v;
      }
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const path = (req.url || '').split('?')[0];
        const route = routes.find((r) => r.test(path));
        if (!route) return next();

        try {
          const chunks = [];
          for await (const chunk of req) chunks.push(chunk);
          const body = chunks.length ? Buffer.concat(chunks) : undefined;

          const request = new Request(`http://localhost${req.url}`, {
            method: req.method,
            headers: req.headers,
            body: ['GET', 'HEAD'].includes(req.method) ? undefined : body,
          });

          const mod = await import(`${pathToFileURL(resolve(route.file)).href}?t=${Date.now()}`);
          const response = await mod.default(request);

          res.statusCode = response.status;
          response.headers.forEach((value, key) => res.setHeader(key, value));
          res.end(Buffer.from(await response.arrayBuffer()));
        } catch (error) {
          console.error(`[dev-api] ${path}`, error);
          res.statusCode = 500;
          res.setHeader('content-type', 'application/json');
          res.end(JSON.stringify({ error: 'dev_function_error', message: error.message }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [netlifyFunctionsDev(env)],
  };
});
