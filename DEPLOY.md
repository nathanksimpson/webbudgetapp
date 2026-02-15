# Deploying to GitHub Pages

This app is configured to run as a fully web-based application on GitHub Pages.

## Quick Deploy (Automatic)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/Budget-Web-Based-App.git
   git push -u origin main
   ```

2. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Click **Settings** → **Pages**
   - Under "Source", select **GitHub Actions**
   - The workflow will automatically build and deploy your app

3. **Access your app:**
   - Your app will be available at: `https://YOUR_USERNAME.github.io/Budget-Web-Based-App/`
   - The first deployment may take a few minutes

## Manual Deploy

If you prefer to deploy manually:

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Deploy using gh-pages:**
   ```bash
   npm install -g gh-pages
   npm run deploy
   ```

   Or if you've added gh-pages as a dependency:
   ```bash
   npx gh-pages -d dist
   ```

3. **Configure GitHub Pages:**
   - Go to repository **Settings** → **Pages**
   - Select **gh-pages** branch as source
   - Your app will be live at: `https://YOUR_USERNAME.github.io/Budget-Web-Based-App/`

## Important Notes

- **Repository Name:** If your repository has a different name, update the `base` path in `vite.config.js`
- **Custom Domain:** You can use a custom domain by adding a `CNAME` file in the `public` folder
- **Data Storage:** The app uses browser localStorage, so data is stored locally on each device
- **No Backend Required:** This is a fully client-side app, perfect for GitHub Pages

## After Deployment

Once deployed, your app will:
- ✅ Run completely in the browser
- ✅ Work on any device (desktop, tablet, phone)
- ✅ Save data locally in the browser
- ✅ Be accessible from anywhere with the URL
- ✅ Update automatically when you push changes (with GitHub Actions)

## Troubleshooting

**App shows blank page:**
- Check the browser console for errors
- Make sure the `base` path in `vite.config.js` matches your repository name
- Verify the build completed successfully

**404 errors:**
- Ensure GitHub Pages is enabled in repository settings
- Check that the workflow completed successfully in the Actions tab
