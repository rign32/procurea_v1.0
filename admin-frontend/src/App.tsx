import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import ErrorLogsPage from './pages/ErrorLogsPage';
import EventsPage from './pages/EventsPage';
import IntegrationsPage from './pages/IntegrationsPage';
import SystemStatusPage from './pages/SystemStatusPage';
import LeadMagnetsPage from './pages/LeadMagnetsPage';
import Layout from './components/Layout';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return <>{children}</>;
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route
                    path="/*"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <Routes>
                                    <Route path="/" element={<DashboardPage />} />
                                    <Route path="/users" element={<UsersPage />} />
                                    <Route path="/events" element={<EventsPage />} />
                                    <Route path="/errors" element={<ErrorLogsPage />} />
                                    <Route path="/integrations" element={<IntegrationsPage />} />
                                    <Route path="/status" element={<SystemStatusPage />} />
                                    <Route path="/lead-magnets" element={<LeadMagnetsPage />} />
                                    <Route path="*" element={<Navigate to="/" replace />} />
                                </Routes>
                            </Layout>
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}
