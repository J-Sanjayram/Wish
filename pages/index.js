import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Home() {
  const router = useRouter();
  const [wishes, setWishes] = useState([]);
  const [formData, setFormData] = useState({ from: '', to: '', message: '' });
  const [uploadedImage, setUploadedImage] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    const { wish } = router.query;
    if (wish) {
      fetchWish(wish);
    }
  }, [router.query]);

  const fetchWish = async (id) => {
    try {
      const response = await fetch(`/api/wishes?id=${id}`);
      const wishData = await response.json();
      if (wishData && !wishData.error) {
        showCelebration(wishData);
      }
    } catch (error) {
      console.log('Error fetching wish:', error);
    }
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = function() {
        canvas.width = 200;
        canvas.height = 200;
        ctx.drawImage(img, 0, 0, 200, 200);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      
      const reader = new FileReader();
      reader.onload = (e) => { img.src = e.target.result; };
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 5 * 1024 * 1024) {
      const compressed = await compressImage(file);
      setUploadedImage(compressed);
    }
  };

  const createWish = async () => {
    if (!formData.from || !formData.to || !formData.message) {
      alert('Please fill in all fields');
      return;
    }

    const wish = {
      id: Date.now(),
      from: formData.from,
      to: formData.to,
      message: formData.message,
      image: uploadedImage,
      date: new Date().toLocaleString(),
      timestamp: Date.now()
    };

    try {
      await fetch('/api/wishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wish)
      });
    } catch (error) {
      console.log('Error saving wish:', error);
    }

    const url = `${window.location.origin}?wish=${wish.id}`;
    setShareUrl(url);
    setShowSuccess(true);
  };

  const showCelebration = (wish) => {
    const imageSection = wish.image ? 
      `<div style="margin: 20px 0;"><img src="${wish.image}" style="width: 200px; height: 200px; border-radius: 50%; object-fit: cover; border: 5px solid rgba(255,255,255,0.8);" alt="Birthday Person"></div>` : '';
    
    document.body.innerHTML = `
      <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57); background-size: 400% 400%; animation: gradientShift 3s ease infinite; display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 10000; overflow: hidden; padding: 20px;">
        <div style="text-align: center; color: white; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); max-width: 90vw;">
          <div style="font-size: clamp(2rem, 5vw, 3rem); margin-bottom: 10px;">✨🎉✨</div>
          ${imageSection}
          <h1 style="font-family: 'Brush Script MT', cursive; font-size: clamp(2.5rem, 8vw, 5rem); margin: 10px 0;">Happy Birthday</h1>
          <h2 style="font-family: 'Poppins', sans-serif; font-size: clamp(2rem, 6vw, 4rem); margin: 20px 0; font-weight: 700;">${wish.to}!</h2>
          <div style="background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); padding: 30px; border-radius: 20px; margin: 30px auto; max-width: 600px;">
            <div style="font-size: clamp(1.5rem, 4vw, 2.5rem); margin-bottom: 15px;">🎂🎁🎂</div>
            <p style="font-size: clamp(1.2rem, 3vw, 1.8rem); font-style: italic; margin-bottom: 20px; line-height: 1.6;">"${wish.message}"</p>
            <p style="font-size: clamp(1rem, 2.5vw, 1.4rem); font-weight: 600;">- From ${wish.from} ❤️</p>
          </div>
          <div style="font-size: clamp(4rem, 10vw, 8rem); margin: 30px 0;">🎂</div>
          <button onclick="window.location.href = '/'" style="background: rgba(255,255,255,0.3); border: 2px solid white; color: white; padding: 15px 30px; border-radius: 50px; font-size: 1.2rem; font-weight: 600; cursor: pointer;">🎉 Create Another Wish</button>
        </div>
      </div>
      <style>
        @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
      </style>
    `;
  };

  if (showSuccess) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh', color: 'white' }}>
        <h2>🎉 Wish Created Successfully!</h2>
        <p>Share this link:</p>
        <div style={{ background: 'rgba(255,255,255,0.2)', padding: '15px', borderRadius: '10px', margin: '20px 0', wordBreak: 'break-all' }}>
          {shareUrl}
        </div>
        <button onClick={() => navigator.clipboard.writeText(shareUrl)} style={{ background: 'rgba(255,255,255,0.3)', border: '2px solid white', color: 'white', padding: '10px 20px', borderRadius: '8px', margin: '5px', cursor: 'pointer' }}>
          📋 Copy Link
        </button>
        <button onClick={() => setShowSuccess(false)} style={{ background: 'rgba(255,255,255,0.3)', border: '2px solid white', color: 'white', padding: '10px 20px', borderRadius: '8px', margin: '5px', cursor: 'pointer' }}>
          ➕ Create Another
        </button>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>🎉 Birthday Wishes - Share the Joy Worldwide</title>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
      </Head>
      
      <div style={{ fontFamily: 'Poppins, sans-serif', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh', padding: '20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px', color: 'white' }}>
            <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', fontWeight: '700', marginBottom: '10px' }}>
              <i className="fas fa-birthday-cake"></i> Birthday Wishes
            </h1>
            <p style={{ fontSize: 'clamp(1rem, 3vw, 1.2rem)', opacity: '0.9' }}>
              Create and share beautiful birthday messages worldwide 🌍
            </p>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderRadius: '20px', padding: '40px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginBottom: '30px', color: '#333', textAlign: 'center' }}>
              <i className="fas fa-gift"></i> Create a Birthday Wish
            </h2>
            
            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>From (Your Name)</label>
              <input 
                type="text" 
                value={formData.from}
                onChange={(e) => setFormData({...formData, from: e.target.value})}
                placeholder="Enter your name"
                style={{ width: '100%', padding: '15px', border: '2px solid #e1e5e9', borderRadius: '12px', fontSize: '1rem' }}
              />
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>To (Birthday Person)</label>
              <input 
                type="text" 
                value={formData.to}
                onChange={(e) => setFormData({...formData, to: e.target.value})}
                placeholder="Enter birthday person's name"
                style={{ width: '100%', padding: '15px', border: '2px solid #e1e5e9', borderRadius: '12px', fontSize: '1rem' }}
              />
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>Birthday Person's Photo (Optional)</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageUpload}
                style={{ width: '100%', padding: '15px', border: '2px solid #e1e5e9', borderRadius: '12px' }}
              />
              {uploadedImage && (
                <img src={uploadedImage} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '10px', marginTop: '10px' }} />
              )}
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>Birthday Message</label>
              <textarea 
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                placeholder="Write your heartfelt birthday message..."
                style={{ width: '100%', padding: '15px', border: '2px solid #e1e5e9', borderRadius: '12px', fontSize: '1rem', minHeight: '120px', resize: 'vertical' }}
              />
            </div>

            <button 
              onClick={createWish}
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '15px 30px', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: '600', cursor: 'pointer', width: '100%' }}
            >
              <i className="fas fa-paper-plane"></i> Create & Share Wish
            </button>
          </div>
        </div>
      </div>
    </>
  );
}