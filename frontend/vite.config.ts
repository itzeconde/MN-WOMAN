import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import Sitemap from 'vite-plugin-sitemap'

export default defineConfig({
  plugins: [
    react(),
    Sitemap({
      hostname: 'https://mn-woman.vercel.app',
      dynamicRoutes: [
        '/',
        '/cursos',
        '/linea911',
        '/articulos',
        '/sobre-nosotros',
        '/privacidad',
      ],
    }),
  ],
})