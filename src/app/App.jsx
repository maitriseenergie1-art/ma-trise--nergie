import { BrowserRouter } from 'react-router-dom';
import { AppShell } from './AppShell';
import { AppRoutes } from './router';

export function App() {
  return (
    <BrowserRouter>
      <AppShell RoutesComponent={AppRoutes} />
    </BrowserRouter>
  );
}
