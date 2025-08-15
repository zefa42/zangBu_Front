<template>
  <div class="price-chart-container">
    <div class="chart-header">
      <h3>📈 시세 그래프</h3>
      <div class="chart-controls">
        <select v-model="selectedPeriod" @change="updateChart">
          <option value="6">최근 6개월</option>
          <option value="12">최근 12개월</option>
          <option value="24">최근 24개월</option>
        </select>
      </div>
    </div>

    <div class="chart-wrapper">
      <canvas ref="chartCanvas" width="400" height="200"></canvas>
    </div>

    <div v-if="loading" class="loading">
      <p>시세 데이터를 불러오는 중...</p>
    </div>

    <div v-if="error" class="error">
      <p>{{ error }}</p>
    </div>

    <div v-if="!loading && !error && priceHistory.length === 0" class="no-data">
      <p>해당 기간의 시세 데이터가 없습니다.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { Chart, registerables } from 'chart.js'
import { usePriceStore } from '@/stores/priceStore'

// Chart.js 등록
Chart.register(...registerables)

// Props
const props = defineProps({
  buildingId: {
    type: [String, Number],
    required: true,
  },
})

// Store
const priceStore = usePriceStore()

// 상태
const chartCanvas = ref(null)
const selectedPeriod = ref(12)
const chart = ref(null)
const loading = ref(false)
const error = ref(null)

// 계산된 속성
const priceHistory = computed(() => priceStore.priceHistory)

// 차트 데이터 준비
const prepareChartData = () => {
  if (!priceHistory.value || priceHistory.value.length === 0) {
    return { labels: [], datasets: [] }
  }

  // 데이터 정렬 (년월순)
  const sortedData = [...priceHistory.value].sort((a, b) => {
    const yearA = a.year
    const monthA = a.month
    const yearB = b.year
    const monthB = b.month

    if (yearA !== yearB) return yearA - yearB
    return monthA - monthB
  })

  // 라벨과 데이터 추출
  const labels = sortedData.map((item) => `${item.year}년 ${item.month}월`)
  const prices = sortedData.map((item) => {
    // dealAmount는 "1억 5,000" 형태의 문자열이므로 숫자로 변환
    const amount = item.dealAmount
    if (typeof amount === 'string') {
      // "억" 단위 처리
      if (amount.includes('억')) {
        const parts = amount.split('억')
        const billion = parseFloat(parts[0]) || 0
        const million = parseFloat(parts[1]?.replace(/[^\d]/g, '')) || 0
        return billion + million / 10000
      }
      // 숫자만 있는 경우
      return parseFloat(amount.replace(/[^\d]/g, '')) / 10000
    }
    return amount
  })

  return {
    labels,
    datasets: [
      {
        label: '매매가 (억원)',
        data: prices,
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#4CAF50',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  }
}

// 차트 생성
const createChart = () => {
  if (chart.value) {
    chart.value.destroy()
  }

  const ctx = chartCanvas.value.getContext('2d')
  const chartData = prepareChartData()

  chart.value = new Chart(ctx, {
    type: 'line',
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: function (context) {
              return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}억원`
            },
          },
        },
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: '거래 시기',
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: '매매가 (억원)',
          },
          beginAtZero: false,
        },
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false,
      },
    },
  })
}

// 차트 업데이트
const updateChart = async () => {
  try {
    loading.value = true
    error.value = null

    await priceStore.fetchPriceHistory(props.buildingId, parseInt(selectedPeriod.value))

    if (chart.value) {
      const chartData = prepareChartData()
      chart.value.data = chartData
      chart.value.update()
    }
  } catch (err) {
    error.value = err.message || '차트 업데이트에 실패했습니다.'
  } finally {
    loading.value = false
  }
}

// 컴포넌트 마운트 시
onMounted(async () => {
  try {
    await priceStore.fetchPriceHistory(props.buildingId, parseInt(selectedPeriod.value))
    createChart()
  } catch (err) {
    error.value = err.message || '시세 데이터를 불러오는데 실패했습니다.'
  }
})

// 컴포넌트 언마운트 시
onUnmounted(() => {
  if (chart.value) {
    chart.value.destroy()
  }
})

// priceHistory 변경 감지
watch(
  priceHistory,
  () => {
    if (chart.value) {
      createChart()
    }
  },
  { deep: true }
)
</script>

<style scoped>
.price-chart-container {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin: 20px 0;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
}

.chart-controls select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  font-size: 14px;
  cursor: pointer;
}

.chart-wrapper {
  position: relative;
  height: 300px;
  margin: 20px 0;
}

.loading,
.error,
.no-data {
  text-align: center;
  padding: 40px;
  color: #666;
}

.error {
  color: #f44336;
}

.no-data {
  color: #999;
}
</style>
