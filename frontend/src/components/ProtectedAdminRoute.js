import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { adminAPI, apiUtils } from '../services/api';
import LoadingSpinner from './LoadingSpinner';

const ProtectedAdminRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      // First check if user is logged in
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const authToken = localStorage.getItem('authToken');
      
      if (!isLoggedIn || !authToken) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // Check admin status with backend
      const response = await adminAPI.checkStatus();
      setIsAdmin(response.data.is_admin);
    } catch (error) {
      console.error('Admin status check failed:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedAdminRoute;
