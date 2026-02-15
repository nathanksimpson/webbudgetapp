import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// For GitHub Pages, set base to your repository name
// For custom domain or root deployment, set base to '/'
export default defineConfig({
  plugins: [react()],
  // Change this to match your GitHub repository name, or '/' for root
  base: process.env.NODE_ENV === 'production' ? '/Budget-Web-Based-App/' : '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})
