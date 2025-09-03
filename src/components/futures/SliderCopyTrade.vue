<template>
  <Swiper :modules="[Autoplay, Pagination]" :loop="true" :autoplay="{ delay: 4000 }"
    class="rounded-2xl overflow-hidden mb-6">
    <SwiperSlide v-for="s in slides" :key="s.src">
      <!-- Slide 1: buka modal -->
      <button v-if="'modal' in s" type="button" class="block w-full h-full" @click="openModalTerm()"
        aria-label="Open Terms">
        <img :src="s.src" :alt="s.alt" class="block w-full h-full" />
      </button>

      <!-- Slide 2: langsung navigate -->
      <RouterLink v-else :to="s.to" class="block">
        <img :src="s.src" :alt="s.alt" class="block w-full h-full" />
      </RouterLink>
    </SwiperSlide>
  </Swiper>

  <!-- Modal -->
  <div v-if="showModalTerm" class="fixed inset-0 z-51 flex items-center justify-center" aria-modal="true" role="dialog">
    <div class="absolute inset-0 bg-black/30" @click="closeModalTerm"></div>

    <div class="relative z-10 w-full max-w-lg mx-4 rounded-2xl bg-white shadow-xl" @click.stop>
      <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 class="text-[12px] font-semibold">Terms &amp; Conditions</h3>
        <button type="button" class="p-1 rounded hover:bg-gray-100" @click="closeModalTerm" aria-label="Close">
          <Icon icon="tabler:x" class="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div ref="scrollArea"
        class="max-h-[70dvh] overflow-y-auto px-4 py-3 text-[12px] leading-relaxed text-gray-700 space-y-4"
        @scroll="onScroll">
        <!-- 1. Join the Pool -->
        <div>
          <h4 class="mt-1 font-semibold">1. Join the Pool</h4>
          <ul class="list-disc pl-5 space-y-1 mt-1">
            <li>
              Each member who wishes to participate in the collective trading pool must deposit
              funds according to the agreed amount.
            </li>
            <li>
              Funds will be automatically secured in the smart contract for the duration of the
              trading session.
            </li>
            <li>
              All trading activities within the Pool are executed under the direction of the
              Master Trader, with positions opened and closed on behalf of all members.
            </li>
            <li>By joining, you agree to follow the Pool rules.</li>
          </ul>
        </div>

        <!-- 2. How Trading Works -->
        <div>
          <h4 class="mt-1 font-semibold">2. How Trading Works</h4>
          <ul class="list-disc pl-5 space-y-1 mt-1">
            <li>
              Trading positions are opened and closed collectively according to the applied
              strategy.
            </li>
            <li>During the session, members cannot close positions individually.</li>
            <li>All profit and loss calculations are performed automatically by the smart contract.</li>
            <li>Followers can only participate in a maximum of 5 open positions at the same time.</li>
          </ul>
        </div>

        <!-- 3. Profit Distribution -->
        <div>
          <h4 class="mt-1 font-semibold">3. Profit Distribution</h4>
          <ul class="list-disc pl-5 space-y-1 mt-1">
            <li>Profits and losses are shared proportionally based on each member’s contribution.</li>
            <li>
              Final results will be displayed on the dashboard and can be withdrawn once the
              session is completed.
            </li>
            <li>
              If service fees apply, they are not automatically deducted from profit. Members are
              required to pay service fees manually as instructed by the Pool management.
            </li>
          </ul>
        </div>

        <!-- 4. Discipline Rules -->
        <div>
          <h4 class="mt-1 font-semibold">4. Discipline Rules</h4>
          <ul class="list-disc pl-5 space-y-1 mt-1">
            <li>
              If a member fails to meet obligations (e.g., cancels participation, insufficient
              balance, or attempts to withdraw funds early), their funds will remain locked until
              the entire trading session ends.
            </li>
            <li>In such cases, the member cannot withdraw early.</li>
            <li>
              This rule ensures fairness, consistency, and avoids disruptions to the collective
              session.
            </li>
          </ul>
        </div>

        <!-- 5. Things to Understand -->
        <div>
          <h4 class="mt-1 font-semibold">5. Things to Understand</h4>
          <ul class="list-disc pl-5 space-y-1 mt-1">
            <li>Trading cryptocurrencies offers potential profit, but also involves risk.</li>
            <li>
              Profit is not guaranteed in every session as results depend on market conditions.
            </li>
            <li>By participating, members acknowledge and accept the risks involved.</li>
          </ul>
        </div>

        <!-- 6. Smart Contract Transparency -->
        <div>
          <h4 class="mt-1 font-semibold">6. Smart Contract Transparency</h4>
          <ul class="list-disc pl-5 space-y-1 mt-1">
            <li>
              All rules are coded into the smart contract, ensuring transparency and automation.
            </li>
            <li>No party can alter the final outcome once the session is in progress.</li>
          </ul>
        </div>

        <div class="h-2"></div>
      </div>

      <div class="px-4 py-3 border-t border-gray-100 flex justify-end">
        <button type="button" class="px-4 py-2 rounded-lg font-medium text-[12px]"
          :class="readDone ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'"
          :disabled="!readDone" @click="acknowledge">
          I understand
        </button>
      </div>
    </div>
  </div>

</template>
<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, Pagination } from 'swiper/modules'
import { Icon } from '@iconify/vue'

type Slide =
  | { src: string; alt?: string; modal: true }   // slide yang buka modal
  | { src: string; alt?: string; to: string }    // slide yang navigate

const slides: Slide[] = [
  { src: '/img/slider1.jpeg', alt: 'Slider 1', modal: true },           // klik -> modal
  { src: '/img/slider2.jpeg', to: '/event', alt: 'Slider 2' },           // klik -> /event
]

const router = useRouter()

const showModalTerm = ref(false)
const readDone = ref(false)
const scrollArea = ref<HTMLDivElement | null>(null)

function openModalTerm() {
  readDone.value = false
  showModalTerm.value = true
  nextTick(() => { if (scrollArea.value) scrollArea.value.scrollTop = 0 })
}
function closeModalTerm() {
  showModalTerm.value = false
}
function onScroll() {
  const el = scrollArea.value
  if (!el) return
  readDone.value = el.scrollTop + el.clientHeight >= el.scrollHeight - 2
}
function acknowledge() {
  // sesuai request: cukup tutup modal (tanpa navigate)
  showModalTerm.value = false
}
</script>
