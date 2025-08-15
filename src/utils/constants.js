// 거래 상태 상수
export const DEAL_STATUS = {
  BEFORE_TRANSACTION: 'BEFORE_TRANSACTION', // 거래 전
  BEFORE_OWNER: 'BEFORE_OWNER', // 소유자 확인 대기
  BEFORE_CONSUMER: 'BEFORE_CONSUMER', // 소비자 확인 대기
  MIDDLE_DEAL: 'MIDDLE_DEAL', // 거래 진행 중
  CLOSE_DEAL: 'CLOSE_DEAL', // 거래 완료
  CANCEL_DEAL: 'CANCEL_DEAL', // 거래 취소
}

// 거래 상태 한글 매핑
export const DEAL_STATUS_LABELS = {
  [DEAL_STATUS.BEFORE_TRANSACTION]: '거래 전',
  [DEAL_STATUS.BEFORE_OWNER]: '소유자 확인 대기',
  [DEAL_STATUS.BEFORE_CONSUMER]: '소비자 확인 대기',
  [DEAL_STATUS.MIDDLE_DEAL]: '거래 진행 중',
  [DEAL_STATUS.CLOSE_DEAL]: '거래 완료',
  [DEAL_STATUS.CANCEL_DEAL]: '거래 취소',
}

// 매물 타입 상수
export const PROPERTY_TYPE = {
  APARTMENT: 'APARTMENT', // 아파트
  VILLA: 'VILLA', // 빌라
  OFFICETEL: 'OFFICETEL', // 오피스텔
  HOUSE: 'HOUSE', // 단독주택
}

// 매물 타입 한글 매핑
export const PROPERTY_TYPE_LABELS = {
  [PROPERTY_TYPE.APARTMENT]: '아파트',
  [PROPERTY_TYPE.VILLA]: '빌라',
  [PROPERTY_TYPE.OFFICETEL]: '오피스텔',
  [PROPERTY_TYPE.HOUSE]: '단독주택',
}

// 문서 타입 상수
export const DOCUMENT_TYPE = {
  ESTATE: 'ESTATE', // 등기부등본
  BUILDING_REGISTER: 'BUILDING_REGISTER', // 건축물대장
}

// 문서 타입 한글 매핑
export const DOCUMENT_TYPE_LABELS = {
  [DOCUMENT_TYPE.ESTATE]: '등기부등본',
  [DOCUMENT_TYPE.BUILDING_REGISTER]: '건축물대장',
}
