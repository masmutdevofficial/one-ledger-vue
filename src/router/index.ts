import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import { useAuthStore } from '@/stores/auth'

const publicPages = [
  '/',
  '/login',
  '/register',
  '/verification',
  '/forgot-password',
  '/reset-password',
]

const routes = [
  // Public pages (no layout)
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/LoginUser.vue'),
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/auth/RegisterUser.vue'),
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: () => import('@/views/auth/ForgotPassword.vue'),
  },
  {
    path: '/reset-password',
    name: 'reset-password',
    component: () => import('@/views/auth/ResetPassword.vue'),
  },
  {
    path: '/verification',
    name: 'verification',
    component: () => import('@/views/auth/VerificationOTP.vue'),
  },
  {
    path: '',
    name: 'landing',
    component: () => import('@/views/LandingApp.vue'),
  },

  // Pages with MainLayout
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: 'account',
        name: 'account',
        component: () => import('@/views/NewAccountMenu.vue'),
      },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/views/DashboardUser.vue'),
      },
      {
        path: 'add-funds',
        name: 'add-funds',
        component: () => import('@/views/DepositRoute.vue'),
      },
      {
        path: 'verify',
        name: 'verify',
        component: () => import('@/views/menu/VerifyKTP.vue'),
      },
      {
        path: 'on-chain-deposit',
        name: 'on-chain-deposit',
        component: () => import('@/views/AddFunds.vue'),
      },
      {
        path: 'send',
        name: 'send',
        component: () => import('@/views/SendUSDT.vue'),
      },
      {
        path: 'notification',
        name: 'notification',
        component: () => import('@/views/NotificationTransactions.vue'),
      },
      {
        path: 'transfer',
        name: 'transfer',
        component: () => import('@/views/TransferUSDT.vue'),
      },
      {
        path: 'transfer-detail',
        name: 'transfer-detail',
        component: () => import('@/views/TransferUSDTDetail.vue'),
      },
      {
        path: 'market',
        name: 'market',
        component: () => import('@/views/MarketAll.vue'),
      },
      {
        path: 'trade',
        name: 'trade',
        component: () => import('@/views/NewMarketCoin.vue'),
      },
      {
        path: 'history',
        name: 'history',
        component: () => import('@/views/OrderHistory.vue'),
      },
      {
        path: 'assets',
        name: 'assets',
        component: () => import('@/views/AssetsData.vue'),
      },
      {
        path: 'futures',
        name: 'futures',
        component: () => import('@/views/FuturesCopy.vue'),
      },
      {
        path: 'tracking',
        name: 'tracking',
        component: () => import('@/views/Tracking.vue'),
      },
      {
        path: 'detail-tracking',
        name: 'detail-tracking',
        component: () => import('@/views/DetailTracking.vue'),
      },
      {
        path: 'smart-arbitrage',
        name: 'smart-arbitrage',
        component: () => import('@/views/menu/SmartArbitrage.vue'),
      },
      {
        path: 'hub-rewards',
        name: 'hub-rewards',
        component: () => import('@/views/menu/HubReward.vue'),
      },
      {
        path: 'launchpool',
        name: 'launchpool',
        component: () => import('@/views/menu/LaunchPool.vue'),
      },
      {
        path: 'p2p',
        name: 'p2p',
        component: () => import('@/views/menu/P2P.vue'),
      },
      {
        path: 'p2p-detail',
        name: 'p2p-detail',
        component: () => import('@/views/menu/P2PDetail.vue'),
      },
      {
        path: 'profile-copy-trade',
        name: 'profile-copy-trade',
        component: () => import('@/views/ProfileCopyTrade.vue'),
      },
      {
        path: 'future',
        name: 'future',
        component: () => import('@/views/FutureClone.vue'),
      },
      {
        path: 'p2p-checkout',
        name: 'p2p-checkout',
        component: () => import('@/views/menu/P2PCheckout.vue'),
      },
      {
        path: 'p2p-detail-sell',
        name: 'p2p-detail-sell',
        component: () => import('@/views/menu/P2PDetailSell.vue'),
      },
      {
        path: 'p2p-checkout-sell',
        name: 'p2p-checkout-sell',
        component: () => import('@/views/menu/P2PCheckoutSell.vue'),
      },
      {
        path: 'more',
        name: 'more',
        component: () => import('@/views/MoreMenu.vue'),
      },
      {
        path: 'event',
        name: 'event',
        component: () => import('@/views/menu/WeeklyEvent.vue'),
      },
      {
        path: 'security',
        name: 'security',
        component: () => import('@/views/menu/SecurityPassword.vue'),
      },
      {
        path: 'megadrop',
        name: 'megadrop',
        component: () => import('@/views/menu/MegaDrop.vue'),
      },
      {
        path: 'customer-service',
        name: 'customer-service',
        component: () => import('@/views/SupportChat.vue'),
      },
      {
        path: 'r2-files',
        name: 'r2-files',
        component: () => import('@/views/R2FilesView.vue'),
      },
      {
        path: 'chats/:threadId',
        name: 'chats',
        component: () => import('@/views/CustomerServiceCopyTrade.vue'),
      },
      {
        path: 'smart-arbitrage/detail/:symbol',
        name: 'smart-arbitrage-detail',
        component: () => import('@/views/menu/DetailSmartArbitrage.vue'),
      },
      {
        path: 'news/:slug',
        name: 'news-detail',
        component: () => import('@/views/DetailNews.vue'),
      },
      {
        path: 'futures/:username',
        name: 'futures-detail',
        component: () => import('@/views/DetailFutures.vue'),
      },
      {
        path: 'futures/:username/history',
        name: 'futures-history',
        component: () => import('@/views/NewFuturesHistory.vue'),
      },
      // 404 Not Found
      {
        path: '/:catchAll(.*)',
        name: 'not-found',
        component: () => import('@/views/NotFound.vue'),
      },
    ],
  },
]
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// ---- Navigation Guard ----
router.beforeEach(async (to, _from, next) => {
  const isPublic = publicPages.includes(to.path)
  const auth = useAuthStore()

  if (auth.isAuthenticated) {
    // Validate token with server (uses 5-min TTL cache)
    const valid = await auth.validateToken()

    if (!valid) {
      auth.clearToken()
      return next('/login?reason=unauthorized')
    }

    // Authenticated user on auth pages → redirect to dashboard
    if (publicPages.includes(to.path) && to.path !== '/') {
      return next('/dashboard')
    }

    return next()
  }

  // No token and accessing protected page → redirect to login
  if (!isPublic) {
    return next('/login?reason=unauthorized')
  }

  next()
})

export default router
