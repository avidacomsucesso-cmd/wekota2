import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        es: 'es.html',
        admin: 'admin.html',
        funil: 'funil-conversao.html',
        funil_es: 'funil-conversao-es.html',
        termos: 'termos-condicoes.html',
        privacidade: 'politica-privacidade.html'
      }
    }
  },
  server: {
    historyApiFallback: true,
  }
})