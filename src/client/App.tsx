import React, { Component, ErrorInfo, ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { OrganizationsPage } from './pages/OrganizationsPage';
import { OrganizationDetailPage } from './pages/OrganizationDetailPage';
import { TasksPage } from './pages/TasksPage';
import { EventsPage } from './pages/EventsPage';
import { ApprovalsPage } from './pages/ApprovalsPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { AiAssistantPage } from './pages/AiAssistantPage';
import { AdminPage } from './pages/AdminPage';

// React Error Boundary Class
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled React Error:', error, errorInfo);
  }

  private handleReset = () => {
    localStorage.removeItem('dsa_access_token');
    localStorage.removeItem('dsa_refresh_token');
    localStorage.removeItem('dsa_user_data');
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="p-6 bg-white border border-rose-200 rounded-xl shadow-sm max-w-lg space-y-3">
            <h2 className="text-lg font-bold text-rose-600">DSA Portal Notice</h2>
            <p className="text-xs text-slate-600 font-mono">
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>
            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs transition-colors"
            >
              Sign Out & Clear Session Cache
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const ProtectedLayout: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600 font-medium text-xs">
        Loading DSA Ecosystem Context...
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/orgs" element={<OrganizationsPage />} />
            <Route path="/orgs/clubs" element={<OrganizationsPage defaultWindow="clubs" />} />
            <Route path="/orgs/domains" element={<OrganizationsPage defaultWindow="domains" />} />
            <Route path="/orgs/:id" element={<OrganizationDetailPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/logs" element={<Navigate to="/orgs" replace />} />
            <Route path="/events/logs" element={<Navigate to="/orgs" replace />} />
            <Route path="/approvals" element={<ApprovalsPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/ai-assistant" element={<AiAssistantPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <ProtectedLayout />
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
