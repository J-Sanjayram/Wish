const fs = require('fs').promises;
const path = require('path');

const WISHES_DIR = '/tmp/wishes';

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    await fs.mkdir(WISHES_DIR, { recursive: true });
  } catch (error) {
    // Directory already exists
  }

  if (event.httpMethod === 'POST') {
    try {
      const wish = JSON.parse(event.body);
      const filePath = path.join(WISHES_DIR, `${wish.id}.json`);
      
      await fs.writeFile(filePath, JSON.stringify(wish));
      
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
        const filePath = path.join(WISHES_DIR, `${wishId}.json`);
        const data = await fs.readFile(filePath, 'utf8');
        const wish = JSON.parse(data);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(wish)
        };
      } catch (error) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Wish not found' })
        };
      }
    }
  }

  return {
    statusCode: 404,
    headers,
    body: JSON.stringify({ error: 'Invalid request' })
  };
};