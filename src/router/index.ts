import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'

const publicPages = [
  '/',
  '/login',
  '/register',
  '/verification',
  '/forgot-password',
  '/reset-password',
]

const routes = [
  // Untuk halaman tanpa layout (login, register, dsb)
  {
    path: '/login',
    component: () => import('@/views/auth/LoginUser.vue'),
  },
  {
    path: '/register',
    component: () => import('@/views/auth/RegisterUser.vue'),
  },
  {
    path: '/forgot-password',
    component: () => import('@/views/auth/ForgotPassword.vue'),
  },
  {
    path: '/reset-password',
    component: () => import('@/views/auth/ResetPassword.vue'),
  },
  {
    path: '/verification',
    component: () => import('@/views/auth/VerificationOTP.vue'),
  },
  {
    path: '',
    component: () => import('@/views/LandingApp.vue'),
  },

  // Untuk halaman lain yang harus pakai layout
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: 'account',
        component: () => import('@/views/NewAccountMenu.vue'),
      },
      {
        path: 'dashboard',
        component: () => import('@/views/DashboardUser.vue'),
      },
      {
        path: 'add-funds',
        component: () => import('@/views/DepositRoute.vue'),
      },
      {
        path: 'verify',
        component: () => import('@/views/menu/VerifyKTP.vue'),
      },
      {
        path: 'on-chain-deposit',
        component: () => import('@/views/AddFunds.vue'),
      },
      {
        path: 'send',
        component: () => import('@/views/SendUSDT.vue'),
      },
      {
        path: 'notification',
        component: () => import('@/views/NotificationTransactions.vue'),
      },
      {
        path: 'transfer',
        component: () => import('@/views/TransferUSDT.vue'),
      },
      {
        path: 'transfer-detail',
        component: () => import('@/views/TransferUSDTDetail.vue'),
      },
      {
        path: 'market',
        component: () => import('@/views/MarketAll.vue'),
      },
      {
        path: 'trade',
        component: () => import('@/views/NewMarketCoin.vue'),
      },
      {
        path: 'history',
        component: () => import('@/views/OrderHistory.vue'),
      },
      {
        path: 'assets',
        component: () => import('@/views/AssetsData.vue'),
      },
      {
        path: 'futures',
        component: () => import('@/views/FuturesCopy.vue'),
      },
      {
        path: 'tracking',
        component: () => import('@/views/Tracking.vue'),
      },
      {
        path: 'detail-tracking',
        component: () => import('@/views/DetailTracking.vue'),
      },
      {
        path: 'account',
        component: () => import('@/views/DashboardUser.vue'),
      },
      {
        path: 'smart-arbitrage',
        component: () => import('@/views/menu/SmartArbitrage.vue'),
      },
      {
        path: 'hub-rewards',
        component: () => import('@/views/menu/HubReward.vue'),
      },
      {
        path: 'launchpool',
        component: () => import('@/views/menu/LaunchPool.vue'),
      },
      {
        path: 'p2p',
        component: () => import('@/views/menu/P2P.vue'),
      },
      {
        path: 'p2p-detail',
        component: () => import('@/views/menu/P2PDetail.vue'),
      },
      {
        path: 'profile-copy-trade',
        component: () => import('@/views/ProfileCopyTrade.vue'),
      },
      {
        path: 'future',
        component: () => import('@/views/FutureClone.vue'),
      },
      {
        path: 'p2p-checkout',
        component: () => import('@/views/menu/P2PCheckout.vue'),
      },
      {
        path: 'p2p-detail-sell',
        component: () => import('@/views/menu/P2PDetailSell.vue'),
      },
      {
        path: 'p2p-checkout-sell',
        component: () => import('@/views/menu/P2PCheckoutSell.vue'),
      },
      {
        path: 'more',
        component: () => import('@/views/MoreMenu.vue'),
      },
      {
        path: 'event',
        component: () => import('@/views/menu/WeeklyEvent.vue'),
      },
      {
        path: 'security',
        component: () => import('@/views/menu/SecurityPassword.vue'),
      },
      {
        path: 'megadrop',
        component: () => import('@/views/menu/MegaDrop.vue'),
      },
      {
        path: 'chats/:threadId',
        component: () => import('@/views/CustomerServiceCopyTrade.vue'),
      },
      {
        path: 'smart-arbitrage/detail/:symbol',
        component: () => import('@/views/menu/DetailSmartArbitrage.vue'),
      },
      {
        path: 'news/:slug',
        component: () => import('@/views/DetailNews.vue'),
      },
      {
        path: 'futures/:username',
        component: () => import('@/views/DetailFutures.vue'),
      },
      {
        path: 'futures/:username/history',
        component: () => import('@/views/FuturesHistory.vue'),
      },
      // 404 Not Found
      {
        path: '/:catchAll(.*)',
        component: () => import('@/views/NotFound.vue'),
      },
    ],
  },
]
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// ---- MIDDLEWARE DI SINI ----
router.beforeEach(async (to, from, next) => {
  // Cek jika route public
  const isPublic = publicPages.includes(to.path)
  const token = localStorage.getItem('token')

  // Jika ada token, cek ke backend
  if (token) {
    try {
      // Validasi token ke server
      const res = await fetch('https://one-ledger.masmutpanel.my.id/api/auth-token', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      })
      const data = await res.json()

      // Jika token tidak valid (session expired)
      if (data.message === 'Unauthenticated.') {
        localStorage.removeItem('token')
        // Redirect ke login dengan pesan session habis
        return next('/login?reason=unauthorized')
      }

      // Jika token valid dan akses halaman public, redirect ke dashboard
      if (token && data.valid && publicPages.includes(to.path) && to.path !== '/') {
        // Kalau user akses halaman login/register/forgot dsb saat sudah login, redirect ke dashboard
        return next('/dashboard')
      }
    } catch {
      localStorage.removeItem('token')
      // Jika akses protected, paksa login
      if (!isPublic) return next('/login?reason=unauthorized')
    }
    // Jika token valid dan akses protected, lanjut
    return next()
  }

  // Tidak ada token dan akses non-public → paksa login
  if (!isPublic) {
    return next('/login?reason=unauthorized')
  }

  // Jika halaman public, lanjut
  next()
})

export default router
