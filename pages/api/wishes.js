import fs from 'fs';
import path from 'path';

const wishesFile = path.join(process.cwd(), 'data', 'wishes.json');

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const wish = req.body;
      
      let wishes = [];
      try {
        if (fs.existsSync(wishesFile)) {
          const data = fs.readFileSync(wishesFile, 'utf8');
          wishes = JSON.parse(data);
        }
      } catch (error) {
        wishes = [];
      }
      
      wishes.unshift(wish);
      
      if (!fs.existsSync(path.dirname(wishesFile))) {
        fs.mkdirSync(path.dirname(wishesFile), { recursive: true });
      }
      
      fs.writeFileSync(wishesFile, JSON.stringify(wishes, null, 2));
      
      return res.status(200).json({ success: true, id: wish.id });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to save wish' });
    }
  }

  if (req.method === 'GET') {
    const { id } = req.query;
    
    if (id) {
      try {
        if (fs.existsSync(wishesFile)) {
          const data = fs.readFileSync(wishesFile, 'utf8');
          const wishes = JSON.parse(data);
          const wish = wishes.find(w => w.id == id);
          
          if (wish) {
            return res.status(200).json(wish);
          }
        }
      } catch (error) {
        console.log('File read error:', error);
      }
    }
  }

  return res.status(404).json({ error: 'Wish not found' });
}