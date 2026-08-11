import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { OrganizationsPage } from './pages/OrganizationsPage';
import { TasksPage } from './pages/TasksPage';
import { EventsPage } from './pages/EventsPage';
import { ApprovalsPage } from './pages/ApprovalsPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { AiAssistantPage } from './pages/AiAssistantPage';

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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-amber-400 font-mono text-xs">
        Loading DSA Ecosystem Context...
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/orgs" element={<OrganizationsPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/approvals" element={<ApprovalsPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/ai-assistant" element={<AiAssistantPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <ProtectedLayout />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
