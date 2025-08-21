<template>
  <div class="w-full max-w-screen-xl mx-auto">
    <div class="flex flex-col h-screen bg-gray-50">
      <!-- 헤더 -->
      <header class="bg-[var(--brand-3)] text-white flex items-center justify-between px-4 py-3">
        <!-- 좌측 영역 -->
        <div class="flex items-start gap-3">
          <button @click="router.push('/chat/list')" class="text-white mt-1">
            <i class="fas fa-arrow-left"></i>
          </button>
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-2">
              <span class="font-semibold text-base">{{ otherNickname }}</span>
            </div>
            <div class="flex items-center gap-2 text-xs text-white/90">
              <i class="fas fa-home"></i> <span>{{ buildingName }}</span>
              <span
                class="text-xs bg-[var(--brand-2)] text-[var(--brand-5)] px-2 py-0.5 rounded-lg"
              >
                {{ sellerType }}
              </span>
            </div>
          </div>
        </div>
        <!-- 우측 영역 (판매자, 구매자에 따라 다르게) -->
        <div class="flex items-center gap-5">
          <!-- 판매자인 경우 거래 활성화 토글 -->
          <template v-if="isSeller">
            <!-- 거래 완료면 토글 대신 배지 -->
            <span
              v-if="statusRaw === 'CLOSE_DEAL'"
              class="text-xs font-medium px-2 py-1 rounded bg-gray-100 text-gray-500"
            >
              거래 완료
            </span>
            <div v-else class="flex flex-col items-center text-sm">
              <span class="mb-1">거래 활성화</span>
              <label
                class="relative inline-flex items-center cursor-pointer"
                :class="
                  isActive ? 'cursor-not-allowed pointer-events-none opacity-60' : 'cursor-pointer'
                "
              >
                <input
                  type="checkbox"
                  :checked="isActive"
                  @change="handleToggle"
                  class="sr-only peer"
                  :disabled="isActive"
                />
                <div
                  class="w-10 h-5 bg-[var(--brand-5)] peer-checked:bg-[var(--brand-2)] rounded-full transition-colors duration-300"
                ></div>
                <div
                  class="absolute left-0 top-0 w-5 h-5 bg-white border rounded-full transition-transform duration-300 transform peer-checked:translate-x-5"
                ></div>
              </label>
            </div>
          </template>
          <!-- 구매자인 경우 거래 상태 -->
          <div v-else>
            <router-link
              v-if="status === '거래 시작하러 가기'"
              :to="{ name: 'deal-buyer', params: { dealId }, query: { chatRoomId: roomId } }"
              class="text-xs font-medium px-2 py-1 rounded bg-blue-100 text-blue-600 hover:bg-blue-200"
            >
              거래 시작하러 가기
            </router-link>
            <span
              v-else
              class="text-xs font-medium px-2 py-1 rounded"
              :class="{
                'bg-gray-100 text-gray-600': status === '거래 전',
                'bg-blue-100 text-gray-600': status === '판매자 수락 전',
                'bg-blue-100 text-blue-600': status === '거래 시작하러 가기',
                'bg-yellow-100 text-yellow-600': status === '거래 중',
                'bg-gray-100 text-gray-500': status === '거래 완료',
              }"
            >
              {{ status }}
            </span>
          </div>
          <!-- 나가기 버튼 -->
          <Button
            variant="button9"
            class="px-2 py-1 text-xs h-auto"
            :disabled="leaving"
            @click="showModal = true"
            >{{ leaving ? '처리 중...' : '나가기' }}
          </Button>
        </div>
        <!-- 팝업 -->
        <PopupModal
          :is-visible="showModal"
          title="정말 채팅방을 나가시겠습니까?"
          message="이 작업은 되돌릴 수 없습니다."
          cancel-text="취소"
          confirm-text="확인"
          :confirm-disabled="leaving"
          @cancel="handleCancel"
          @confirm="handleConfirm"
          @close="showModal = false"
        />
      </header>
      <!-- 채팅 내용 -->
      <main
        ref="scrollArea"
        class="h-[65vh] overflow-y-auto px-4 py-2 space-y-2"
        @scroll="onScroll"
      >
        <div v-for="(msg, index) in viewMessages" :key="index" class="flex flex-col">
          <!-- 시스템 메시지: 가운데 회색 배지 -->
          <div v-if="msg.isSystem" class="self-center my-0.5">
            <span class="text-[10px] md:text-xs px-2 py-1 rounded bg-gray-100 text-gray-500">
              {{ msg.message }}
            </span>
          </div>
          <!-- 일반 말풍선 -->
          <template v-else>
            <div
              :class="[
                msg.isMine
                  ? 'self-end bg-[var(--brand-4)] text-gray-800'
                  : 'self-start bg-[var(--brand-5)] border text-gray-800',
                'rounded-lg px-3 py-2 max-w-xs text-sm leading-tight',
              ]"
            >
              <p>{{ msg.message }}</p>
            </div>
            <p
              :class="[
                msg.isMine
                  ? 'self-end text-right text-xs text-gray-500 pr-1'
                  : 'self-start text-xs text-gray-400 pl-1',
                'mt-1',
              ]"
            >
              {{ msg.createdAt || '' }}
            </p>
          </template>
        </div>
      </main>
      <!-- 입력창 -->
      <footer class="px-4 py-3 bg-white border-t flex items-center gap-2">
        <input
          v-model="newMessage"
          @keyup.enter="sendMessage"
          type="text"
          :placeholder="getPlaceholder"
          :disabled="isInputDisabled"
          class="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none"
        />
        <button
          @click="sendMessage"
          :disabled="isInputDisabled"
          class="w-10 h-10 flex items-center justify-center bg-[var(--brand-3)] text-white rounded-lg hover:bg-[var(--brand-2)]"
        >
          <i class="fas fa-paper-plane text-base"></i>
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useChatStore } from '@/stores/chat/chat'
import { useStomp } from '@/utils/useStomp'
import { useAuthStore } from '@/stores/auth/auth'
import axios from 'axios'

import Button from '@/components/common/Button.vue'
import PopupModal from '@/components/common/PopupModal.vue'

const route = useRoute()
const router = useRouter()
const chatStore = useChatStore()
const authStore = useAuthStore()
const { connect, subscribeRoom, unsubscribeRoom, disconnect, connected } = useStomp()
const roomId = computed(() => String(route.params.roomId || ''))

const userStr = localStorage.getItem('user')
const user = userStr ? JSON.parse(userStr) : null

// email만 꺼내기
const email = user?.email || null
console.log('멤버email: ' + email)

//const myUserId = await chatStore.fetchMemberIdByEmail(email)
const myUserId = ref('')

//나가기 모달
const showModal = ref(false)
const leaving = ref(false)

const isSeller = ref(false) // 'BUYER' or 'SELLER'
const isActive = ref(false) // 거래 활성화 toggle
const statusRaw = ref('') // 거래 상태 원본 값: 'BEFORE_TRANSACTION', 'BEFORE_OWNER', 'BEFORE_CONSUMER', 'MIDDLE_DEAL', 'CLOSE_DEAL' 등
const status = ref('') // 거래 상태 : '거래 전', '거래 중', '거래 완료' 등

const otherNickname = ref('') //대화 상대방 닉네임
const buildingName = ref('')
const sellerType = ref('') // or '세입자'
const sellerVisible = ref(1) // 1: 보임, 0: 나감
const consumerVisible = ref(1) // 1: 보임, 0: 나감
const dealId = ref('')

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
  if (['BEFORE_CONSUMER'].includes(v)) return '거래 시작하러 가기'
  if (['MIDDLE_DEAL'].includes(v)) return '거래 중'
  if (['CLOSE_DEAL'].includes(v)) return '거래 완료'

  return String(raw) // 그대로 표시
}

async function fetchRoomMeta() {
  try {
    const { data } = await axios.get(`/api/chat/room/info/${roomId.value}`)
    // 응답 형태가 {room: {...}} 또는 바로 {...} 둘 다 대응
    const r = data?.room ?? data ?? {}
    console.log('fetchRoomMeta : 방 정보:', r)

    sellerVisible.value = Number(r.sellerVisible ?? 1)
    consumerVisible.value = Number(r.consumerVisible ?? 1)

    // 내가 판매자인지 계산
    const iAmSeller = myUserId.value && r.sellerId && myUserId.value === r.sellerId
    isSeller.value = iAmSeller
    console.log('isSeller : ', isSeller.value)

    // 헤더
    buildingName.value = r.buildingName ?? ''
    sellerType.value = mapSellerType(r.sellerType)
    otherNickname.value = iAmSeller ? r.consumerNickname ?? '' : r.sellerNickname ?? ''

    // 거래 활성화 토글 관련
    const raw = String(r.status ?? '').toUpperCase()
    statusRaw.value = raw
    status.value = mapDealStatus(raw)

    // 거래 활성화 초기 상태(요구사항대로)
    isActive.value = ['BEFORE_CONSUMER', 'MIDDLE_DEAL'].includes(statusRaw.value)

    dealId.value = r.dealId || '' // 거래 ID
  } catch (e) {
    console.error('방 로딩 실패:', e)
  }
}

watch(statusRaw, (v) => {
  if (['BEFORE_TRANSACTION', 'BEFORE_OWNER'].includes(v)) {
    isActive.value = false
  } else if (['BEFORE_CONSUMER', 'MIDDLE_DEAL'].includes(v)) {
    isActive.value = true
  } else {
    // CLOSE_DEAL 등
    isActive.value = false
  }
})

// 토글 클릭 핸들러
function handleToggle(e) {
  const checked = e.target.checked
  console.log('거래 활성화 토글 클릭: dealId', dealId.value)
  // 활성화가 꺼진 상태(= BEFORE_TRANSACTION/BEFORE_OWNER)에서만 클릭 가능
  if (['BEFORE_TRANSACTION', 'BEFORE_OWNER'].includes(statusRaw.value) && checked) {
    if (!dealId.value) {
      console.warn('dealId 없음: /deal/seller 경로로 이동 불가')
      return
    }

    router.push({
      name: 'deal-seller',
      params: {
        dealId: dealId.value,
      },
      query: {
        chatRoomId: roomId.value, // 채팅방 id 전달
      },
    })
  }
}

const getPlaceholder = computed(() => {
  if (isSeller.value && consumerVisible.value === 0) {
    return '구매자가 채팅방을 나갔습니다.'
  }
  if (!isSeller.value && sellerVisible.value === 0) {
    return '판매자가 채팅방을 나갔습니다.'
  }
  return '메시지를 입력하세요...'
})

const isInputDisabled = computed(() => {
  // 상대방이 나간 경우에만 입력 막기
  return (
    (isSeller.value && consumerVisible.value === 0) ||
    (!isSeller.value && sellerVisible.value === 0)
  )
})

const messages = computed(() => chatStore.messages)
const scrollArea = ref(null)
const isLoadingOlder = ref(false)
const hasMore = ref(true) // 더 불러올 수 있는지 (서버에서 빈 배열이면 false)

const scrollToBottom = async () => {
  await nextTick()
  const el = scrollArea.value
  if (el) el.scrollTop = el.scrollHeight
}

// 화면용: 정렬 방향(isMine) 붙이기
const viewMessages = computed(() => {
  const arr = Array.isArray(messages.value) ? messages.value : []

  return arr.map((m, i) => {
    const isMine =
      !m?.isSystem && String(m?.senderId ?? '') === String(myUserId?.value ?? myUserId ?? '')

    // 여기서 마음껏 찍기
    console.log('[viewMessages]', i, {
      msgId: m?.chatMessageId,
      senderId: m?.senderId,
      myUserId: myUserId?.value ?? myUserId,
      isMine,
    })

    return { ...m, isMine }
  })
})

// 자동 스크롤(새 메시지 들어오면 아래로)
watch(
  () => messages.value.length,
  async () => {
    await scrollToBottom()
  }
)

const handleCancel = () => {
  showModal.value = false
}

const handleConfirm = async () => {
  if (leaving.value) return
  leaving.value = true
  try {
    const ok = await chatStore.leaveChatRoom()
    showModal.value = false
    // 목록 화면으로 이동
    router.replace('/chat/list')
  } catch (err) {
    // 실패: 모달은 닫지 않고 사용자에게 알림
    alert('채팅방 나가기에 실패했습니다. 다시 시도해 주세요.')
  } finally {
    leaving.value = false
  }
}

const senderUserId = ref('')
//////////////////////////
// function subscribeCurrentRoom() {
//   if (!connected.value || !roomId.value) return
//   subscribeRoom(roomId.value, async (message) => {
//     console.log('원본 메시지 수신:', message)

//     // 시스템 메시지일 때 키워드 감지
//     if (message?.isSystem) {
//       console.log('거래 상태 변경 감지 : 새로고침')
//       await fetchRoomMeta()
//     }

//     // pushIncoming 하기 전에 senderId를 변환
//     let processedMessage = { ...message }

//     if (message.senderId && !message.isSystem) {
//       // senderId가 email인지 확인하고 ID로 변환
//       if (message.senderId.includes('@')) {
//         try {
//           const memberId = await chatStore.fetchMemberIdByEmail(message.senderId)
//           senderUserId.value = memberId // 변환된 ID 저장
//           processedMessage.senderId = senderUserId.value // email을 ID로 교체
//           console.log('senderId 변환:', message.senderId, '->', senderUserId.value)
//         } catch (error) {
//           console.error('senderId 변환 실패:', error)
//         }
//       }
//     }

//     // 변환된 메시지로 스토어에 저장
//     const normalized = chatStore.pushIncoming(processedMessage)
//     console.log('변환된 메시지 저장:', normalized)

//     // 내가 보낸 게 아니고 시스템 메시지도 아닐 때만 읽음 처리
//     if (
//       !normalized?.isSystem &&
//       normalized?.senderId &&
//       String(normalized.senderId) !== String(myUserId.value)
//     ) {
//       chatStore.markAsRead()
//     }
//   })
// }

// ===== 시스템 메시지 판별 & 스로틀 =====
function isSystemMsg(m) {
  if (!m) return false
  const type = String(m.type ?? '').toUpperCase()
  if (type === 'SYSTEM') return true
  const sid = (m.senderId ?? m.sender_id ?? m?.sender?.id ?? '').toString().toLowerCase()
  if (sid === 'system') return true
  return m.isSystem === true
}

let lastMetaAt = 0
async function fetchRoomMetaThrottled() {
  const now = Date.now()
  if (now - lastMetaAt < 800) return
  lastMetaAt = now
  await fetchRoomMeta()
}

function subscribeCurrentRoom() {
  if (!connected.value || !roomId.value) return

  // (선택) 혹시라도 중복 구독 막고 싶으면:
  // unsubscribeRoom(roomId.value)

  subscribeRoom(roomId.value, async (message) => {
    console.log('원본 메시지 수신:', message)

    // [1차 감지] pushIncoming 전에 보수적으로 시스템 체크
    if (isSystemMsg(message)) {
      console.log('거래 상태 변경 감지(전): 메타 새로고침')
      await fetchRoomMetaThrottled()
    }

    // 이메일 -> ID 변환 (시스템 메시지는 제외)
    let processedMessage = { ...message }
    if (message?.senderId && !isSystemMsg(message) && String(message.senderId).includes('@')) {
      try {
        const memberId = await chatStore.fetchMemberIdByEmail(message.senderId)
        processedMessage.senderId = memberId
        console.log('senderId 변환:', message.senderId, '->', memberId)
      } catch (error) {
        console.error('senderId 변환 실패:', error)
      }
    }

    // 스토어 반영
    const normalized = chatStore.pushIncoming(processedMessage)
    console.log('정규화된 메시지:', normalized)

    // [2차 감지] 정규화 후 다시 확인
    if (isSystemMsg(normalized)) {
      console.log('거래 상태 변경 감지(후): 메타 새로고침')
      await fetchRoomMetaThrottled()
    }

    // 읽음 처리(내가 보낸 거/시스템 제외)
    if (
      !isSystemMsg(normalized) &&
      normalized?.senderId &&
      String(normalized.senderId) !== String(myUserId.value)
    ) {
      chatStore.markAsRead()
    }
  })
}

// 컴포넌트 onMounted에서 상태 확인
onMounted(async () => {
  console.log('=== onMounted 시작 ===')

  // 사용자 ID 확인
  myUserId.value = await chatStore.fetchMemberIdByEmail(email)
  console.log('사용자 ID:', myUserId.value)
  console.log('이메일:', email)

  // 방 정보 확인
  await fetchRoomMeta()
  console.log('방 ID:', roomId.value)

  // STOMP 연결
  await connect(async () => {
    console.log('STOMP 연결 완료')
    subscribeCurrentRoom()
    await chatStore.markAsRead()
  })

  // 메시지 로드
  const loaded = await chatStore.loadInitialMessages(30)
  await scrollToBottom()
  hasMore.value = loaded > 0

  console.log('=== onMounted 완료 ===')
})

// 동일 컴포넌트 내에서 route만 변경될 때를 대비
watch(
  () => roomId.value,
  async (newId, oldId) => {
    if (oldId) unsubscribeRoom(oldId)
    if (newId && connected.value) subscribeCurrentRoom()
    await fetchRoomMeta() // 방 바뀌면 헤더 갱신
    const loaded = await chatStore.loadInitialMessages(30)
    await scrollToBottom()
    hasMore.value = loaded > 0
  }
)

// ★ 스크롤 핸들러: 위로 당기면 이전 메시지 더 불러오기
async function onScroll() {
  const el = scrollArea.value
  if (!el || isLoadingOlder.value || !hasMore.value) return
  if (el.scrollTop <= 50) {
    isLoadingOlder.value = true
    const prevHeight = el.scrollHeight
    const prevTop = el.scrollTop
    const loaded = await chatStore.loadOlderMessages(30)
    hasMore.value = loaded > 0
    await nextTick()
    // 스크롤 위치 보정 (점프 방지)
    el.scrollTop = el.scrollHeight - prevHeight + prevTop
    isLoadingOlder.value = false
  }
}

onUnmounted(() => {
  if (roomId.value) unsubscribeRoom(roomId.value)
  disconnect() // 화면 떠날 때 완전히 끊고 싶으면 유지
})

const newMessage = ref('')
// 컴포넌트의 sendMessage 함수 수정
const sendMessage = async () => {
  if (isInputDisabled.value) {
    alert(getPlaceholder.value)
    return
  }

  const text = newMessage.value.trim()
  if (!text) {
    console.log('빈 메시지입니다.')
    return
  }

  try {
    console.log('메시지 전송 시작:', text)
    await chatStore.sendMessage(text)
    newMessage.value = ''
    await scrollToBottom()
    console.log('메시지 전송 성공')
  } catch (error) {
    console.error('메시지 전송 실패:', error)
    // 사용자에게 에러 알림
    alert('메시지 전송에 실패했습니다. 다시 시도해주세요.')
  }
}
</script>
