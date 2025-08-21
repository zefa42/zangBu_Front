<template>
  <div
    class="property-card-waiting"
    :class="{ 'completed-deal': property.dealStatusEnum === 'CLOSE_DEAL' }"
  >
    <!-- Header with waiting status -->
    <div class="card-header">
      <div class="waiting-badge" :style="{ background: getBadgeColor(property.dealStatusEnum) }">
        <i :class="getStatusIcon(property.dealStatusEnum)" class="waiting-icon"></i>
        <span class="waiting-text">{{ getStatusText(property.dealStatusEnum) }}</span>
      </div>
    </div>

    <!-- Property image with waiting overlay -->
    <div class="image-container">
      <img
        :src="authenticatedImageUrl || property.imageUrl || '/default-property.jpg'"
        :alt="property.title || 'Property Image'"
        class="property-image"
        :class="{ 'completed-image': property.dealStatusEnum === 'CLOSE_DEAL' }"
        @error="handleImageError"
      />
      <div v-if="property.dealStatusEnum !== 'CLOSE_DEAL'" class="waiting-overlay">
        <i :class="getStatusIcon(property.dealStatusEnum)" class="overlay-icon"></i>
        <span class="overlay-text">{{ getStatusText(property.dealStatusEnum) }}</span>
      </div>
      <div v-if="property.dealStatusEnum === 'CLOSE_DEAL'" class="completed-overlay">
        <i class="fas fa-check-circle overlay-icon completed-icon"></i>
        <span class="overlay-text completed-text">거래 완료</span>
      </div>
    </div>

    <!-- Property details -->
    <div class="details-container">
      <h3 class="property-title">{{ property.buildingName || '스카이빌' }}</h3>

      <div class="price-info">
        <span class="price-text">{{ formatPrice(property.price) || '7억 5천만원' }}</span>
      </div>

      <div class="location-info">
        <i class="fas fa-map-marker-alt location-icon"></i>
        <span class="location-text">{{ property.address || '서울시 광진구' }}</span>
      </div>

      <div class="property-type-info">
        <span class="property-type">{{ property.houseType || '아파트' }}</span>
        <span class="sale-type">{{ property.saleType || '매매' }}</span>
      </div>

      <div class="waiting-info">
        <i class="fas fa-info-circle info-icon"></i>
        <span class="waiting-info-text">{{ getStatusDescription(property.dealStatusEnum) }}</span>
      </div>

      <div class="submitted-date">
        {{ property.createdAt || '1일 전 등록' }}
      </div>

      <!-- Progress indicator -->
      <div class="progress-container">
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{
              width: getProgressWidth(property.dealStatusEnum),
              background: getProgressColor(property.dealStatusEnum),
            }"
          ></div>
        </div>
        <span class="progress-text">{{ getProgressText(property.dealStatusEnum) }}</span>
      </div>

      <!-- Action buttons for waiting state -->
      <div class="action-buttons">
        <!-- 거래 진행 중일 때의 버튼들 -->
        <template v-if="property.dealStatusEnum !== 'CLOSE_DEAL'">
          <!-- 수락 페이지 버튼 - 거래 진행 중일 때만 표시 -->
          <button
            @click="handleAcceptance"
            :class="['primary-button', { 'disabled-button': isAcceptanceButtonDisabled }]"
            :disabled="isAcceptanceButtonDisabled"
            :title="getAcceptanceButtonTooltip()"
          >
            {{ getAcceptanceButtonText() }}
          </button>

          <!-- 채팅 버튼 - 거래 진행 중일 때만 표시 -->
          <button
            @click="handleChat"
            :class="['chat-button', { 'disabled-button': isChatButtonDisabled }]"
            :disabled="isChatButtonDisabled"
            :title="getChatButtonTooltip()"
          >
            {{ getChatButtonText() }}
          </button>

          <!-- 취소 버튼 - 거래 진행 중일 때만 표시 -->
          <button @click="handleCancel" class="secondary-button" title="거래를 취소합니다">
            취소하기
          </button>
        </template>

        <!-- 거래 완료 상태일 때의 버튼들 -->
        <template v-if="property.dealStatusEnum === 'CLOSE_DEAL'">
          <!-- 거래 내역 보기 버튼 -->
          <button
            @click="handleViewDetails"
            class="primary-button completed-button"
            title="거래 내역을 확인합니다"
          >
            거래 내역 보기
          </button>
          <!-- 리뷰 작성 버튼 -->
          <button
            @click="handleReview"
            class="secondary-button completed-button"
            title="거래에 대한 리뷰를 작성합니다"
          >
            리뷰 작성
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed, ref, onMounted, watch } from 'vue'
import { getObject, createSignedUrl } from '@/utils/ncp-object-storage-service.js'

const props = defineProps({
  property: {
    type: Object,
    required: true,
    default: () => ({
      buildingId: null,
      buildingName: '',
      address: '',
      imageUrl: '',
      price: '',
      dealStatus: '대기중',
      createdAt: '',
      saleType: '',
      houseType: '',
      dealId: null,
      userRole: '',
      dealStatusEnum: '',
      chatRoomId: null, // 채팅방 ID 추가
    }),
  },
})

const emit = defineEmits([
  'edit',
  'cancel',
  'viewDetails',
  'review',
  'acceptance',
  'chat',
  'completeDeal',
])

// NCP 인증 관련 상태
const authenticatedImageUrl = ref(null)

// NCP URL에서 버킷과 오브젝트 이름 추출
const extractNcpInfo = (url) => {
  try {
    const urlObj = new URL(url)
    if (urlObj.hostname === 'kr.object.ncloudstorage.com') {
      const pathParts = urlObj.pathname.split('/').filter((part) => part)
      if (pathParts.length >= 2) {
        return {
          bucketName: pathParts[0],
          objectName: pathParts.slice(1).join('/'),
        }
      }
    }
  } catch (error) {
    console.error('Failed to parse NCP URL:', error)
  }
  return null
}

// 이미지 URL 처리
const processImageUrl = async () => {
  if (!props.property.imageUrl) {
    authenticatedImageUrl.value = null
    return
  }

  // NCP Object Storage URL인지 확인
  if (props.property.imageUrl.includes('ncloudstorage.com')) {
    const ncpInfo = extractNcpInfo(props.property.imageUrl)
    if (ncpInfo) {
      try {
        // 서명된 URL 생성 (CORS 우회)
        const signedUrl = createSignedUrl(ncpInfo.bucketName, ncpInfo.objectName)
        authenticatedImageUrl.value = signedUrl
      } catch (error) {
        console.error('Failed to create signed URL:', error)
        authenticatedImageUrl.value = props.property.imageUrl
      }
    } else {
      authenticatedImageUrl.value = props.property.imageUrl
    }
  } else {
    authenticatedImageUrl.value = props.property.imageUrl
  }
}

// 이미지 로드 에러 처리
const handleImageError = () => {
  authenticatedImageUrl.value = null
}

// 컴포넌트 마운트 시 이미지 URL 처리
onMounted(() => {
  processImageUrl()
})

// 이미지 URL 변경 시 재처리
watch(
  () => props.property.imageUrl,
  () => {
    processImageUrl()
  }
)

// ===== 가격 포맷팅 =====

// 가격을 만원/억 단위로 포맷팅
const formatPrice = (price) => {
  if (!price) return null

  // 숫자로 변환 (문자열 제거)
  const numPrice = parseInt(price.toString().replace(/[^\d]/g, ''))

  if (isNaN(numPrice)) return null

  // 억 단위로 변환
  if (numPrice >= 10000) {
    const billion = Math.floor(numPrice / 10000)
    const million = numPrice % 10000

    if (million === 0) {
      return `${billion}억원`
    } else {
      return `${billion}억 ${million}만원`
    }
  } else {
    // 만원 단위
    return `${numPrice}만원`
  }
}

// ===== 버튼 활성화/비활성화 상태 =====

// 수락 페이지 버튼 비활성화 여부
const isAcceptanceButtonDisabled = computed(() => {
  const { dealStatusEnum, userRole } = props.property

  // 거래 전 상태일 때 비활성화
  if (dealStatusEnum === 'BEFORE_TRANSACTION') {
    return true
  }

  // 판매자: BEFORE_CONSUMER 상태일 때 비활성화 (구매자 수락 대기)
  if (userRole === 'seller' && dealStatusEnum === 'BEFORE_CONSUMER') {
    return true
  }

  // MIDDLE_DEAL 상태에서는 거래 완료 버튼 활성화 (판매자, 구매자 모두)
  // if (userRole === 'seller' && dealStatusEnum === 'MIDDLE_DEAL') {
  //   return true
  // }

  // 구매자: BEFORE_OWNER 상태일 때 비활성화 (판매자 수락 대기)
  if ((userRole === 'consumer' || userRole === 'buyer') && dealStatusEnum === 'BEFORE_OWNER') {
    return true
  }

  // 거래 완료 상태일 때 비활성화
  if (dealStatusEnum === 'CLOSE_DEAL') {
    return true
  }

  return false
})

// 채팅 버튼 비활성화 여부
const isChatButtonDisabled = computed(() => {
  const { dealStatusEnum, userRole } = props.property

  // 거래 완료 상태일 때 비활성화
  if (dealStatusEnum === 'CLOSE_DEAL') {
    return true
  }

  return false
})

// ===== 버튼 텍스트 및 툴팁 =====

// 수락 페이지 버튼 텍스트
const getAcceptanceButtonText = () => {
  const { dealStatusEnum, userRole } = props.property

  if (userRole === 'seller' && dealStatusEnum === 'BEFORE_OWNER') {
    return '거래 수락하기'
  }

  if ((userRole === 'consumer' || userRole === 'buyer') && dealStatusEnum === 'BEFORE_CONSUMER') {
    return '거래 수락하기'
  }

  if (dealStatusEnum === 'MIDDLE_DEAL') {
    return '거래 완료'
  }

  // 비활성화 상태일 때는 대기 중임을 표시
  if (isAcceptanceButtonDisabled.value) {
    if (dealStatusEnum === 'BEFORE_TRANSACTION') {
      return '거래 전'
    }
    if (userRole === 'seller' && dealStatusEnum === 'BEFORE_CONSUMER') {
      return '구매자 수락 대기'
    }
    if (userRole === 'seller' && dealStatusEnum === 'MIDDLE_DEAL') {
      return '구매자 수락 대기'
    }
    if ((userRole === 'consumer' || userRole === 'buyer') && dealStatusEnum === 'BEFORE_OWNER') {
      return '판매자 수락 대기'
    }
  }

  return '거래 수락하기'
}

// 수락 페이지 버튼 툴팁
const getAcceptanceButtonTooltip = () => {
  const { dealStatusEnum, userRole } = props.property

  if (userRole === 'seller' && dealStatusEnum === 'BEFORE_OWNER') {
    return '구매자의 거래 요청을 수락합니다'
  }

  if ((userRole === 'consumer' || userRole === 'buyer') && dealStatusEnum === 'BEFORE_CONSUMER') {
    return '판매자의 거래 요청을 수락합니다'
  }

  if (dealStatusEnum === 'MIDDLE_DEAL') {
    return '거래를 완료합니다'
  }

  // 비활성화 상태일 때는 대기 중임을 표시
  if (isAcceptanceButtonDisabled.value) {
    if (dealStatusEnum === 'BEFORE_TRANSACTION') {
      return '거래가 시작되지 않았습니다'
    }
    if (userRole === 'seller' && dealStatusEnum === 'BEFORE_CONSUMER') {
      return '구매자의 수락을 기다리는 중입니다'
    }
    if (userRole === 'seller' && dealStatusEnum === 'MIDDLE_DEAL') {
      return '구매자의 수락을 기다리는 중입니다'
    }
    if ((userRole === 'consumer' || userRole === 'buyer') && dealStatusEnum === 'BEFORE_OWNER') {
      return '판매자의 수락을 기다리는 중입니다'
    }
  }

  return '거래를 수락하려면 클릭하세요'
}

// 채팅 버튼 텍스트
const getChatButtonText = () => {
  const { dealStatusEnum, userRole } = props.property

  if (dealStatusEnum === 'CLOSE_DEAL') {
    return '채팅 불가'
  }

  return '채팅하기'
}

// 채팅 버튼 툴팁
const getChatButtonTooltip = () => {
  const { dealStatusEnum, userRole } = props.property

  if (dealStatusEnum === 'CLOSE_DEAL') {
    return '거래가 완료되어 채팅이 불가능합니다'
  }

  return '채팅방으로 이동합니다'
}

// 거래 상태에 따른 텍스트 반환 (사용자 역할 고려)
const getStatusText = (dealStatus) => {
  const userRole = props.property.userRole

  switch (dealStatus) {
    case 'BEFORE_OWNER':
      return userRole === 'seller' ? '구매자 수락 대기' : '판매자 수락 대기'
    case 'BEFORE_CONSUMER':
      return userRole === 'seller' ? '구매자 수락 대기' : '구매자 수락 대기'
    case 'MIDDLE_DEAL':
      return '거래 중'
    case 'CLOSE_DEAL':
      return '거래 성사'
    default:
      return '대기중'
  }
}

// 거래 상태에 따른 설명 반환 (사용자 역할 고려)
// 거래 상태에 따른 설명 반환 (사용자 역할 고려)
const getStatusDescription = (dealStatus) => {
  const userRole = props.property.userRole

  switch (dealStatus) {
    case 'BEFORE_OWNER':
      return userRole === 'seller'
        ? '구매자의 수락을 기다리는 중입니다'
        : '판매자의 수락을 기다리는 중입니다'

    case 'BEFORE_CONSUMER':
      return userRole === 'seller'
        ? '구매자의 수락을 기다리는 중입니다'
        : '구매자의 수락을 기다리는 중입니다'

    case 'MIDDLE_DEAL':
      return '거래가 진행 중입니다. 서류를 준비해주세요'
    case 'CLOSE_DEAL':
      return '거래가 성사되었습니다'
    default:
      return '거래 진행 중입니다'
  }
}

// 거래 상태에 따른 진행률 반환
const getProgressWidth = (dealStatus) => {
  switch (dealStatus) {
    case 'BEFORE_OWNER':
      return '25%'
    case 'BEFORE_CONSUMER':
      return '50%'
    case 'MIDDLE_DEAL':
      return '75%'
    case 'CLOSE_DEAL':
      return '100%'
    default:
      return '25%'
  }
}

// 거래 상태에 따른 진행 텍스트 반환 (사용자 역할 고려)
// 거래 상태에 따른 진행 텍스트 반환 (사용자 역할 고려)
const getProgressText = (dealStatus) => {
  const userRole = props.property.userRole

  switch (dealStatus) {
    case 'BEFORE_OWNER':
      return userRole === 'seller' ? '구매자 수락 대기 중...' : '판매자 수락 대기 중...'
    case 'BEFORE_CONSUMER':
      return userRole === 'seller' ? '구매자 수락 대기 중...' : '구매자 수락 대기 중...'
    case 'MIDDLE_DEAL':
      return '거래 진행 중...'
    case 'CLOSE_DEAL':
      return '거래 완료!'
    default:
      return '승인 진행중...'
  }
}

// 거래 상태에 따른 진행률 색상 반환
const getProgressColor = (dealStatus) => {
  switch (dealStatus) {
    case 'BEFORE_OWNER':
      return 'linear-gradient(90deg, #ff9800, #f57c00)'
    case 'BEFORE_CONSUMER':
      return 'linear-gradient(90deg, #2196f3, #1976d2)'
    case 'MIDDLE_DEAL':
      return 'linear-gradient(90deg, #4caf50, #388e3c)'
    case 'CLOSE_DEAL':
      return 'linear-gradient(90deg, #28a745, #20c997)'
    default:
      return 'linear-gradient(90deg, #ff9800, #f57c00)'
  }
}

// 거래 상태에 따른 배지 색상 반환
const getBadgeColor = (dealStatus) => {
  switch (dealStatus) {
    case 'BEFORE_OWNER':
      return '#ff9800'
    case 'BEFORE_CONSUMER':
      return '#2196f3'
    case 'MIDDLE_DEAL':
      return '#4caf50'
    case 'CLOSE_DEAL':
      return '#28a745'
    default:
      return '#ff9800'
  }
}

// 거래 상태에 따른 아이콘 반환
const getStatusIcon = (dealStatus) => {
  switch (dealStatus) {
    case 'BEFORE_OWNER':
      return 'fas fa-user-check'
    case 'BEFORE_CONSUMER':
      return 'fas fa-user-clock'
    case 'MIDDLE_DEAL':
      return 'fas fa-file-contract'
    case 'CLOSE_DEAL':
      return 'fas fa-check-circle'
    default:
      return 'fas fa-clock'
  }
}

// Handle acceptance (거래 수락 페이지로 이동)
const handleAcceptance = () => {
  const { dealId, userRole, dealStatusEnum } = props.property

  // MIDDLE_DEAL 상태일 때는 거래 완료 이벤트 발생
  if (dealStatusEnum === 'MIDDLE_DEAL') {
    emit('completeDeal', props.property)
    return
  }

  // 사용자 역할과 거래 상태에 따라 적절한 거래 수락 페이지로 이동
  if (userRole === 'seller' && dealStatusEnum === 'BEFORE_OWNER') {
    // 판매자: 판매자 거래 수락 페이지
    emit('acceptance', props.property)
  } else if (
    (userRole === 'consumer' || userRole === 'buyer') &&
    dealStatusEnum === 'BEFORE_CONSUMER'
  ) {
    // 구매자: 구매자 거래 수락 페이지
    emit('acceptance', props.property)
  } else {
    // 기본값: acceptance 이벤트 발생
    emit('acceptance', props.property)
  }
}

// Handle chat (채팅방으로 이동)
const handleChat = () => {
  // chat 이벤트를 발생시켜 부모 컴포넌트에서 처리하도록 함
  emit('chat', props.property)
}

// Handle cancel
const handleCancel = () => {
  emit('cancel', props.property)
}

// Handle view details for completed deals
const handleViewDetails = () => {
  emit('viewDetails', props.property)
}

// Handle review for completed deals
const handleReview = () => {
  emit('review', props.property)
}
</script>

<style scoped>
.property-card-waiting {
  width: 500px;
  background: white;
  border-radius: 12px;
  box-shadow: 0px 4px 6px 0px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  opacity: 0.8;
  transition: opacity 0.2s ease;
}

.property-card-waiting:hover {
  opacity: 1;
}

/* Completed deal card styles */
.property-card-waiting.completed-deal {
  opacity: 0.9;
}

.property-card-waiting.completed-deal:hover {
  opacity: 1;
  transform: translateY(-2px);
  box-shadow: 0px 8px 16px 0px rgba(40, 167, 69, 0.2);
}

/* Header */
.card-header {
  padding: 16px 20px 12px 20px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.waiting-badge {
  border-radius: 20px;
  padding: 6px 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.waiting-icon {
  color: var(--text-3);
  font-size: 12px;
}

.waiting-text {
  color: var(--text-3);
  font-size: 12px;
  font-weight: bold;
  font-family: 'Roboto', sans-serif;
  line-height: 1.2;
}

/* Image with waiting overlay */
.image-container {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.property-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(30%);
}

.waiting-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.overlay-icon {
  color: var(--text-3);
  font-size: 24px;
}

.overlay-text {
  color: var(--text-3);
  font-size: 14px;
  font-weight: 600;
  font-family: 'Roboto', sans-serif;
}

/* Completed deal overlay styles */
.completed-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(40, 167, 69, 0.4);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.completed-icon {
  color: white;
  font-size: 24px;
}

.completed-text {
  color: white;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Roboto', sans-serif;
}

.completed-image {
  filter: none;
}

/* Details */
.details-container {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.property-title {
  color: var(--brand-1);
  font-size: 18px;
  font-weight: bold;
  font-family: 'Roboto', sans-serif;
  line-height: 1.4;
  margin: 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.price-info {
  margin-top: 4px;
}

.price-text {
  color: var(--brand-3);
  font-size: 20px;
  font-weight: bold;
  font-family: 'Roboto', sans-serif;
}

.location-info {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
}

.location-icon {
  color: var(--text-1);
  font-size: 14px;
}

.location-text {
  color: var(--text-2);
  font-size: 14px;
  font-weight: normal;
  font-family: 'Roboto', sans-serif;
}

.property-type-info {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.property-type {
  background: var(--brand-1);
  color: var(--text-3);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  font-family: 'Roboto', sans-serif;
}

.sale-type {
  background: var(--brand-3);
  color: var(--text-3);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  font-family: 'Roboto', sans-serif;
}

.waiting-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  margin-top: 8px;
}

.info-icon {
  color: #856404;
  font-size: 16px;
}

.waiting-info-text {
  color: #856404;
  font-size: 13px;
  font-weight: 500;
  font-family: 'Roboto', sans-serif;
  line-height: 1.4;
}

.submitted-date {
  color: var(--text-1);
  font-size: 12px;
  font-weight: normal;
  font-family: 'Roboto', sans-serif;
  margin-top: 4px;
}

/* Action buttons */
.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.primary-button {
  flex: 1;
  height: 40px;
  background: var(--brand-3);
  border-radius: 8px;
  border: none;
  cursor: pointer;
  color: var(--text-3);
  font-size: 14px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  transition: background-color 0.2s ease;
}

.primary-button:hover {
  background: var(--brand-2);
}

/* 비활성화된 버튼 스타일 */
.primary-button.disabled-button {
  background: var(--bg-1);
  color: var(--text-2);
  cursor: not-allowed;
  opacity: 0.6;
}

.primary-button.disabled-button:hover {
  background: var(--bg-1);
  color: var(--text-2);
  cursor: not-allowed;
}

/* 채팅 버튼 스타일 */
.chat-button {
  flex: 1;
  height: 40px;
  border-radius: 8px;
  border: 2px solid #2196f3;
  background: #2196f3;
  cursor: pointer;
  color: white;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  transition: all 0.2s ease;
}

.chat-button:hover:not(:disabled) {
  background: #1976d2;
  border-color: #1976d2;
  transform: translateY(-1px);
  box-shadow: 0px 4px 8px 0px rgba(33, 150, 243, 0.3);
}

.chat-button:active:not(:disabled) {
  transform: translateY(0);
}

.chat-button.disabled-button {
  background: #e5e7eb;
  border-color: #d1d5db;
  color: #9ca3af;
  cursor: not-allowed;
  opacity: 0.6;
}

.chat-button.disabled-button:hover {
  background: #e5e7eb;
  border-color: #d1d5db;
  color: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.secondary-button {
  flex: 1;
  height: 40px;
  border-radius: 8px;
  border: 2px solid var(--status-2);
  background: var(--bg-2);
  cursor: pointer;
  color: var(--status-2);
  font-size: 14px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  transition: all 0.2s ease;
}

.secondary-button:hover {
  background: #fef2f2;
  border-color: var(--status-2);
  color: var(--status-2);
}

/* Completed deal button styles */
.completed-button {
  transition: all 0.2s ease;
}

.completed-button:hover {
  transform: translateY(-1px);
  box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, 0.1);
}

/* Progress indicator */
.progress-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: var(--bg-1);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 2px;
  animation: progress-pulse 2s ease-in-out infinite;
}

.progress-text {
  color: var(--text-1);
  font-size: 12px;
  font-weight: 500;
  font-family: 'Roboto', sans-serif;
  text-align: center;
}

@keyframes progress-pulse {
  0%,
  100% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .property-card-waiting {
    width: 100%;
    max-width: 500px;
  }

  .details-container {
    padding: 16px;
    gap: 10px;
  }

  .property-title {
    font-size: 16px;
  }

  .price-text {
    font-size: 18px;
  }

  .location-text {
    font-size: 13px;
  }

  .action-buttons {
    gap: 8px;
    margin-top: 12px;
  }

  .primary-button,
  .secondary-button {
    height: 36px;
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .property-card-waiting {
    max-width: 100%;
    margin: 0 8px;
  }

  .card-header {
    padding: 12px 16px 8px 16px;
  }

  .waiting-badge {
    padding: 4px 8px;
    gap: 4px;
  }

  .waiting-icon {
    font-size: 10px;
  }

  .waiting-text {
    font-size: 10px;
  }

  .image-container {
    height: 160px;
  }

  .overlay-icon {
    font-size: 20px;
  }

  .overlay-text {
    font-size: 12px;
  }

  .details-container {
    padding: 12px;
    gap: 8px;
  }

  .property-title {
    font-size: 15px;
  }

  .price-text {
    font-size: 16px;
  }

  .location-text {
    font-size: 12px;
  }

  .property-type,
  .sale-type {
    font-size: 10px;
    padding: 3px 6px;
  }

  .waiting-info {
    padding: 8px;
    margin-top: 6px;
  }

  .info-icon {
    font-size: 14px;
  }

  .waiting-info-text {
    font-size: 11px;
  }

  .submitted-date {
    font-size: 10px;
  }

  .action-buttons {
    gap: 6px;
    margin-top: 10px;
  }

  .primary-button,
  .secondary-button {
    height: 32px;
    font-size: 12px;
  }

  .progress-text {
    font-size: 10px;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .property-card-waiting {
    width: 100%;
    max-width: 500px;
  }

  .details-container {
    padding: 18px;
    gap: 11px;
  }

  .property-title {
    font-size: 17px;
  }

  .price-text {
    font-size: 19px;
  }
}

@media (min-width: 1025px) {
  .property-card-waiting {
    width: 500px;
  }

  .property-card-waiting:hover {
    transform: translateY(-2px);
    box-shadow: 0px 8px 12px 0px rgba(0, 0, 0, 0.15);
  }
}
</style>
