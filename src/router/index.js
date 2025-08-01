import { createRouter, createWebHistory } from 'vue-router'

// 메인 페이지
import MainView from '@/pages/MainView.vue'
import MapView from '@/pages/map/MapView.vue'
import MapTestView from '@/pages/map/MapTestView.vue'
import MapDiagnostic from '@/pages/map/MapDiagnostic.vue'

// 인증 관련 페이지
import LoginView from '@/pages/auth/LoginView.vue'
import SignupView from '@/pages/auth/SignupView.vue'
import FindIdView from '@/pages/auth/FindIdView.vue'
import FindPasswordView from '@/pages/auth/FindPasswordView.vue'

// 사용자 관련 페이지
import MyPageView from '@/pages/user/MyPageView.vue'
import ProfileEditView from '@/pages/user/ProfileEditView.vue'
import WithdrawView from '@/pages/user/WithdrawView.vue'

// 매물 관련 페이지
import PropertyDetailView from '@/pages/property/PropertyDetailView.vue'
import PropertyRegisterView from '@/pages/property/PropertyRegisterView.vue'

// 채팅 관련 페이지
import ChatListView from '@/pages/chat/ChatListView.vue'
import ChatSellerView from '@/pages/chat/ChatSellerView.vue'
import ChatBuyerView from '@/pages/chat/ChatBuyerView.vue'

// 거래 관련 페이지
import TradeGuideView from '@/pages/trade/TradeGuideView.vue'
import TradeSellerView from '@/pages/trade/TradeSellerView.vue'
import TradeBuyerView from '@/pages/trade/TradeBuyerView.vue'
import TradeWaitingView from '@/pages/trade/TradeWaitingView.vue'

// 문서 관련 페이지
import DocumentView from '@/pages/document/DocumentView.vue'
import AnalysisReportView from '@/pages/document/AnalysisReportView.vue'

// 리뷰 관련 페이지
import ReviewView from '@/pages/review/ReviewView.vue'
import ReviewWriteView from '@/pages/review/ReviewWriteView.vue'

// 시스템 관련 페이지
import NotificationView from '@/pages/system/NotificationView.vue'
import PaymentView from '@/pages/system/PaymentView.vue'

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
      path: '/map/test',
      name: 'map-test',
      component: MapTestView,
    },
    {
      path: '/map/diagnostic',
      name: 'map-diagnostic',
      component: MapDiagnostic,
    },

    // 인증 관련 라우트
    {
      path: '/auth/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/auth/signup',
      name: 'signup',
      component: SignupView,
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
      path: '/property/detail/:id',
      name: 'property-detail',
      component: PropertyDetailView,
      props: true,
    },
    {
      path: '/property/register',
      name: 'property-register',
      component: PropertyRegisterView,
    },

    // 채팅 관련 라우트
    {
      path: '/chat/list',
      name: 'chat-list',
      component: ChatListView,
    },
    {
      path: '/chat/seller/:roomId',
      name: 'chat-seller',
      component: ChatSellerView,
      props: true,
    },
    {
      path: '/chat/buyer/:roomId',
      name: 'chat-buyer',
      component: ChatBuyerView,
      props: true,
    },

    // 거래 관련 라우트
    {
      path: '/trade/guide',
      name: 'trade-guide',
      component: TradeGuideView,
    },
    {
      path: '/trade/seller/:tradeId',
      name: 'trade-seller',
      component: TradeSellerView,
      props: true,
    },
    {
      path: '/trade/buyer/:tradeId',
      name: 'trade-buyer',
      component: TradeBuyerView,
      props: true,
    },
    {
      path: '/trade/waiting/:tradeId',
      name: 'trade-waiting',
      component: TradeWaitingView,
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
      path: '/review',
      name: 'review',
      component: ReviewView,
    },
    {
      path: '/review/write',
      name: 'review-write',
      component: ReviewWriteView,
    },

    // 시스템 관련 라우트
    {
      path: '/notification',
      name: 'notification',
      component: NotificationView,
    },
    {
      path: '/payment',
      name: 'payment',
      component: PaymentView,
    },
  ],
})

export default router
