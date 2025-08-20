<script setup>
/* ===== 기본 import ===== */
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth/auth'
import { usePropertyStore } from '@/stores/property/property'
import { logout as logoutApi } from '@/api/auth/auth'

/* ===== 섹션 컴포넌트 ===== */
import FavoritesSection from '@/components/user/FavoritesSection.vue'
import PropertyCard from '@/components/common/PropertyCard.vue' // '내가 등록한 매물' 더미 표시용

/* ===== 상태 ===== */
const router = useRouter()
const selectedTab = ref('favorite')
const authStore = useAuthStore()
const propertyStore = usePropertyStore()
const isLoggingOut = ref(false)

// 상단 통계용: 찜 개수는 FavoritesSection에서 emit해 주는 total을 반영
const favTotal = ref(0)

// (임시) 내가 등록한 매물 개수
const user = { registered: 2 }

/* ===== JWT 표시용 유틸 ===== */
function decodeJwt(token) {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(payload))
  } catch {
    return null
  }
}
const token = computed(() => authStore.accessToken || localStorage.getItem('token') || '')
const claims = computed(() => (token.value ? decodeJwt(token.value) : null) || {})

const displayEmail = computed(
  () => authStore.user?.email ?? claims.value.email ?? claims.value.sub ?? ''
)

const displayName = computed(
  () =>
    authStore.user?.nickname ??
    authStore.user?.name ??
    claims.value.nickname ??
    claims.value.name ??
    (displayEmail.value ? displayEmail.value.split('@')[0] : '사용자')
)

const userInitial = computed(() => displayName.value?.charAt(0) || '?')
const registeredCount = computed(() => authStore.user?.registered ?? user.registered ?? 0)

/* ===== 로그아웃 ===== */
async function handleLogout() {
  if (isLoggingOut.value) return
  isLoggingOut.value = true
  try {
    await logoutApi() // 1) 서버 로그아웃 (Redis 키 삭제 + refresh 쿠키 만료)
    authStore.logout() // 2) 클라이언트 인증 상태 정리
    router.replace('/auth/login') // 3) 로그인 페이지로 이동
  } catch (e) {
    console.error('로그아웃 실패:', e)
    authStore.logout()
    router.replace('/auth/login?relogin=1')
  } finally {
    isLoggingOut.value = false
  }
}

/* ===== 초본 조회 ===== */
async function handleRegistryLookup() {
  try {
    // API 요청 보내기
    const response = await fetch('/api/address-changes/import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.accessToken || localStorage.getItem('token')}`,
      },
    })

    if (response.ok) {
      const data = await response.json()
      console.log('초본 조회 응답:', data)

      // 응답 데이터에서 텍스트로 "true"가 있는지 확인
      const responseText = JSON.stringify(data).toLowerCase()
      if (responseText.includes('"true"') || responseText.includes('true')) {
        alert('성공했습니다')
      } else {
        alert('초본 조회 요청이 처리되었지만 결과를 확인해주세요.')
      }
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
  } catch (error) {
    console.error('초본 조회 실패:', error)
    alert('초본 조회에 실패했습니다. 다시 시도해주세요.')
  }
}

/* ===== 내가 등록한 매물 (더미) -> PropertyCard 스키마로 맵핑 =====
PropertyCard는 snake_case를 기대하므로 아래 형태로 맞춤
*/
// API에서 받은 원본 데이터
const myPropertiesRaw = ref([])
const isLoadingMyProperties = ref(false)

// API 응답 데이터를 PropertyCard가 기대하는 형태로 변환 (PropertyCard에서 실제 사용하는 필드만)
const myProperties = computed(() => {
  // myPropertiesRaw.value가 배열인지 확인
  if (!Array.isArray(myPropertiesRaw.value)) {
    return []
  }

  return myPropertiesRaw.value.map((property) => {
    return {
      sale_type: formatSaleType(property.saleType), // TRADING -> '매매'
      bookmark_count: property.bookmarkCount,
      building_name: property.buildingName,
      image_url: property.representativeImageUrl || property.imageUrl || property.imageUrls?.[0],
      price: property.price,
      deposit: property.deposit,
      property_type: formatPropertyType(property.propertyType), // APARTMENT -> '아파트'
      seller_nickname: property.sellerNickname,
      info_oneline: property.infoOneline,
      facility: property.facility,
      created_at: property.createdAt,
      building_id: property.buildingId, // 상세보기/수정/삭제에 필요
      raw: property, // 수정 시 사용할 원본 데이터
    }
  })
})

// saleType 변환 함수 (TRADING -> '매매')
function formatSaleType(saleType) {
  switch (saleType) {
    case 'TRADING':
      return '매매'
    case 'JEONSE':
      return '전세'
    case 'MONTHLY':
      return '월세'
    default:
      return saleType || '전세'
  }
}

// propertyType 변환 함수 (APARTMENT -> '아파트')
function formatPropertyType(propertyType) {
  switch (propertyType) {
    case 'APARTMENT':
      return '아파트'
    case 'OFFICETEL':
      return '오피스텔'
    case 'VILLA':
      return '빌라'
    case 'HOUSE':
      return '주택'
    default:
      return propertyType || '아파트'
  }
}

/* ===== FavoritesSection 이벤트 처리 ===== */
function handleFavLoaded(meta) {
  favTotal.value = meta.total ?? 0
}
function handleFavDetail(prop) {
  // building_id 기준으로 매물 상세페이지 이동
  if (prop?.building_id) router.push(`/map/apt/${prop.building_id}`)
}
function handleFavDeleted(buildingId) {
  // 토스트/알림 등 필요 시 추가
}

/* ===== 내가 등록한 매물 탭 클릭 처리 ===== */
async function handleMyPropertiesClick() {
  selectedTab.value = 'my'

  // 이미 데이터가 있으면 다시 호출하지 않음
  if (myPropertiesRaw.value.length > 0) return

  // API 호출
  isLoadingMyProperties.value = true
  try {
    const result = await propertyStore.fetchMyProperties()

    if (result.success && result.data && result.data.buildings) {
      // buildings 배열을 사용
      myPropertiesRaw.value = result.data.buildings
    } else {
      console.error('내 매물 목록 조회 실패:', result.message || '데이터가 없습니다')
      myPropertiesRaw.value = []
    }
  } catch (error) {
    console.error('내 매물 목록 조회 중 오류:', error)
  } finally {
    isLoadingMyProperties.value = false
  }
}

/* ===== 내가 등록한 매물 이벤트 처리 ===== */
function handleMyPropertyEdit(property) {
  // 매물 수정 페이지로 이동 (buildingId를 경로에 직접 포함)
  router.push(`/property/edit/${property.building_id}`)
}

function handleMyPropertyDetail(property) {
  // building_id 기준으로 매물 상세페이지 이동
  if (property?.building_id) {
    router.push(`/map/apt/${property.building_id}`)
  }
}

async function handleMyPropertyDelete(property) {
  // 삭제 확인 후 API 호출
  if (confirm('정말로 이 매물을 삭제하시겠습니까?')) {
    try {
      // 매물 삭제 API 호출
      await propertyStore.removeProperty(property.building_id)

      // 성공 시 로컬 목록에서 제거
      myPropertiesRaw.value = myPropertiesRaw.value.filter(
        (item) => item.buildingId !== property.building_id
      )

      alert('매물이 성공적으로 삭제되었습니다.')
    } catch (error) {
      alert('매물 삭제에 실패했습니다. 다시 시도해주세요.')
    }
  }
}
</script>

<template>
  <section class="px-6 py-10 bg-gray-50 min-h-screen">
    <!-- 제목 -->
    <h1 class="text-2xl font-bold text-center mb-4">
      <i class="fa-solid fa-user" style="color: var(--brand-3)"></i> 마이페이지
    </h1>
    <p class="text-xs text-center mb-8">계정을 관리하고 저장된 매물을 확인하세요.</p>

    <!-- 사용자 카드 -->
    <div class="bg-white shadow rounded-xl p-6 max-w-6xl mx-auto mb-4 flex items-center">
      <div
        class="w-16 h-16 bg-brand-3 rounded-full flex items-center justify-center text-xl font-bold text-white"
      >
        {{ userInitial }}
      </div>
      <div class="ml-4">
        <p class="font-semibold text-lg">{{ displayName }}</p>
        <p class="text-sm text-gray-600">{{ displayEmail }}</p>
        <div class="flex space-x-4 mt-2 text-gray-700">
          <!-- 찜한 매물 -->
          <div class="stat-block">
            <div class="stat-number">{{ favTotal }}</div>
            <div class="stat-label">찜한 매물</div>
          </div>
          <!-- 등록한 매물 -->
          <div class="stat-block">
            <div class="stat-number">{{ registeredCount }}</div>
            <div class="stat-label">등록한 매물</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 액션 버튼 -->
    <div class="action-buttons mt-6 p-6">
      <router-link to="/user/profile-edit" class="primary-button">
        <i class="fa-regular fa-pen-to-square mr-2"></i>개인 정보 수정
      </router-link>
      <button class="primary-button" @click="handleLogout" :disabled="isLoggingOut">
        <i class="fa-solid fa-right-from-bracket mr-2"></i>
        {{ isLoggingOut ? '로그아웃 중...' : '로그아웃' }}
      </button>
      <button class="registry-lookup-button" @click="handleRegistryLookup">
        <i class="fa-solid fa-file-text mr-2"></i>초본 조회
      </button>
      <router-link to="/user/withdraw" class="secondary-button">
        <i class="fa-solid fa-trash-can mr-2"></i>계정 삭제
      </router-link>
    </div>

    <!-- 섹션 -->
    <div class="max-w-6xl mx-auto mt-6 p-6 rounded-lg mb-20" style="background: var(--bg-1)">
      <!-- 탭 버튼 -->
      <div class="flex justify-center gap-4 mb-6">
        <button
          class="tab-button"
          :class="{ active: selectedTab === 'favorite' }"
          @click="selectedTab = 'favorite'"
        >
          <i class="fa-regular fa-heart mr-2"></i> 내가 찜한 매물
        </button>
        <button
          class="tab-button"
          :class="{ active: selectedTab === 'my' }"
          @click="handleMyPropertiesClick"
        >
          <i class="fa-solid fa-house mr-2"></i> 내가 등록한 매물
        </button>
      </div>

      <!-- 콘텐츠 -->
      <!-- A. 찜한 매물: API 연동된 섹션 -->
      <FavoritesSection
        v-if="selectedTab === 'favorite'"
        :page-size="9"
        :unit-is-manwon="true"
        @loaded="handleFavLoaded"
        @detail="handleFavDetail"
        @deleted="handleFavDeleted"
      />

      <!-- B. 내가 등록한 매물 -->
      <div v-else>
        <!-- 로딩 상태 -->
        <div v-if="isLoadingMyProperties" class="flex justify-center items-center py-8">
          <div class="text-gray-500">내 매물을 불러오는 중...</div>
        </div>

        <!-- 매물 목록 -->
        <div
          v-else-if="myProperties.length > 0"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <PropertyCard
            v-for="property in myProperties"
            :key="property.building_id"
            :property="property"
            :show-edit-button="true"
            @edit="handleMyPropertyEdit"
            @detail="handleMyPropertyDetail"
            @delete="handleMyPropertyDelete"
          />
        </div>

        <!-- 빈 상태 -->
        <div v-else class="text-center py-8">
          <div class="text-gray-500 mb-4">
            <i class="fas fa-home text-4xl mb-2"></i>
            <p>등록한 매물이 없습니다.</p>
            <p class="text-sm">첫 번째 매물을 등록해보세요!</p>
          </div>
          <router-link
            to="/property/register"
            class="inline-block bg-brand-3 text-white px-6 py-2 rounded-lg hover:bg-brand-2 transition-colors"
          >
            매물 등록하기
          </router-link>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.stat-block {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 20px;
  font-weight: 700;
  color: var(--brand-3); /* 강조 색 */
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  color: var(--text-2);
}

.tab-button {
  padding: 0.5rem 1.5rem;
  border-radius: 8px;
  border: 1.5px solid var(--brand-3);
  background-color: var(--bg-2);
  color: var(--text-1);
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.tab-button.active {
  background-color: var(--brand-3);
  color: var(--text-3);
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
}

.primary-button {
  height: 40px;
  padding: 0 20px;
  background: var(--brand-3);
  border-radius: 8px;
  border: none;
  cursor: pointer;
  color: var(--text-3);
  font-size: 14px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  transition: background-color 0.2s ease;
  text-align: center;
  line-height: 40px;
  text-decoration: none;
  display: inline-block;
}

.primary-button:hover {
  background: var(--brand-2);
}

.secondary-button {
  height: 40px;
  padding: 0 20px;
  border-radius: 8px;
  border: 2px solid var(--status-2);
  background: var(--bg-2);
  cursor: pointer;
  color: var(--status-2);
  font-size: 14px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  transition: all 0.2s ease;
  text-align: center;
  line-height: 40px;
  text-decoration: none;
  display: inline-block;
}

.secondary-button:hover {
  background: #fef2f2;
}

.registry-lookup-button {
  height: 40px;
  padding: 0 20px;
  border-radius: 8px;
  border: 2px solid var(--brand-3);
  background: var(--bg-2);
  cursor: pointer;
  color: var(--brand-3);
  font-size: 14px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  transition: all 0.2s ease;
}

.registry-lookup-button:hover {
  background: var(--brand-3);
  color: var(--text-3);
}
</style>
