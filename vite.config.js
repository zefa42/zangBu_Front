import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  //sockjs-client 오류 해결하느라 추가
  define: {
    global: 'globalThis', // Node.js의 global을 브라우저 globalThis로 매핑
  },
  // 프록시 설정 - 개발 환경에서 /api 요청을 백엔드로 전달
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''), // /api 제거하여 백엔드로 전달
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        },
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('프록시 에러:', err)
          })
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('프록시 요청:', req.method, req.url)
            // CORS 헤더 추가
            proxyReq.setHeader('Origin', 'http://localhost:8080')
          })
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('프록시 응답:', proxyRes.statusCode, req.url)
            // CORS 헤더 설정
            proxyRes.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
            proxyRes.headers['Access-Control-Allow-Methods'] =
              'GET, POST, PUT, DELETE, PATCH, OPTIONS'
            proxyRes.headers['Access-Control-Allow-Headers'] =
              'Content-Type, Authorization, X-Requested-With'
          })
        },
      },
    },
  },
})
