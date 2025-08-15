import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { refreshToken as refreshTokenApi } from '@/api/auth/auth.js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('user')) || null)
  const accessToken = ref(localStorage.getItem('token') || null)
  const refreshToken = ref(localStorage.getItem('refreshToken') || null)
  const isAuthenticated = computed(() => !!accessToken.value && !!user.value)

  function login(credentials) {
    // 로그인 로직
  }

  function setTokens(tokens) {
    accessToken.value = tokens.accessToken
    refreshToken.value = tokens.refreshToken
    localStorage.setItem('token', tokens.accessToken)
    localStorage.setItem('refreshToken', tokens.refreshToken)
  }

  function setUser(userData) {
    user.value = userData
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('isLoggedIn', 'true')
  }

  function logout() {
    user.value = null
    accessToken.value = null
    refreshToken.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    localStorage.removeItem('isLoggedIn')
  }

  // 토큰 갱신 함수
  async function refreshAccessToken() {
    try {
      const response = await refreshTokenApi()
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data

      // 새로운 토큰들 저장
      setTokens({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken || refreshToken.value,
      })

      return newAccessToken
    } catch (error) {
      console.error('토큰 갱신 실패:', error)
      // 토큰 갱신 실패 시 로그아웃
      logout()
      throw error
    }
  }

  // 토큰 유효성 검사
  function isTokenValid() {
    if (!accessToken.value) return false

    // TODO: reissue 기능 개발 완료 후 정확한 만료 시간 검사 활성화
    // 현재는 토큰이 있으면 유효하다고 간주
    console.log('🔍 토큰 유효성 검사 - 일시적으로 토큰 존재 여부만 확인')
    return true

    /*
    try {
      // JWT 토큰의 만료 시간 확인 (간단한 검사)
      const payload = JSON.parse(atob(accessToken.value.split('.')[1]))
      const currentTime = Date.now() / 1000

      // 만료 5분 전부터는 갱신 필요로 간주
      return payload.exp > currentTime + 300
    } catch (error) {
      console.error('토큰 파싱 오류:', error)
      return false
    }
    */
  }

  function signup(userData) {
    // 회원가입 로직
  }

  function findId(email) {
    // 아이디 찾기 로직
  }

  function findPassword(email) {
    // 비밀번호 찾기 로직
  }

  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    login,
    logout,
    signup,
    findId,
    findPassword,
    setTokens,
    setUser,
    refreshAccessToken,
    isTokenValid,
  }
})
