<template>
  <div class="diagnostic-container">
    <h1>🔧 카카오 맵 진단 도구</h1>
    
    <!-- 기본 정보 -->
    <div class="section">
      <h2>📋 기본 정보</h2>
      <div class="info-item">
        <span class="label">현재 URL:</span>
        <span class="value">{{ currentUrl }}</span>
      </div>
      <div class="info-item">
        <span class="label">환경:</span>
        <span class="value">{{ isDev ? '개발' : '프로덕션' }}</span>
      </div>
    </div>

    <!-- API 키 확인 -->
    <div class="section">
      <h2>🔑 API 키 확인</h2>
      <div class="check-item" :class="apiKeyStatus.class">
        <span class="status">{{ apiKeyStatus.icon }}</span>
        <span class="message">{{ apiKeyStatus.message }}</span>
      </div>
      <div v-if="maskedApiKey" class="api-key-info">
        <span class="label">API 키:</span>
        <span class="value monospace">{{ maskedApiKey }}</span>
      </div>
    </div>

    <!-- 스크립트 로딩 확인 -->
    <div class="section">
      <h2>📦 스크립트 로딩</h2>
      <div class="check-item" :class="scriptStatus.class">
        <span class="status">{{ scriptStatus.icon }}</span>
        <span class="message">{{ scriptStatus.message }}</span>
      </div>
      <button @click="loadKakaoScript" :disabled="scriptLoading" class="test-btn">
        {{ scriptLoading ? '로딩 중...' : '스크립트 다시 로드' }}
      </button>
    </div>

    <!-- 카카오 맵 객체 확인 -->
    <div class="section">
      <h2>🗺️ 카카오 맵 객체</h2>
      <div class="check-item" :class="kakaoStatus.class">
        <span class="status">{{ kakaoStatus.icon }}</span>
        <span class="message">{{ kakaoStatus.message }}</span>
      </div>
    </div>

    <!-- 테스트 맵 -->
    <div class="section">
      <h2>🧪 테스트 맵</h2>
      <button @click="testMap" :disabled="!canTestMap" class="test-btn">
        테스트 맵 생성
      </button>
      <div 
        ref="testMapContainer" 
        class="test-map-container"
        :class="{ 'map-loaded': testMapLoaded }"
      >
        <div v-if="!testMapLoaded" class="map-placeholder">
          테스트 맵이 여기에 표시됩니다
        </div>
      </div>
      <div v-if="mapError" class="error-message">
        {{ mapError }}
      </div>
    </div>

    <!-- 해결 방법 -->
    <div class="section">
      <h2>💡 해결 방법</h2>
      <div class="solution-steps">
        <div class="step">
          <strong>1. API 키 설정</strong>
          <div class="code-block">
            <code># .env 파일에 추가
VITE_KAKAO_MAP_API_KEY=여러분의_실제_API_키</code>
          </div>
        </div>
        
        <div class="step">
          <strong>2. 카카오 개발자 콘솔 설정</strong>
          <ul>
            <li><a href="https://developers.kakao.com/" target="_blank">카카오 개발자 사이트</a> 접속</li>
            <li>앱 설정 → 플랫폼 → Web 플랫폼 추가</li>
            <li>사이트 도메인에 <code>http://localhost:5173</code> 추가</li>
            <li>JavaScript 키 복사하여 .env에 설정</li>
          </ul>
        </div>

        <div class="step">
          <strong>3. 서버 재시작</strong>
          <div class="code-block">
            <code>npm run dev</code>
          </div>
        </div>
      </div>
    </div>

    <!-- 네트워크 테스트 -->
    <div class="section">
      <h2>🌐 네트워크 테스트</h2>
      <button @click="testNetwork" :disabled="networkTesting" class="test-btn">
        {{ networkTesting ? '테스트 중...' : '카카오 API 연결 테스트' }}
      </button>
      <div v-if="networkResult" class="network-result" :class="networkResult.success ? 'success' : 'error'">
        {{ networkResult.message }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const currentUrl = ref(window.location.href)
const isDev = ref(import.meta.env.DEV)
const apiKey = ref(import.meta.env.VITE_KAKAO_MAP_API_KEY)
const scriptLoading = ref(false)
const testMapContainer = ref(null)
const testMapLoaded = ref(false)
const mapError = ref('')
const networkTesting = ref(false)
const networkResult = ref(null)

// API 키 상태
const apiKeyStatus = computed(() => {
  if (!apiKey.value || apiKey.value === 'YOUR_APP_KEY') {
    return {
      icon: '❌',
      message: 'API 키가 설정되지 않았습니다',
      class: 'error'
    }
  }
  if (apiKey.value.length < 20) {
    return {
      icon: '⚠️',
      message: 'API 키가 너무 짧습니다 (올바르지 않을 수 있음)',
      class: 'warning'
    }
  }
  return {
    icon: '✅',
    message: 'API 키가 설정되었습니다',
    class: 'success'
  }
})

// 마스킹된 API 키
const maskedApiKey = computed(() => {
  if (!apiKey.value || apiKey.value === 'YOUR_APP_KEY') return null
  return apiKey.value.substring(0, 10) + '...' + apiKey.value.slice(-4)
})

// 스크립트 로딩 상태
const scriptStatus = computed(() => {
  const script = document.querySelector('script[src*="dapi.kakao.com"]')
  if (!script) {
    return {
      icon: '❌',
      message: '카카오 맵 스크립트가 로드되지 않았습니다',
      class: 'error'
    }
  }
  return {
    icon: '✅',
    message: '카카오 맵 스크립트가 로드되었습니다',
    class: 'success'
  }
})

// 카카오 맵 객체 상태
const kakaoStatus = computed(() => {
  if (!window.kakao) {
    return {
      icon: '❌',
      message: 'window.kakao 객체가 없습니다',
      class: 'error'
    }
  }
  if (!window.kakao.maps) {
    return {
      icon: '⚠️',
      message: 'kakao.maps 객체가 없습니다',
      class: 'warning'
    }
  }
  return {
    icon: '✅',
    message: '카카오 맵 객체가 정상적으로 로드되었습니다',
    class: 'success'
  }
})

// 테스트 가능 여부
const canTestMap = computed(() => {
  return window.kakao && window.kakao.maps && apiKey.value && apiKey.value !== 'YOUR_APP_KEY'
})

// 카카오 스크립트 로드
const loadKakaoScript = async () => {
  if (!apiKey.value || apiKey.value === 'YOUR_APP_KEY') {
    alert('먼저 API 키를 설정해주세요')
    return
  }

  scriptLoading.value = true
  
  // 기존 스크립트 제거
  const existingScript = document.querySelector('script[src*="dapi.kakao.com"]')
  if (existingScript) {
    existingScript.remove()
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey.value}&autoload=false`
    script.async = true
    
    script.onload = () => {
      console.log('✅ 카카오 맵 스크립트 로드 성공')
      scriptLoading.value = false
      resolve()
    }
    
    script.onerror = (error) => {
      console.error('❌ 카카오 맵 스크립트 로드 실패:', error)
      scriptLoading.value = false
      reject(error)
    }
    
    document.head.appendChild(script)
  })
}

// 테스트 맵 생성
const testMap = () => {
  if (!canTestMap.value) {
    alert('카카오 맵 객체가 준비되지 않았습니다')
    return
  }

  try {
    mapError.value = ''
    
    window.kakao.maps.load(() => {
      const container = testMapContainer.value
      const options = {
        center: new window.kakao.maps.LatLng(37.5665, 126.9780),
        level: 3
      }
      
      const testMap = new window.kakao.maps.Map(container, options)
      testMapLoaded.value = true
      
      // 마커 추가
      const markerPosition = new window.kakao.maps.LatLng(37.5665, 126.9780)
      const marker = new window.kakao.maps.Marker({
        position: markerPosition
      })
      marker.setMap(testMap)
      
      console.log('✅ 테스트 맵 생성 성공!')
    })
  } catch (error) {
    mapError.value = `맵 생성 실패: ${error.message}`
    console.error('❌ 테스트 맵 생성 실패:', error)
  }
}

// 네트워크 테스트
const testNetwork = async () => {
  networkTesting.value = true
  networkResult.value = null
  
  try {
    const response = await fetch('//dapi.kakao.com/v2/maps/sdk.js?appkey=test')
    if (response.ok || response.status === 401) { // 401은 API 키 문제이므로 네트워크는 정상
      networkResult.value = {
        success: true,
        message: '카카오 API 서버에 정상 연결됩니다'
      }
    } else {
      networkResult.value = {
        success: false,
        message: `연결 실패: ${response.status}`
      }
    }
  } catch (error) {
    networkResult.value = {
      success: false,
      message: `네트워크 오류: ${error.message}`
    }
  }
  
  networkTesting.value = false
}

onMounted(() => {
  console.log('🔧 카카오 맵 진단 도구 시작')
  console.log('API 키:', maskedApiKey.value)
  console.log('Kakao 객체:', !!window.kakao)
  console.log('Kakao Maps:', !!(window.kakao && window.kakao.maps))
})
</script>

<style scoped>
.diagnostic-container {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

h1 {
  color: #333;
  border-bottom: 3px solid #4CAF50;
  padding-bottom: 10px;
  margin-bottom: 30px;
}

h2 {
  color: #555;
  margin: 20px 0 15px 0;
  font-size: 18px;
}

.section {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.info-item, .check-item {
  padding: 8px 0;
  display: flex;
  align-items: center;
}

.label {
  font-weight: 600;
  margin-right: 10px;
  min-width: 100px;
}

.value {
  color: #666;
}

.monospace {
  font-family: 'Courier New', monospace;
  background: #f5f5f5;
  padding: 2px 4px;
  border-radius: 3px;
}

.check-item {
  margin: 10px 0;
}

.check-item.success { color: #4CAF50; }
.check-item.warning { color: #FF9800; }
.check-item.error { color: #f44336; }

.status {
  margin-right: 8px;
  font-size: 16px;
}

.test-btn {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  margin: 10px 5px 10px 0;
  font-size: 14px;
}

.test-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.test-btn:hover:not(:disabled) {
  background: #45a049;
}

.test-map-container {
  width: 100%;
  height: 300px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  margin: 15px 0;
  position: relative;
  overflow: hidden;
}

.test-map-container.map-loaded {
  border: 2px solid #4CAF50;
}

.map-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
  font-style: italic;
}

.error-message {
  color: #f44336;
  background: #ffebee;
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0;
}

.solution-steps .step {
  margin: 20px 0;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 5px;
  border-left: 4px solid #4CAF50;
}

.code-block {
  background: #2d3748;
  color: #e2e8f0;
  padding: 10px;
  border-radius: 4px;
  margin: 8px 0;
  font-family: 'Courier New', monospace;
  font-size: 13px;
}

.step ul {
  margin: 10px 0;
  padding-left: 20px;
}

.step li {
  margin: 5px 0;
}

.step a {
  color: #4CAF50;
  text-decoration: none;
}

.step a:hover {
  text-decoration: underline;
}

.network-result {
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0;
}

.network-result.success {
  background: #e8f5e8;
  color: #2e7d32;
  border: 1px solid #4caf50;
}

.network-result.error {
  background: #ffebee;
  color: #c62828;
  border: 1px solid #f44336;
}

.api-key-info {
  margin: 10px 0;
  padding: 8px 0;
}
</style>