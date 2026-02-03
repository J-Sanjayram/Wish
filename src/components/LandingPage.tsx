import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Camera, Scissors, Sparkles, Shield, Zap } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import AdsterraSocialBanner from './AdsterraSocialBanner';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center pt-20">
          <div className="container mx-auto px-4">
            <motion.div
              className="max-w-4xl mx-auto text-center space-y-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              {/* Hero Content */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                {/* <motion.div
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 backdrop-blur-sm rounded-full border border-white/20 mb-8"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring" }}
                >
                  <Sparkles className="w-5 h-5 text-purple-300" />
                  <span className="text-white/90 font-semibold">Creative Studio Platform</span>
                </motion.div> */}
                
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-8 mt-8 leading-[0.9]">
                  Create Beautiful
                  <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent leading-tight">
                    Digital Experiences
                  </span>
                </h1>
                
                <p className="text-lg sm:text-xl text-white/70 mb-12 max-w-3xl mx-auto leading-relaxed">
                  Privacy-focused creative tools for birthday wishes, wedding invitations, and background removal. 
                  Simple, personalized, and beautifully crafted.
                </p>

                {/* Enhanced Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
                  {[
                    { number: '10K+', label: 'Happy Users', icon: '👥' },
                    { number: '24hr', label: 'Auto Delete', icon: '🔒' },
                    { number: '100%', label: 'Private', icon: '✨' }
                  ].map((stat, i) => (
                    <motion.div 
                      key={i}
                      className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + i * 0.1 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                    >
                      <div className="text-2xl mb-2">{stat.icon}</div>
                      <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{stat.number}</div>
                      <div className="text-sm text-white/60 font-medium">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <motion.button
                    onClick={() => onNavigate('birthday-wishes')}
                    className="group px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-2xl font-bold text-base sm:text-lg hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden"
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Heart className="w-5 h-5 sm:w-6 sm:h-6 relative z-10" />
                    <span className="relative z-10">Start Creating</span>
                  </motion.button>
                  <motion.button
                    onClick={() => onNavigate('about')}
                    className="px-8 sm:px-10 py-4 sm:py-5 border-2 border-white/30 text-white rounded-2xl font-bold text-base sm:text-lg hover:bg-white/10 hover:border-white/50 transition-all duration-300"
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                  >
                    Learn More
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Feature Highlights Section */}
        <section className="pt-20 pb-16 sm:pt-24 sm:pb-20">
          <div className="container mx-auto px-4">
            <motion.div
              className="max-w-4xl mx-auto text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 sm:p-10 border border-white/10">
                <div className="mb-8 sm:mb-12">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">🎨 Creative Tools</h2>
                  <p className="text-white/70 leading-relaxed max-w-2xl mx-auto">Professional-grade creative suite for all your digital needs</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-8">
                  {[
                    {
                      icon: Heart,
                      title: 'Birthday Wishes',
                      description: 'Create memorable celebrations with photos, music, and personal messages',
                      color: 'from-pink-500 to-rose-500'
                    },
                    {
                      icon: Camera,
                      title: 'Wedding Invitations',
                      description: 'Design elegant invitations with custom themes and beautiful layouts',
                      color: 'from-purple-500 to-indigo-500'
                    },
                    {
                      icon: Scissors,
                      title: 'Background Removal',
                      description: 'AI-powered image editing with professional-quality results',
                      color: 'from-blue-500 to-cyan-500'
                    }
                  ].map((tool, i) => (
                    <motion.div 
                      key={i}
                      className="text-center p-4 sm:p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                    >
                      <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r ${tool.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                        <tool.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                      </div>
                      <h3 className="text-white font-semibold mb-2 text-sm sm:text-base">{tool.title}</h3>
                      <p className="text-white/60 text-xs sm:text-sm leading-relaxed">{tool.description}</p>
                    </motion.div>
                  ))}
                </div>
                
                <div className="pt-6 border-t border-white/10">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm">
                    <span className="text-white/60 flex items-center gap-2">✨ Privacy-focused</span>
                    <span className="text-white/60 flex items-center gap-2">⚡ Lightning fast</span>
                    <span className="text-white/60 flex items-center gap-2">🔒 Auto-delete</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Enhanced Features Section */}
        <section className="py-32 bg-gradient-to-b from-transparent via-black/10 to-transparent">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-20"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 backdrop-blur-sm rounded-full border border-white/10 mb-6">
                <span className="text-white/90 font-semibold">Our Creative Tools</span>
              </div>
              <h2 className="text-5xl font-bold text-white mb-6">Choose Your Creative Tool</h2>
              <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">Professional-grade tools designed for everyone, from beginners to experts</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {[
                {
                  icon: Heart,
                  title: 'Birthday Wishes',
                  description: 'Create personalized birthday celebrations with photos, music, and heartfelt messages that bring joy to your loved ones.',
                  features: ['Photo Galleries', 'Music Integration', 'Custom Messages', 'Shareable Links'],
                  color: 'from-pink-500 to-rose-500',
                  bgColor: 'from-pink-500/10 to-rose-500/10',
                  action: () => onNavigate('birthday-wishes'),
                  popular: true,
                  stats: '5K+ wishes created'
                },
                {
                  icon: Camera,
                  title: 'Wedding Invitations',
                  description: 'Design elegant wedding invitations with custom themes, beautiful typography, and personal touches.',
                  features: ['Custom Themes', 'Photo Uploads', 'Color Schemes', 'Mobile Optimized'],
                  color: 'from-purple-500 to-indigo-500',
                  bgColor: 'from-purple-500/10 to-indigo-500/10',
                  action: () => onNavigate('marriage'),
                  stats: '2K+ invitations sent'
                },
                {
                  icon: Scissors,
                  title: 'Background Removal',
                  description: 'AI-powered background removal for professional-quality image editing with pixel-perfect results.',
                  features: ['AI-Powered', 'High Quality', 'Instant Results', 'Multiple Formats'],
                  color: 'from-blue-500 to-cyan-500',
                  bgColor: 'from-blue-500/10 to-cyan-500/10',
                  action: () => onNavigate('remove-bg'),
                  stats: '10K+ images processed'
                }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="group cursor-pointer relative"
                  onClick={feature.action}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.15 }}
                  whileHover={{ y: -12, scale: 1.02 }}
                >
                  {feature.popular && (
                    <motion.div 
                      className="absolute -top-4 left-8 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-black text-sm font-bold rounded-full z-10 shadow-lg"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.8 + index * 0.1, type: "spring" }}
                    >
                      🎆 Most Popular
                    </motion.div>
                  )}
                  
                  <div className={`relative bg-gradient-to-br ${feature.bgColor} backdrop-blur-xl rounded-3xl p-10 border border-white/20 h-full hover:border-white/40 transition-all duration-500 overflow-hidden group-hover:shadow-2xl group-hover:shadow-purple-500/10`}>
                    {/* Enhanced Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                      <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full transform translate-x-20 -translate-y-20"></div>
                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full transform -translate-x-16 translate-y-16"></div>
                      <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-white rounded-full transform -translate-x-12 -translate-y-12 opacity-30"></div>
                    </div>
                    
                    <div className="relative z-10">
                      <div className={`w-20 h-20 bg-gradient-to-r ${feature.color} rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 shadow-xl`}>
                        <feature.icon className="w-10 h-10 text-white" />
                      </div>
                      
                      <div className="mb-6">
                        <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                        <p className="text-white/70 leading-relaxed mb-4">{feature.description}</p>
                        <div className="text-sm text-white/50 font-medium">{feature.stats}</div>
                      </div>
                      
                      <div className="space-y-3 mb-10">
                        {feature.features.map((feat, i) => (
                          <motion.div 
                            key={i} 
                            className="flex items-center text-white/60 text-sm"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 + index * 0.1 + i * 0.05 }}
                          >
                            <div className={`w-2 h-2 bg-gradient-to-r ${feature.color} rounded-full mr-4 flex-shrink-0`}></div>
                            {feat}
                          </motion.div>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <span className="text-white/80 font-semibold">Get Started</span>
                        <motion.div
                          className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-full flex items-center justify-center group-hover:shadow-xl transition-all duration-300`}
                          whileHover={{ rotate: 45, scale: 1.1 }}
                        >
                          <span className="text-white text-xl font-bold">→</span>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h2 className="text-4xl font-bold text-white mb-4">Why Choose Our Platform?</h2>
              <p className="text-white/70 text-lg">Built with modern technology and user experience in mind</p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Shield,
                  title: 'Privacy First',
                  description: 'Your data stays secure with our privacy-focused approach.',
                  details: ['End-to-end encryption', 'Auto-deletion', 'No data tracking', 'GDPR compliant'],
                  color: 'from-emerald-500 to-teal-500'
                },
                {
                  icon: Zap,
                  title: 'Lightning Fast',
                  description: 'Optimized performance for quick and smooth experiences.',
                  details: ['Instant loading', 'Mobile optimized', 'Cloud processing', 'Real-time updates'],
                  color: 'from-yellow-500 to-orange-500'
                },
                {
                  icon: Sparkles,
                  title: 'Beautiful Design',
                  description: 'Expert-level UI/UX design for stunning results.',
                  details: ['Modern interface', 'Responsive design', 'Smooth animations', 'Professional quality'],
                  color: 'from-purple-500 to-pink-500'
                }
              ].map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  className="group"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 h-full hover:border-white/20 transition-all duration-300 group-hover:bg-white/10">
                    <div className={`w-16 h-16 bg-gradient-to-r ${benefit.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <benefit.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">{benefit.title}</h3>
                    <p className="text-white/60 mb-6 leading-relaxed">{benefit.description}</p>
                    <div className="space-y-2">
                      {benefit.details.map((detail, i) => (
                        <div key={i} className="flex items-center text-white/50 text-sm">
                          <div className={`w-1.5 h-1.5 bg-gradient-to-r ${benefit.color} rounded-full mr-3 flex-shrink-0`}></div>
                          {detail}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <div className="relative bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-indigo-500/10 backdrop-blur-xl rounded-3xl p-12 border border-white/20 overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-40 h-40 bg-purple-500 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-blue-500 rounded-full blur-3xl"></div>
              </div>
              
              <div className="relative z-10">
                <h3 className="text-3xl sm:text-4xl font-bold text-white mb-6">Ready to Create Something Amazing?</h3>
                <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">Join thousands of users creating beautiful digital experiences. Start your creative journey today.</p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <motion.button
                    onClick={() => onNavigate('birthday-wishes')}
                    className="px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-2xl font-semibold hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 flex items-center gap-2"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Sparkles className="w-5 h-5" />
                    Start Creating Now
                  </motion.button>
                  <motion.button
                    onClick={() => onNavigate('about')}
                    className="px-8 py-4 border border-white/30 text-white rounded-2xl font-semibold hover:bg-white/10 transition-all duration-300"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Learn More
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      </div>
      
      {/* AdsterraSocialBanner */}
      <AdsterraSocialBanner />
      
      {/* Footer */}
      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default LandingPage;