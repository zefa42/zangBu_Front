<template>
  <div style="padding: 20px; max-width: 800px; margin: 0 auto;">
    <h1>🔧 카카오 맵 빠른 진단</h1>
    
    <!-- 상태 표시 -->
    <div style="margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px;">
      <h3>📊 현재 상태</h3>
      
      <div style="margin: 8px 0;">
        <span>🔑 API 키: </span>
        <span :style="{ color: apiKeyColor }">{{ apiKeyStatus }}</span>
        <code v-if="maskedKey" style="margin-left: 10px; background: #f0f0f0; padding: 2px 4px;">{{ maskedKey }}</code>
      </div>
      
      <div style="margin: 8px 0;">
        <span>📦 카카오 스크립트: </span>
        <span :style="{ color: scriptColor }">{{ scriptStatus }}</span>
      </div>
      
      <div style="margin: 8px 0;">
        <span>🗺️ 카카오 맵 객체: </span>
        <span :style="{ color: kakaoColor }">{{ kakaoStatus }}</span>
      </div>
    </div>

    <!-- 빠른 액션 -->
    <div style="margin: 20px 0;">
      <button @click="loadScript" style="margin: 5px; padding: 10px 15px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">
        🔄 스크립트 로드
      </button>
      
      <button @click="testMap" :disabled="!canTest" style="margin: 5px; padding: 10px 15px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer;">
        🧪 지도 테스트
      </button>
      
      <button @click="openConsole" style="margin: 5px; padding: 10px 15px; background: #FF9800; color: white; border: none; border-radius: 4px; cursor: pointer;">
        🔍 콘솔 열기
      </button>
    </div>

    <!-- 테스트 맵 영역 -->
    <div style="margin: 20px 0;">
      <h3>🗺️ 테스트 맵</h3>
      <div 
        ref="mapContainer" 
        style="width: 100%; height: 300px; border: 2px dashed #ccc; border-radius: 8px; background: #f9f9f9; position: relative;"
      >
        <div v-if="!mapCreated" style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666;">
          {{ mapMessage }}
        </div>
      </div>
    </div>

    <!-- 로그 -->
    <div style="margin: 20px 0;">
      <h3>📝 로그</h3>
      <div style="background: #1e1e1e; color: #00ff00; padding: 15px; border-radius: 4px; font-family: monospace; font-size: 12px; max-height: 200px; overflow-y: auto;">
        <div v-for="log in logs" :key="log.id">{{ log.message }}</div>
      </div>
    </div>

    <!-- 해결 방법 -->
    <div style="margin: 20px 0; padding: 15px; background: #e8f5e8; border-radius: 8px;">
      <h3>💡 해결 방법</h3>
      <ol>
        <li><strong>API 키 설정:</strong> .env 파일에 <code>VITE_KAKAO_MAP_API_KEY=여러분의_키</code> 추가</li>
        <li><strong>도메인 등록:</strong> <a href="https://developers.kakao.com" target="_blank">카카오 개발자 콘솔</a>에서 <code>http://localhost:5173</code> 등록</li>
        <li><strong>서버 재시작:</strong> <code>npm run dev</code> 재실행</li>
        <li><strong>브라우저 새로고침:</strong> Ctrl+Shift+R (하드 리프레시)</li>
      </ol>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const logs = ref([])
const mapContainer = ref(null)
const mapCreated = ref(false)
const mapMessage = ref('지도 테스트 준비 중...')

let logId = 0
const addLog = (message) => {
  logs.value.push({ id: logId++, message: `[${new Date().toLocaleTimeString()}] ${message}` })
}

// API 키 확인
const apiKey = import.meta.env.VITE_KAKAO_MAP_API_KEY
const apiKeyStatus = computed(() => {
  if (!apiKey || apiKey === 'YOUR_APP_KEY') return '❌ 설정되지 않음'
  if (apiKey.length < 20) return '⚠️ 형식 의심됨'
  return '✅ 설정됨'
})

const apiKeyColor = computed(() => {
  if (!apiKey || apiKey === 'YOUR_APP_KEY') return '#f44336'
  if (apiKey.length < 20) return '#ff9800'
  return '#4caf50'
})

const maskedKey = computed(() => {
  if (!apiKey || apiKey === 'YOUR_APP_KEY') return null
  return apiKey.substring(0, 8) + '...' + apiKey.slice(-4)
})

// 스크립트 상태
const scriptStatus = computed(() => {
  const script = document.querySelector('script[src*="dapi.kakao.com"]')
  return script ? '✅ 로드됨' : '❌ 없음'
})

const scriptColor = computed(() => {
  return document.querySelector('script[src*="dapi.kakao.com"]') ? '#4caf50' : '#f44336'
})

// 카카오 객체 상태
const kakaoStatus = computed(() => {
  if (!window.kakao) return '❌ 없음'
  if (!window.kakao.maps) return '⚠️ maps 없음'
  return '✅ 정상'
})

const kakaoColor = computed(() => {
  if (!window.kakao) return '#f44336'
  if (!window.kakao.maps) return '#ff9800'
  return '#4caf50'
})

const canTest = computed(() => {
  return window.kakao && window.kakao.maps && apiKey && apiKey !== 'YOUR_APP_KEY'
})

// 스크립트 로드
const loadScript = () => {
  addLog('🔄 카카오 맵 스크립트 로딩 시작...')
  
  if (!apiKey || apiKey === 'YOUR_APP_KEY') {
    addLog('❌ API 키가 설정되지 않았습니다')
    alert('API 키를 먼저 설정해주세요!\n\n1. .env 파일 생성\n2. VITE_KAKAO_MAP_API_KEY=여러분의_키 추가\n3. npm run dev 재시작')
    return
  }

  // 기존 스크립트 제거
  const existing = document.querySelector('script[src*="dapi.kakao.com"]')
  if (existing) {
    existing.remove()
    addLog('🗑️ 기존 스크립트 제거')
  }

  const script = document.createElement('script')
  script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false`
  
  script.onload = () => {
    addLog('✅ 카카오 맵 스크립트 로드 성공!')
    if (window.kakao && window.kakao.maps) {
      addLog('✅ 카카오 맵 객체 확인됨')
    }
  }
  
  script.onerror = () => {
    addLog('❌ 카카오 맵 스크립트 로드 실패')
    addLog('🔍 API 키와 도메인 설정을 확인하세요')
  }

  document.head.appendChild(script)
  addLog('📤 스크립트 DOM에 추가됨')
}

// 지도 테스트
const testMap = () => {
  if (!canTest.value) {
    addLog('❌ 지도 테스트 불가능 - 카카오 맵 객체 없음')
    return
  }

  addLog('🧪 지도 테스트 시작...')
  mapMessage.value = '지도 생성 중...'

  window.kakao.maps.load(() => {
    try {
      const container = mapContainer.value
      const options = {
        center: new window.kakao.maps.LatLng(37.5665, 126.9780),
        level: 3
      }

      const map = new window.kakao.maps.Map(container, options)
      
      // 마커 추가
      const marker = new window.kakao.maps.Marker({
        position: new window.kakao.maps.LatLng(37.5665, 126.9780)
      })
      marker.setMap(map)

      mapCreated.value = true
      mapMessage.value = ''
      addLog('🎉 지도 생성 성공!')
      addLog('✅ 마커 추가 완료')
      
    } catch (error) {
      addLog(`❌ 지도 생성 실패: ${error.message}`)
      mapMessage.value = `지도 생성 실패: ${error.message}`
    }
  })
}

const openConsole = () => {
  addLog('💡 브라우저 개발자 도구를 열어 Console 탭을 확인하세요')
  alert('F12 키를 눌러 개발자 도구를 열고\nConsole 탭에서 에러를 확인하세요!')
}

onMounted(() => {
  addLog('🚀 카카오 맵 진단 도구 시작')
  addLog(`🔑 API 키 상태: ${apiKeyStatus.value}`)
  addLog(`📦 스크립트 상태: ${scriptStatus.value}`)
  addLog(`🗺️ 카카오 객체: ${kakaoStatus.value}`)
  
  if (window.kakao && window.kakao.maps) {
    addLog('✨ 카카오 맵이 이미 준비되어 있습니다!')
    mapMessage.value = '"지도 테스트" 버튼을 클릭하세요'
  } else {
    mapMessage.value = '"스크립트 로드" 버튼을 먼저 클릭하세요'
  }
})
</script>