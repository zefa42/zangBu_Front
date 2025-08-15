import { createRouter, createWebHistory } from 'vue-router'

// 메인 페이지
import MainView from '@/pages/MainView.vue'
import MapView from '@/pages/map/MapView.vue'
import MapTestView from '@/pages/map/MapTestView.vue'

// 인증 관련 페이지
import LoginView from '@/pages/auth/LoginView.vue'
import SignupView from '@/pages/auth/SignupView.vue'
import FindIdView from '@/pages/auth/FindIdView.vue'
import FindPasswordView from '@/pages/auth/FindPasswordView.vue'
import VerifyIdentity from '@/pages/auth/VerifyIdentity.vue'
import EnterAddress from '@/pages/auth/EnterAddress.vue'

// 사용자 관련 페이지
import MyPageView from '@/pages/user/MyPageView.vue'
import ProfileEditView from '@/pages/user/ProfileEditView.vue'
import WithdrawView from '@/pages/user/WithdrawView.vue'

// 매물 관련 페이지
import PropertyRegisterView from '@/pages/property/PropertyRegisterView.vue'

// 채팅 관련 페이지
import ChatListView from '@/pages/chat/ChatListView.vue'
import ChatRoomView from '@/pages/chat/ChatRoomView.vue'

// 거래 관련 페이지
import DealGuideView from '@/pages/deal/DealGuideView.vue'
import DealSellerView from '@/pages/deal/DealSellerView.vue'
import DealBuyerView from '@/pages/deal/DealBuyerView.vue'
import DealWaitingListView from '@/pages/deal/DealWaitingListView.vue'
import DealNoticeView from '@/pages/deal/DealNoticeView.vue'
import DealConsumerDocument from '@/pages/deal/DealConsumerDocument.vue'

// 문서 관련 페이지
import DocumentView from '@/pages/document/DocumentView.vue'
import AnalysisReportView from '@/pages/document/AnalysisReportView.vue'

// 리뷰 관련 페이지
import ReviewView from '@/pages/review/ReviewView.vue'
import ReviewWriteView from '@/pages/review/ReviewWriteView.vue'

// 알림 관련 페이지
import NotificationView from '@/pages/notification/NotificationView.vue'

// 결제 관련 페이지
import PaymentView from '@/pages/payment/PaymentView.vue'
import PaymentSuccessView from '@/pages/payment/PaymentSuccessView.vue'
import PaymentFailView from '@/pages/payment/PaymentFailView.vue'
import PaymentConfirmView from '@/pages/payment/PaymentConfirmView.vue'
import PaymentDevView from '@/pages/payment/PaymentDevView.vue'

// 가이드 페이지
import GuideMainView from '@/pages/guide/GuideMainView.vue'
import ColorGuideView from '@/pages/guide/ColorGuideView.vue'
import PropertyCardGuideView from '@/pages/guide/PropertyCardGuideView.vue'
import PropertyCardMainView from '@/pages/guide/PropertyCardMainView.vue'
import PropertyCardWaitingView from '@/pages/guide/PropertyCardWaitingView.vue'
import ButtonGuideView from '@/pages/guide/ButtonGuideView.vue'
import InputGuideView from '@/pages/guide/InputGuideView.vue'
import DropboxGuideView from '@/pages/guide/DropboxGuideView.vue'
import FooterGuideView from '@/pages/guide/FooterGuideView.vue'
import PopupModalGuideView from '@/pages/guide/PopupModalGuideView.vue'
import HeaderGuideView from '@/pages/guide/HeaderGuideView.vue'
import TailwindGuideView from '@/pages/guide/TailwindGuideView.vue'
import SidebarGuideView from '@/pages/guide/SidebarGuideView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 메인 페이지
    {
      path: '/',
      name: 'main',
      component: MainView,
    },

    {
      path: '/map',
      name: 'map',
      component: MapView,
    },
    {
      path: '/map/apt/:buildingId',
      name: 'map-detail',
      component: MapView,
      props: true,
    },
    {
      path: '/map/test',
      name: 'map-test',
      component: MapTestView,
    },

    // 인증 관련 라우트
    {
      path: '/auth/login',
      name: 'login',
      component: LoginView,
      meta: { hideHeaderFooter: true },
    },
    {
      path: '/auth/verify',
      name: 'verify-identity',
      component: VerifyIdentity,
    },
    {
      path: '/auth/enter-address',
      name: 'enter-addtess',
      component: EnterAddress,
    },
    {
      path: '/auth/signup',
      name: 'signup',
      component: SignupView,
      beforeEnter: (to, from, next) => {
        if (to.path === '/auth/signup') {
          const verified = sessionStorage.getItem('verified') === 'true'
          if (!verified) {
            // 인증 안 했으면 verify 페이지로 리다이렉트
            return next('/auth/verify')
          }
        }
        sessionStorage.removeItem('verified')
        next()
      },
    },
    {
      path: '/auth/find-id',
      name: 'find-id',
      component: FindIdView,
    },
    {
      path: '/auth/find-password',
      name: 'find-password',
      component: FindPasswordView,
      beforeEnter: (to, from, next) => {
        const verified = sessionStorage.getItem('verified') === 'true'
        if (!verified) {
          // 인증 안 했으면 verify 페이지로 이동
          return next('/auth/verify')
        }
        // 인증이 끝난 경우 verified 상태 초기화
        sessionStorage.removeItem('verified')
        next()
      },
    },

    // 사용자 관련 라우트
    {
      path: '/user/mypage',
      name: 'mypage',
      component: MyPageView,
    },
    {
      path: '/user/profile-edit',
      name: 'profile-edit',
      component: ProfileEditView,
    },
    {
      path: '/user/withdraw',
      name: 'withdraw',
      component: WithdrawView,
    },

    // 매물 관련 라우트
    {
      path: '/property/register',
      name: 'register',
      component: PropertyRegisterView,
      props: true,
    },

    // 채팅 관련 라우트
    {
      path: '/chat/list',
      name: 'chat-list',
      component: ChatListView,
    },
    {
      path: '/chat/room',
      // path: '/chat/room/:roomId',
      name: 'chat-room',
      component: ChatRoomView,
    },

    // 거래 관련 라우트
    {
      path: '/deal/guide',
      name: 'deal-guide',
      component: DealGuideView,
    },
    {
      path: '/deal/notice/:buildingId',
      name: 'deal-notice',
      component: DealNoticeView,
      props: true,
    },
    {
      path: '/deal/seller/:dealId',
      name: 'deal-seller',
      component: DealSellerView,
      props: true,
    },
    {
      path: '/deal/buyer/:dealId',
      name: 'deal-buyer',
      component: DealBuyerView,
      props: true,
    },
    // 거래 중인 매물(전체) 불러오기
    {
      path: '/deal/waitinglist',
      name: 'deal-waitinglist',
      component: DealWaitingListView,
      props: true,
    },
    // 소비자 문서 조회
    {
      path: '/deal/consumer/documents/:dealId/:type',
      name: 'deal-consumer-document',
      component: DealConsumerDocument,
      props: true,
    },

    // 문서 관련 라우트
    {
      path: '/document',
      name: 'document',
      component: DocumentView,
    },
    {
      path: '/document/analysis-report/:propertyId',
      name: 'analysis-report',
      component: AnalysisReportView,
      props: true,
    },

    // 리뷰 관련 라우트
    {
      path: '/review/:buildingId',
      name: 'review',
      component: ReviewView,
      props: true,
    },
    {
      path: '/review/write/:buildingId',
      name: 'review-write',
      component: ReviewWriteView,
      props: true,
    },

    // 알림 관련 라우트
    {
      path: '/notification',
      name: 'notification',
      component: NotificationView,
    },

    // 결제 관련 라우트
    {
      path: '/payment',
      name: 'payment',
      component: PaymentView,
    },
    {
      path: '/payment/success',
      name: 'payment-success',
      component: PaymentSuccessView,
    },
    {
      path: '/payment/fail',
      name: 'payment-fail',
      component: PaymentFailView,
    },
    {
      path: '/payment/confirm',
      name: 'payment-confirm',
      component: PaymentConfirmView,
    },
    {
      path: '/payment/dev',
      name: 'payment-dev',
      component: PaymentDevView,
    },

    // 가이드 라우트
    {
      path: '/guide',
      name: 'guide',
      component: GuideMainView,
    },
    {
      path: '/guide/color-guide',
      name: 'color-guide',
      component: ColorGuideView,
    },
    {
      path: '/guide/property-card-guide',
      name: 'property-card-guide',
      component: PropertyCardGuideView,
    },
    {
      path: '/guide/property-card-main-guide',
      name: 'property-card-main-guide',
      component: PropertyCardMainView,
    },
    {
      path: '/guide/property-card-waiting-guide',
      name: 'property-card-waiting-guide',
      component: PropertyCardWaitingView,
    },
    {
      path: '/guide/button-guide',
      name: 'button-guide',
      component: ButtonGuideView,
    },
    {
      path: '/guide/input-guide',
      name: 'input-guide',
      component: InputGuideView,
    },
    {
      path: '/guide/dropbox-guide',
      name: 'dropbox-guide',
      component: DropboxGuideView,
    },
    {
      path: '/guide/footer-guide',
      name: 'footer-guide',
      component: FooterGuideView,
    },
    {
      path: '/guide/popup-modal-guide',
      name: 'popup-modal-guide',
      component: PopupModalGuideView,
    },
    {
      path: '/guide/header-guide',
      name: 'header-guide',
      component: HeaderGuideView,
    },
    {
      path: '/guide/tailwind-guide',
      name: 'tailwind-guide',
      component: TailwindGuideView,
    },
    {
      path: '/guide/sidebar-guide',
      name: 'sidebar-guide',
      component: SidebarGuideView,
    },
    {
      path: '/membership',
      name: 'membership',
      component: () => import('@/pages/membership/MembershipView.vue'),
    },
  ],
})

// 라우터 가드 - 로그인 검증
router.beforeEach((to, from, next) => {
  // 리뷰 관련 페이지에 대한 로그인 검증
  if (to.path.startsWith('/review/')) {
    // localStorage에서 로그인 상태 확인 (auth.js 수정 없이)
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'

    if (!isLoggedIn) {
      // 로그인되지 않은 경우 로그인 페이지로 리다이렉트 (원래 가려던 페이지 정보 포함)
      next({
        path: '/auth/login',
        query: { redirect: to.fullPath },
      })
      return
    }
  }

  // 그 외 페이지는 정상적으로 진행
  next()
})

export default router
