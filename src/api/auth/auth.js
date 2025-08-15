import api from '../axios'

// 로그인
export const login = (credentials) => {
  return api.post('/auth/login', credentials)
}

// 회원가입
export const signup = (userData) => {
  return api.post('/auth/signup', userData)
}

// 로그아웃
export const logout = () => {
  return api.post('/auth/logout')
}

// 아이디 찾기
export const findId = (email) => {
  return api.post('/auth/find-id', { email })
}

// 비밀번호 찾기
export const findPassword = (email) => {
  return api.post('/auth/find-password', { email })
}

// 토큰 갱신
export const refreshToken = () => {
  return api.post('/auth/reissue')
}

// 사용자 정보 조회
export const getUserInfo = () => {
  return api.get('/auth/me')
}
