# Birthday Wishes - Next.js Framework

## Setup & Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```
   Visit: http://localhost:3000

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Start production server:**
   ```bash
   npm start
   ```

## Deployment Options

### Option 1: Vercel (Recommended)
1. Push to GitHub
2. Connect to Vercel
3. Auto-deploy with serverless functions

### Option 2: Netlify
1. Build: `npm run build`
2. Deploy `out` folder
3. Configure redirects for API routes

### Option 3: Static Export
1. Add to package.json: `"export": "next build && next export"`
2. Run: `npm run export`
3. Deploy `out` folder to any static host

## Features

- ✅ **Next.js Framework** - Modern React framework
- ✅ **API Routes** - Built-in serverless functions
- ✅ **File-based Storage** - JSON file storage
- ✅ **Image Compression** - Automatic image optimization
- ✅ **Dynamic Routing** - Clean URLs with ?wish=ID
- ✅ **SSR/SSG Support** - Server-side rendering
- ✅ **Production Ready** - Optimized builds

## File Structure

```
├── pages/
│   ├── api/
│   │   └── wishes.js      # API endpoint
│   └── index.js           # Main page
├── data/
│   └── wishes.json        # Wishes storage
├── package.json           # Dependencies
└── next.config.js         # Next.js config
```

## Global Features

- **Dynamic Storage**: Wishes saved to JSON file via API
- **Global Access**: Shared links work worldwide
- **Image Support**: Compressed images stored with wishes
- **Responsive Design**: Works on all devices
- **SEO Optimized**: Meta tags and structured data