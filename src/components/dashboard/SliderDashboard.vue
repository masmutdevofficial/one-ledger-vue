<template>
  <Swiper
    :modules="[Autoplay, Pagination]"
    :loop="true"
    :autoplay="{ delay: 4000, disableOnInteraction: false }"
    :pagination="{ clickable: true }"
    class="rounded-2xl overflow-hidden mb-6"
  >
    <SwiperSlide v-for="(src, i) in slideImages" :key="i">
      <img :src="src" :alt="`Slide ${i + 1}`" class="block w-full h-auto" />
    </SwiperSlide>
  </Swiper>
</template>

<script setup lang="ts">
import 'swiper/css'
import 'swiper/css/pagination'

import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, Pagination } from 'swiper/modules'

const slideImages = ['/img/slide-banner-1.png', '/img/slide-banner-2.png']
</script>
