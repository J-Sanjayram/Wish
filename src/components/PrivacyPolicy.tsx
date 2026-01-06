import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Privacy Policy</h1>
          <p className="text-gray-600">Last updated: January 2024</p>
        </div>

        <div className="prose max-w-none text-gray-700 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Information We Collect</h2>
            <p>We collect only the information you voluntarily provide when creating a birthday wish:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Names (sender and recipient) when creating birthday wishes</li>
              <li>Birthday messages you write</li>
              <li>Optional images you choose to upload</li>
              <li>Optional background music selections</li>
            </ul>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
              <h3 className="text-green-800 font-semibold mb-2">🔒 Our Privacy Promise</h3>
              <ul className="text-green-700 text-sm space-y-1">
                <li>• We don't store, analyze, or use your uploaded images for any purpose</li>
                <li>• Your images are only used to display your birthday wish</li>
                <li>• You can delete your images anytime using your sharing link</li>
                <li>• All wishes and images are automatically deleted after 24 hours</li>
                <li>• We never share your content with third parties</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Data Retention & Automatic Deletion</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="text-blue-800 font-semibold mb-2">⏰ 24-Hour Automatic Deletion</h3>
              <p className="text-blue-700 text-sm">
                For your privacy and security, all birthday wishes, images, and associated data are automatically 
                deleted from our servers after 24 hours. This ensures your personal content doesn't remain stored 
                longer than necessary.
              </p>
            </div>
            
            <p>You also have the right to delete your wish and all associated images at any time before the 
            24-hour automatic deletion by using the management link provided when you create your wish.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. How We Use Your Information</h2>
            <p>We use the information we collect solely to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Create and display your personalized birthday wish</li>
              <li>Provide the sharing functionality</li>
              <li>Enable image management features</li>
              <li>Ensure automatic deletion after 24 hours</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Third-Party Advertising</h2>
            <p>We may display advertisements from third-party advertising networks, including Adsterra. These companies may use cookies and other tracking technologies to collect information about your visits to provide relevant advertisements.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Cookies and Tracking</h2>
            <p>We use cookies and similar technologies to enhance your experience, analyze traffic, and provide personalized content and advertisements.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Contact Us</h2>
            <div className="bg-gray-100 p-4 rounded-lg">
              <p><strong>Email:</strong> privacy@unfoldly.com</p>
              <p><strong>Address:</strong> 123 Celebration Street, Joy City, JC 12345</p>
            </div>
          </section>
        </div>
      </div>
  );
};

export default PrivacyPolicy;