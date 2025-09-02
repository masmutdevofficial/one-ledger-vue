<template>
  <Swiper :modules="[Autoplay, Pagination]" :loop="true" :autoplay="{ delay: 4000 }"
    class="rounded-2xl overflow-hidden mb-6">
    <SwiperSlide v-for="s in slides" :key="s.to">
      <RouterLink :to="s.to" class="block">
        <img :src="s.src" :alt="s.alt" class="block w-full h-36 sm:h-44" />
      </RouterLink>
    </SwiperSlide>
  </Swiper>
</template>

<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, Pagination } from 'swiper/modules'

type Slide = { src: string; to: string; alt?: string }

const slides: Slide[] = [
  { src: '/img/slide1.jpeg', to: '/dashboard', alt: 'Slider 1' },
  { src: '/img/slide2.jpeg', to: '/event', alt: 'Slider 2' },
]
</script>
