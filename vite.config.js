import { defineConfig } from 'vite'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        es: resolve(__dirname, 'es.html'),
        admin: resolve(__dirname, 'admin.html'),
        funil: resolve(__dirname, 'funil-conversao.html'),
        funil_es: resolve(__dirname, 'funil-conversao-es.html'),
        termos: resolve(__dirname, 'termos-condicoes.html'),
        privacidade: resolve(__dirname, 'politica-privacidade.html')
      }
    }
  },
  server: {
    historyApiFallback: true,
  }
})