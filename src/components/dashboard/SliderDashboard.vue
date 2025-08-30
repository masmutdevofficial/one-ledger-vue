<template>
  <Swiper
    :modules="[Autoplay, Pagination]"
    :loop="true"
    :autoplay="{ delay: 4000 }"
    class="rounded-2xl overflow-hidden mb-6"
  >
    <SwiperSlide v-for="(slide, index) in slides" :key="index">
      <div class="flex justify-between items-center bg-white p-5">
        <div class="flex flex-col">
          <div class="text-[10px] text-[#9ca3af] uppercase">TRADERS LEAGUE SEASON 2:</div>
          <div class="text-black font-semibold text-[14px] mt-1">SHARE $6M IN REWARDS!</div>
        </div>
        <img src="/img/fire.png" class="w-6 h-6" alt="" />
      </div>
    </SwiperSlide>
  </Swiper>
</template>

<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, Pagination } from 'swiper/modules'

const slides = [1, 2, 3]
</script>
