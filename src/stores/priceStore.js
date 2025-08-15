import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const usePriceStore = defineStore('price', () => {
  // 상태
  const buildingDetail = ref(null)
  const priceHistory = ref([])
  const loading = ref(false)
  const error = ref(null)

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
    try {
      loading.value = true
      error.value = null

      const response = await axios.get(`/api/building/price/${buildingId}/detail`)
      buildingDetail.value = response.data

      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || '매물 정보를 불러오는데 실패했습니다.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchPriceHistory = async (buildingId, months = 12) => {
    try {
      loading.value = true
      error.value = null

      const response = await axios.get(`/api/building/price/${buildingId}/price-history`, {
        params: { months }
      })

      buildingDetail.value = response.data.buildingInfo
      priceHistory.value = response.data.priceHistory

      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || '시세 데이터를 불러오는데 실패했습니다.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearData = () => {
    buildingDetail.value = null
    priceHistory.value = []
    error.value = null
  }

  return {
    // 상태
    buildingDetail,
    priceHistory,
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
