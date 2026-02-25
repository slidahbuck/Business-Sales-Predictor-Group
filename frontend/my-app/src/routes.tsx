import { createBrowserRouter } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { ForecastInsights } from './pages/ForecastInsights';
import { Layout } from './components/Layout';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: 'insights', Component: ForecastInsights }
    ]
  }
]);

// export default function App() {
//   return (
//     <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
//       <h1>Test App</h1>
//       <p>If you can see this, App.tsx is finally connected!</p>
//     </div>
//   );
// }
