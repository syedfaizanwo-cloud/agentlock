import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import LoadingScreen from './components/ui/LoadingScreen';
import MockBadge from './components/ui/MockBadge';

const Landing = lazy(() => import('./pages/Landing'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Agents = lazy(() => import('./pages/Agents'));
const AgentDetail = lazy(() => import('./pages/AgentDetail'));
const NewScan = lazy(() => import('./pages/NewScan'));
const ScanProgress = lazy(() => import('./pages/ScanProgress'));
const ScanResults = lazy(() => import('./pages/ScanResults'));
const Reports = lazy(() => import('./pages/Reports'));
const NotFound = lazy(() => import('./pages/NotFound'));

export default function App() {
  return (
    <>
      <MockBadge />
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/agents" element={<Agents />} />
            <Route path="/agents/:agentId" element={<AgentDetail />} />
            <Route path="/scans/new" element={<NewScan />} />
            <Route path="/scans/:scanId" element={<ScanProgress />} />
            <Route path="/scans/:scanId/results" element={<ScanResults />} />
            <Route path="/reports" element={<Reports />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}
