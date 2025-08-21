<template>
  <div class="w-full max-w-screen-xl mx-auto">
    <div
      class="flex flex-col min-h-screen bg-[var(--bg-1)] py-4 px-3 sm:py-6 sm:px-4 md:px-6 xl:px-8"
    >
      <!-- 헤더 -->
      <div class="flex items-center gap-3 mb-4 sm:mb-5">
        <button
          @click="router.back()"
          class="text-[var(--text-1)] hover:text-[var(--brand-1)] p-2 -ml-2 rounded-lg active:scale-[0.98]"
          aria-label="뒤로가기"
        >
          <i class="fas fa-arrow-left text-base sm:text-lg"></i>
        </button>
        <h3 class="font-semibold text-base sm:text-lg">채팅방 목록</h3>
      </div>

      <main class="flex-1 flex flex-col">
        <!-- 필터 탭 -->
        <div class="my-3 sm:my-6">
          <div
            class="grid grid-cols-3 gap-2 sm:gap-6 md:flex md:justify-center md:gap-16 xl:gap-[260px]"
          >
            <div
              v-for="tab in tabs"
              :key="tab.type"
              :class="[
                'flex flex-col-reverse items-center cursor-pointer select-none text-[var(--text-1)] transition rounded-lg active:scale-[0.98]',
                // 기본 크기 (모바일)
                'py-2 sm:py-3 px-2',
                // 큰 화면에서 더 넓게
                'md:min-w-[120px] md:px-6 md:py-4',
                tab.type === filterType
                  ? 'text-black font-bold bg-[var(--bg-2)] shadow-sm'
                  : 'hover:bg-white/60',
              ]"
              @click="selectTab(tab.type)"
            >
              <div class="text-lg sm:text-xl font-bold leading-none">
                {{ tab.count }}
                <span
                  v-if="tab.unread > 0"
                  class="inline-flex items-center justify-center ml-1 w-4 h-4 text-[11px] font-semibold bg-[var(--status-1)] text-white rounded-full"
                >
                  {{ tab.unread }}
                </span>
              </div>
              <div class="mt-1 text-xs sm:text-sm">{{ tab.label }}</div>
            </div>
          </div>
        </div>

        <!-- 채팅방 리스트 -->
        <div v-if="rooms.length > 0" class="flex flex-col gap-3 sm:gap-4">
          <div
            v-for="room in rooms"
            :key="room.chatRoomId"
            class="flex items-center sm:items-start bg-[var(--bg-2)] p-3 sm:p-4 rounded-lg relative cursor-pointer active:scale-[0.99]"
            @click="goToChatRoom(room.chatRoomId)"
          >
            <!-- 아바타 -->
            <div
              class="w-10 h-10 sm:w-11 sm:h-11 rounded-full text-white font-bold text-sm sm:text-base flex items-center justify-center mr-3 sm:mr-4 shrink-0"
              :style="{
                backgroundColor: room.type === 'BUY' ? 'var(--brand-3)' : 'var(--brand-2)',
              }"
              :aria-label="room.otherUserNickname"
            >
              {{ room.otherUserNickname?.charAt(0) }}
            </div>

            <!-- 본문 -->
            <div class="flex-1 min-w-0">
              <!-- 상단 라인: 닉네임/뱃지/시간 -->
              <div
                class="flex items-center justify-between gap-2 text-[var(--text-2)] mb-0.5 sm:mb-1"
              >
                <div class="min-w-0">
                  <div class="flex items-center gap-1.5 sm:gap-2 min-w-0">
                    <span
                      class="font-semibold text-sm sm:text-base truncate max-w-[10rem] sm:max-w-[14rem]"
                    >
                      {{ room.otherUserNickname }}
                    </span>

                    <!-- 뱃지 (모바일에선 간략화) -->
                    <div class="flex gap-1">
                      <span
                        class="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded bg-[var(--brand-3)] text-white whitespace-nowrap"
                      >
                        {{ room.displaySellerType }}
                      </span>
                      <span
                        class="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded whitespace-nowrap hidden xs:inline-block sm:inline-block"
                        :class="{
                          'bg-gray-100 text-gray-600': room.displayStatus === '거래 전',
                          'bg-blue-100 text-gray-600': room.displayStatus === '판매자 수락 전',
                          'bg-blue-100 text-blue-600': room.displayStatus === '구매자 수락 대기',
                          'bg-yellow-100 text-yellow-600': room.displayStatus === '거래 중',
                          'bg-gray-100 text-gray-500': room.displayStatus === '거래 완료',
                        }"
                      >
                        {{ room.displayStatus }}
                      </span>
                    </div>
                  </div>

                  <!-- 빌딩/가격: 모바일 한 줄 트렁킷 -->
                  <div
                    class="text-[11px] sm:text-xs text-[var(--text-1)] mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis"
                  >
                    <i class="fa-solid fa-house"></i>
                    {{ room.buildingName }} |
                    <i class="fa-solid fa-sack-dollar"></i>
                    전세 {{ room.price }}
                  </div>
                </div>

                <!-- 시간: 모바일에선 작게 -->
                <span class="text-[10px] sm:text-xs text-[var(--text-1)] shrink-0">
                  {{ room.lastMessageTime || room.createdAt }}
                </span>
              </div>

              <!-- 마지막 메시지 -->
              <div
                class="text-[13px] sm:text-sm text-[var(--text-1)] whitespace-nowrap overflow-hidden text-ellipsis"
              >
                {{ room.lastMessagePreview }}
              </div>
            </div>

            <!-- 안읽음 카운트 -->
            <div
              v-if="room.unreadCount > 0"
              class="absolute right-3 bottom-2 sm:bottom-3 text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-[var(--brand-3)] text-white"
            >
              {{ room.unreadCount }}
            </div>
          </div>
        </div>

        <!-- 빈 목록 안내 -->
        <div
          v-else
          class="flex flex-col items-center justify-center py-14 sm:py-16 text-[var(--text-1)]"
        >
          <i class="fa-regular fa-comment-dots text-3xl sm:text-4xl mb-2 sm:mb-3"></i>
          <p class="text-sm sm:text-base font-medium text-center">표시할 채팅방이 없습니다.</p>
        </div>

        <!-- 페이지네이션 -->
        <div class="flex justify-center mt-5 sm:mt-6 flex-wrap gap-1.5 sm:gap-2">
          <!-- 이전 -->
          <button
            @click="changePage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-3 py-1 rounded border text-sm min-w-9"
            :class="
              currentPage === 1
                ? 'text-gray-400 border-gray-300 cursor-not-allowed'
                : 'hover:bg-gray-100 border-gray-400 active:scale-[0.98]'
            "
            aria-label="이전 페이지"
          >
            <i class="fa-solid fa-angle-left"></i>
          </button>

          <!-- 번호 -->
          <button
            v-for="page in totalPages"
            :key="page"
            @click="changePage(page)"
            class="px-3 py-1 rounded border text-sm min-w-9"
            :class="
              page === currentPage
                ? 'bg-[var(--brand-3)] text-white border-[var(--brand-3)]'
                : 'border-gray-400 hover:bg-gray-100 active:scale-[0.98]'
            "
            :aria-current="page === currentPage ? 'page' : undefined"
          >
            {{ page }}
          </button>

          <!-- 다음 -->
          <button
            @click="changePage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-3 py-1 rounded border text-sm min-w-9"
            :class="
              currentPage === totalPages
                ? 'text-gray-400 border-gray-300 cursor-not-allowed'
                : 'hover:bg-gray-100 border-gray-400 active:scale-[0.98]'
            "
            aria-label="다음 페이지"
          >
            <i class="fa-solid fa-angle-right"></i>
          </button>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed, onBeforeUnmount } from 'vue'
import axios from 'axios'
import { useChatStore } from '@/stores/chat/chat'
import { useStomp } from '@/utils/useStomp'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth/auth'

const chatStore = useChatStore()
const { connect, subscribeRoom, unsubscribeAll, disconnect } = useStomp()
const authStore = useAuthStore()
const router = useRouter()

const filterType = ref('ALL') //'ALL', 'BUY', 'SELL'
const rooms = ref([]) //현재 페이지 방 목록
const loading = ref(false)
const errorMsg = ref('')
const currentPage = ref(1)
const pageSize = 5
const totalCount = ref(0)
const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / pageSize)))

//  탭 상태(백엔드에서 내려주면 우선 사용)
const tabs = ref([
  { label: '전체', type: 'ALL', count: 0, unread: 0 },
  { label: '구매', type: 'BUY', count: 0, unread: 0 },
  { label: '판매', type: 'SELL', count: 0, unread: 0 },
])

//  탭 계산(백엔드 미제공 시)
function computeTabsFrom(roomsList) {
  const buyRooms = roomsList.filter((r) => r.type === 'BUY')
  const sellRooms = roomsList.filter((r) => r.type === 'SELL')
  const buyUnread = buyRooms.filter((r) => (r.unreadCount || 0) > 0).length
  const sellUnread = sellRooms.filter((r) => (r.unreadCount || 0) > 0).length
  const allUnread = roomsList.filter((r) => (r.unreadCount || 0) > 0).length

  tabs.value = [
    { label: '전체', type: 'ALL', count: roomsList.length, unread: allUnread },
    { label: '구매', type: 'BUY', count: buyRooms.length, unread: buyUnread },
    { label: '판매', type: 'SELL', count: sellRooms.length, unread: sellUnread },
  ]
}

function mapSellerType(raw) {
  const v = String(raw || '').toUpperCase()
  if (v === 'OWNER') return '집주인'
  if (v === 'TENANT') return '세입자'
  return raw || ''
}

function mapDealStatus(raw) {
  if (!raw) return '거래 전'
  const v = String(raw).toUpperCase()
  if (['BEFORE_TRANSACTION'].includes(v)) return '거래 전'
  if (['BEFORE_OWNER'].includes(v)) return '판매자 수락 전'
  if (['BEFORE_CONSUMER'].includes(v)) return '구매자 수락 대기'
  if (['MIDDLE_DEAL'].includes(v)) return '거래 중'
  if (['CLOSE_DEAL'].includes(v)) return '거래 완료'

  return String(raw) // 그대로 표시
}

/** ---------------------------
 * API: 채팅방 목록 조회
 * 응답 예시:
 * {
 *   items: Room[],
 *   total: number,
 *   counts: {
 *     ALL: { count: number, unread: number },
 *     BUY: { count: number, unread: number },
 *     SELL:{ count: number, unread: number }
 *   }
 * }
 * -------------------------- */
/** ---------------------------
 * API: 탭 카운트만 조회하는 함수
 * -------------------------- */
async function fetchTabCounts() {
  try {
    const { data } = await axios.get('/api/chat/counts', {
      headers: { Authorization: `Bearer ${authStore.accessToken}` },
    })

    if (data?.counts?.ALL && data?.counts?.BUY && data?.counts?.SELL) {
      tabs.value = [
        {
          label: '전체',
          type: 'ALL',
          count: data.counts.ALL.count,
          unread: data.counts.ALL.unread,
        },
        {
          label: '구매',
          type: 'BUY',
          count: data.counts.BUY.count,
          unread: data.counts.BUY.unread,
        },
        {
          label: '판매',
          type: 'SELL',
          count: data.counts.SELL.count,
          unread: data.counts.SELL.unread,
        },
      ]
    }
  } catch (err) {
    console.error('탭 카운트 조회 실패:', err)
  }
}

/** ---------------------------
 * STOMP: 현재 페이지 방들만 구독 (서버 동기화 방식)
 * -------------------------- */
function resubscribeForCurrentPage() {
  if (!rooms.value?.length) {
    unsubscribeAll()
    return
  }
  // 기존 구독 해제 후 현재 페이지만 재구독
  unsubscribeAll()
  rooms.value.forEach((room) => {
    subscribeRoom(room.chatRoomId, (message, roomId) => {
      const target = rooms.value.find((r) => r.chatRoomId === roomId)
      if (!target) return

      target.lastMessage = message.message
      target.lastMessageTime = message.createdAt
      // 표시용 프리뷰도 동기화 (빈 문자열이면 플레이스홀더)
      const msg = (message.message ?? '').trim()
      target.lastMessagePreview = msg.length ? msg : '채팅을 시작해보세요'

      if (authStore.memberId && message.senderId !== authStore.memberId) {
        target.unreadCount = (target.unreadCount || 0) + 1

        // 서버에서 최신 탭 카운트 조회해서 동기화
        fetchTabCounts()
      }
    })
  })
}

async function fetchRooms() {
  loading.value = true
  errorMsg.value = ''
  try {
    const { data } = await axios.get('/api/chat/list', {
      params: {
        type: filterType.value, // 'ALL' | 'BUY' | 'SELL'
        page: currentPage.value, // 1-base 또는 0-base면 서버에 맞춰 수정
        size: pageSize,
      },
      headers: { Authorization: `Bearer ${authStore.accessToken}` },
    })

    // 호환 처리: items/total/counts가 없을 수도 있으니 안전하게
    const itemsRaw = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : []
    // 화면 표시용 필드로 가공
    const items = itemsRaw.map((r) => ({
      ...r,
      displaySellerType: mapSellerType(r.sellerType),
      displayStatus: mapDealStatus(r.status),
    }))
    const total = Number.isFinite(data?.total) ? data.total : items.length
    rooms.value = items
    totalCount.value = total

    // 탭 카운트 세팅(백엔드 제공 우선)
    if (data?.counts?.ALL && data?.counts?.BUY && data?.counts?.SELL) {
      tabs.value = [
        {
          label: '전체',
          type: 'ALL',
          count: data.counts.ALL.count,
          unread: data.counts.ALL.unread,
        },
        {
          label: '구매',
          type: 'BUY',
          count: data.counts.BUY.count,
          unread: data.counts.BUY.unread,
        },
        {
          label: '판매',
          type: 'SELL',
          count: data.counts.SELL.count,
          unread: data.counts.SELL.unread,
        },
      ]
    } else if (filterType.value === 'ALL') {
      //counts 없고 ALL일 때만 계산해서 갱신
      computeTabsFrom(items)
    } // BUY/SELL이면 tabs 갱신하지 않고 유지

    // 방 목록이 바뀌었으므로 구독 재구성
    resubscribeForCurrentPage()
  } catch (err) {
    console.error(err)
    errorMsg.value = '채팅방 목록을 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
}

/** ---------------------------
 * 탭/페이지 전환
 * -------------------------- */
function changePage(page) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
}

function selectTab(type) {
  if (filterType.value === type) return
  filterType.value = type
  currentPage.value = 1
}

/** ---------------------------
 * 라우팅/구독/초기화
 * -------------------------- */
const goToChatRoom = (roomId) => {
  router.push(`/chat/room/${roomId}`)
}

onMounted(async () => {
  // STOMP 연결 후 목록 로딩
  fetchRooms()
  // 2) 토큰 함수 전달: authStore에서 확실히 값이 준비된 후 사용
  await connect(
    () => authStore.accessToken,
    () => {
      // 연결되면 현재 페이지 구독만 붙이기
      resubscribeForCurrentPage()
    }
  )
})

// 탭/페이지 변경 시 재조회
watch([filterType, currentPage], () => {
  fetchRooms()
})

onBeforeUnmount(() => {
  // 현재 페이지 구독만 해제 (연결 유지)
  unsubscribeAll()
})
</script>
