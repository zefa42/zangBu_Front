<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    @click="closeModal"
  >
    <div class="w-full max-w-md mx-4 bg-white rounded-lg shadow-xl" @click.stop>
      <!-- Modal Header -->
      <div class="flex items-center justify-between p-4 border-b">
        <h3 class="text-lg font-semibold text-gray-900">검색</h3>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      </div>

      <!-- Search Input -->
      <div class="p-4">
        <div class="relative">
          <div class="flex items-center bg-zinc-100 rounded-lg px-3 py-3">
            <i class="fas fa-search text-neutral-600 text-base mr-2"></i>
            <input
              ref="searchInputRef"
              v-model="searchQuery"
              @keyup.enter="handleSearch"
              @input="handleSearchInput"
              type="text"
              placeholder="지역, 매물명, 지하철역으로 검색"
              class="flex-1 bg-transparent text-text-1 text-base font-normal font-inter placeholder-text-1 outline-none"
            />
            <button
              v-if="searchQuery"
              @click="clearSearch"
              class="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
          <!-- 검색 버튼 -->
          <button
            @click="handleSearch"
            :disabled="!searchQuery.trim()"
            class="w-full mt-3 bg-brand-1 text-white py-3 px-4 rounded-lg font-medium hover:bg-brand-2 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            검색하기
          </button>
        </div>
      </div>

      <!-- Search Results or Recent Searches -->
      <div class="px-4 pb-4">
        <div v-if="!searchQuery && recentSearches.length > 0" class="space-y-2">
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-sm font-medium text-gray-700">최근 검색</h4>
            <button
              @click="clearAllRecentSearches"
              class="text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              전체 삭제
            </button>
          </div>
          <div
            v-for="(search, index) in recentSearches"
            :key="index"
            class="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors group"
            @click="selectRecentSearch(search)"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <i class="fas fa-history text-gray-400 mr-2"></i>
                <span class="text-gray-900">{{ search }}</span>
              </div>
              <button
                @click.stop="removeRecentSearch(index)"
                class="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all duration-200"
              >
                <i class="fas fa-times text-sm"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'search'])

// Reactive data
const searchQuery = ref('')
const searchInputRef = ref(null)
const recentSearches = ref([])

// 로컬 스토리지에서 최근 검색 불러오기
const loadRecentSearches = () => {
  try {
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      recentSearches.value = JSON.parse(saved)
    }
  } catch (error) {
    console.error('최근 검색 불러오기 실패:', error)
  }
}

// 로컬 스토리지에 최근 검색 저장하기
const saveRecentSearches = () => {
  try {
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches.value))
  } catch (error) {
    console.error('최근 검색 저장 실패:', error)
  }
}

// 컴포넌트 마운트 시 최근 검색 불러오기
onMounted(() => {
  loadRecentSearches()
})

// Methods
const closeModal = () => {
  emit('close')
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    console.log('검색 실행:', searchQuery.value)
    emit('search', searchQuery.value)

    // 최근 검색에 추가
    if (!recentSearches.value.includes(searchQuery.value)) {
      recentSearches.value.unshift(searchQuery.value)
      if (recentSearches.value.length > 5) {
        recentSearches.value.pop()
      }
      saveRecentSearches() // 최근 검색 저장
    }

    closeModal()
  }
}

const handleSearchInput = () => {
  // 검색어 입력 시 아무것도 하지 않음
  // 실제 검색은 검색 버튼 클릭 시에만 실행
}

const clearSearch = () => {
  searchQuery.value = ''
}

const selectRecentSearch = (search) => {
  searchQuery.value = search
  handleSearch()
}

const removeRecentSearch = (index) => {
  recentSearches.value.splice(index, 1)
  saveRecentSearches()
}

const clearAllRecentSearches = () => {
  recentSearches.value = []
  saveRecentSearches()
}

// Watch for modal open to focus input
watch(
  () => props.isOpen,
  (newValue) => {
    if (newValue) {
      nextTick(() => {
        searchInputRef.value?.focus()
      })
    } else {
      searchQuery.value = ''
    }
  }
)
</script>

<style scoped>
.font-inter {
  font-family: 'Inter', sans-serif;
}
</style>
