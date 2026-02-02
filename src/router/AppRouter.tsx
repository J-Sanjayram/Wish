import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ErrorBoundary from '../components/ErrorBoundary';

// Lazy loaded components
const MainApp = React.lazy(() => import('../components/MainApp'));
const MarriageInvitationPage = React.lazy(() => import('../components/MarriageInvitationPage'));
const MarriageInvitationDisplay = React.lazy(() => import('../components/MarriageInvitationDisplay'));
const RemoveBackgroundPage = React.lazy(() => import('../components/RemoveBackgroundPage'));
const DeleteHandler = React.lazy(() => import('../components/DeleteHandler'));
const DeleteMarriageHandler = React.lazy(() => import('../components/DeleteMarriageHandler'));

// Enhanced Loading Component
const LoadingSpinner: React.FC<{ message?: string }> = ({ message = "Loading..." }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
    <motion.div 
      className="text-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full mx-auto mb-4"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <motion.p 
        className="text-white text-lg font-medium"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {message}
      </motion.p>
    </motion.div>
  </div>
);

// Route configuration
const routes = [
  {
    path: "/",
    element: <MainApp />
  },
  {
    path: "/tools/birthday-wishes",
    element: <MainApp defaultPage="birthday-wishes" />
  },
  {
    path: "/tools/marriage-invitation",
    element: <MarriageInvitationPage />
  },
  {
    path: "/tools/remove-background",
    element: <RemoveBackgroundPage />
  },
  {
    path: "/invitation/:id",
    element: <MarriageInvitationDisplay />
  },
  {
    path: "/marriage-invitation/:id",
    element: <MarriageInvitationDisplay />
  },
  {
    path: "/delete/:id",
    element: <DeleteHandler />
  },
  {
    path: "/delete-marriage/:id",
    element: <DeleteMarriageHandler />
  },
  // Redirect old routes
  {
    path: "/marriage-invitation",
    element: <Navigate to="/tools/marriage-invitation" replace />
  },
  {
    path: "/remove-background",
    element: <Navigate to="/tools/remove-background" replace />
  }
];

const AppRouter: React.FC = () => {
  return (
    <Router>
      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {routes.map((route, index) => (
              <Route
                key={index}
                path={route.path}
                element={route.element}
              />
            ))}
            {/* 404 Route */}
            <Route 
              path="*" 
              element={<Navigate to="/" replace />} 
            />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </Router>
  );
};

export default AppRouter;