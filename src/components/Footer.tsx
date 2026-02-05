import React from 'react';
import { motion } from 'framer-motion';

interface FooterProps {
  onNavigate: (page: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: 'Create Wish', action: () => onNavigate('home') },
      { label: 'About Us', action: () => onNavigate('about') },
      { label: 'Contact', action: () => onNavigate('contact') }
    ],
    legal: [
      { label: 'Privacy Policy', action: () => onNavigate('privacy') },
      { label: 'Terms of Service', action: () => onNavigate('terms') },
      { label: 'Cookie Policy', action: () => onNavigate('privacy') }
    ],
    social: [
      { label: 'Twitter', icon: '🐦', href: '#' },
      { label: 'Instagram', icon: '📷', href: '#' },
      { label: 'Facebook', icon: '👥', href: '#' }
    ]
  };

  return (
    <motion.footer 
      className="relative bg-gradient-to-t from-black/20 to-transparent backdrop-blur-sm border-t border-white/10 mt-16"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Brand Section */}
          <motion.div 
            className="md:col-span-2"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-4">
              
              <div>
                <h3 className="text-white font-bold text-xl tracking-tight">Unfoldly</h3>
                <p className="text-white/60 text-sm font-medium">Creative Studio</p>
              </div>
            </div>
            <p className="text-white/80 text-sm leading-relaxed max-w-md mb-6">
              Create magical moments with birthday wishes, wedding invitations, and professional image editing. 
              Share personalized experiences with photos, music, and heartfelt messages.
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white/70 text-xs font-medium">Most Satisfying</span>
              </div>
              <div className="w-px h-4 bg-white/20"></div>
              <span className="text-white/70 text-xs">Trustable</span>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={link.action}
                    className="text-white/70 hover:text-white text-sm transition-colors duration-200 hover:translate-x-1 transform"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Legal Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={link.action}
                    className="text-white/70 hover:text-white text-sm transition-colors duration-200 hover:translate-x-1 transform"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <motion.div 
          className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center gap-6">
            <p className="text-white/60 text-sm">
              © {currentYear} Unfoldly. All rights reserved.
            </p>
            <div className="hidden sm:flex items-center gap-4">
              {footerLinks.social.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <span className="text-sm">{social.icon}</span>
                </motion.a>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-white/60 text-xs">
            <span>Made with</span>
            <motion.span 
              className="text-red-400"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ❤️
            </motion.span>
            <span>for celebrations worldwide</span>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;