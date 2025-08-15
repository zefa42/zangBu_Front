<script setup>
// Vue 3 Composition API 관련 import
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// API 및 컴포넌트 import
import { getDeals } from '@/api/deal/deal.js'
import PropertyCardWaiting from '@/components/common/PropertyCardWaiting.vue'
import Button from '@/components/common/Button.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import PopupModal from '@/components/common/PopupModal.vue'

// 스토어 import
import { useAuthStore } from '@/stores/auth/auth.js'

// 상수 import
import { DEAL_STATUS } from '@/utils/constants'

// Vue Router 인스턴스 생성
const router = useRouter()

// 인증 스토어 사용
const authStore = useAuthStore()

// ===== 반응형 데이터 정의 =====
const deals = ref([]) // 거래 목록 데이터
const loading = ref(false) // 로딩 상태
const error = ref(null) // 에러 상태
const activeFilter = ref('buying') // 활성화된 필터 (기본값: '구매 중')

// 로그인 필요 모달 상태
const showLoginModal = ref(false)

// ===== API에서 거래 목록 가져오기 =====
// /deal/waitinglist 엔드포인트를 통해 실제 거래 데이터를 가져옴
const fetchDeals = async () => {
  loading.value = true // 로딩 상태 활성화
  error.value = null // 에러 상태 초기화

  try {
    // JWT 토큰 확인 및 유효성 검사
    if (!authStore.isAuthenticated || !authStore.isTokenValid()) {
      // TODO: reissue 기능 개발 완료 후 활성화
      // 토큰 갱신 시도
      /*
      try {
        await authStore.refreshAccessToken()
        
        // 갱신된 토큰으로 다시 API 호출
        const response = await getDeals()

        // API 응답 데이터 처리 - Postman 응답 구조에 맞게 처리
        if (response.data && response.data.deals) {
          // 페이지네이션된 응답 구조 처리 (Postman 응답과 동일)
          deals.value = response.data.deals
        } else if (response.data && Array.isArray(response.data)) {
          // 배열 형태로 직접 응답하는 경우
          deals.value = response.data
        } else if (response.data) {
          // 단일 객체인 경우 배열로 변환
          deals.value = [response.data]
        } else {
          // API 응답이 없는 경우 빈 배열로 설정
          deals.value = []
        }

        return // 성공적으로 처리되었으므로 함수 종료
      } catch (refreshError) {
        // 토큰 갱신 실패 시 로그인 필요 팝업 표시
        showLoginRequiredPopup()
        return
      }
      */
      // 일단 기존 토큰으로 API 호출 시도
    }

    // 실제 API 호출
    const response = await getDeals()

    // API 응답 데이터 처리 - Postman 응답 구조에 맞게 처리
    if (response.data && response.data.deals) {
      // 페이지네이션된 응답 구조 처리 (Postman 응답과 동일)
      deals.value = response.data.deals
    } else if (response.data && Array.isArray(response.data)) {
      // 배열 형태로 직접 응답하는 경우
      deals.value = response.data
    } else if (response.data) {
      // 단일 객체인 경우 배열로 변환
      deals.value = [response.data]
    } else {
      // API 응답이 없는 경우 빈 배열로 설정
      deals.value = []
    }
  } catch (err) {
    // 401 Unauthorized 에러인 경우 로그인 페이지로 이동
    if (err.response?.status === 401) {
      showLoginRequiredPopup()
      return
    }

    // API 오류 발생 시 빈 배열로 설정
    deals.value = []

    // 에러 발생 시 사용자에게 친화적인 메시지 표시
    if (err.response) {
      // 서버 응답이 있는 경우
      switch (err.response.status) {
        case 401:
          error.value = '인증이 필요합니다. 다시 로그인해주세요.'
          showLoginRequiredPopup()
          break
        case 403:
          error.value = '접근 권한이 없습니다. 로그인이 필요합니다.'
          showLoginRequiredPopup()
          break
        case 404:
          error.value = '거래 목록을 찾을 수 없습니다.'
          break
        case 500:
          error.value = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
          break
        default:
          error.value = `거래 목록을 불러오는데 실패했습니다. (${err.response.status})`
      }
    } else if (err.request) {
      // 네트워크 오류
      error.value = '백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.'
    } else {
      // 기타 오류
      error.value = '거래 목록을 불러오는데 실패했습니다. 다시 시도해주세요.'
    }
  } finally {
    loading.value = false // 로딩 상태 비활성화
  }
}

// ===== 로그인 필요 팝업 표시 및 로그인 페이지 이동 =====
const showLoginRequiredPopup = () => {
  // 사용자에게 로그인이 필요하다는 팝업 표시
  showLoginModal.value = true
}

// ===== 모달 이벤트 핸들러 =====
const handleLoginConfirm = () => {
  showLoginModal.value = false
  router.push('/auth/login')
}

const handleLoginCancel = () => {
  showLoginModal.value = false
  router.push('/')
}

const handleLoginModalClose = () => {
  showLoginModal.value = false
}

// ===== 필터링된 거래 목록 계산 =====
// 활성화된 필터에 따라 거래 목록을 동적으로 필터링
const filteredDeals = computed(() => {
  console.log('=== 필터링 시작 ===')
  console.log('활성 필터:', activeFilter.value)
  console.log('전체 거래 수:', deals.value.length)
  console.log('원본 거래 데이터:', deals.value)

  let filtered = []

  if (activeFilter.value === 'all') {
    filtered = deals.value
    console.log('전체 필터 적용 - 결과:', filtered.length)
  } else if (activeFilter.value === 'buying') {
    // 구매자 관점에서 볼 수 있는 거래들
    filtered = deals.value.filter((deal) => {
      const isBuying = deal.userStatus === '구매중'
      console.log(`거래 ${deal.dealId}: userStatus=${deal.userStatus}, isBuying=${isBuying}`)
      return isBuying
    })
    console.log('구매중 필터 적용 - 결과:', filtered.length)
  } else if (activeFilter.value === 'selling') {
    // 판매자 관점에서 볼 수 있는 거래들
    filtered = deals.value.filter((deal) => {
      const isSelling = deal.userStatus === '판매중'
      console.log(`거래 ${deal.dealId}: userStatus=${deal.userStatus}, isSelling=${isSelling}`)
      return isSelling
    })
    console.log('판매중 필터 적용 - 결과:', filtered.length)
  } else if (activeFilter.value === 'completed') {
    // 거래 완료된 거래들
    filtered = deals.value.filter((deal) => {
      const isCompleted = deal.dealStatus === DEAL_STATUS.CLOSE_DEAL
      console.log(`거래 ${deal.dealId}: dealStatus=${deal.dealStatus}, isCompleted=${isCompleted}`)
      return isCompleted
    })
    console.log('완료 필터 적용 - 결과:', filtered.length)
  } else {
    filtered = deals.value
    console.log('기본값 - 결과:', filtered.length)
  }

  console.log('필터링된 거래:', filtered)
  console.log('=== 필터링 완료 ===')

  return filtered
})

// ===== 필터 설정 함수 =====
// 사용자가 선택한 필터를 활성화
const setActiveFilter = (filter) => {
  console.log('=== 필터 변경 ===')
  console.log('이전 필터:', activeFilter.value)
  console.log('새 필터:', filter)

  activeFilter.value = filter

  console.log('필터 변경 완료:', activeFilter.value)
  console.log('=== 필터 변경 완료 ===')
}

// ===== 거래 데이터 포맷팅 함수 =====
// PropertyCard 컴포넌트에서 사용할 수 있도록 거래 데이터를 포맷팅
const formatDealForPropertyCard = (deal) => {
  // 현재 로그인한 사용자 정보 가져오기
  const currentUser = authStore.user

  // API 응답 데이터를 PropertyCard 컴포넌트에 맞는 형태로 변환
  const formattedProperty = {
    dealId: deal.dealId, // API: dealId: 1203
    buildingId: deal.buildingId, // API: buildingId: 902
    buildingName: deal.buildingName, // API: buildingName: "테스트 오피스텔 902호"
    address: deal.address, // API: address: "서울 강남구 역삼동 1-1"
    imageUrl:
      deal.imageUrl && deal.imageUrl !== 'https://example.com/img902.jpg'
        ? deal.imageUrl
        : '/default-property.jpg', // API: imageUrl: "https://example.com/img902.jpg"
    price: deal.price || 0, // API: price: 350000000
    dealStatus: deal.dealStatus, // API: dealStatus: "BEFORE_CONSUMER"
    createdAt: deal.createdAt || new Date().toISOString().split('T')[0], // API에 createdAt이 없으면 현재 날짜
    saleType: mapSaleType(deal.saleType), // API: saleType: "TRADING" → "매매"
    houseType: mapPropertyType(deal.propertyType), // API: propertyType: "OFFICETEL" → "오피스텔"
    userRole: determineUserRole(deal, currentUser), // 사용자 역할 결정
    dealStatusEnum: deal.dealStatus, // API: dealStatus: "BEFORE_CONSUMER"
    dealStatusText: mapDealStatus(deal.dealStatus), // "BEFORE_CONSUMER" → "구매자 확인 대기"
  }

  // 가격이 0인 경우 "가격 협의"로 표시
  if (deal.price === 0) {
    formattedProperty.priceDisplay = '가격 협의'
  }

  return formattedProperty
}

// 사용자 역할 결정 함수
const determineUserRole = (deal, currentUser) => {
  console.log('=== 사용자 역할 결정 ===')
  console.log('거래 데이터:', deal)
  console.log('현재 사용자:', currentUser)

  // API 응답에 판매자/구매자 ID가 있는 경우
  if (deal.sellerId && deal.buyerId) {
    if (currentUser && deal.sellerId === currentUser.id) {
      console.log('판매자로 판단됨')
      return 'seller'
    } else if (currentUser && deal.buyerId === currentUser.id) {
      console.log('구매자로 판단됨')
      return 'buyer'
    }
  }

  // API 응답에 ownerId가 있는 경우
  if (deal.ownerId) {
    if (currentUser && deal.ownerId === currentUser.id) {
      console.log('소유자(판매자)로 판단됨')
      return 'seller'
    }
  }

  // 기본값: userStatus로 판단 (임시)
  const defaultRole = deal.userStatus === '구매중' ? 'buyer' : 'seller'
  console.log(`기본값 사용: ${defaultRole}`)
  return defaultRole
}

// ===== API 응답 데이터 매핑 함수들 =====

// 판매 유형 매핑 (API → 한글)
const mapSaleType = (apiSaleType) => {
  const saleTypeMap = {
    TRADING: '매매',
    CHARTER: '전세',
    MONTHLY: '월세',
    TRADING_CHARTER: '매매+전세',
    TRADING_MONTHLY: '매매+월세',
  }
  return saleTypeMap[apiSaleType] || apiSaleType
}

// 주택 유형 매핑 (API → 한글)
const mapPropertyType = (apiPropertyType) => {
  const propertyTypeMap = {
    APARTMENT: '아파트',
    OFFICETEL: '오피스텔',
    VILLA: '빌라',
    HOUSE: '단독주택',
    COMMERCIAL: '상가',
    LAND: '토지',
  }
  return propertyTypeMap[apiPropertyType] || apiPropertyType
}

// 거래 상태 매핑 (API → 한글)
const mapDealStatus = (apiDealStatus) => {
  const dealStatusMap = {
    BEFORE_OWNER: '소유자 확인 대기',
    BEFORE_CONSUMER: '소비자 확인 대기',
    MIDDLE_DEAL: '거래 진행 중',
    CLOSE_DEAL: '거래 완료',
    CANCEL_DEAL: '거래 취소',
  }
  return dealStatusMap[apiDealStatus] || apiDealStatus
}

// ===== 거래 상세 페이지 이동 처리 =====
// PropertyCard에서 거래 상세 버튼 클릭 시 호출
const handleDealDetail = (property) => {
  console.log('=== 거래 이어가기 버튼 클릭 ===')
  console.log('거래 정보:', property)

  const dealId = property.dealId
  const dealStatus = property.dealStatusEnum
  const userRole = property.userRole

  console.log('dealId:', dealId)
  console.log('dealStatus:', dealStatus)
  console.log('userRole:', userRole)

  // dealStatus와 사용자 역할에 따른 분기 처리
  if (dealStatus === DEAL_STATUS.BEFORE_TRANSACTION) {
    // 채팅방 이동
    console.log('BEFORE_TRANSACTION -> 채팅방 이동')
    router.push(`/chat/room?dealId=${dealId}`)
  } else if (dealStatus === DEAL_STATUS.BEFORE_OWNER) {
    if (userRole === 'seller') {
      // 판매자 거래 수락 페이지 이동
      console.log('BEFORE_OWNER + seller -> 판매자 거래 수락 페이지')
      router.push(`/deal/seller/${dealId}`)
    } else {
      // 구매자: 판매자 거래 수락 대기
      console.log('BEFORE_OWNER + consumer -> 판매자 거래 수락 대기')
      router.push(`/deal/buyer/${dealId}`)
    }
  } else if (dealStatus === DEAL_STATUS.BEFORE_CONSUMER) {
    if (userRole === 'seller') {
      // 판매자: 구매자 거래 수락 대기
      console.log('BEFORE_CONSUMER + seller -> 구매자 거래 수락 대기')
      router.push(`/deal/seller/${dealId}`)
    } else {
      // 구매자 거래 수락 페이지 이동
      console.log('BEFORE_CONSUMER + consumer -> 구매자 거래 수락 페이지')
      router.push(`/deal/buyer/${dealId}`)
    }
  } else if (dealStatus === DEAL_STATUS.MIDDLE_DEAL) {
    // 채팅방 이동
    console.log('MIDDLE_DEAL -> 채팅방 이동')
    router.push(`/chat/room?dealId=${dealId}`)
  } else if (dealStatus === DEAL_STATUS.CLOSE_DEAL) {
    // 거래 이력 보기
    console.log('CLOSE_DEAL -> 거래 이력 보기')
    router.push(`/deal/completed/${dealId}`)
  } else {
    // 기본값: 사용자 역할에 따라 거래 페이지 이동
    console.log('기본값 -> 사용자 역할에 따라 거래 페이지 이동')
    if (userRole === 'seller') {
      router.push(`/deal/seller/${dealId}`)
    } else {
      router.push(`/deal/buyer/${dealId}`)
    }
  }

  // 페이지 이동 후 스크롤 초기화
  window.scrollTo({
    top: 96,
    behavior: 'smooth',
  })
}

// ===== 완료된 거래 상세 보기 처리 =====
// 완료된 거래의 상세 정보를 보기 위한 함수
const handleViewDetails = (property) => {
  // 거래 내역 페이지로 이동 (예: 거래 완료 상세 페이지)
  router.push(`/deal/completed/${property.dealId}`)
}

// ===== 리뷰 작성 처리 =====
// 완료된 거래에 대한 리뷰를 작성하기 위한 함수
const handleReview = (property) => {
  // 리뷰 작성 페이지로 이동
  router.push(`/review/write/${property.dealId}`)
}

// ===== 컴포넌트 초기화 =====
// 컴포넌트가 마운트될 때 거래 목록을 가져옴
onMounted(() => {
  // 거래 목록 가져오기
  fetchDeals()
})
</script>

<template>
  <div class="deal-waiting-list-view">
    <!-- 메인 콘텐츠 영역 -->
    <div class="main-content">
      <!-- 데스크탑 레이아웃 -->
      <div class="desktop-layout">
        <!-- 중앙 제목 -->
        <div class="centered-title">
          <h1>거래 중인 매물</h1>
        </div>

        <!-- 사이드바와 메인 콘텐츠 영역 -->
        <div class="content-layout">
          <!-- 왼쪽 사이드바 -->
          <div class="sidebar">
            <!-- 필터 탭 버튼들 -->
            <div class="filter-tabs">
              <!-- 전체 거래 필터 -->
              <button
                :class="['filter-btn', activeFilter === 'all' ? 'button1' : 'button10']"
                @click="setActiveFilter('all')"
              >
                전체
              </button>
              <!-- 구매 중인 거래 필터 -->
              <button
                :class="['filter-btn', activeFilter === 'buying' ? 'button1' : 'button10']"
                @click="setActiveFilter('buying')"
              >
                구매 중
              </button>
              <!-- 판매 중인 거래 필터 -->
              <button
                :class="['filter-btn', activeFilter === 'selling' ? 'button1' : 'button10']"
                @click="setActiveFilter('selling')"
              >
                판매 중
              </button>
              <!-- 완료된 거래 필터 -->
              <button
                :class="['filter-btn', activeFilter === 'completed' ? 'button1' : 'button10']"
                @click="setActiveFilter('completed')"
              >
                거래 완료
              </button>
            </div>
          </div>

          <!-- 오른쪽 메인 콘텐츠 -->
          <div class="main-content-area">
            <!-- 로딩 상태 표시 -->
            <LoadingSpinner v-if="loading" text="거래 목록을 불러오는 중..." size="medium" />

            <!-- 에러 상태 표시 -->
            <div v-else-if="error" class="error-container">
              <i class="fas fa-exclamation-triangle error-icon"></i>
              <p class="error-text">{{ error }}</p>
              <Button variant="button1" @click="fetchDeals" icon="fas fa-redo"> 다시 시도 </Button>
            </div>

            <!-- 빈 상태 표시 (거래가 없을 때) -->
            <div v-else-if="filteredDeals.length === 0" class="empty-container">
              <i class="fas fa-inbox empty-icon"></i>
              <h3 class="empty-title">거래 중인 매물이 없습니다</h3>
              <p class="empty-text">새로운 거래가 등록되면 여기에 표시됩니다.</p>
            </div>

            <!-- 거래 목록 표시 -->
            <div v-else class="deals-container">
              <div class="deals-grid">
                <!-- PropertyCardWaiting 컴포넌트를 사용하여 각 거래를 카드 형태로 표시 -->
                <PropertyCardWaiting
                  v-for="deal in filteredDeals"
                  :key="deal.dealId"
                  :property="formatDealForPropertyCard(deal)"
                  @edit="handleDealDetail"
                  @viewDetails="handleViewDetails"
                  @review="handleReview"
                />

                <!-- 매물이 1개일 때 빈 카드 공간 추가 -->
                <div v-if="filteredDeals.length === 1" class="empty-card-space"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 모바일 레이아웃 -->
      <div class="mobile-layout">
        <!-- 섹션 제목 -->
        <div class="section-title">
          <h1>거래 중인 매물</h1>
        </div>

        <!-- 필터 탭 버튼들 -->
        <div class="filter-tabs">
          <!-- 전체 거래 필터 -->
          <button
            :class="['filter-btn', activeFilter === 'all' ? 'button1' : 'button10']"
            @click="setActiveFilter('all')"
          >
            전체
          </button>
          <!-- 구매 중인 거래 필터 -->
          <button
            :class="['filter-btn', activeFilter === 'buying' ? 'button1' : 'button10']"
            @click="setActiveFilter('buying')"
          >
            구매 중
          </button>
          <!-- 판매 중인 거래 필터 -->
          <button
            :class="['filter-btn', activeFilter === 'selling' ? 'button1' : 'button10']"
            @click="setActiveFilter('selling')"
          >
            판매 중
          </button>
          <!-- 완료된 거래 필터 -->
          <button
            :class="['filter-btn', activeFilter === 'completed' ? 'button1' : 'button10']"
            @click="setActiveFilter('completed')"
          >
            거래 완료
          </button>
        </div>

        <!-- 로딩 상태 표시 -->
        <LoadingSpinner v-if="loading" text="거래 목록을 불러오는 중..." size="medium" />

        <!-- 에러 상태 표시 -->
        <div v-else-if="error" class="error-container">
          <i class="fas fa-exclamation-triangle error-icon"></i>
          <p class="error-text">{{ error }}</p>
          <Button variant="button1" @click="fetchDeals" icon="fas fa-redo"> 다시 시도 </Button>
        </div>

        <!-- 빈 상태 표시 (거래가 없을 때) -->
        <div v-else-if="filteredDeals.length === 0" class="empty-container">
          <i class="fas fa-inbox empty-icon"></i>
          <h3 class="empty-title">거래 중인 매물이 없습니다</h3>
          <p class="empty-text">새로운 거래가 등록되면 여기에 표시됩니다.</p>
        </div>

        <!-- 거래 목록 표시 -->
        <div v-else class="deals-container">
          <div class="deals-grid">
            <!-- PropertyCardWaiting 컴포넌트를 사용하여 각 거래를 카드 형태로 표시 -->
            <PropertyCardWaiting
              v-for="deal in filteredDeals"
              :key="deal.dealId"
              :property="formatDealForPropertyCard(deal)"
              @edit="handleDealDetail"
              @viewDetails="handleViewDetails"
              @review="handleReview"
            />

            <!-- 매물이 1개일 때 빈 카드 공간 추가 -->
            <div v-if="filteredDeals.length === 1" class="empty-card-space"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 로그인 필요 모달 -->
    <PopupModal
      v-if="showLoginModal"
      title="로그인이 필요합니다"
      message="거래 목록을 보려면 로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?"
      cancelText="취소"
      confirmText="로그인하기"
      @close="handleLoginModalClose"
      @confirm="handleLoginConfirm"
      @cancel="handleLoginCancel"
    />
  </div>
</template>

<style scoped>
/* ===== 거래 대기 목록 뷰 전체 스타일 ===== */
.deal-waiting-list-view {
  min-height: 100vh;
  background: white;
  display: flex;
  flex-direction: column;
  width: 100%;
}

/* ===== 메인 콘텐츠 영역 스타일 ===== */
.main-content {
  flex: 1;
  padding: 1.25rem;
  max-width: 75rem;
  margin: 0 auto;
  width: 100%;
  min-height: calc(100vh - 12.5rem);
  background: white;
  box-sizing: border-box;
}

/* ===== 데스크탑 레이아웃 ===== */
.desktop-layout {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
}

/* ===== 중앙 제목 스타일 ===== */
.centered-title {
  text-align: center;
  margin-bottom: 2rem;
  padding: 4rem 2rem;
  background: transparent;
  border-radius: 1rem;
  border: none;
  min-height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.centered-title h1 {
  color: #1f2937;
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.025em;
  position: relative;
  display: inline-block;
}

.centered-title h1::after {
  content: '';
  position: absolute;
  bottom: -1.5rem;
  left: 50%;
  transform: translateX(-50%);
  width: 5rem;
  height: 4px;
  background: #059669;
  border-radius: 2px;
}

/* ===== 콘텐츠 레이아웃 ===== */
.content-layout {
  display: flex;
  gap: 2rem;
  width: 100%;
}

/* ===== 사이드바 스타일 ===== */
.sidebar {
  flex: 0 0 280px;
  background: transparent;
  border-radius: 0;
  padding: 0;
  border: none;
  height: fit-content;
  position: sticky;
  top: 2rem;
}

/* ===== 메인 콘텐츠 영역 ===== */
.main-content-area {
  flex: 1;
  min-width: 0;
}

/* ===== 모바일 레이아웃 ===== */
.mobile-layout {
  display: none;
}

/* ===== 섹션 제목 스타일 ===== */
.section-title {
  margin-bottom: 2rem;
  padding: 0;
  background: transparent;
  border-radius: 0;
  border-left: none;
  position: relative;
  box-shadow: none;
}

.section-title h1 {
  color: #1f2937;
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.025em;
  position: relative;
  display: block;
}

.section-title h1::before {
  content: none;
}

.section-title h1::after {
  content: '';
  position: absolute;
  bottom: -0.75rem;
  left: 0;
  width: 3rem;
  height: 2px;
  background: #059669;
  border-radius: 1px;
}

/* ===== 필터 탭 버튼 스타일 ===== */
.filter-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  justify-content: center;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 0;
}

.filter-tabs .filter-btn {
  width: auto;
  min-width: 80px;
  padding: 0.75rem 1.25rem;
  font-size: 0.875rem;
  height: auto;
  min-height: auto;
  background: white;
  border: none;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  color: #374151;
  font-weight: 600;
  flex-shrink: 0;
  text-align: left;
  justify-content: flex-start;
  box-shadow: none;
  transform: none;
}

.filter-tabs .filter-btn:hover {
  background: #f0fdf4;
  box-shadow: 0 2px 4px rgba(5, 150, 105, 0.1);
  transform: translateY(-1px);
}

.filter-tabs .filter-btn:active {
  transform: translateY(0);
}

.filter-tabs .filter-btn.button1 {
  background: #059669;
  color: white;
  border-color: #059669;
  box-shadow: 0 2px 8px rgba(5, 150, 105, 0.3);
  font-weight: 600;
  position: relative;
}

.filter-tabs .filter-btn.button1::after {
  content: none;
}

.filter-tabs .filter-btn.button1:hover {
  background: #047857;
  border-color: #047857;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.4);
  color: white;
}

.filter-tabs .filter-btn.button10 {
  background: white;
  color: #1f2937;
  border-color: #e2e8f0;
  font-weight: 500;
}

.filter-tabs .filter-btn.button10:hover {
  background: #f0fdf4;
  border-color: #059669;
  color: #059669;
}

/* ===== 거래 목록 컨테이너 스타일 ===== */
.deals-container {
  width: 100%;
  max-width: 75rem;
  box-sizing: border-box;
}

/* 거래 그리드 레이아웃 */
.deals-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  width: 100%;
  justify-items: center;
  max-width: 100%;
}

/* 빈 카드 공간 (매물이 1개일 때) */
.empty-card-space {
  width: 100%;
  height: 0;
  visibility: hidden;
}

/* ===== 카드 전환 효과 ===== */
.deals-grid :deep(.property-card-waiting) {
  transition: all 0.3s ease;
  width: 100%;
  max-width: 100%;
}

.deals-grid :deep(.property-card-waiting:hover) {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

/* ===== 에러 상태 스타일 ===== */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1.25rem;
  text-align: center;
  width: 100%;
  min-height: 50vh;
  margin: 2rem 0;
}

.error-icon {
  font-size: 3rem;
  color: #ef4444;
  margin-bottom: 1rem;
}

.error-text {
  color: #6b7280;
  font-size: 1rem;
  margin-bottom: 1.25rem;
}

/* ===== 빈 상태 스타일 ===== */
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1.25rem;
  text-align: center;
  width: 100%;
  min-height: 50vh;
  margin: 2rem 0;
}

.empty-icon {
  font-size: 4rem;
  color: #9ca3af;
  margin-bottom: 1rem;
}

.empty-title {
  color: #6b7280;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.empty-text {
  color: #9ca3af;
  font-size: 0.875rem;
}

/* ===== 반응형 스타일 ===== */

/* 데스크탑 (1024px 이상) */
@media (min-width: 64rem) {
  .desktop-layout {
    display: flex;
  }

  .mobile-layout {
    display: none;
  }

  .deals-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
    justify-items: center;
  }

  .sidebar .filter-tabs .filter-btn {
    width: 100%;
    min-width: 280px;
  }
}

/* 태블릿 및 작은 데스크탑 (1024px 미만) */
@media (max-width: 63.9375rem) {
  .main-content {
    padding: 1rem;
    min-height: calc(100vh - 11.25rem);
  }

  .desktop-layout {
    display: none;
  }

  .mobile-layout {
    display: block;
  }

  .section-title {
    margin-bottom: 2rem;
    padding: 3rem 1.5rem;
    background: transparent;
    border-radius: 1rem;
    border: none;
    min-height: 140px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  .section-title h1 {
    font-size: 1.75rem;
    color: #1f2937;
    font-weight: 700;
    margin: 0;
    letter-spacing: -0.025em;
    position: relative;
    display: inline-block;
  }

  .section-title h1::after {
    content: '';
    position: absolute;
    bottom: -1rem;
    left: 50%;
    transform: translateX(-50%);
    width: 3rem;
    height: 2px;
    background: #059669;
    border-radius: 1px;
  }

  .filter-tabs {
    display: flex;
    flex-direction: row;
    gap: 0.375rem;
    margin-bottom: 1.75rem;
    padding: 0;
    background: transparent;
    border: none;
    border-radius: 0;
  }

  .filter-tabs .filter-btn {
    flex: 1;
    min-width: auto;
    padding: 0.625rem 0.375rem;
    font-size: 0.8125rem;
    height: auto;
    min-height: auto;
    background: white;
    border: none;
    border-radius: 0.5rem;
    transition: all 0.2s ease;
    color: #1f2937;
    font-weight: 600;
    flex-shrink: 0;
    text-align: center;
    justify-content: center;
    box-shadow: none;
    transform: none;
    cursor: pointer;
  }

  .filter-tabs .filter-btn.button1 {
    background: #059669;
    color: white;
    border: none;
    box-shadow: 0 2px 8px rgba(5, 150, 105, 0.3);
    font-weight: 600;
  }

  .filter-tabs .filter-btn.button10 {
    background: white;
    color: #1f2937;
    border: none;
    font-weight: 500;
  }

  .deals-container {
    max-width: 100%;
  }

  .deals-grid {
    display: block;
    width: 100%;
    max-width: 100%;
    grid-template-columns: none;
    grid-template-rows: none;
    grid-auto-flow: unset;
  }

  .deals-grid > * {
    display: block;
    width: 100%;
    margin-bottom: 1.25rem;
    grid-column: unset;
    grid-row: unset;
  }

  .deals-grid > *:last-child {
    margin-bottom: 0;
  }
}

/* 모바일 (480px 이하) */
@media (max-width: 30rem) {
  .main-content {
    padding: 0.75rem;
  }

  .desktop-layout {
    display: none;
  }

  .mobile-layout {
    display: block;
  }

  .section-title {
    margin-bottom: 1.5rem;
    padding: 2.5rem 1rem;
    background: transparent;
    border-radius: 0.75rem;
    border: none;
    min-height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  .section-title h1 {
    font-size: 1.5rem;
    color: #1f2937;
    font-weight: 700;
    margin: 0;
    letter-spacing: -0.025em;
    position: relative;
    display: inline-block;
  }

  .section-title h1::after {
    content: '';
    position: absolute;
    bottom: -0.75rem;
    left: 50%;
    transform: translateX(-50%);
    width: 2.5rem;
    height: 2px;
    background: #059669;
    border-radius: 1px;
  }

  .filter-tabs {
    margin-bottom: 1.75rem;
    gap: 0.375rem;
    padding: 0.75rem;
    border-radius: 0.5rem;
    max-width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .filter-tabs button {
    width: auto;
    min-width: 60px;
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
    height: auto;
    min-height: 2.25rem;
    background: white;
    border: none;
    border-radius: 0.5rem;
    transition: all 0.2s ease;
    color: #1f2937;
    font-weight: 500;
    flex-shrink: 0;
    text-align: left;
    justify-content: flex-start;
  }

  .filter-tabs button:hover {
    background: #f0fdf4;
    box-shadow: 0 2px 4px rgba(5, 150, 105, 0.1);
    transform: translateY(-1px);
  }

  .filter-tabs button:active {
    transform: translateY(0);
  }

  .filter-tabs button.button1 {
    background: #059669;
    color: white;
    border: none;
    box-shadow: 0 2px 8px rgba(5, 150, 105, 0.3);
    font-weight: 600;
    position: relative;
  }

  .filter-tabs button.button1::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: #059669;
  }

  .filter-tabs button.button1:hover {
    background: #047857;
    border: none;
    box-shadow: 0 4px 12px rgba(5, 150, 105, 0.4);
    color: white;
  }

  .filter-tabs button.button10 {
    background: white;
    color: #1f2937;
    border: none;
    font-weight: 500;
  }

  .filter-tabs button.button10:hover {
    background: #f0fdf4;
    border-color: #059669;
    color: #059669;
  }

  .deals-container {
    max-width: 100%;
  }

  .deals-grid {
    display: block;
    width: 100%;
    max-width: 100%;
    grid-template-columns: none;
    grid-template-rows: none;
    grid-auto-flow: unset;
  }

  .deals-grid > * {
    display: block;
    width: 100%;
    margin-bottom: 1rem;
    grid-column: unset;
    grid-row: unset;
  }

  .deals-grid > *:last-child {
    margin-bottom: 0;
  }

  .error-container,
  .empty-container {
    min-height: 40vh;
    padding: 3rem 1rem;
    margin: 1rem 0;
  }

  .error-text {
    font-size: 0.875rem;
  }

  .empty-icon {
    font-size: 3rem;
  }

  .empty-title {
    font-size: 1.125rem;
  }

  .empty-text {
    font-size: 0.8125rem;
  }
}

/* ===== 사이드바 필터 탭 스타일 ===== */
.sidebar .filter-tabs {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 0;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 0;
}

.sidebar .filter-tabs .filter-btn {
  width: 100%;
  min-width: 280px;
  padding: 1rem 1.5rem;
  font-size: 0.875rem;
  height: auto;
  min-height: auto;
  background: white;
  border: none;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  color: #1f2937;
  font-weight: 600;
  flex-shrink: 0;
  text-align: left;
  justify-content: flex-start;
  box-shadow: none;
  transform: none;
  cursor: pointer;
}

.sidebar .filter-tabs .filter-btn.button1 {
  background: #059669;
  color: white;
  border: none;
  box-shadow: 0 2px 8px rgba(5, 150, 105, 0.3);
  font-weight: 600;
}

.sidebar .filter-tabs .filter-btn.button10 {
  background: white;
  color: #1f2937;
  border: none;
  font-weight: 500;
}
</style>
