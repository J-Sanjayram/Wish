import React from 'react';

const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">About Unfoldly</h1>
          <p className="text-xl text-gray-600">Spreading joy and celebration worldwide 🎉</p>
        </div>

        <div className="space-y-8">
          <section className="text-center">
            <div className="text-6xl mb-4">🎂</div>
            <h2 className="text-3xl font-semibold text-gray-800 mb-4">Our Mission</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              At Unfoldly, we believe every birthday deserves celebration with love, joy, and personalized messages. 
              Our platform makes it easy to create beautiful, heartfelt birthday wishes with photos and music.
            </p>
          </section>

          <section className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
              <div className="text-4xl mb-4">✨</div>
              <h4 className="text-xl font-semibold text-gray-800 mb-3">Custom Messages</h4>
              <p className="text-gray-600">Create personalized birthday messages with your own words and style.</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
              <div className="text-4xl mb-4">📸</div>
              <h4 className="text-xl font-semibold text-gray-800 mb-3">Photo Integration</h4>
              <p className="text-gray-600">Add special photos to make your birthday wishes memorable.</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
              <div className="text-4xl mb-4">🎵</div>
              <h4 className="text-xl font-semibold text-gray-800 mb-3">Music & Sharing</h4>
              <p className="text-gray-600">Add music and share instantly via links or social media.</p>
            </div>
          </section>

          
        </div>
      </div>
  );
};

export default About;