import { ref, computed, watch } from 'vue'
import { useRoute, onBeforeRouteUpdate } from 'vue-router'
import { defineStore } from 'pinia'
import { useStomp } from '@/utils/useStomp'
import { useAuthStore } from '@/stores/auth/auth'
import axios from 'axios'
import { a } from '../../../project/zangBu_Back/src/main/resources/assets/index-Ci5mVUka'

// 보낸사람 ID 후보를 senderId로 통일
function getSenderId(m) {
  const candidates = [m.senderId, m.userId, m.memberId, m.sender_id, m?.sender?.id].filter(Boolean)
  return candidates.length ? String(candidates[0]).trim() : null
}

function getType(m) {
  const t = String(m?.type || '').toUpperCase()
  if (t === 'SYSTEM') return 'SYSTEM'
  // REST로 받은 과거 메시지엔 type이 없을 수 있음 → senderId로 판별
  const isSystemSender = String(m?.senderId || '').toLowerCase() === 'system'
  return isSystemSender ? 'SYSTEM' : 'USER'
}

function normalizeMessage(m) {
  const type = getType(m)
  return {
    ...m,
    type,
    isSystem: type === 'SYSTEM',
    senderId: getSenderId(m), // 통일!
  }
}

export const useChatStore = defineStore('chat', () => {
  const chatRooms = ref([])
  const currentChat = ref(null)
  const messages = ref([])
  const unreadCount = ref(0)
  const route = useRoute()
  const roomId = computed(() => String(route.params.roomId || ''))
  const { sendToRoom, subscribeRoom, unsubscribeRoom, connected } = useStomp()
  const oldestMessageId = ref(null) //가장 오래 로드된(리스트 맨 앞) 메시지 id 기억 → 더보기 요청용

  const authStore = useAuthStore()
  const myUserEmail = computed(() => authStore.user?.email || '')
  const myUserId = ref('')
  // 이메일이 변경될 때마다 userId 업데이트
  watch(
    myUserEmail,
    async (newEmail) => {
      if (newEmail && newEmail.includes('@')) {
        try {
          console.log('🔄 이메일 변경 감지, UUID 조회:', newEmail)
          const userId = await fetchMemberIdByEmail(newEmail)
          myUserId.value = userId
          console.log('✅ UUID 설정 완료:', userId)
        } catch (error) {
          console.error('❌ UUID 조회 실패:', error)
          myUserId.value = newEmail // 실패시 이메일 사용
        }
      } else {
        myUserId.value = ''
      }
    },
    { immediate: true }
  ) // immediate: true로 즉시 실행

  // 채팅방 목록 조회 로직
  async function getChatRooms(type = 'ALL') {
    try {
      const res = await axios.get('/api/chat/list', { params: { type } })
      chatRooms.value = res.data.result
    } catch (err) {
      console.error('채팅방 목록 조회 실패:', err)
    }
  }

  //서버는 최신부터(DESC) 반환 → 여기서 reverse()로 ASC로 맞춤
  async function fetchMessages(lastMessageId = null, limit = 5) {
    const { data } = await axios.get(`/api/chat/room/${roomId.value}`, {
      params: { lastMessageId, limit },
    })
    const list = Array.isArray(data) ? data : []
    return list.reverse().map(normalizeMessage) // 오래→최근 순으로 변환
  }

  // 최초 로드: 화면엔 오래→최근, 스크롤은 맨 아래로
  async function loadInitialMessages(limit = 5) {
    try {
      const asc = await fetchMessages(null, limit)
      messages.value = asc
      oldestMessageId.value = asc[0]?.chatMessageId ?? null
      currentChat.value = { chatRoomId: roomId.value }
      return asc.length
    } catch (err) {
      console.error('초기 메시지 로드 실패:', err)
      messages.value = []
      oldestMessageId.value = null
      return 0
    }
  }

  // 더보기(위로 스크롤): 가장 오래 로드된 id보다 더 오래된 묶음을 앞쪽에 붙임
  async function loadOlderMessages(limit = 30) {
    if (!oldestMessageId.value) return 0
    try {
      const olderAsc = await fetchMessages(oldestMessageId.value, limit)
      if (olderAsc.length === 0) return 0
      messages.value = [...olderAsc, ...messages.value]
      oldestMessageId.value = messages.value[0]?.chatMessageId ?? oldestMessageId.value
      return olderAsc.length
    } catch (err) {
      console.error('이전 메시지 로드 실패:', err)
      return 0
    }
  }

  // 메시지 전송 로직
  async function sendMessage(message) {
    try {
      // STOMP 연결 상태 확인
      if (!connected.value) {
        console.error('STOMP 연결이 끊어져 있습니다.')
        throw new Error('STOMP_NOT_CONNECTED')
      }

      // 메시지 유효성 검사
      if (!message || !message.trim()) {
        console.error('빈 메시지는 전송할 수 없습니다.')
        return
      }

      // roomId 확인
      if (!roomId.value) {
        console.error('roomId가 없습니다.')
        throw new Error('NO_ROOM_ID')
      }

      // userId 확인 및 타입 변환
      const userId = myUserId.value
      if (!userId) {
        console.error('사용자 ID가 없습니다.')
        throw new Error('NO_USER_ID')
      }

      // ===== 🔥 서버 DTO에 맞는 형태로 전송 =====
      const messageData = {
        message: message.trim(),
        chatRoomId: roomId.value,
        senderId: userId,
      }

      console.log('📤 서버로 전송할 데이터:', messageData)

      // STOMP로 메시지 전송
      sendToRoom(roomId.value, messageData)

      console.log('메시지 전송 완료')
    } catch (err) {
      console.error('메시지 전송 실패:', err)
      throw err
    }
  }

  function pushIncoming(raw) {
    const msg = normalizeMessage(raw)
    messages.value.push(msg)
    return msg
  }

  // 채팅방 생성 로직
  // async function createChatRoom(buildingId) {
  //   try {
  //     const token = authStore.accessToken
  //     console.log('createChatRoom의 token: ' + token)

  //     if (!token) {
  //       console.error('[createChatRoom] accessToken이 없습니다. 로그인/저장 로직 확인!')
  //       throw new Error('NO_ACCESS_TOKEN')
  //     }

  //     const res = await axios.post(`/api/chat/room/${buildingId}`, {
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Authorization: `Bearer ${token}`,
  //       },
  //     })
  //     console.log('createChatRoom result:', res.data)
  //     return res.data // 생성된 채팅방 ChatRoom 반환
  //   } catch (err) {
  //     console.error('채팅방 생성 실패:', err)
  //     throw err
  //   }
  // }
  async function reissueAccessToken() {
    // refreshToken이 HttpOnly 쿠키라면 이 호출에서 쿠키가 서버로 가야 함
    const { data } = await axios.post('/api/auth/reissue', {}, { withCredentials: true })
    const token = data?.accessToken
    if (!token) throw new Error('REISSUE_NO_TOKEN')
    localStorage.setItem('accessToken', token)
    return token
  }

  async function createChatRoom(buildingId, memberId) {
    const doRequest = async (token) => {
      console.log('[createChatRoom] Using token(head)=', token?.slice(0, 12), 'len=', token?.length)
      const res = await axios.post(
        `/api/chat/room/${buildingId}`,
        { consumerId: memberId },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // ★ 여기서 붙임
          },
        }
      )
      return res
    }

    let token = authStore.accessToken
    console.log('[createChatRoom] authStore.accessToken:', token)

    // 1차 시도
    if (token) {
      try {
        const { data } = await doRequest(token)
        return data
      } catch (err) {
        if (err?.response?.status !== 401) throw err
        console.warn('[createChatRoom] 401 → 토큰 만료로 보고 재발급 진행')
      }
    } else {
      console.warn('[createChatRoom] 저장된 accessToken 없음 → 재발급 시도')
    }

    // 2차: 재발급 후 재시도
    token = await reissueAccessToken()
    const { data } = await doRequest(token)
    return data
  }

  async function fetchMemberIdByEmail(email) {
    const res = await axios.get('/api/chat/id', { params: { email } })

    // 실제 키가 무엇인지 확인 후 맞춰 반환
    const data = res.data
    const memberId = data?.memberId ?? data?.member_id ?? data?.id ?? null

    if (!memberId) {
      throw new Error('응답에 memberId가 없음')
    }
    return String(memberId)
  }

  //채팅방 삭제 로직
  async function deleteChatRoom(roomId) {
    try {
      await axios.delete(`/api/chat/room/${roomId}`)
      // 성공적으로 삭제되면 목록에서 제거
      chatRooms.value = chatRooms.value.filter((r) => r.chatRoomId !== roomId)
      if (currentChat.value?.chatRoomId === roomId) {
        currentChat.value = null
        messages.value = []
        oldestMessageId.value = null
      }
    } catch (err) {
      console.error('채팅방 삭제 실패:', err)
      throw err
    }
  }

  // 채팅방 나가기 로직
  async function leaveChatRoom() {
    const id = roomId.value
    if (!id) return

    // 1) 낙관적 UI: 목록/카운트/현재방 상태를 미리 정리
    const prevRooms = [...chatRooms.value]
    const roomIdx = chatRooms.value.findIndex((r) => r.chatRoomId === id)
    const prevRoom = roomIdx >= 0 ? { ...chatRooms.value[roomIdx] } : null

    // 목록에서 제거 & 현재방/메시지 초기화
    chatRooms.value = chatRooms.value.filter((r) => r.chatRoomId !== id)
    if (currentChat.value?.chatRoomId === id) {
      currentChat.value = null
      messages.value = []
      oldestMessageId.value = null
    }

    try {
      await axios.patch(
        `/api/chat/list/exit/${id}`,
        {}, // 본문 없음 → {}로 JSON 보냄
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authStore.accessToken}`,
          },
          withCredentials: true, // refreshToken 쿠키 사용 시 필요
        }
      )

      unsubscribeRoom(id) // STOMP 구독 해제

      // 4) 남은 구독 없으면 소켓 연결 종료(선택 사항)
      if ((typeof getActiveRooms === 'function' && getActiveRooms()?.length === 0) || false) {
        // connected는 readonly ref 라서 길이만 체크
        // 필요 시 자동 재연결을 막고 싶다면 아래 호출
        // disconnect()

        // 성공적으로 종료됨
        return true
      }
    } catch (err) {
      console.error('채팅방 나가기 실패:', err)
      // 실패 시 낙관적 UI 롤백
      if (roomIdx >= 0) {
        // 삭제했던 방 되돌리기
        chatRooms.value = [...prevRooms]
      }
      if (prevRoom) {
        currentChat.value = { chatRoomId: id }
        // 메시지까지 복원할 필요가 있다면, 필요 시 서버 재조회
      }

      throw err
    }
  }

  // 읽음 처리 로직
  async function markAsRead() {
    try {
      await axios.put(
        `/api/chat/room/${roomId.value}/read`,
        {}, // ← 빈 본문이라도 {}를 보내면 JSON로 안전
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authStore.accessToken}`,
          },
          withCredentials: true, // refreshToken을 쿠키로 쓰는 경우 대비
        }
      )
      const room = chatRooms.value.find((r) => r.chatRoomId === roomId.value)
      if (room) room.unreadCount = 0
    } catch (err) {
      console.error('읽음 처리 실패:', err)
    }
  }

  //채팅방 존재하는지 확인
  async function existChatRoom(buildingId, consumerId) {
    try {
      const res = await axios.get(`/api/chat/room/${buildingId}/${consumerId}`)
      return { exists: res.data.exists, chatRoomId: res.data.chatRoomId }
    } catch (err) {
      console.error('채팅방 존재 여부 확인 실패:', err)
    }
  }

  return {
    chatRooms,
    currentChat,
    messages,
    unreadCount,
    oldestMessageId,
    myUserId,
    getChatRooms,
    loadInitialMessages,
    loadOlderMessages,
    sendMessage,
    createChatRoom,
    leaveChatRoom,
    deleteChatRoom,
    markAsRead,
    pushIncoming,
    existChatRoom,
    fetchMemberIdByEmail,
  }
})
