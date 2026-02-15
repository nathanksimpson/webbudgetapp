# Budget Web App

A fully web-based budget planning application with category management, daily expense tracking, and payday calculator. **Runs entirely in your browser - no server needed!**

## 🌐 Live Demo

Once deployed to GitHub Pages, your app will be accessible at:
`https://YOUR_USERNAME.github.io/Budget-Web-Based-App/`

## 🚀 Quick Start (Local Development)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   - The terminal will show a URL (usually `http://localhost:5173`)
   - Open that URL in your browser

## 📦 Deploy to GitHub Pages

This app is configured to run as a static website on GitHub Pages. See [DEPLOY.md](DEPLOY.md) for detailed deployment instructions.

### Quick Deploy Steps:

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
   - Go to repository **Settings** → **Pages**
   - Under "Source", select **GitHub Actions**
   - Your app will automatically deploy!

3. **Access your app:**
   - Available at: `https://YOUR_USERNAME.github.io/Budget-Web-Based-App/`
   - Works on any device with a web browser!

## ✨ Features

- **Budget Planner**: Create categories and track expenses
- **Payday Calculator**: Calculate daily spending limits until your next payday
- **Cross-Linked Data**: Expenses automatically update payday calculator balance
- **Bill Management**: Link bills to categories and track upcoming payments
- **Data Persistence**: All data saved automatically in browser localStorage
- **Import/Export**: Import from old JSON format or export your data
- **Mobile Responsive**: Works great on phones, tablets, and desktops
- **Fully Web-Based**: No backend required, runs entirely in the browser

## 📱 Mobile Support

The app is fully responsive and works great on:
- 📱 Mobile phones
- 📱 Tablets
- 💻 Desktop computers

## 💾 Data Storage

- All data is stored locally in your browser (localStorage)
- Data persists between sessions
- Export your data anytime for backup
- Import data from previous sessions

## 🛠️ Development

### Project Structure
```
Budget Web Based App/
├── src/
│   ├── components/     # React components
│   ├── utils/           # Utility functions
│   └── styles/       # CSS styles
├── public/           # Static assets
└── dist/             # Production build (generated)
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run deploy` - Deploy to GitHub Pages (requires gh-pages)

## 📝 Notes

- **Repository Name**: If your GitHub repository has a different name, update the `base` path in `vite.config.js`
- **No Backend**: This is a fully client-side application - perfect for GitHub Pages
- **Browser Support**: Works in all modern browsers (Chrome, Firefox, Safari, Edge)

## 🔧 Troubleshooting

**Blank page after deployment:**
- Check that the `base` path in `vite.config.js` matches your repository name
- Verify GitHub Pages is enabled and using GitHub Actions
- Check the browser console for errors

**Import not working:**
- Make sure you're importing a valid JSON file
- The app supports both new format and old payday calculator format
