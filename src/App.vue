<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth/auth.js'
import Header from './components/common/Header.vue'
import Footer from './components/common/Footer.vue'

const route = useRoute()
const authStore = useAuthStore()

// /map 경로와 그 하위 경로에서는 footer를 숨김
const showFooter = computed(() => {
  return !(route.path.startsWith('/map') || route.path.startsWith('/auth'))
})

const showHeader = computed(() => {
  return !route.path.startsWith('/auth')
})

// 토큰 유효성 주기적 검사 (5분마다)
let tokenCheckInterval

onMounted(() => {
  // 로그인된 사용자만 토큰 검사 실행
  if (authStore.isAuthenticated) {
    tokenCheckInterval = setInterval(async () => {
      try {
        // 토큰이 곧 만료될 예정이면 자동 갱신
        if (!authStore.isTokenValid()) {
          await authStore.refreshAccessToken()
        }
      } catch (error) {
        console.error('자동 토큰 갱신 실패:', error)
        // 토큰 갱신 실패 시 자동 로그아웃
        authStore.logout()
        window.location.href = '/auth/login'
      }
    }, 5 * 60 * 1000) // 5분마다 실행
  }
})

onUnmounted(() => {
  if (tokenCheckInterval) {
    clearInterval(tokenCheckInterval)
  }
})
</script>

<template>
  <div id="app">
    <Header v-if="showHeader" />
    <main>
      <RouterView />
    </main>
    <Footer v-if="showFooter" />
  </div>
</template>
