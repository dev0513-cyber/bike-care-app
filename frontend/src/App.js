import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import AdminLayout from './components/AdminLayout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import BookService from './pages/BookService';
import DoorstepService from './pages/DoorstepService';
import ServiceHistory from './pages/ServiceHistory';
import EstimatePrice from './pages/EstimatePrice';
import ResellValue from './pages/ResellValue';
import About from './pages/About';
import Contact from './pages/Contact';
import UserProfile from './pages/UserProfile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminServices from './pages/admin/AdminServices';
import AdminContacts from './pages/admin/AdminContacts';

// Layout component to conditionally show Navbar and Footer
const Layout = ({ children }) => {
  const location = useLocation();
  const hideNavFooter = ['/login', '/signup'].includes(location.pathname);
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Admin routes use their own layout
  if (isAdminRoute) {
    return children;
  }

  return (
    <div className="app">
      {!hideNavFooter && <Navbar />}
      <main className={hideNavFooter ? 'main-auth' : 'main-content'}>
        {children}
      </main>
      {!hideNavFooter && <Footer />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* Service Routes - Now Accessible to Everyone */}
          <Route path="/book-service" element={<BookService />} />
          <Route path="/doorstep-service" element={<DoorstepService />} />
          <Route path="/service-history" element={<ServiceHistory />} />
          <Route path="/estimate-price" element={<EstimatePrice />} />
          <Route path="/resell-value" element={<ResellValue />} />
          <Route path="/profile" element={<UserProfile />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedAdminRoute>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </ProtectedAdminRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedAdminRoute>
              <AdminLayout>
                <AdminUsers />
              </AdminLayout>
            </ProtectedAdminRoute>
          } />
          <Route path="/admin/services" element={
            <ProtectedAdminRoute>
              <AdminLayout>
                <AdminServices />
              </AdminLayout>
            </ProtectedAdminRoute>
          } />
          <Route path="/admin/contacts" element={
            <ProtectedAdminRoute>
              <AdminLayout>
                <AdminContacts />
              </AdminLayout>
            </ProtectedAdminRoute>
          } />

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </Router>
  );
}

// 404 Component
const NotFound = () => {
  return (
    <div className="not-found">
      <div className="container">
        <div className="not-found-content">
          <h1>404</h1>
          <h2>Page Not Found</h2>
          <p>The page you're looking for doesn't exist.</p>
          <a href="/" className="btn btn-primary">
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default App;
