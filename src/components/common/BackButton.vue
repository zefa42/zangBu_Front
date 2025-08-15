<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const showBackButton = ref(false)

// 스크롤 이벤트 핸들러
const handleScroll = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  showBackButton.value = scrollTop > 100 // 100px 이상 스크롤되면 버튼 표시
}

onMounted(() => {
  // 스크롤 이벤트 리스너 추가
  window.addEventListener('scroll', handleScroll)
})

// 컴포넌트 언마운트 시 이벤트 리스너 제거
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div
    v-show="showBackButton"
    class="fixed bottom-20 lg:bottom-24 left-4 z-50 transition-all duration-300 ease-in-out"
    :class="showBackButton ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'"
  >
    <button
      @click="router.go(-1)"
      class="p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-200"
    >
      <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 19l-7-7 7-7"
        ></path>
      </svg>
    </button>
  </div>
</template>

<style scoped>
/* 추가 스타일이 필요한 경우 여기에 작성 */
</style>
