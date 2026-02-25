import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        funil: './funil-conversao.html',
        admin: './admin.html',
        adminv2: './admin-v2.html',
        privacidade: './politica-privacidade.html',
        termos: './termos-condicoes.html'
      }
    }
  },
  server: {
    historyApiFallback: true,
  }
})