import { createRoot, hydrateRoot } from 'react-dom/client';
import { App } from './app/App';
import './styles.css';

const container = document.getElementById('root');

// Prerendered pages ship server markup inside #root — hydrate it in place.
// (An empty template only has a comment node, so check for a real element.)
if (container.firstElementChild) {
  hydrateRoot(container, <App />);
} else {
  createRoot(container).render(<App />);
}
