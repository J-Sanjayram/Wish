import React from 'react';

const TermsOfService: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Terms of Service</h1>
          <p className="text-gray-600">Last updated: January 2024</p>
        </div>

        <div className="prose max-w-none text-gray-700 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Acceptance of Terms</h2>
            <p>By accessing and using Unfoldly, you accept and agree to be bound by these terms and provisions.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Description of Service</h2>
            <p>Unfoldly allows users to create, customize, and share personalized birthday messages and wishes with photos and music.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. User Responsibilities</h2>
            <p>As a user, you agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate information</li>
              <li>Use the service only for lawful purposes</li>
              <li>Not upload offensive or copyrighted content</li>
              <li>Respect others' privacy and rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Advertising</h2>
            <p>Our service may display advertisements from third-party networks. We are not responsible for advertiser content or practices.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Contact Information</h2>
            <div className="bg-gray-100 p-4 rounded-lg">
              <p><strong>Email:</strong> legal@unfoldly.com</p>
              <p><strong>Address:</strong> 123 Celebration Street, Joy City, JC 12345</p>
            </div>
          </section>
        </div>
      </div>
  );
};

export default TermsOfService;