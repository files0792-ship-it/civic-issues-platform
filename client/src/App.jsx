import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/Layout.jsx';
import PageTransition from './components/PageTransition.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import SubmitIssue from './pages/SubmitIssue.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import Profile from './pages/Profile.jsx';
import About from './pages/About.jsx';
import Privacy from './pages/Privacy.jsx';
import Contact from './pages/Contact.jsx';
import Settings from './pages/Settings.jsx';
import { useAuth } from './context/AuthContext.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import { Toaster } from 'react-hot-toast';
import FloatingActionButton from './components/FloatingActionButton.jsx';

function PrivateRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) return null;
  if (!token) return <Navigate to="/login" replace state={{ from: { pathname: '/submit' } }} />;
  return children;
}

function AdminRoute({ children }) {
  const { token, user, loading, isAdmin } = useAuth();
  if (loading) return null;
  if (!token) return <Navigate to="/login" replace state={{ from: { pathname: '/admin' } }} />;
  if (!user || !isAdmin) return <Navigate to="/" replace />;
  return children;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <PageTransition key={location.pathname}>
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/settings" element={<Settings />} />
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
      </PageTransition>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Layout>
        <AnimatedRoutes />
      </Layout>
      <FloatingActionButton />
      <Toaster position="top-right" />
    </ThemeProvider>
  );
}
