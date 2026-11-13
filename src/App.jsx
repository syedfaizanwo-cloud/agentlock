import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoadingScreen from './components/ui/LoadingScreen';

const HomePage = lazy(() => import('./pages/HomePage'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const ThankYou = lazy(() => import('./pages/ThankYou'));
const NotFound = lazy(() => import('./pages/NotFound'));

export default function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<Navigate to="/#telemetry" replace />} />
        <Route path="/agents" element={<Navigate to="/#fleet-governance" replace />} />
        <Route path="/scans" element={<Navigate to="/#attack-simulation" replace />} />
        <Route path="/scans/*" element={<Navigate to="/#attack-simulation" replace />} />
        <Route path="/reports" element={<Navigate to="/#audit-explorer" replace />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/thank-you" element={<ThankYou />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
