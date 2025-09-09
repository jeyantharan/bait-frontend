import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Login from './Login';
import Home from './Home';
import Clients from './Clients';

function PrivateRoute({ children, isAuthenticated, isLoading }) {
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.post('https://backend-dy1x692mj-jeys-projects-10abfd47.vercel.app/api/verifyToken', {
          token: token
        });
        
        if (response.data.valid) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('userEmail');
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        // Only remove token if it's a 401 (unauthorized) error
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('userEmail');
        }
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/" /> : <Login setIsAuthenticated={setIsAuthenticated} />
        } />
        <Route path="/" element={
          <PrivateRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
            <Home setIsAuthenticated={setIsAuthenticated} />
          </PrivateRoute>
        } />
        <Route path="/clients" element={
          <PrivateRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
            <Clients />
          </PrivateRoute>
        } />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
