# Deployment Configuration

## Quick Deploy Options

### 1. Netlify (Recommended)
```bash
# Build the project
npm run build

# Deploy to Netlify
npx netlify-cli deploy --prod --dir=dist
```

### 2. Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Build and deploy
npm run build
vercel --prod
```

### 3. Firebase Hosting
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login and initialize
firebase login
firebase init hosting

# Build and deploy
npm run build
firebase deploy
```

### 4. GitHub Pages
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2

    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'

    - name: Install dependencies
      run: npm ci

    - name: Build
      run: npm run build

    - name: Deploy
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

## Environment Variables for Production

Create a `.env` file with:
```
VITE_SUPABASE_URL=your-production-supabase-url
VITE_SUPABASE_ANON_KEY=your-production-supabase-key
VITE_ENABLE_BACKEND=true
```

## SSL/HTTPS Requirements

This application requires HTTPS for:
- Camera access
- Microphone access
- MediaPipe face detection
- Service Worker features

Most deployment platforms (Netlify, Vercel, Firebase) provide HTTPS by default.

## Performance Optimization

The built application includes:
- Code splitting for faster initial load
- Optimized chunks for TensorFlow.js models
- Compressed assets
- Service Worker for offline capabilities

## Browser Support

- Chrome 90+ (Recommended)
- Firefox 88+
- Safari 14+
- Edge 90+

## Production Checklist

- [ ] HTTPS enabled
- [ ] Camera permissions working
- [ ] All AI models loading correctly
- [ ] PDF generation working
- [ ] Video recording functional
- [ ] Backend integration (if enabled)
- [ ] Performance testing completed