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

  // Untuk halaman lain yang harus pakai layout
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '', // /
        component: () => import('@/views/LandingApp.vue'),
      },
      {
        path: 'dashboard', // /
        component: () => import('@/views/DashboardUser.vue'),
      },
      {
        path: 'market',
        component: () => import('@/views/DashboardUser.vue'),
      },
      {
        path: 'trade',
        component: () => import('@/views/DashboardUser.vue'),
      },
      {
        path: 'history',
        component: () => import('@/views/DashboardUser.vue'),
      },
      {
        path: 'account',
        component: () => import('@/views/DashboardUser.vue'),
      },
    ],
  },
  // 404 Not Found
  {
    path: '/:catchAll(.*)',
    component: () => import('@/views/NotFound.vue'),
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
      const res = await fetch('http://localhost:8000/api/auth-token', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      })
      const data = await res.json()

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
