import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api, handleApiError, createLoadingState } from '@/api/axios'

export const usePriceStore = defineStore('price', () => {
  // 상태
  const buildingDetail = ref(null)
  const priceHistory = ref([])

  // 로딩 상태 관리
  const { loading, error, executeRequest, clearError } = createLoadingState()

  // 계산된 속성
  const fullAddress = computed(() => {
    if (!buildingDetail.value) return ''
    return buildingDetail.value.fullAddress
  })

  const sigunguCode = computed(() => {
    if (!buildingDetail.value) return ''
    return buildingDetail.value.sigunguCode
  })

  // 액션
  const fetchBuildingDetail = async (buildingId) => {
    return executeRequest(async () => {
      const response = await api.get(`/building/price/${buildingId}/detail`)
      buildingDetail.value = response.data
      return response.data
    })
  }

  const fetchPriceHistory = async (buildingId, months = 12) => {
    return executeRequest(async () => {
      const response = await api.get(`/building/price/${buildingId}/price-history`, {
        params: { months }
      })

      buildingDetail.value = response.data.buildingInfo
      priceHistory.value = response.data.priceHistory

      return response.data
    })
  }

  const clearData = () => {
    buildingDetail.value = null
    priceHistory.value = []
    clearError()
  }

  return {
    // 상태
    buildingDetail,
    priceHistory,

    // 로딩 상태
    loading,
    error,

    // 계산된 속성
    fullAddress,
    sigunguCode,

    // 액션
    fetchBuildingDetail,
    fetchPriceHistory,
    clearData
  }
})

