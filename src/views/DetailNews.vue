<template>
  <main class="max-w-2xl mx-auto px-4 py-6">
    <!-- Back / Title row -->
    <div class="flex items-center gap-2 mb-4">
      <button
        type="button"
        class="text-gray-500 hover:text-gray-800"
        @click="goBack"
        aria-label="Back"
      >
        <Icon icon="tabler:arrow-left" class="w-5 h-5" />
      </button>
      <h1 class="text-xl font-semibold text-gray-900">News</h1>
    </div>

    <!-- Loading -->
    <div v-if="state === 'loading'" class="space-y-3 animate-pulse">
      <div class="h-7 bg-gray-200 rounded w-3/4"></div>
      <div class="h-4 bg-gray-200 rounded w-1/3"></div>
      <div class="h-48 bg-gray-200 rounded"></div>
      <div class="space-y-2">
        <div class="h-3 bg-gray-200 rounded"></div>
        <div class="h-3 bg-gray-200 rounded w-5/6"></div>
        <div class="h-3 bg-gray-200 rounded w-2/3"></div>
      </div>
    </div>

    <!-- Error -->
    <div
      v-else-if="state === 'error'"
      class="p-4 border border-red-200 bg-red-50 text-red-700 rounded-md text-sm"
    >
      <Icon icon="tabler:alert-triangle" class="w-4 h-4 inline-block mr-1" />
      {{ errorMessage }}
    </div>

    <!-- Success -->
    <article v-else class="space-y-4 mb-20">
      <header>
        <h2 class="text-2xl font-bold text-gray-900 leading-snug">
          {{ news.title }}
        </h2>
        <div class="mt-2 flex items-center gap-4 text-xs text-gray-500">
          <span v-if="news.published_at" class="inline-flex items-center gap-1">
            <Icon icon="tabler:calendar" class="w-4 h-4" />
            {{ formattedDate }}
          </span>
          <span class="inline-flex items-center gap-1">
            <Icon icon="tabler:hash" class="w-4 h-4" />
            {{ news.slug }}
          </span>
        </div>
        <p v-if="news.description" class="mt-3 text-gray-700">
          {{ news.description }}
        </p>
      </header>

      <figure v-if="news.image" class="mt-2">
        <img
          :src="`https://su.oneled.io${news.image}`"
          :alt="news.title"
          class="w-full rounded-lg border border-gray-100"
          loading="lazy"
        />
      </figure>

      <!-- Content (HTML from backend) -->
      <section
        class="prose prose-sm sm:prose base max-w-none prose-img:rounded-md prose-headings:scroll-mt-20"
        v-html="news.content"
      ></section>
    </article>
  </main>
</template>

<script setup lang="ts">
import { onMounted, reactive, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'

type NewsItem = {
  id: number
  title: string
  slug: string
  description?: string | null
  content?: string | null
  image?: string | null
  published_at?: string | null
  created_at?: string
  updated_at?: string
}

type LoadState = 'loading' | 'success' | 'error'

const route = useRoute()
const router = useRouter()

const apiBase = import.meta.env.VITE_API_BASE ?? 'https://su.oneled.io/api' // contoh: https://api.domain.com

const stateRef = reactive<{
  state: LoadState
  errorMessage: string
  news: NewsItem | null
}>({
  state: 'loading',
  errorMessage: '',
  news: null,
})

const state = computed(() => stateRef.state)
const errorMessage = computed(() => stateRef.errorMessage)
const news = computed<NewsItem>(() => stateRef.news as NewsItem)

const formattedDate = computed(() => {
  if (!news.value?.published_at) return ''
  // Format simpel: YYYY-MM-DD HH:mm (local)
  const d = new Date(news.value.published_at)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`
})

async function fetchNewsBySlug(slug: string) {
  stateRef.state = 'loading'
  stateRef.errorMessage = ''
  stateRef.news = null

  try {
    const token = localStorage.getItem('token') // pastikan key sesuai yang kamu pakai
    if (!token) {
      throw new Error('Authentication token not found.')
    }

    const res = await fetch(`${apiBase}/news/${encodeURIComponent(slug)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      credentials: 'include', // Sanctum sering butuh ini
    })

    const data = await res.json()

    if (!res.ok || data?.status !== 'success' || !data?.data) {
      throw new Error(data?.message || 'Failed to load news.')
    }

    stateRef.news = data.data as NewsItem
    stateRef.state = 'success'
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error.'
    stateRef.state = 'error'
    stateRef.errorMessage = message
  }
}

function goBack() {
  router.back()
}

onMounted(() => {
  const slug = String(route.params.slug || '')
  fetchNewsBySlug(slug)
})

watch(
  () => route.params.slug,
  (slug) => {
    if (slug) fetchNewsBySlug(String(slug))
  },
)
</script>

<style scoped>
/* optional: prose base if you don't have @tailwind/typography */
.prose :where(img):not(:where([class~='not-prose'] *)) {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}
</style>
