import axios from 'axios'

// axios 인스턴스 생성
const api = axios.create({
  baseURL: '/api', // 프론트엔드에서는 /api 경로 사용
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 토큰 갱신 중인지 확인하는 플래그
let isRefreshing = false
// 토큰 갱신 대기 중인 요청들을 저장하는 배열
let failedQueue = []

// 대기 중인 요청들을 처리하는 함수
const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token)
    }
  })

  failedQueue = []
}

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    console.log('=== API 요청 전송 ===')
    console.log('메서드:', config.method?.toUpperCase())
    console.log('URL:', config.url)
    console.log('전체 URL:', `${config.baseURL}${config.url}`)
    console.log('요청 헤더:', config.headers)
    console.log('요청 데이터:', config.data)

    // 토큰이 있으면 헤더에 추가
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('토큰 추가됨:', token.substring(0, 20) + '...')
    } else {
      console.log('⚠토큰 없음 - localStorage에서 token을 찾을 수 없음')
    }

    // CORS 관련 헤더 확인
    console.log('최종 요청 헤더:', config.headers)
    console.log('=== 요청 전송 완료 ===')
    return config
  },
  (error) => {
    console.error('요청 인터셉터 오류:', error)
    return Promise.reject(error)
  }
)

// 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    console.log('API 응답 성공:', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      data: response.data,
    })
    return response
  },
  async (error) => {
    console.error('API 응답 오류:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message,
    })

    const originalRequest = error.config

    // 401 에러이고 토큰 갱신을 시도하지 않은 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      // 이미 토큰 갱신 중인 경우
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // refresh token으로 새로운 access token 요청
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) {
          throw new Error('No refresh token')
        }

        const response = await axios.post(
          '/api/auth/reissue',
          {
            refreshToken: refreshToken,
          },
          {
            baseURL: '', // 전체 URL 사용
            timeout: 5000,
          }
        )

        const { accessToken, newRefreshToken } = response.data

        // 새로운 토큰들을 저장
        localStorage.setItem('token', accessToken)
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken)
        }

        // 대기 중인 요청들 처리
        processQueue(null, accessToken)

        // 원래 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        // 토큰 갱신 실패 시 대기 중인 요청들 처리
        processQueue(refreshError, null)

        // 모든 토큰 제거
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        localStorage.removeItem('isLoggedIn')

        // 로그인 페이지로 리다이렉트
        window.location.href = '/auth/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
