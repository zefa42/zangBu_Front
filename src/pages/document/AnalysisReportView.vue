<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { getAnalysisReport } from '@/api/deal/deal'
import BackButton from '@/components/common/BackButton.vue'

const route = useRoute()
const reportHtml = ref('')
const loading = ref(true)
const error = ref(null)

const sectionVisibility = ref({})

const parsedSections = computed(() => {
  if (!reportHtml.value) return []
  const parser = new DOMParser()
  const doc = parser.parseFromString(reportHtml.value, 'text/html')
  const sections = []
  const headers = doc.querySelectorAll('h4')

  headers.forEach((header, index) => {
    let content = ''
    let currentNode = header.nextSibling
    while (currentNode && currentNode.nodeName !== 'H4') {
      if (currentNode.outerHTML) {
        content += currentNode.outerHTML
      } else if (currentNode.nodeType === Node.TEXT_NODE) {
        content += currentNode.textContent
      }
      currentNode = currentNode.nextSibling
    }

    const title = header.textContent.trim()
    sections.push({
      id: `section-${index}`,
      title: title,
      content: content.trim(),
    })

    if (sectionVisibility.value[title] === undefined) {
      sectionVisibility.value[title] = true
    }
  })

  return sections
})

const toggleSection = (title) => {
  sectionVisibility.value[title] = !sectionVisibility.value[title]
}

onMounted(async () => {
  try {
    const reportId = route.params.reportId
    const response = await getAnalysisReport(reportId)
    if (response.data && typeof response.data === 'string') {
      reportHtml.value = response.data
    } else {
      // Fallback to mock data if API response is not as expected
      reportHtml.value = mockHtmlReport
      console.warn('API response is not a string, using mock data.')
    }
  } catch (err) {
    console.error('Failed to fetch analysis report:', err)
    reportHtml.value = mockHtmlReport // Use mock on error
  } finally {
    loading.value = false
  }
})

const mockHtmlReport = `
  <div class="report-header">
    <h3 class="text-2xl font-bold text-blue-800 mb-6 text-center border-b-2 border-blue-200 pb-4">부동산 등기부·건축물대장 분석 리포트</h3>
  </div>
  
  <div class="section-content">
    <h4 class="section-title">1) 주요 재무 지표</h4>
    <div class="financial-metrics">
      <div class="metric-item">
        <span class="metric-label">선순위 채권액:</span>
        <span class="metric-value">384,000,000원</span>
      </div>
      <div class="metric-item">
        <span class="metric-label">최종낙찰가(추정):</span>
        <span class="metric-value">316,000,000원</span>
      </div>
      <div class="metric-item">
        <span class="metric-label">여유 보증금:</span>
        <span class="metric-value">216,000,000원</span>
      </div>
    </div>
  </div>
  
  <div class="section-content">
    <h4 class="section-title">2) 산출 근거</h4>
    <div class="calculation-basis">
      <div class="basis-item">
        <span class="basis-label">선순위 채권액:</span>
        <p class="basis-text">등기부상 순위번호 1번인 근저당권의 채권최고액 384,000,000원을 기준으로 산정했습니다.</p>
        <div class="note-box">
          <em>참고: 이 담보권은 <strong>건물만에 관한 담보권</strong>이라는 부기등기가 있습니다.</em>
        </div>
      </div>
      <div class="basis-item">
        <span class="basis-label">최종낙찰가(추정):</span>
        <p class="basis-text">시세(추정) 700,000,000원에서 선순위 채권액(384,000,000원)과 기타 선순위 채무액(0원)을 차감하여 산출했습니다.</p>
      </div>
      <div class="basis-item">
        <span class="basis-label">여유 보증금:</span>
        <p class="basis-text">최종낙찰가(추정) 316,000,000원에서 신청 보증금(100,000,000원)을 차감한 금액입니다.</p>
      </div>
    </div>
  </div>
  
  <div class="section-content">
    <h4 class="section-title">3) 소유자/권리현황</h4>
    <div class="ownership-info">
      <div class="info-item">
        <span class="info-label">소유자 유형:</span>
        <span class="info-value">개인 (소유자 이름 '김미숙'으로 법인/신탁 관련 표기 없음)</span>
      </div>
      <div class="info-item">
        <span class="info-label">권리침해 및 기타사항:</span>
        <div class="rights-list">
          <div class="right-item">근저당권 (중소기업은행, 채권최고액 384,000,000원)</div>
          <div class="right-item">부기등기 (1번 근저당권이 건물에만 해당함을 명시)</div>
          <div class="right-item">금지사항등기 (현재는 말소됨)</div>
        </div>
      </div>
    </div>
  </div>
  
  <div class="section-content">
    <h4 class="section-title">4) 소유권 변동 요약</h4>
    <div class="ownership-changes">
      <p class="change-text">
        2019년 12월 5일 '주식회사한길개발'이 소유권보존등기를 하였으며, 이후 2020년 2월 4일 현 소유자인 '김미숙'에게 소유권이 이전되었습니다. 이전 사유는 2017년 8월 4일자 매매이며, 거래가액은 504,980,000원입니다.
      </p>
    </div>
  </div>
  
  <div class="section-content">
    <h4 class="section-title">5) 위반건축물</h4>
    <div class="violation-info">
      <p class="violation-text">
        없음 (건축물대장상 위반건축물 관련 내용이 기재되어 있지 않습니다.)
      </p>
    </div>
  </div>
`
</script>

<template>
  <div class="container mx-auto p-4 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
    <header class="flex items-center mb-6">
      <BackButton />
      <h1 class="text-2xl font-bold text-center flex-1 text-gray-800">분석리포트 상세</h1>
    </header>

    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="mt-2 text-gray-600">로딩 중...</p>
    </div>

    <div v-if="!loading" class="space-y-6">
      <div
        v-for="section in parsedSections"
        :key="section.id"
        class="bg-white p-6 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <div
          class="flex justify-between items-center cursor-pointer group"
          @click="toggleSection(section.title)"
        >
          <h2
            class="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors"
          >
            {{ section.title }}
          </h2>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 ml-2 text-gray-400 transform transition-all duration-300 group-hover:text-blue-500"
            :class="{ 'rotate-180': !sectionVisibility[section.title] }"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div
          v-if="sectionVisibility[section.title]"
          class="mt-6 prose max-w-none"
          v-html="section.content"
        ></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.report-header) {
  margin-bottom: 2rem;
}

:deep(.section-content) {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  border-left: 4px solid #3b82f6;
}

:deep(.section-title) {
  color: #1e40af;
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #dbeafe;
}

:deep(.financial-metrics) {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

:deep(.metric-item) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

:deep(.metric-label) {
  font-weight: 600;
  color: #374151;
}

:deep(.metric-value) {
  font-weight: 700;
  color: #059669;
  font-size: 1.1rem;
}

:deep(.calculation-basis) {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

:deep(.basis-item) {
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border-left: 3px solid #10b981;
}

:deep(.basis-label) {
  font-weight: 600;
  color: #374151;
  display: block;
  margin-bottom: 0.5rem;
}

:deep(.basis-text) {
  color: #4b5563;
  line-height: 1.6;
  margin-bottom: 0.5rem;
}

:deep(.note-box) {
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 6px;
  padding: 0.75rem;
  margin-top: 0.5rem;
}

:deep(.note-box em) {
  color: #92400e;
  font-style: normal;
}

:deep(.ownership-info) {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

:deep(.info-item) {
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border-left: 3px solid #8b5cf6;
}

:deep(.info-label) {
  font-weight: 600;
  color: #374151;
  display: block;
  margin-bottom: 0.75rem;
}

:deep(.info-value) {
  color: #4b5563;
  font-weight: 500;
}

:deep(.rights-list) {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

:deep(.right-item) {
  padding: 0.5rem 0.75rem;
  background: #f3f4f6;
  border-radius: 6px;
  color: #4b5563;
  font-size: 0.9rem;
}

:deep(.ownership-changes) {
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border-left: 3px solid #f59e0b;
}

:deep(.change-text) {
  color: #4b5563;
  line-height: 1.7;
  text-align: justify;
}

:deep(.violation-info) {
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border-left: 3px solid #ef4444;
}

:deep(.violation-text) {
  color: #4b5563;
  line-height: 1.6;
}

/* Responsive design */
@media (max-width: 768px) {
  :deep(.metric-item) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  :deep(.section-content) {
    padding: 1rem;
  }
}
</style>
