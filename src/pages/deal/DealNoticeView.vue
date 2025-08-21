<template>
  <div class="min-h-screen" style="background: var(--bg-1)">
    <!-- 뒤로가기 버튼 -->
    <div
      v-show="showBackButton"
      class="fixed top-20 lg:top-24 left-4 z-50 transition-all duration-300 ease-in-out"
      :class="showBackButton ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'"
    >
      <button
        @click="$router.go(-1)"
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

    <!-- 로딩 상태 -->
    <div v-if="loading" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <div
          class="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-4"
          style="border-color: var(--brand-3)"
        ></div>
        <p style="color: var(--text-1)">거래전 안내 정보를 불러오는 중...</p>
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
          @click="fetchDealNotice"
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
                    >거래전 안내</span
                  >
                </div>
                <h1 class="text-xl lg:text-3xl font-bold mb-2 lg:mb-3" style="color: var(--text-2)">
                  {{ dealNotice.buildingName }}
                </h1>
                <p class="text-xs lg:text-base mb-2 leading-relaxed" style="color: var(--text-1)">
                  {{ dealNotice.infoBuilding }}
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
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- 콘텐츠 섹션 -->
          <div class="p-4 lg:p-12">
            <!-- 중요 안내 사항 -->
            <div class="space-y-6 lg:space-y-8 mb-8 lg:mb-12">
              <h2 class="text-lg lg:text-2xl font-bold text-gray-900 mb-6 lg:mb-8">
                중요 안내 사항
              </h2>

              <!-- 전세 주의사항 -->
              <div class="bg-red-50 border border-red-200 rounded-xl p-4 lg:p-6">
                <div class="flex items-start">
                  <div class="bg-red-100 rounded-full p-1.5 lg:p-2 mr-3 lg:mr-4">
                    <svg
                      class="w-4 h-4 lg:w-5 lg:h-5 text-red-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                  </div>
                  <div>
                    <h3 class="font-semibold text-red-800 mb-1.5 lg:mb-2 text-sm lg:text-lg">
                      권리금 전세 주의
                    </h3>
                    <p class="text-red-700 text-xs lg:text-base leading-relaxed">
                      전세 계약 시 권리금이 포함된 경우가 많습니다. 등기부등본을 반드시 확인하고,
                      전세보증금반환보증에 가입되어 있는지 확인하세요. 권리금은 법적 보호를 받지
                      못할 수 있습니다.
                    </p>
                  </div>
                </div>
              </div>

              <!-- 매물 순위 확인 -->
              <div class="bg-orange-50 border border-orange-200 rounded-xl p-4 lg:p-6">
                <div class="flex items-start">
                  <div class="bg-orange-100 rounded-full p-1.5 lg:p-2 mr-3 lg:mr-4">
                    <svg
                      class="w-4 h-4 lg:w-5 lg:h-5 text-orange-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                  </div>
                  <div>
                    <h3 class="font-semibold text-orange-800 mb-1.5 lg:mb-2 text-sm lg:text-lg">
                      매물 순위 확인 필수
                    </h3>
                    <p class="text-orange-700 text-xs lg:text-base leading-relaxed">
                      매물에 설정된 저당권, 전세권 등 선순위 권리가 있는지 반드시 확인하세요.
                      전문가와 상담하여 매수인의 권리 확보 여부를 확인하는 것이 중요합니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 법적 고지 및 면책 조항 -->
            <div class="rounded-xl p-4 lg:p-8 mb-8 lg:mb-12" style="background: var(--bg-1)">
              <h2 class="text-lg lg:text-2xl font-bold mb-4 lg:mb-8" style="color: var(--text-2)">
                법적 고지 및 면책 조항
              </h2>
              <div
                class="text-xs lg:text-base space-y-3 lg:space-y-4 leading-relaxed"
                style="color: var(--text-1)"
              >
                <p>
                  본 페이지에 제공되는 정보는 참고용이며, 실제 거래 시에는 부동산 중개업소와 법무사
                  등 전문가의 자문을 받으시기 바랍니다.
                </p>
                <p>
                  회사는 제공된 정보의 오류나 누락으로 인한 손해에 대해 책임을 지지 않습니다. 모든
                  정보는 실제 현장 방문과 서류 확인을 통해 검증하시기 바랍니다.
                </p>
                <p>
                  매물 확인 시 등기부등본, 건축물대장 등 관련 서류를 반드시 확인하시고, 임대인과의
                  계약은 법적 구속력이 있으므로 모든 조건을 신중히 검토하여 합의하시기 바랍니다.
                </p>
              </div>
            </div>

            <!-- 동의 체크박스 -->
            <div class="bg-white border border-gray-200 rounded-xl p-4 lg:p-8 mb-8 lg:mb-12">
              <div class="flex items-start space-x-2 lg:space-x-3">
                <input
                  id="agreement"
                  v-model="isAgreed"
                  type="checkbox"
                  class="mt-1 w-4 h-4 lg:w-5 lg:h-5 rounded"
                  style="color: var(--brand-3); border-color: var(--text-1)"
                />
                <label
                  for="agreement"
                  class="text-xs lg:text-base leading-relaxed cursor-pointer"
                  style="color: var(--text-1)"
                >
                  위의 모든 안내사항과 법적 고지를 확인하고 이해하였으며, 이에 동의합니다. 거래 진행
                  시 발생할 수 있는 모든 위험과 책임을 인지하고 있습니다.
                </label>
              </div>
            </div>

            <!-- 채팅 시작 버튼 -->
            <div class="rounded-xl p-4 lg:p-12" style="background: var(--bg-2)">
              <div class="text-center">
                <h2 class="text-lg lg:text-2xl font-bold mb-3 lg:mb-6" style="color: var(--text-2)">
                  거래 진행하기
                </h2>
                <p class="text-xs lg:text-base mb-4 lg:mb-8" style="color: var(--text-1)">
                  위의 안내사항을 모두 확인하셨다면, 채팅을 통해 거래를 진행하실 수 있습니다.
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
                    @click="startChat"
                    :disabled="!isAgreed"
                    :class="[
                      'w-full sm:w-48 py-3 lg:py-4 px-6 lg:px-8 rounded-lg font-semibold flex items-center justify-center gap-2 lg:gap-3 transition-colors text-base lg:text-lg',
                      isAgreed ? 'text-white' : 'cursor-not-allowed',
                    ]"
                    :style="
                      isAgreed
                        ? 'background: var(--brand-3)'
                        : 'background: var(--text-1); color: var(--bg-1)'
                    "
                    @mouseenter="isAgreed && ($event.target.style.background = 'var(--brand-2)')"
                    @mouseleave="isAgreed && ($event.target.style.background = 'var(--brand-3)')"
                  >
                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fill-rule="evenodd"
                        d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                    채팅 시작
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
            거래를 진행하기 전에 위의 안내사항에 동의해주세요.
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
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getDealNoticeBefore } from '@/api/deal/deal'
import { useChatStore } from '@/stores/chat/chat'
import { useAuthStore } from '@/stores/auth/auth'
import { changeDealStatus } from '@/api/deal/deal'
import axios from 'axios'

const route = useRoute()
const router = useRouter()

const dealNotice = ref({})
const loading = ref(true)
const error = ref(null)
const isUsingDummyData = ref(false)
const isAgreed = ref(false)
const showAgreementModal = ref(false)
const showBackModal = ref(false)
const showBackButton = ref(false)
const chatStore = useChatStore()
const authStore = useAuthStore()

const fetchDealNotice = async () => {
  try {
    loading.value = true
    error.value = null

    const buildingId = route.params.buildingId
    if (!buildingId) {
      throw new Error('매물 ID가 필요합니다')
    }

    // 실제 API 호출 시도
    try {
      const response = await getDealNoticeBefore(buildingId)
      dealNotice.value = response.data
      console.log('거래전 안내 정보:', dealNotice.value)
      isUsingDummyData.value = false
    } catch (apiError) {
      console.warn('API 호출 실패, 더미데이터 사용:', apiError)
      // API 호출 실패 시 더미데이터 사용
      dealNotice.value = getDummyData(buildingId)
      isUsingDummyData.value = true
    }
  } catch (err) {
    console.error('거래전 안내 정보 조회 실패:', err)
    error.value = err.message || '거래전 안내 정보를 불러올 수 없습니다'
  } finally {
    loading.value = false
  }
}

// 더미데이터 생성 함수
const getDummyData = (buildingId) => {
  const dummyData = {
    1: {
      building_id: '1',
      building_name: '레미안 강남 아파트 101동 1001호',
      info_building:
        '서울시 강남구 역삼동에 위치한 아파트입니다. 2018년 건축, 총 1,234세대 규모의 대단지 아파트입니다. 역삼역 도보 5분 거리에 위치하여 교통이 매우 편리하며, 강남의 중심지에 위치해 있어 상권이 발달되어 있습니다.',
    },
    2: {
      building_id: '2',
      building_name: '래미안 신촌 아파트 205동 1502호',
      info_building:
        '서울시 서대문구 신촌동에 위치한 아파트입니다. 2020년 건축, 총 856세대 규모의 중단지 아파트입니다. 신촌역과 가까워 대학가의 분위기를 느낄 수 있으며, 주변에 카페와 맛집이 많아 생활이 편리합니다.',
    },
    3: {
      building_id: '3',
      building_name: '푸르지오 마포 아파트 301동 801호',
      info_building:
        '서울시 마포구 합정동에 위치한 아파트입니다. 2019년 건축, 총 1,567세대 규모의 대단지 아파트입니다. 한강공원과 가까워 자연환경이 우수하며, 합정역과 홍대입구역이 모두 도보 10분 이내에 있어 교통이 편리합니다.',
    },
    4: {
      building_id: '4',
      building_name: '롯데캐슬 송도 아파트 401동 2001호',
      info_building:
        '인천시 연수구 송도동에 위치한 아파트입니다. 2021년 건축, 총 2,100세대 규모의 초대단지 아파트입니다. 송도국제도시의 중심에 위치하여 미래지향적인 도시환경을 제공하며, 인천대학교와 가까워 교육환경이 우수합니다.',
    },
    5: {
      building_id: '5',
      building_name: '자이 분당 아파트 501동 1201호',
      info_building:
        '경기도 성남시 분당구 정자동에 위치한 아파트입니다. 2017년 건축, 총 1,890세대 규모의 대단지 아파트입니다. 분당신도시의 중심지에 위치하여 교육환경이 우수하며, 정자역과 가까워 서울 접근성이 좋습니다.',
    },
  }

  return dummyData[buildingId] || dummyData['1']
}

const startDeal = () => {
  // 거래 시작 페이지로 이동
  router.push(`/deal/seller/${dealNotice.value.building_id}`)
}

const isStarting = ref(false)
const startChat = async () => {
  if (!isAgreed.value) {
    showAgreementModal.value = true
    return
  }
  if (isStarting.value) return (isStarting.value = true)
  var chatRoomId = null
  try {
    const chatRoom = await chatStore.createChatRoom(route.params.buildingId)
    if (!chatRoom || !chatRoom.chatRoomId) {
      throw new Error('채팅방을 찾을 수 없습니다.')
    }
    chatRoomId = chatRoom.chatRoomId
    const dealId = await createDeal(chatRoomId)
    //상태 변경
    // 거래 상태를 BEFORE_OWNER로 변경
    await changeDealStatus({
      chatRoomId: chatRoomId,
      dealId: dealId,
      status: 'BEFORE_OWNER',
    })

    // 채팅방 생성 후 채팅방으로 이동
    router.push({ name: 'chat-room', params: { roomId: chatRoom.chatRoomId } })
  } catch (err) {
    console.error('채팅방/거래 생성 실패:', err)
    if (chatRoomId) {
      try {
        await chatStore.deleteChatRoom(chatRoomId)
      } catch (cleanupErr) {
        console.warn('채팅방 정리 실패(무시 가능):', cleanupErr)
      }
    }
    alert('생성 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.')
  } finally {
    isStarting.value = false
  }
}

//거래 생성
const createDeal = async (chatRoomId) => {
  const token = authStore.accessToken || ''
  try {
    const res = await axios.post(
      `/api/deal`,
      { chatRoomId },
      {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    )
    return res.data //dealId 반환받음
  } catch (err) {
    console.error('API 응답 오류(createDeal):', {
      status: err.response?.status,
      data: err.response?.data,
    })
    throw err
  }
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

// 스크롤 이벤트 핸들러
const handleScroll = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  showBackButton.value = scrollTop > 100 // 100px 이상 스크롤되면 버튼 표시
}

onMounted(() => {
  fetchDealNotice()
  // 스크롤 이벤트 리스너 추가
  window.addEventListener('scroll', handleScroll)
})

// 컴포넌트 언마운트 시 이벤트 리스너 제거
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
/* 추가 스타일이 필요한 경우 여기에 작성 */
</style>
