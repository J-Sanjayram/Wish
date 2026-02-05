import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Image, Heart, Scissors, Info, Mail, Shield, FileText, Menu, X, Sparkles } from 'lucide-react';

interface NavigationProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

interface NavItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  route?: string;
  isNew?: boolean;
  isPopular?: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ onNavigate, currentPage }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems: NavItem[] = [
    { 
      key: 'home', 
      label: 'Home', 
      icon: <Home className="w-4 h-4" />, 
      description: 'Creative tools dashboard',
      route: '/'
    },
    { 
      key: 'birthday-wishes', 
      label: 'Birthday Wishes', 
      icon: <Sparkles className="w-4 h-4" />, 
      description: 'Create magical birthday cards',
      route: '/tools/birthday-wishes',
      isPopular: true
    },
    { 
      key: 'marriage-invitation', 
      label: 'Wedding Invites', 
      icon: <Heart className="w-4 h-4" />, 
      description: 'Beautiful wedding invitations',
      route: '/tools/marriage-invitation',
      isNew: true
    },
    { 
      key: 'remove-background', 
      label: 'Remove Background', 
      icon: <Scissors className="w-4 h-4" />, 
      description: 'AI-powered background removal',
      route: '/tools/remove-background'
    },
    { 
      key: 'manage', 
      label: 'Manage Images', 
      icon: <Image className="w-4 h-4" />, 
      description: 'Organize your creations',
      route: '/manage'
    },
    { 
      key: 'about', 
      label: 'About', 
      icon: <Info className="w-4 h-4" />, 
      description: 'Learn about our mission'
    },
    { 
      key: 'contact', 
      label: 'Contact', 
      icon: <Mail className="w-4 h-4" />, 
      description: 'Get in touch with us'
    },
    { 
      key: 'privacy', 
      label: 'Privacy', 
      icon: <Shield className="w-4 h-4" />, 
      description: 'Your data protection'
    },
    { 
      key: 'terms', 
      label: 'Terms', 
      icon: <FileText className="w-4 h-4" />, 
      description: 'Terms of service'
    }
  ];

  // Get current page from URL
  const getCurrentPageFromPath = useCallback(() => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path === '/tools/birthday-wishes') return 'birthday-wishes';
    if (path === '/tools/marriage-invitation') return 'marriage-invitation';
    if (path === '/tools/remove-background') return 'remove-background';
    if (path === '/manage') return 'manage';
    // Check for dynamic routes
    if (path.startsWith('/invitation/') || path.startsWith('/marriage-invitation/')) return 'marriage-invitation';
    if (path.startsWith('/delete')) return 'manage';
    return currentPage;
  }, [location.pathname, currentPage]);

  const activePage = getCurrentPageFromPath();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle navigation with route support
  const handleNavigation = useCallback((item: NavItem) => {
    if (item.route) {
      navigate(item.route);
    } else {
      onNavigate(item.key);
    }
    setIsMobileMenuOpen(false);
  }, [navigate, onNavigate]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  return (
    <motion.nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-gradient-to-r from-purple-900/95 via-blue-900/95 to-indigo-900/95 backdrop-blur-xl border-b border-white/20 shadow-2xl' 
          : 'bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-indigo-900/20 backdrop-blur-xl border-b border-white/10'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          <motion.div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => handleNavigation(navItems[0])}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div 
              className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300"
              whileHover={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-lg text-white font-bold">L</span>
            </motion.div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-lg tracking-tight">Unfoldly</span>
              <span className="text-white/60 text-xs font-medium">Creative Studio</span>
            </div>
          </motion.div>
          
          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.slice(0, 6).map((item, index) => (
              <motion.div
                key={item.key}
                className="relative group"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <motion.button
                  onClick={() => handleNavigation(item)}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activePage === item.key 
                      ? 'text-white bg-gradient-to-r from-purple-500/30 to-indigo-500/30 shadow-lg border border-purple-400/40' 
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item.icon}
                  <span className="hidden xl:inline">{item.label}</span>
                  {item.isNew && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  )}
                  {item.isPopular && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                  )}
                </motion.button>
                
                {/* Tooltip */}
                <motion.div
                  className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-gray-900/95 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50"
                  initial={{ opacity: 0, y: -10 }}
                  whileHover={{ opacity: 1, y: 0 }}
                >
                  {item.description}
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900/95 rotate-45" />
                </motion.div>
              </motion.div>
            ))}
          </div>
          
          {/* Mobile Menu Button */}
          <motion.button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors relative"
            whileTap={{ scale: 0.9 }}
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            <AnimatePresence >
              {isMobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-5 h-5" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="w-5 h-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
        
        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              className="lg:hidden absolute top-full left-0 right-0 bg-gradient-to-b from-purple-900/95 to-indigo-900/95 backdrop-blur-xl border-b border-white/10 shadow-2xl"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <div className="py-4 px-4 space-y-1 max-h-[70vh] overflow-y-auto">
                {navItems.map((item, index) => (
                  <motion.button
                    key={item.key}
                    onClick={() => handleNavigation(item)}
                    className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 group ${
                      activePage === item.key 
                        ? 'text-white bg-gradient-to-r from-purple-500/30 to-indigo-500/30 border border-purple-400/40 shadow-lg' 
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className={`transition-colors duration-300 ${
                      activePage === item.key ? 'text-purple-300' : 'text-white/60 group-hover:text-white'
                    }`}>
                      {item.icon}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span>{item.label}</span>
                        {item.isNew && (
                          <span className="px-1.5 py-0.5 bg-green-500/20 text-green-300 text-xs rounded-full border border-green-400/30">
                            New
                          </span>
                        )}
                        {item.isPopular && (
                          <span className="px-1.5 py-0.5 bg-orange-500/20 text-orange-300 text-xs rounded-full border border-orange-400/30">
                            Popular
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/50 mt-0.5">{item.description}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navigation;