import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import SubmitIssue from './pages/SubmitIssue.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import Profile from './pages/Profile.jsx';
import { useAuth } from './context/AuthContext.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import { Toaster } from 'react-hot-toast';

function PrivateRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) return <p className="p-8 text-center text-slate-500">Loading…</p>;
  if (!token) return <Navigate to="/login" replace state={{ from: { pathname: '/submit' } }} />;
  return children;
}

function AdminRoute({ children }) {
  const { token, user, loading, isAdmin } = useAuth();
  if (loading) return <p className="p-8 text-center text-slate-500">Loading…</p>;
  if (!token) return <Navigate to="/login" replace state={{ from: { pathname: '/admin' } }} />;
  if (!user || !isAdmin) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <ThemeProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/submit"
            element={
              <PrivateRoute>
                <SubmitIssue />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
      <Toaster position="top-right" />
    </ThemeProvider>
  );
}
