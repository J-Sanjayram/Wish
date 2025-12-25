const fs = require('fs').promises;
const path = require('path');

const WISHES_FILE = path.join(__dirname, '../../wishes.json');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod === 'POST') {
    try {
      const wish = JSON.parse(event.body);
      
      let wishes = [];
      try {
        const data = await fs.readFile(WISHES_FILE, 'utf8');
        wishes = JSON.parse(data);
      } catch (error) {
        wishes = [];
      }
      
      wishes.unshift(wish);
      
      await fs.writeFile(WISHES_FILE, JSON.stringify(wishes, null, 2));
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, id: wish.id })
      };
    } catch (error) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to save wish' })
      };
    }
  }

  if (event.httpMethod === 'GET') {
    const wishId = event.queryStringParameters?.id;
    if (wishId) {
      try {
        const data = await fs.readFile(WISHES_FILE, 'utf8');
        const wishes = JSON.parse(data);
        const wish = wishes.find(w => w.id == wishId);
        
        if (wish) {
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(wish)
          };
        }
      } catch (error) {
        console.log('File read error:', error);
      }
    }
  }

  return {
    statusCode: 404,
    headers,
    body: JSON.stringify({ error: 'Wish not found' })
  };
};