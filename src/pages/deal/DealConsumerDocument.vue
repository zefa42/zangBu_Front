<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 뒤로가기 버튼 -->
    <BackButton />

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center h-96">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-4 text-gray-600">문서를 불러오는 중...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex items-center justify-center h-96">
        <div class="text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 class="mt-2 text-sm font-medium text-gray-900">문서를 불러올 수 없습니다</h3>
          <p class="mt-1 text-sm text-gray-500">{{ error }}</p>
          <div class="mt-6">
            <button
              @click="loadDocument"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>

      <!-- PDF Viewer -->
      <div v-else-if="pdfUrl" class="bg-white rounded-lg shadow-sm border">
        <div class="p-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-medium text-gray-900">{{ documentTitle }}</h2>
            </div>
            <div class="flex items-center space-x-3">
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {{ documentTypeLabel }}
              </span>
              <button
                @click="openOfficialDocument"
                class="inline-flex items-center px-3 py-1.5 border border-blue-300 text-xs font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg class="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                공식서류 열람
              </button>
              <button
                @click="downloadPdf"
                class="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg class="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                다운로드
              </button>
            </div>
          </div>
        </div>

        <!-- PDF Container -->
        <div class="relative">
          <div class="bg-gray-100 p-4">
            <div class="flex items-center justify-center space-x-4 mb-4">
              <button
                @click="zoomOut"
                :disabled="zoom <= 0.5"
                class="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-200 disabled:opacity-50"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"
                  />
                </svg>
              </button>
              <span class="text-sm text-gray-600">{{ Math.round(zoom * 100) }}%</span>
              <button
                @click="zoomIn"
                :disabled="zoom >= 2"
                class="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-200 disabled:opacity-50"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div class="overflow-auto" style="height: calc(100vh - 200px)">
            <div class="flex justify-center p-4">
              <div class="w-full max-w-4xl">
                <div class="bg-white rounded-lg shadow-sm border border-gray-300 overflow-hidden">
                  <iframe
                    :src="pdfUrl"
                    class="w-full"
                    :style="{
                      transform: `scale(${zoom})`,
                      transformOrigin: 'top center',
                      aspectRatio: '1 / 1.414',
                      minHeight: '800px',
                      maxHeight: 'calc(100vh - 300px)',
                    }"
                    frameborder="0"
                    sandbox="allow-same-origin allow-scripts"
                    allow="fullscreen"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No Document State -->
      <div v-else class="flex items-center justify-center h-96">
        <div class="text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
            <svg
              class="h-6 w-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 class="mt-2 text-sm font-medium text-gray-900">문서가 없습니다</h3>
          <p class="mt-1 text-sm text-gray-500">요청하신 문서를 찾을 수 없습니다.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getConsumerDocumentUrl } from '@/api/deal/deal'
import { DOCUMENT_TYPE } from '@/utils/constants'
import BackButton from '@/components/common/BackButton.vue'

export default {
  name: 'DealConsumerDocument',
  components: {
    BackButton,
  },
  setup() {
    const route = useRoute()
    const router = useRouter()

    const loading = ref(true)
    const error = ref(null)
    const pdfUrl = ref(null)
    const zoom = ref(1)

    const dealId = computed(() => route.params.dealId)
    const documentType = computed(() => route.params.type)

    const documentTypeLabel = computed(() => {
      const typeMap = {
        register: '등기부등본',
        building: '건축물대장',
      }
      return typeMap[documentType.value] || documentType.value
    })

    const documentTitle = computed(() => {
      return `${documentTypeLabel.value} 문서`
    })

    // API 요청용 type 매핑
    const apiType = computed(() => {
      const typeMap = {
        register: DOCUMENT_TYPE.ESTATE,
        building: DOCUMENT_TYPE.BUILDING_REGISTER,
      }
      return typeMap[documentType.value] || documentType.value
    })

    // 더미 PDF URL 생성 함수
    const getDummyPdfUrl = (type) => {
      const dummyPdfBase64 =
        'JVBERi0xLjQKJcOkw7zDtsO8DQoxIDAgb2JqDQo8PA0KL1R5cGUgL0NhdGFsb2cNCi9QYWdlcyAyIDAgUg0KPj4NCmVuZG9iag0KMiAwIG9iag0KPDwNCi9UeXBlIC9QYWdlcw0KL0NvdW50IDENCi9LaWRzIFsgMyAwIFIgXQ0KPj4NCmVuZG9iag0KMyAwIG9iag0KPDwNCi9UeXBlIC9QYWdlDQovUGFyZW50IDIgMCBSDQovUmVzb3VyY2VzIDw8DQovRm9udCA8PA0KL0YxIDQgMCBSDQo+Pg0KPj4NCi9NZWRpYUJveCBbIDAgMCA2MTIgNzkyIF0NCi9Db250ZW50cyA1IDAgUg0KPj4NCmVuZG9iag0KNCAwIG9iag0KPDwNCi9UeXBlIC9Gb250DQovU3VidHlwZSAvVHlwZTENCi9CYXNlRm9udCAvSGVsdmV0aWNhDQovRW5jb2RpbmcgL1dpbkFuc2lFbmNvZGluZw0KPj4NCmVuZG9iag0KNSAwIG9iag0KPDwNCi9MZW5ndGggNDQNCj4+DQpzdHJlYW0NCkJUCjcwIDUwIFRECi9GMSAxMiBUZgooSGVsbG8gV29ybGQpIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoNCnhyZWYNCjAgNg0KMDAwMDAwMDAwMCA2NTUzNSBmDQowMDAwMDAwMDEwIDAwMDAwIG4NCjAwMDAwMDAwNzkgMDAwMDAgbg0KMDAwMDAwMDE3MyAwMDAwMCBuDQowMDAwMDAwMzAxIDAwMDAwIG4NCjAwMDAwMDAzODAgMDAwMDAgbg0KdHJhaWxlcg0KPDwNCi9TaXplIDYNCi9Sb290IDEgMCBSDQo+Pg0Kc3RhcnR4cmVmDQo0OTINCiUlRU9G'
      return `data:application/pdf;base64,${dummyPdfBase64}`
    }

    // PDF URL에 파라미터 추가하여 브라우저 기능 비활성화
    const getSecurePdfUrl = (url) => {
      if (!url) return url

      // Data URL인 경우 파라미터 추가
      if (url.startsWith('data:')) {
        return `${url}#toolbar=0&navpanes=0&scrollbar=0&statusbar=0&messages=0&scrollbar=0&toolbar=0&navpanes=0&scrollbar=0&statusbar=0&messages=0&view=FitH`
      }

      // 외부 URL인 경우 파라미터 추가
      const separator = url.includes('?') ? '&' : '?'
      return `${url}${separator}#toolbar=0&navpanes=0&scrollbar=0&statusbar=0&messages=0&view=FitH`
    }

    const loadDocument = async () => {
      try {
        loading.value = true
        error.value = null

        // 실제 API 호출 시도
        try {
          const response = await getConsumerDocumentUrl(dealId.value, apiType.value)
          const originalUrl = response.data.url

          if (!originalUrl) {
            throw new Error('문서 URL을 받지 못했습니다.')
          }

          // PDF URL을 보안 처리하여 브라우저 기능 비활성화
          pdfUrl.value = getSecurePdfUrl(originalUrl)
        } catch (apiError) {
          console.warn('API 호출 실패, 더미 PDF 사용:', apiError)
          // API 호출 실패 시 더미 PDF URL 사용
          const dummyUrl = getDummyPdfUrl(documentType.value)
          pdfUrl.value = getSecurePdfUrl(dummyUrl)
        }
      } catch (err) {
        console.error('문서 로드 오류:', err)
        error.value =
          err.response?.data?.message || err.message || '문서를 불러오는 중 오류가 발생했습니다.'
      } finally {
        loading.value = false
      }
    }

    const openOfficialDocument = async () => {
      try {
        loading.value = true
        error.value = null

        // 공식서류 열람 API 호출
        const response = await getConsumerDocumentUrl(dealId.value, apiType.value)
        const originalUrl = response.data.url

        if (!originalUrl) {
          throw new Error('공식서류 URL을 받지 못했습니다.')
        }

        // 새 창에서 공식서류 열기
        window.open(originalUrl, '_blank', 'noopener,noreferrer')
      } catch (err) {
        console.error('공식서류 열람 오류:', err)
        error.value = err.response?.data?.message || err.message || '공식서류를 열람할 수 없습니다.'
      } finally {
        loading.value = false
      }
    }

    const downloadPdf = () => {
      if (pdfUrl.value) {
        const link = document.createElement('a')
        link.href = pdfUrl.value
        link.download = `${documentTypeLabel.value}_${dealId.value}.pdf`
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    }

    const zoomIn = () => {
      if (zoom.value < 2) {
        zoom.value = Math.min(2, zoom.value + 0.1)
      }
    }

    const zoomOut = () => {
      if (zoom.value > 0.5) {
        zoom.value = Math.max(0.5, zoom.value - 0.1)
      }
    }

    onMounted(() => {
      loadDocument()
    })

    return {
      loading,
      error,
      pdfUrl,
      zoom,
      dealId,
      documentType,
      documentTypeLabel,
      documentTitle,
      loadDocument,
      openOfficialDocument,
      downloadPdf,
      zoomIn,
      zoomOut,
    }
  },
}
</script>

<style scoped>
.overflow-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.overflow-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.overflow-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
