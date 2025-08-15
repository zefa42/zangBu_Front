import api from '../axios'

// 백엔드 서버 연결 상태 확인
export const checkServerHealth = () => {
  return api.get('/health')
}

// 거래 전체 목록 조회
export const getDeals = () => {
  console.log('getDeals 함수 호출됨')
  console.log('/deal/waitinglist 엔드포인트 호출')

  // Postman에서 작동하는 방식과 동일하게 설정
  return api.get('/deal/waitinglist', {
    headers: {
      'Content-Type': 'application/json',
      // Postman에서 사용한 헤더와 동일하게 설정
    },
  })
}

// 거래 생성
export const createDeal = (dealData) => {
  return api.post('/deals', dealData)
}

// 거래 상세 조회
export const getDealDetail = (dealId) => {
  return api.get(`/deals/${dealId}`)
}

// 거래 상태 업데이트
export const updateDealStatus = (dealId, status) => {
  return api.put(`/deals/${dealId}/status`, { status })
}

// 거래 상태 변경 (새로운 엔드포인트)
export const changeDealStatus = (dealData) => {
  return api.patch('/deal/status', dealData)
}

// 거래 취소
export const cancelDeal = (dealId, reason) => {
  return api.put(`/deals/${dealId}/cancel`, { reason })
}

// 거래 완료
export const completeDeal = (dealId) => {
  return api.put(`/deals/${dealId}/complete`)
}

// 거래 가이드 조회
export const getDealGuide = () => {
  return api.get('/deals/guide')
}

// 거래 이력 조회
export const getDealHistory = (params) => {
  return api.get('/deals/history', { params })
}

// 거래 평가
export const rateDeal = (dealId, rating) => {
  return api.post(`/deals/${dealId}/rating`, rating)
}

// 거래전 안내 정보 조회
export const getDealNotice = (dealId) => {
  return api.get(`/deal/notice/${dealId}`)
}

// 소비자 문서 다운로드 URL 조회
export const getConsumerDocumentUrl = (dealId, type) => {
  return api.get(`/deal/consumer/documents/${dealId}/${type}/download`)
}
