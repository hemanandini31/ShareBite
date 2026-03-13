import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOtp from './pages/VerifyOtp';
import AvailableFood from './pages/AvailableFood';
import CreateListing from './pages/CreateListing';
import MyClaims from './pages/MyClaims';
import MyDonations from './pages/MyDonations';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { AuthProvider, useAuth } from './context/AuthContext';

const PrivateRoute: React.FC<{ children: React.ReactElement; roles?: string[] }> = ({ children, roles }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  // If roles are specified, check if user has required role
  if (roles && user?.role && !roles.includes(user.role)) {
    // specific role check failed
    return <Navigate to="/dashboard" />; // Redirect to dashboard instead of landing to avoid loop
  }
  
  return children;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-vh-100 d-flex flex-column">
          <Header />
          <main className="flex-grow-1">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-otp" element={<VerifyOtp />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Protected Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/available" 
                element={
                  <PrivateRoute roles={['RECIPIENT']}>
                    <AvailableFood />
                  </PrivateRoute>
                } 
              />

              <Route 
                path="/create-listing" 
                element={
                  <PrivateRoute roles={['DONOR']}>
                    <CreateListing />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/my-donations" 
                element={
                  <PrivateRoute roles={['DONOR']}>
                    <MyDonations />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/my-claims" 
                element={
                  <PrivateRoute roles={['RECIPIENT']}>
                    <MyClaims />
                  </PrivateRoute>
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
              
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <footer className="py-4 bg-white border-top mt-auto">
            <div className="container text-center text-muted">
              <small>&copy; {new Date().getFullYear()} ShareBite - Final Year Project. All rights reserved.</small>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;