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
                    >매물 판매</span
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
            <!-- 서류 발급 동의 섹션 -->
            <div class="space-y-6 lg:space-y-8 mb-8 lg:mb-12">
              <h2 class="text-lg lg:text-2xl font-bold text-gray-900 mb-6 lg:mb-8">
                서류 발급 동의
              </h2>

              <!-- 등기부 등본 발급 동의 -->
              <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 lg:p-6">
                <div class="flex items-start">
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
                  <div class="flex-1">
                    <h3 class="font-semibold text-blue-800 mb-1.5 lg:mb-2 text-sm lg:text-lg">
                      등기부 등본 발급 동의
                    </h3>
                    <p class="text-blue-700 text-xs lg:text-base leading-relaxed mb-3">
                      매수인이 등기부 등본을 확인할 수 있도록 발급 동의를 해주세요. 등기부 등본에는
                      부동산의 소유권, 저당권, 전세권 등의 권리관계가 기록되어 있습니다.
                    </p>
                    <div class="flex items-center space-x-3">
                      <input
                        id="registerAgreement"
                        v-model="registerAgreement"
                        type="checkbox"
                        class="w-4 h-4 lg:w-5 lg:h-5 rounded"
                        style="color: var(--brand-3); border-color: var(--text-1)"
                      />
                      <label
                        for="registerAgreement"
                        class="text-sm lg:text-base cursor-pointer"
                        style="color: var(--text-1)"
                      >
                        등기부 등본 발급에 동의합니다
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 건축물 대장 발급 동의 -->
              <div class="bg-green-50 border border-green-200 rounded-xl p-4 lg:p-6">
                <div class="flex items-start">
                  <div class="bg-green-100 rounded-full p-1.5 lg:p-2 mr-3 lg:mr-4">
                    <svg
                      class="w-4 h-4 lg:w-5 lg:h-5 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                  </div>
                  <div class="flex-1">
                    <h3 class="font-semibold text-green-800 mb-1.5 lg:mb-2 text-sm lg:text-lg">
                      건축물 대장 발급 동의
                    </h3>
                    <p class="text-green-700 text-xs lg:text-base leading-relaxed mb-3">
                      매수인이 건축물 대장을 확인할 수 있도록 발급 동의를 해주세요. 건축물 대장에는
                      건축물의 면적, 용도, 구조 등의 정보가 기록되어 있습니다.
                    </p>
                    <div class="flex items-center space-x-3">
                      <input
                        id="buildingAgreement"
                        v-model="buildingAgreement"
                        type="checkbox"
                        class="w-4 h-4 lg:w-5 lg:h-5 rounded"
                        style="color: var(--brand-3); border-color: var(--text-1)"
                      />
                      <label
                        for="buildingAgreement"
                        class="text-sm lg:text-base cursor-pointer"
                        style="color: var(--text-1)"
                      >
                        건축물 대장 발급에 동의합니다
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 거래 결정 섹션 -->
            <div class="rounded-xl p-4 lg:p-12" style="background: var(--bg-2)">
              <div class="text-center">
                <h2 class="text-lg lg:text-2xl font-bold mb-3 lg:mb-6" style="color: var(--text-2)">
                  거래 결정
                </h2>
                <p class="text-xs lg:text-base mb-4 lg:mb-8" style="color: var(--text-1)">
                  서류 발급 동의 후 거래 수락 또는 취소를 선택해주세요.
                </p>
                <div class="flex flex-col sm:flex-row gap-3 lg:gap-4 justify-center items-center">
                  <button
                    @click="handleBackClick"
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
                    class="w-full sm:w-48 py-3 lg:py-4 px-6 lg:px-8 rounded-lg font-semibold flex items-center justify-center gap-2 lg:gap-3 transition-colors text-base lg:text-lg text-white"
                    style="background: var(--status-2)"
                    @mouseenter="$event.target.style.background = '#b91c1c'"
                    @mouseleave="$event.target.style.background = 'var(--status-2)'"
                  >
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                      ></path>
                    </svg>
                    거래 취소
                  </button>
                  <button
                    @click="acceptDeal"
                    :disabled="!canProceed"
                    :class="[
                      'w-full sm:w-48 py-3 lg:py-4 px-6 lg:px-8 rounded-lg font-semibold flex items-center justify-center gap-2 lg:gap-3 transition-colors text-base lg:text-lg',
                      canProceed ? 'text-white' : 'cursor-not-allowed',
                    ]"
                    :style="
                      canProceed
                        ? 'background: var(--brand-3)'
                        : 'background: var(--text-1); color: var(--bg-1)'
                    "
                    @mouseenter="canProceed && ($event.target.style.background = 'var(--brand-2)')"
                    @mouseleave="canProceed && ($event.target.style.background = 'var(--brand-3)')"
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

    <!-- 동의 확인 모달 -->
    <div
      v-if="showAgreementModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div class="text-center">
          <div
            class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-slate-100 mb-4"
          >
            <svg
              class="h-6 w-6 text-slate-600"
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
          </div>
          <h3 class="text-lg font-medium mb-2" style="color: var(--text-2)">동의가 필요합니다</h3>
          <p class="text-sm mb-6" style="color: var(--text-1)">
            거래를 진행하기 전에 서류 발급에 동의해주세요.
          </p>
          <button
            @click="closeAgreementModal"
            class="w-full py-2 px-4 rounded-lg font-medium transition-colors text-white"
            style="background: var(--status-2)"
            @mouseenter="$event.target.style.background = '#b91c1c'"
            @mouseleave="$event.target.style.background = 'var(--status-2)'"
          >
            확인
          </button>
        </div>
      </div>
    </div>

    <!-- 거래 수락 확인 모달 -->
    <div
      v-if="showAcceptModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div class="text-center">
          <div
            class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4"
          >
            <svg
              class="h-6 w-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>
          <h3 class="text-lg font-medium mb-2" style="color: var(--text-2)">거래 수락 확인</h3>
          <p class="text-sm mb-6" style="color: var(--text-1)">
            정말로 이 거래를 수락하시겠습니까?<br />
            수락 후에는 취소할 수 없습니다.
          </p>
          <div class="flex space-x-3">
            <button
              @click="cancelAccept"
              class="flex-1 py-2 px-4 rounded-lg font-medium transition-colors"
              style="background: var(--bg-1); color: var(--text-2)"
              @mouseenter="$event.target.style.background = 'var(--bg-2)'"
              @mouseleave="$event.target.style.background = 'var(--bg-1)'"
            >
              취소
            </button>
            <button
              @click="confirmAccept"
              class="flex-1 py-2 px-4 rounded-lg font-medium transition-colors text-white"
              style="background: var(--brand-3)"
              @mouseenter="$event.target.style.background = 'var(--brand-2)'"
              @mouseleave="$event.target.style.background = 'var(--brand-3)'"
            >
              수락
            </button>
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

    <!-- 뒤로가기 확인 모달 -->
    <div
      v-if="showBackModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div class="text-center">
          <div
            class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-slate-100 mb-4"
          >
            <svg
              class="h-6 w-6 text-slate-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
          <h3 class="text-lg font-medium mb-2" style="color: var(--text-2)">
            페이지를 나가시겠습니까?
          </h3>
          <p class="text-sm mb-6" style="color: var(--text-1)">
            현재 페이지를 나가면 입력한 정보가 저장되지 않을 수 있습니다.
          </p>
          <div class="flex space-x-3">
            <button
              @click="cancelBack"
              class="flex-1 py-2 px-4 rounded-lg font-medium transition-colors"
              style="background: var(--bg-1); color: var(--text-2)"
              @mouseenter="$event.target.style.background = 'var(--bg-2)'"
              @mouseleave="$event.target.style.background = 'var(--bg-1)'"
            >
              취소
            </button>
            <button
              @click="confirmBack"
              class="flex-1 py-2 px-4 rounded-lg font-medium transition-colors text-white"
              style="background: var(--brand-3)"
              @mouseenter="$event.target.style.background = 'var(--brand-2)'"
              @mouseleave="$event.target.style.background = 'var(--brand-3)'"
            >
              나가기
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getDealNotice, changeDealStatus } from '@/api/deal/deal'
import { DEAL_STATUS } from '@/utils/constants'
import BackButton from '@/components/common/BackButton.vue'

const route = useRoute()
const router = useRouter()

const propertyInfo = ref({})
const loading = ref(true)
const error = ref(null)
const registerAgreement = ref(false)
const buildingAgreement = ref(false)
const showAgreementModal = ref(false)
const showAcceptModal = ref(false)
const showCancelModal = ref(false)
const showBackModal = ref(false)

// 모든 동의가 완료되었는지 확인 (거래 수락만 체크)
const canProceed = computed(() => {
  return registerAgreement.value && buildingAgreement.value
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
        dealStatus: response.data.dealStatus,
        chatRoomId: response.data.chatRoomId,
      }
    } catch (apiError) {
      console.warn('API 호출 실패, 더미데이터 사용:', apiError)
      // API 호출 실패 시 더미데이터 사용
      propertyInfo.value = getDummyPropertyData(dealId)
    }
  } catch (err) {
    console.error('매물 정보 조회 실패:', err)
    error.value = err.message || '매물 정보를 불러올 수 없습니다'
  } finally {
    loading.value = false
  }
}

// 더미 매물 데이터 생성 함수
const getDummyPropertyData = (dealId) => {
  const dummyData = {
    1: {
      deal_id: '1',
      building_id: '1',
      building_name: '레미안 강남 아파트 101동 1001호',
      info_building:
        '서울시 강남구 역삼동에 위치한 아파트입니다. 2018년 건축, 총 1,234세대 규모의 대단지 아파트입니다.',
    },
    2: {
      deal_id: '2',
      building_id: '2',
      building_name: '래미안 신촌 아파트 205동 1502호',
      info_building:
        '서울시 서대문구 신촌동에 위치한 아파트입니다. 2020년 건축, 총 856세대 규모의 중단지 아파트입니다.',
    },
    3: {
      deal_id: '3',
      building_id: '3',
      building_name: '푸르지오 마포 아파트 301동 801호',
      info_building:
        '서울시 마포구 합정동에 위치한 아파트입니다. 2019년 건축, 총 1,567세대 규모의 대단지 아파트입니다.',
    },
  }

  return dummyData[dealId] || dummyData['1']
}

const acceptDeal = () => {
  if (!canProceed.value) {
    showAgreementModal.value = true
    return
  }
  showAcceptModal.value = true
}

const confirmAccept = async () => {
  showAcceptModal.value = false

  const buildingId = propertyInfo.value.buildingId
  const roomId = propertyInfo.value.chatRoomId

  if (!roomId) {
    alert('chatRoomId가 없습니다.')
    return
  }
  if (!buildingId) {
    alert('buildingId가 없습니다.')
    return
  }

  try {
    const dto = {
      dealId: buildingId,
      chatRoomId: roomId,
      status: DEAL_STATUS.BEFORE_CONSUMER,
    } // 판매자 수락 - 소비자 확인 대기 상태로 변경

    await changeDealStatus(dto)

    // (선택) 방 메타 갱신 후 이동하고 싶으면:
    //await fetchRoomMeta()

    // 성공 후 채팅방으로 이동
    router.push({ name: 'chat-room', params: { roomId } })
  } catch (e) {
    console.error('거래 수락 실패:', e?.response?.status, e?.response?.data)
    alert('거래 수락 처리에 실패했습니다. 잠시 후 다시 시도해 주세요.')
  }
}

const cancelAccept = () => {
  showAcceptModal.value = false
}

const cancelDeal = () => {
  // 거래 취소는 체크박스 동의 없이도 가능
  showCancelModal.value = true
}

const confirmCancel = () => {
  showCancelModal.value = false
  // 실제로는 API 호출하여 거래 취소 처리
  console.log('거래 취소 처리:', propertyInfo.value.buildingId)
  // 성공 후 이전 페이지로 이동
  router.go(-1)
}

const cancelCancel = () => {
  showCancelModal.value = false
}

const handleBackClick = () => {
  showBackModal.value = true
}

const confirmBack = () => {
  showBackModal.value = false
  router.go(-1)
}

const cancelBack = () => {
  showBackModal.value = false
}

const closeAgreementModal = () => {
  showAgreementModal.value = false
}

onMounted(() => {
  fetchPropertyInfo()
})

watch(
  () => propertyInfo.value,
  async (newVal) => {
    if (newVal?.buildingId && newVal?.chatRoomId) {
      try {
        await changeDealStatus({
          dealId: newVal.buildingId,
          chatRoomId: newVal.chatRoomId,
          status: DEAL_STATUS.BEFORE_OWNER,
        })
        console.log('BEFORE_OWNER로 변경 성공')
      } catch (e) {
        console.error('상태 변경 실패:', e)
      }
    }
  },
  { immediate: false } // 처음엔 실행 안 하고 값이 바뀔 때만 실행
)
</script>
