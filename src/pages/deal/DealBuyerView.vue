<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getDealNotice, changeDealStatus } from '@/api/deal/deal'
import { DEAL_STATUS } from '@/utils/constants'
import Button from '@/components/common/Button.vue'
import BackButton from '@/components/common/BackButton.vue'

const route = useRoute()
const router = useRouter()

const propertyInfo = ref({})
const loading = ref(true)
const error = ref(null)
const showCancelModal = ref(false)
const checklistItems = ref({
  precautions: false,
  specialTerms: false,
})

const fetchPropertyInfo = async () => {
  try {
    loading.value = true
    error.value = null

    const dealId = route.params.dealId
    if (!dealId) {
      throw new Error('거래 ID가 필요합니다')
    }

    // 실제 API 호출 시도
    try {
      const response = await getDealNotice(dealId)
      console.log('거래 상세 정보 응답:', response.data)

      // API 응답 구조에 맞게 데이터 매핑
      propertyInfo.value = {
        dealId: dealId,
        buildingId: response.data.buildingId,
        buildingName: response.data.buildingName,
        infoBuilding: response.data.infoBuilding,
      }
    } catch (apiError) {
      console.error('API 호출 실패:', apiError)

      let errorMessage = '매물 정보를 불러올 수 없습니다.'

      if (apiError.response?.status === 404) {
        errorMessage = '해당 거래를 찾을 수 없습니다.'
      } else if (apiError.response?.status === 403) {
        errorMessage = '이 거래에 대한 접근 권한이 없습니다.'
      } else if (apiError.response?.data?.message) {
        errorMessage = apiError.response.data.message
      }

      error.value = errorMessage
    }
  } catch (err) {
    console.error('매물 정보 조회 실패:', err)
    error.value = err.message || '매물 정보를 불러올 수 없습니다'
  } finally {
    loading.value = false
  }
}

// 서류 열람 함수들
const viewDocument = (type) => {
  console.log(`${type} 서류 열람`)
  // DealConsumerDocument 페이지로 이동
  router
    .push({
      name: 'deal-consumer-document',
      params: {
        dealId: propertyInfo.value.dealId,
        type: type,
      },
    })
    .then(() => {
      // 페이지 이동 후 스크롤을 맨 위로 초기화
      window.scrollTo(0, 0)
    })
}

const viewAnalysisReport = () => {
  console.log('법무 서류 분석 리포트 열람')
  // 유료 서비스이므로 결제 페이지로 이동
  router.push('/payment').then(() => {
    // 페이지 이동 후 스크롤을 맨 위로 초기화
    window.scrollTo(0, 0)
  })
}

// 체크리스트 완료 여부 확인
const isChecklistComplete = computed(() => {
  return checklistItems.value.precautions && checklistItems.value.specialTerms
})

// 계약 진행 함수들
const downloadContract = () => {
  console.log('표준계약서 다운로드')
  // 실제로는 PDF 다운로드 API 호출
  const link = document.createElement('a')
  link.href = '/api/contract/download'
  link.download = '표준계약서.pdf'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const startDeal = () => {
  if (!isChecklistComplete.value) {
    alert('거래를 시작하기 전에 모든 체크리스트 항목을 확인해주세요.')
    return
  }
  console.log('거래 시작')
  // 채팅 페이지로 이동
  router.push(`/chat/room?dealId=${propertyInfo.value.dealId}`).then(() => {
    // 페이지 이동 후 스크롤을 맨 위로 초기화
    window.scrollTo(0, 0)
  })
}

// 거래 수락 함수
const acceptDeal = async () => {
  try {
    if (!isChecklistComplete.value) {
      alert('거래를 수락하기 전에 모든 체크리스트 항목을 확인해주세요.')
      return
    }

    const dealData = {
      dealId: propertyInfo.value.dealId,
      status: DEAL_STATUS.BEFORE_CONSUMER,
    }

    console.log('거래 수락 요청 데이터:', dealData)
    console.log('현재 토큰:', localStorage.getItem('token'))

    const response = await changeDealStatus(dealData)
    console.log('거래 수락 성공:', response.data)

    // 성공 후 거래 시작 페이지로 이동
    startDeal()
  } catch (err) {
    console.error('거래 수락 실패:', err)

    // 더 자세한 에러 정보 출력
    if (err.response) {
      console.error('응답 상태:', err.response.status)
      console.error('응답 데이터:', err.response.data)
      console.error('응답 헤더:', err.response.headers)
    }

    let errorMessage = '거래 수락에 실패했습니다.'

    if (err.response?.status === 403) {
      errorMessage = '권한이 없습니다. 로그인 상태를 확인해주세요.'
    } else if (err.response?.status === 401) {
      errorMessage = '인증이 필요합니다. 다시 로그인해주세요.'
    } else if (err.response?.data?.message) {
      errorMessage = err.response.data.message
    }

    alert(errorMessage)
  }
}

const cancelDeal = () => {
  showCancelModal.value = true
}

const confirmCancel = () => {
  showCancelModal.value = false
  // 실제로는 API 호출하여 거래 취소 처리
  console.log('거래 취소 처리:', propertyInfo.value.dealId)
  // 성공 후 이전 페이지로 이동
  router.go(-1).then(() => {
    // 페이지 이동 후 스크롤을 맨 위로 초기화
    window.scrollTo(0, 0)
  })
}

const cancelCancel = () => {
  showCancelModal.value = false
}

onMounted(() => {
  fetchPropertyInfo()
})
</script>

<template>
  <div class="min-h-screen" style="background: var(--bg-1)">
    <!-- 뒤로가기 버튼 -->
    <BackButton />

    <!-- 로딩 상태 -->
    <div v-if="loading" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <div
          class="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-4"
          style="border-color: var(--brand-3)"
        ></div>
        <p style="color: var(--text-1)">매물 정보를 불러오는 중...</p>
      </div>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="error" class="min-h-screen flex items-center justify-center px-4">
      <div class="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <svg
          class="w-16 h-16 text-red-400 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          ></path>
        </svg>
        <h3 class="text-xl font-bold mb-2" style="color: var(--text-2)">
          정보를 불러올 수 없습니다
        </h3>
        <p class="mb-6" style="color: var(--text-1)">{{ error }}</p>
        <button
          @click="fetchPropertyInfo"
          class="px-6 py-3 rounded-lg transition-colors text-white"
          style="background: var(--brand-3)"
          @mouseenter="$event.target.style.background = 'var(--brand-2)'"
          @mouseleave="$event.target.style.background = 'var(--brand-3)'"
        >
          다시 시도
        </button>
      </div>
    </div>

    <!-- 메인 콘텐츠 -->
    <div v-else class="min-h-screen flex items-center justify-center p-4 lg:p-12">
      <div class="w-full max-w-4xl">
        <!-- 통합 헤더 & 매물 정보 카드 -->
        <div class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <!-- 헤더 섹션 -->
          <div class="p-4 lg:p-8" style="background: var(--bg-2); border-bottom: 1px solid #e5e7eb">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-2 lg:gap-3 mb-3 lg:mb-4">
                  <div
                    class="w-1.5 h-6 lg:w-2 lg:h-8 rounded-full"
                    style="background: var(--bg-3)"
                  ></div>
                  <span
                    class="px-2 lg:px-3 py-0.5 lg:py-1 rounded-full text-xs lg:text-sm font-semibold"
                    style="background: var(--bg-3); color: var(--brand-1)"
                    >매물 구매</span
                  >
                </div>
                <h1 class="text-xl lg:text-3xl font-bold mb-2 lg:mb-3" style="color: var(--text-2)">
                  {{ propertyInfo.buildingName }}
                </h1>
                <p class="text-xs lg:text-base mb-2 leading-relaxed" style="color: var(--text-1)">
                  {{ propertyInfo.infoBuilding }}
                </p>
              </div>
              <div class="hidden lg:block">
                <div
                  class="w-12 lg:w-16 h-12 lg:h-16 rounded-full flex items-center justify-center"
                  style="background: var(--brand-3)"
                >
                  <svg
                    class="w-8 h-8"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    style="color: var(--text-3)"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- 콘텐츠 섹션 -->
          <div class="p-4 lg:p-12">
            <!-- 거래 체크리스트 섹션 -->
            <div class="bg-green-50 border border-green-200 rounded-xl p-4 lg:p-6 mb-8 lg:mb-12">
              <div class="flex items-center mb-4 lg:mb-6">
                <div class="bg-green-100 rounded-full p-1.5 lg:p-2 mr-3 lg:mr-4">
                  <svg
                    class="w-4 h-4 lg:w-5 lg:h-5 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                </div>
                <h2 class="text-lg lg:text-2xl font-bold text-green-800">거래 체크리스트</h2>
              </div>
              <p class="text-green-700 text-xs lg:text-sm mb-4 lg:mb-6">
                거래를 시작하기 전에 다음 사항들을 확인해주세요.
              </p>
              <div class="space-y-4 lg:space-y-6">
                <!-- 구매 전 주의사항 확인 -->
                <div class="flex items-start space-x-3 lg:space-x-4">
                  <div class="flex-shrink-0 mt-1">
                    <input
                      id="precautions"
                      v-model="checklistItems.precautions"
                      type="checkbox"
                      class="w-4 h-4 lg:w-5 lg:h-5 rounded"
                      style="color: var(--brand-3); border-color: var(--text-1)"
                    />
                  </div>
                  <div class="flex-1">
                    <label
                      for="precautions"
                      class="font-semibold text-sm lg:text-base mb-1 cursor-pointer text-green-800"
                    >
                      구매 전 주의사항 확인
                    </label>
                    <p class="text-xs lg:text-sm text-green-700">
                      권리관계, 대출 가능성, 세금 등을 확인하세요.
                    </p>
                  </div>
                </div>

                <!-- 특약사항 검토 -->
                <div class="flex items-start space-x-3 lg:space-x-4">
                  <div class="flex-shrink-0 mt-1">
                    <input
                      id="specialTerms"
                      v-model="checklistItems.specialTerms"
                      type="checkbox"
                      class="w-4 h-4 lg:w-5 lg:h-5 rounded"
                      style="color: var(--brand-3); border-color: var(--text-1)"
                    />
                  </div>
                  <div class="flex-1">
                    <label
                      for="specialTerms"
                      class="font-semibold text-sm lg:text-base mb-1 cursor-pointer text-green-800"
                    >
                      특약사항 검토
                    </label>
                    <p class="text-xs lg:text-sm text-green-700">
                      계약서의 특별 조건들을 꼼꼼히 확인하세요.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 공식 서류 열람 섹션 -->
            <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 lg:p-6 mb-8 lg:mb-12">
              <div class="flex items-center mb-4 lg:mb-6">
                <div class="bg-blue-100 rounded-full p-1.5 lg:p-2 mr-3 lg:mr-4">
                  <svg
                    class="w-4 h-4 lg:w-5 lg:h-5 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6zm2 2a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm0 4a1 1 0 011-1h4a1 1 0 110 2H7a1 1 0 01-1-1z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                </div>
                <h2 class="text-lg lg:text-2xl font-bold text-blue-800">공식 서류 열람</h2>
              </div>
              <p class="text-blue-700 text-xs lg:text-sm mb-4 lg:mb-6">
                매물 관련 공식 서류를 확인하실 수 있습니다.
              </p>
              <div class="space-y-3 lg:space-y-4">
                <!-- 등기부등본 -->
                <div
                  @click="viewDocument('register')"
                  class="flex items-center justify-between p-3 lg:p-4 rounded-lg border border-blue-200 bg-white hover:border-blue-300 cursor-pointer transition-all duration-200 hover:shadow-sm"
                >
                  <div class="flex items-center space-x-3 lg:space-x-4">
                    <div class="flex-shrink-0">
                      <svg
                        class="w-5 h-5 lg:w-6 lg:h-6 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6zm2 2a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm0 4a1 1 0 011-1h4a1 1 0 110 2H7a1 1 0 01-1-1z"
                          clip-rule="evenodd"
                        ></path>
                      </svg>
                    </div>
                    <span class="font-medium text-sm lg:text-base text-blue-800"> 등기부등본 </span>
                  </div>
                  <svg
                    class="w-4 h-4 lg:w-5 lg:h-5 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 5l7 7-7 7"
                    ></path>
                  </svg>
                </div>

                <!-- 건축물대장 -->
                <div
                  @click="viewDocument('building')"
                  class="flex items-center justify-between p-3 lg:p-4 rounded-lg border border-blue-200 bg-white hover:border-blue-300 cursor-pointer transition-all duration-200 hover:shadow-sm"
                >
                  <div class="flex items-center space-x-3 lg:space-x-4">
                    <div class="flex-shrink-0">
                      <svg
                        class="w-5 h-5 lg:w-6 lg:h-6 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6zm2 2a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm0 4a1 1 0 011-1h4a1 1 0 110 2H7a1 1 0 01-1-1z"
                          clip-rule="evenodd"
                        ></path>
                      </svg>
                    </div>
                    <span class="font-medium text-sm lg:text-base text-blue-800"> 건축물대장 </span>
                  </div>
                  <svg
                    class="w-4 h-4 lg:w-5 lg:h-5 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 5l7 7-7 7"
                    ></path>
                  </svg>
                </div>

                <!-- 법무 서류 분석 리포트 (유료 서비스) -->
                <div
                  @click="viewAnalysisReport"
                  class="flex items-center justify-between p-3 lg:p-4 rounded-lg border border-purple-300 bg-purple-50 hover:border-purple-400 cursor-pointer transition-all duration-200 hover:shadow-sm"
                >
                  <div class="flex items-center space-x-3 lg:space-x-4">
                    <div class="flex-shrink-0">
                      <svg
                        class="w-5 h-5 lg:w-6 lg:h-6 text-purple-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                          clip-rule="evenodd"
                        ></path>
                      </svg>
                    </div>
                    <div>
                      <span class="font-medium text-sm lg:text-base text-purple-800">
                        법무 서류 분석 리포트
                      </span>
                      <p class="text-xs lg:text-sm text-purple-600 mt-1">유료 서비스</p>
                    </div>
                  </div>
                  <svg
                    class="w-4 h-4 lg:w-5 lg:h-5 text-purple-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 5l7 7-7 7"
                    ></path>
                  </svg>
                </div>
              </div>
            </div>

            <!-- 계약 진행 섹션 -->
            <div class="rounded-xl p-8 lg:p-12" style="background: var(--bg-2)">
              <div class="text-center">
                <h2 class="text-xl lg:text-3xl font-bold mb-4 lg:mb-6" style="color: var(--text-2)">
                  거래 결정
                </h2>
                <p class="text-sm lg:text-base mb-8 lg:mb-12" style="color: var(--text-1)">
                  서류 발급 동의 후 거래 수락 또는 취소를 선택해주세요.
                </p>
                <div class="flex flex-col sm:flex-row gap-3 lg:gap-4 justify-center items-center">
                  <button
                    @click="$router.go(-1)"
                    class="w-full sm:w-48 py-3 lg:py-4 px-6 lg:px-8 rounded-lg font-semibold flex items-center justify-center gap-2 lg:gap-3 transition-colors text-base lg:text-lg"
                    style="
                      background: var(--bg-2);
                      border: 1px solid var(--text-1);
                      color: var(--text-2);
                    "
                    @mouseenter="$event.target.style.background = 'var(--bg-1)'"
                    @mouseleave="$event.target.style.background = 'var(--bg-2)'"
                  >
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 19l-7-7 7-7"
                      ></path>
                    </svg>
                    뒤로 가기
                  </button>
                  <button
                    @click="cancelDeal"
                    class="w-full sm:w-48 py-3 lg:py-4 px-6 lg:px-8 rounded-lg font-semibold flex items-center justify-center gap-2 lg:gap-3 transition-colors text-base lg:text-lg"
                    style="background: white; border: 1px solid #dc3545; color: #dc3545"
                    @mouseenter="$event.target.style.background = '#fef2f2'"
                    @mouseleave="$event.target.style.background = 'white'"
                  >
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                      ></path>
                    </svg>
                    취소하기
                  </button>
                  <button
                    @click="acceptDeal"
                    :disabled="!isChecklistComplete"
                    :class="[
                      'w-full sm:w-48 py-3 lg:py-4 px-6 lg:px-8 rounded-lg font-semibold flex items-center justify-center gap-2 lg:gap-3 transition-colors text-base lg:text-lg',
                      isChecklistComplete ? 'text-white' : 'cursor-not-allowed',
                    ]"
                    :style="
                      isChecklistComplete
                        ? 'background: var(--brand-3)'
                        : 'background: var(--text-1); color: var(--bg-1)'
                    "
                    @mouseenter="
                      isChecklistComplete && ($event.target.style.background = 'var(--brand-2)')
                    "
                    @mouseleave="
                      isChecklistComplete && ($event.target.style.background = 'var(--brand-3)')
                    "
                  >
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                    거래 수락
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 거래 취소 확인 모달 -->
    <div
      v-if="showCancelModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div class="text-center">
          <div
            class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4"
          >
            <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </div>
          <h3 class="text-lg font-medium mb-2" style="color: var(--text-2)">거래 취소 확인</h3>
          <p class="text-sm mb-6" style="color: var(--text-1)">
            정말로 이 거래를 취소하시겠습니까?<br />
            취소 후에는 되돌릴 수 없습니다.
          </p>
          <div class="flex space-x-3">
            <button
              @click="cancelCancel"
              class="flex-1 py-2 px-4 rounded-lg font-medium transition-colors"
              style="background: var(--bg-1); color: var(--text-2)"
              @mouseenter="$event.target.style.background = 'var(--bg-2)'"
              @mouseleave="$event.target.style.background = 'var(--bg-1)'"
            >
              취소
            </button>
            <button
              @click="confirmCancel"
              class="flex-1 py-2 px-4 rounded-lg font-medium transition-colors text-white"
              style="background: var(--status-2)"
              @mouseenter="$event.target.style.background = '#b91c1c'"
              @mouseleave="$event.target.style.background = 'var(--status-2)'"
            >
              거래 취소
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 추가 스타일이 필요한 경우 여기에 작성 */
</style>
