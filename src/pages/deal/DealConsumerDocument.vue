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
                @click="refreshDocument"
                class="inline-flex items-center px-3 py-1.5 border border-blue-300 text-xs font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg class="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                새로고침
              </button>
              <button
                @click="downloadPdf"
                :disabled="downloadLoading"
                class="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  v-if="downloadLoading"
                  class="w-3 h-3 mr-1.5 animate-spin"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <svg
                  v-else
                  class="w-3 h-3 mr-1.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                {{ downloadLoading ? '다운로드 중...' : '다운로드' }}
              </button>
            </div>
          </div>
        </div>

        <!-- PDF Container -->
        <div class="relative">
          <!-- 간단한 PDF 뷰어 -->
          <div class="overflow-auto" style="height: calc(100vh - 200px)">
            <div class="flex justify-center p-4">
              <div class="w-full max-w-4xl">
                <div class="bg-white rounded-lg shadow-sm border border-gray-300 overflow-hidden">
                  <!-- 간단한 PDF 뷰어 -->
                  <iframe
                    v-if="pdfUrl"
                    :src="pdfUrl"
                    class="w-full"
                    style="height: 1200px; border: none"
                    frameborder="0"
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
import { getConsumerDocumentUrl, refreshConsumerDocument } from '@/api/deal/deal'
import { DOCUMENT_TYPE } from '@/utils/constants'
import BackButton from '@/components/common/BackButton.vue'
import { getObject, createSignedUrl } from '@/utils/ncp-object-storage-service'

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
    const downloadLoading = ref(false)

    const buildingId = computed(() => route.params.buildingId) // 라우터에서 buildingId로 받음
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
      // 문서 타입에 따라 실제 NCP URL 사용
      const ncpUrls = {
        [DOCUMENT_TYPE.ESTATE]:
          'https://kr.object.ncloudstorage.com/bjs-bucket/estate-register-test_11111.pdf',
        [DOCUMENT_TYPE.BUILDING_REGISTER]:
          'https://kr.object.ncloudstorage.com/bjs-bucket/building-register-test_12345.pdf',
      }

      return ncpUrls[type] || ncpUrls[DOCUMENT_TYPE.ESTATE] // 기본값으로 estate URL 사용
    }

    // NCP URL에서 bucket과 object name 추출하는 함수
    const parseNcpUrl = (url) => {
      try {
        // NCP URL 형식: https://kr.object.ncloudstorage.com/bucket-name/object-name
        const urlObj = new URL(url)
        const pathParts = urlObj.pathname.split('/').filter((part) => part)

        if (pathParts.length >= 2) {
          return {
            bucketName: pathParts[0],
            objectName: pathParts.slice(1).join('/'), // 경로가 여러 단계일 수 있음
          }
        }

        // 기본값 반환
        return {
          bucketName: 'default-bucket',
          objectName: 'document.pdf',
        }
      } catch (error) {
        console.warn('URL 파싱 실패:', error)
        return {
          bucketName: 'default-bucket',
          objectName: 'document.pdf',
        }
      }
    }

    // NCP URL 유효성 검사 함수
    const isValidNcpUrl = (url) => {
      try {
        const urlObj = new URL(url)
        return urlObj.hostname === 'kr.object.ncloudstorage.com' && urlObj.protocol === 'https:'
      } catch (error) {
        return false
      }
    }

    // PDF URL에 파라미터 추가하여 브라우저 기능 비활성화
    const getSecurePdfUrl = (url) => {
      if (!url) return url

      // 서명된 URL인 경우 (이미 쿼리 파라미터가 있음)
      if (url.includes('X-Amz-Signature')) {
        return `${url}#toolbar=0&navpanes=0&scrollbar=0&statusbar=0&messages=0&view=FitH`
      }

      // 일반 HTTP URL인 경우 파라미터 추가
      if (url.startsWith('http')) {
        const separator = url.includes('?') ? '&' : '?'
        return `${url}${separator}#toolbar=0&navpanes=0&scrollbar=0&statusbar=0&messages=0&view=FitH`
      }

      // Data URL인 경우 파라미터 추가
      if (url.startsWith('data:')) {
        return `${url}#toolbar=0&navpanes=0&scrollbar=0&statusbar=0&messages=0&view=FitH`
      }

      return url
    }

    const loadDocument = async () => {
      try {
        loading.value = true
        error.value = null

        // 실제 API 호출 시도
        try {
          const response = await getConsumerDocumentUrl(buildingId.value, apiType.value)
          const originalUrl = response.data.url

          if (!originalUrl) {
            throw new Error('문서 URL을 받지 못했습니다.')
          }

          // NCP를 통해 문서 가져오기
          try {
            // NCP URL 유효성 검사
            if (!isValidNcpUrl(originalUrl)) {
              console.warn('유효하지 않은 NCP URL:', originalUrl)
              pdfUrl.value = getSecurePdfUrl(originalUrl)
              return
            }

            // URL에서 bucket과 object name 추출
            const { bucketName, objectName } = parseNcpUrl(originalUrl)

            console.log('NCP 요청 정보:', { bucketName, objectName })

            // 서명된 URL 생성하여 CORS 우회
            const signedUrl = createSignedUrl(bucketName, objectName)
            pdfUrl.value = getSecurePdfUrl(signedUrl)
          } catch (ncpError) {
            console.warn('NCP 요청 실패, 원본 URL 사용')
            // NCP 실패 시 원본 URL 사용
            pdfUrl.value = getSecurePdfUrl(originalUrl)
          }
        } catch (apiError) {
          console.warn('API 호출 실패, 더미 PDF 사용')
          // API 호출 실패 시 더미 PDF URL 사용 (NCP를 통해 가져오기)
          const dummyUrl = getDummyPdfUrl(apiType.value)

          try {
            // NCP URL 유효성 검사
            if (!isValidNcpUrl(dummyUrl)) {
              console.warn('유효하지 않은 더미 NCP URL:', dummyUrl)
              pdfUrl.value = getSecurePdfUrl(dummyUrl)
              return
            }

            // 더미 URL도 NCP를 통해 가져오기
            const { bucketName, objectName } = parseNcpUrl(dummyUrl)

            // 서명된 URL 생성하여 CORS 우회
            const signedUrl = createSignedUrl(bucketName, objectName)
            pdfUrl.value = getSecurePdfUrl(signedUrl)
          } catch (ncpError) {
            console.warn('더미 PDF NCP 요청 실패, 원본 URL 사용')
            // NCP 실패 시 원본 URL 사용
            pdfUrl.value = getSecurePdfUrl(dummyUrl)
          }
        }
      } catch (err) {
        console.error('문서 로드 오류')
        error.value =
          err.response?.data?.message || err.message || '문서를 불러오는 중 오류가 발생했습니다.'
      } finally {
        loading.value = false
      }
    }

    const refreshDocument = async () => {
      try {
        loading.value = true
        error.value = null

        // API 호출 시도
        try {
          const response = await refreshConsumerDocument(buildingId.value, apiType.value)
          const originalUrl = response.data.url

          if (!originalUrl) {
            throw new Error('문서 URL을 받지 못했습니다.')
          }

          // NCP를 통해 문서 가져오기
          try {
            // NCP URL 유효성 검사
            if (!isValidNcpUrl(originalUrl)) {
              console.warn('유효하지 않은 새로고침 NCP URL:', originalUrl)
              pdfUrl.value = getSecurePdfUrl(originalUrl)
              return
            }

            // URL에서 bucket과 object name 추출
            const { bucketName, objectName } = parseNcpUrl(originalUrl)

            // 서명된 URL 생성하여 CORS 우회
            const signedUrl = createSignedUrl(bucketName, objectName)
            pdfUrl.value = getSecurePdfUrl(signedUrl)
          } catch (ncpError) {
            console.warn('NCP 새로고침 요청 실패, 원본 URL 사용')
            // NCP 실패 시 원본 URL 사용
            pdfUrl.value = getSecurePdfUrl(originalUrl)
          }
        } catch (apiError) {
          console.warn('API 호출 실패, 더미 PDF 사용')
          // API 호출 실패 시 더미 PDF URL 사용 (NCP를 통해 가져오기)
          const dummyUrl = getDummyPdfUrl(apiType.value)

          try {
            // NCP URL 유효성 검사
            if (!isValidNcpUrl(dummyUrl)) {
              console.warn('유효하지 않은 더미 NCP URL:', dummyUrl)
              pdfUrl.value = getSecurePdfUrl(dummyUrl)
              return
            }

            // 더미 URL도 NCP를 통해 가져오기
            const { bucketName, objectName } = parseNcpUrl(dummyUrl)

            // 서명된 URL 생성하여 CORS 우회
            const signedUrl = createSignedUrl(bucketName, objectName)
            pdfUrl.value = getSecurePdfUrl(signedUrl)
          } catch (ncpError) {
            console.warn('더미 PDF NCP 요청 실패, 원본 URL 사용')
            // NCP 실패 시 원본 URL 사용
            pdfUrl.value = getSecurePdfUrl(dummyUrl)
          }
        }
      } catch (err) {
        console.error('문서 새로고침 오류')
        error.value =
          err.response?.data?.message ||
          err.message ||
          '문서를 새로고침하는 중 오류가 발생했습니다.'
      } finally {
        loading.value = false
      }
    }

    const downloadPdf = async () => {
      if (!pdfUrl.value) {
        console.warn('PDF URL이 없습니다.')
        return
      }

      downloadLoading.value = true

      try {
        // 서명된 URL인 경우 (NCP에서 생성된 경우)
        if (pdfUrl.value.includes('X-Amz-Signature')) {
          // fetch로 파일을 가져와서 다운로드
          const response = await fetch(pdfUrl.value)
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }

          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)

          const link = document.createElement('a')
          link.href = url
          link.download = `${documentTypeLabel.value}_${buildingId.value}.pdf`
          link.style.display = 'none'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)

          // Blob URL 정리
          window.URL.revokeObjectURL(url)
          console.log('다운로드 완료 (서명된 URL)')
          return
        }

        // 일반 HTTP URL인 경우
        if (pdfUrl.value.startsWith('http')) {
          // fetch로 파일을 가져와서 다운로드
          const response = await fetch(pdfUrl.value)
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }

          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)

          const link = document.createElement('a')
          link.href = url
          link.download = `${documentTypeLabel.value}_${buildingId.value}.pdf`
          link.style.display = 'none'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)

          // Blob URL 정리
          window.URL.revokeObjectURL(url)
          console.log('다운로드 완료 (HTTP URL)')
          return
        }

        console.warn('지원하지 않는 URL 형식:', pdfUrl.value)
      } catch (error) {
        console.error('다운로드 실패:', error)
        // 에러 발생 시 새 창에서 열기로 fallback
        window.open(pdfUrl.value, '_blank')
      } finally {
        downloadLoading.value = false
      }
    }

    onMounted(() => {
      loadDocument()
    })

    return {
      loading,
      error,
      pdfUrl,
      buildingId,
      documentType,
      documentTypeLabel,
      documentTitle,
      loadDocument,
      refreshDocument,
      downloadPdf,
      downloadLoading,
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
