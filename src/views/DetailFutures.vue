<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<template>
  <main class="px-5 flex-grow mb-20">
    <!-- STATES (page-level) -->
    <div v-if="loading" class="py-10 text-center text-sm text-gray-500">Loading…</div>
    <div v-else-if="pageError" class="py-10 text-center text-sm text-red-500">{{ pageError }}</div>
    <div v-else-if="!trader" class="py-10 text-center text-sm text-gray-500">No Data Available</div>

    <!-- CONTENT -->
    <template v-else>

      <!-- PRICE + CHANGE (UI copied from FutureClone.vue; values are UI-only) -->
      <!-- <div class="-mx-5 px-4 mt-1 mb-4">
        <div class="text-start">
          <p
            class="font-semibold text-[20px]"
            :class="headerPercentChange >= 0 ? 'text-teal-500' : 'text-red-600'"
          >
            {{ headerPriceText }}
          </p>
          <div class="flex flex-row items-center">
            <p class="text-[#7F7F7F] text-[10px]">≈ ${{ headerPriceText }}</p>
            <span
              class="ml-1 text-[10px] font-semibold"
              :class="headerPercentChange >= 0 ? 'text-teal-600' : 'text-red-600'"
            >
              {{ headerPercentChangeText }}
            </span>
          </div>
        </div>
      </div> -->

      <!-- Profile & title (always visible: chart & non-chart) -->
      <div class="flex items-center justify-between mb-1">
        <div class="flex items-center gap-4">
          <img
            :alt="`${trader.name} avatar`"
            class="w-12 h-12 rounded-full object-cover"
            :src="avatarUrl"
            @error="onAvatarError"
          />
          <div class="flex flex-col items-start">
            <h1 class="font-extrabold text-lg flex items-center gap-2">
              <RouterLink
                to="/profile-copy-trade"
                class="hover:underline focus:outline-none focus:ring-2 focus:ring-teal-400 rounded"
              >
                {{ trader.name }}
              </RouterLink>
              <Icon
                v-if="trader.is_featured"
                icon="tabler:shield-check"
                class="w-5 h-5 text-amber-500"
              />
            </h1>
            <div
              class="inline-flex items-center bg-[#FFF4D1] text-[#D6B94D] text-xs font-semibold rounded-md px-2 py-1 select-none"
            >
              <Icon icon="tabler:coins" class="w-4 h-4 mr-1" />
              <span>Profit Sharing 10%</span>
            </div>
          </div>
        </div>

        <router-link
          v-if="trader && trader.id"
          :to="`/chats/${trader.id}`"
          class="ml-4 inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 active:bg-gray-200"
          aria-label="Open chat"
          title="Message"
        >
          <img src="/img/chat-copy-trader.png" alt="Menu" class="w-4 h-4 object-contain" />
        </router-link>
      </div>

      <p class="text-sm mb-2">{{ trader?.description || '' }}</p>

        <!-- CHART MODE (full-width) -->
        <div v-if="showChart" class="max-w-md md:max-w-4xl mx-auto mt-4 px-0 mb-6">
          <div class="flex items-start justify-between mb-2">
            <div class="flex flex-col items-start">
              <div class="relative inline-block">
                <button
                  type="button"
                  class="flex items-center space-x-1 cursor-pointer"
                  @click="headerDropdownOpen = !headerDropdownOpen"
                  :aria-expanded="headerDropdownOpen"
                  aria-haspopup="listbox"
                >
                  <span class="font-semibold text-black text-base">{{ headerSelectedPair }}</span>
                  <span class="font-bold text-xs text-gray-800">Perp</span>
                  <Icon icon="tabler:chevron-down" class="text-black text-base" />
                </button>

                <div
                  v-if="headerDropdownOpen"
                  class="absolute z-50 mt-2 w-44 bg-white border border-gray-200 rounded shadow-md"
                >
                  <ul class="max-h-64 overflow-auto" role="listbox">
                    <li
                      v-for="pair in availablePairs"
                      :key="pair"
                      @click="selectHeaderPair(pair)"
                      class="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-black"
                      role="option"
                    >
                      {{ pair }}
                    </li>
                  </ul>
                </div>
              </div>
              <div
                class="ml-1 text-[10px] font-semibold"
                :class="headerPercentChange >= 0 ? 'text-teal-600' : 'text-red-600'"
              >
                {{ headerPercentChangeText }}
              </div>
            </div>

            <!-- chart mode icons (right side is hidden, so keep controls here) -->
            <div class="flex items-center justify-end gap-2 text-gray-400">
              <button
                aria-label="Gift"
                class="relative w-9 h-9 inline-flex items-center justify-center rounded-lg hover:bg-gray-100 active:bg-gray-200"
                type="button"
                @click="goWeeklyEvent"
              >
                <Icon icon="tabler:gift" class="w-5 h-5" />
                <span class="absolute top-2 right-2 w-1.5 h-1.5 bg-yellow-400 rounded-full"></span>
              </button>

              <button
                aria-label="Chart"
                class="relative w-9 h-9 inline-flex items-center justify-center rounded-lg hover:bg-gray-100 active:bg-gray-200"
                type="button"
                :aria-pressed="showChart"
                :title="showChart ? 'Hide chart' : 'Show chart'"
                @click="toggleChart"
              >
                <Icon icon="tabler:chart-candle" class="w-5 h-5" />
              </button>
            </div>
          </div>

          <div class="grid grid-cols-[44px_1fr] gap-2 items-stretch w-full relative mt-[33px]">
            <aside class="rounded-xl border border-gray-200 p-1.5 bg-white">
              <div class="flex flex-col gap-2 text-xs">
                <button
                  class="pl-1 px-2 py-1 rounded-lg border transition-colors"
                  :class="{
                    'bg-teal-500 text-white border-teal-500': kind === 'candlestick',
                    'hover:bg-gray-50': kind !== 'candlestick',
                  }"
                  :aria-pressed="kind === 'candlestick'"
                  type="button"
                  @click="kind = 'candlestick'"
                >
                  <Icon icon="tabler:chart-candle" class="w-5 h-5" />
                </button>

                <button
                  class="pl-1 px-2 py-1 rounded-lg border transition-colors"
                  :class="{
                    'bg-teal-500 text-white border-teal-500': kind === 'line',
                    'hover:bg-gray-50': kind !== 'line',
                  }"
                  :aria-pressed="kind === 'line'"
                  type="button"
                  @click="kind = 'line'"
                >
                  <Icon icon="tabler:chart-line" class="w-5 h-5" />
                </button>

                <button
                  class="pl-1 px-2 py-1 rounded-lg border transition-colors"
                  :class="{
                    'bg-teal-500 text-white border-teal-500': kind === 'area',
                    'hover:bg-gray-50': kind !== 'area',
                  }"
                  :aria-pressed="kind === 'area'"
                  type="button"
                  @click="kind = 'area'"
                >
                  <Icon icon="tabler:chart-area" class="w-5 h-5" />
                </button>
              </div>
            </aside>

            <section class="rounded-2xl min-w-0 overflow-hidden bg-white border border-gray-200">
              <LightChart
                :series-type="kind"
                :candle-data="dataForChart.candleData"
                :data="dataForChart.data"
                :options="{ timeScale: { rightOffset: 12, barSpacing: 5 } }"
                :fit="false"
                :initial-bars="180"
                :right-offset="12"
                :auto-follow="true"
              />
            </section>

            <div class="flex flex-row items-center absolute -top-8.5 right-2 space-x-2">
              <button
                v-for="t in tfs"
                :key="t"
                class="px-1.5 py-1 rounded-md border text-[11px] leading-none transition-colors bg-white"
                :class="{
                  'bg-teal-500 text-white border-teal-500': tf === t,
                  'hover:bg-gray-50': tf !== t,
                }"
                :aria-pressed="tf === t"
                type="button"
                @click="tf = t"
              >
                {{ t }}
              </button>
            </div>
          </div>

          <!-- MINI ORDERBOOK (di bawah chart) -->
          <div class="mt-3">
            <div class="flex flex-row justify-between items-center mb-1">
              <p class="text-[10px] text-gray-400">Bid</p>
              <p class="text-[10px] text-gray-400">Ask</p>
              <div class="w-[40px] flex justify-center items-center bg-gray-100 rounded-sm text-gray-400">
                <p class="text-[10px] ml-1">5</p>
                <Icon icon="tabler:chevron-down" class="text-gray-700 w-3 h-3" />
              </div>
            </div>

            <div class="flex w-full justify-between items-center">
              <!-- BIDS -->
              <div class="space-y-1 w-full" v-if="depthData">
                <div
                  v-for="bid in top12Bids"
                  :key="bid[0]"
                  class="relative flex justify-between overflow-hidden rounded"
                  style="height: 17.5px"
                >
                  <div
                    class="absolute right-0 top-0 h-full bg-green-100 z-0 transition-all duration-200"
                    :style="{ width: `${((bid[1] / maxBidAmount) * 100).toFixed(2)}%` }"
                  />
                  <p class="text-black text-[10px] z-10 px-2 w-1/2">
                    {{ bid[1].toLocaleString('en-US', { maximumFractionDigits: 5 }) }}
                  </p>
                  <p class="text-[#2DBE87] text-[10px] text-right z-10 px-2 w-1/2">
                    {{ bid[0].toLocaleString('en-US', { maximumFractionDigits: 2 }) }}
                  </p>
                </div>
              </div>

              <!-- ASKS -->
              <div class="space-y-1 w-full" v-if="depthData">
                <div
                  v-for="ask in top12Asks"
                  :key="ask[0]"
                  class="relative flex justify-between overflow-hidden rounded"
                  style="height: 17.5px"
                >
                  <div
                    class="absolute left-0 top-0 h-full bg-red-100 z-0 transition-all duration-200"
                    :style="{ width: `${((ask[1] / maxAskAmount) * 100).toFixed(2)}%` }"
                  />
                  <p class="text-pink-400 text-[10px] z-10 px-2 w-1/2">
                    {{ ask[0].toLocaleString('en-US', { maximumFractionDigits: 2 }) }}
                  </p>
                  <p class="text-black text-[10px] text-right z-10 px-2 w-1/2">
                    {{ ask[1].toLocaleString('en-US', { maximumFractionDigits: 5 }) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ORDERBOOK + FORM (mode tanpa chart) - copied from FutureClone.vue (UI-only) -->
        <div v-else class="grid grid-cols-2 gap-4 max-w-md md:max-w-4xl mx-auto mt-4 px-0 mb-6">
          <!-- LEFT: ORDERBOOK -->
          <div>
            <div class="flex flex-col items-start mb-1">
              <div class="relative inline-block">
                <button
                  type="button"
                  class="flex items-center space-x-1 cursor-pointer"
                  @click="headerDropdownOpen = !headerDropdownOpen"
                  :aria-expanded="headerDropdownOpen"
                  aria-haspopup="listbox"
                >
                  <span class="font-semibold text-black text-base">{{ headerSelectedPair }}</span>
                  <span class="font-bold text-xs text-gray-800">Perp</span>
                  <Icon icon="tabler:chevron-down" class="text-black text-base" />
                </button>

                <div
                  v-if="headerDropdownOpen"
                  class="absolute z-50 mt-2 w-44 bg-white border border-gray-200 rounded shadow-md"
                >
                  <ul class="max-h-64 overflow-auto" role="listbox">
                    <li
                      v-for="pair in availablePairs"
                      :key="pair"
                      @click="selectHeaderPair(pair)"
                      class="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-black"
                      role="option"
                    >
                      {{ pair }}
                    </li>
                  </ul>
                </div>
              </div>
              <div
                class="ml-1 text-[10px] font-semibold"
                :class="headerPercentChange >= 0 ? 'text-teal-600' : 'text-red-600'"
              >
                {{ headerPercentChangeText }}
              </div>
            </div>

            <div class="flex justify-between text-gray-400 text-xs pb-1">
              <span>Price (USDT)</span>
              <span>Amount ({{ baseAsset }})</span>
            </div>

            <!-- ASKS -->
            <div class="space-y-1" v-if="depthData">
              <div
                v-for="ask in top12Asks"
                :key="ask[0]"
                class="relative flex justify-between overflow-hidden rounded"
                style="height: 17.5px"
              >
                <div
                  class="absolute left-0 top-0 h-full bg-red-100 z-0 transition-all duration-200"
                  :style="{ width: `${((ask[1] / maxAskAmount) * 100).toFixed(2)}%` }"
                />
                <p class="text-pink-400 text-[10px] z-10 px-2 w-1/2">
                  {{ ask[0].toLocaleString('en-US', { maximumFractionDigits: 2 }) }}
                </p>
                <p class="text-black text-[10px] text-right z-10 px-2 w-1/2">
                  {{ ask[1].toLocaleString('en-US', { maximumFractionDigits: 5 }) }}
                </p>
              </div>
            </div>

            <!-- MID PRICE -->
            <div class="text-center my-3" v-if="depthData">
              <p class="text-black font-semibold text-[16px]">
                {{
                  (depthData.tick.bids[0]?.[0] ?? 0).toLocaleString('en-US', {
                    maximumFractionDigits: 2,
                  })
                }}
              </p>
              <p class="text-[#7F7F7F] text-[10px]">
                ≈ ${{
                  (depthData.tick.bids[0]?.[0] ?? 0).toLocaleString('en-US', {
                    maximumFractionDigits: 2,
                  })
                }}
              </p>
            </div>

            <!-- BIDS -->
            <div class="space-y-1" v-if="depthData">
              <div
                v-for="bid in top12Bids"
                :key="bid[0]"
                class="relative flex justify-between overflow-hidden rounded"
                style="height: 17.5px"
              >
                <div
                  class="absolute right-0 top-0 h-full bg-green-100 z-0 transition-all duration-200"
                  :style="{ width: `${((bid[1] / maxBidAmount) * 100).toFixed(2)}%` }"
                />
                <p class="text-[#2DBE87] text-[10px] z-10 px-2 w-1/2">
                  {{ bid[0].toLocaleString('en-US', { maximumFractionDigits: 2 }) }}
                </p>
                <p class="text-black text-[10px] text-right z-10 px-2 w-1/2">
                  {{ bid[1].toLocaleString('en-US', { maximumFractionDigits: 5 }) }}
                </p>
              </div>
            </div>
          </div>

        <!-- RIGHT: ORDER FORM -->
        <div class="space-y-3">
          <!-- SYMBOL ROW (icons) -->
          <div class="flex items-center justify-end w-full gap-2 mb-2 text-gray-400">
            <button
              aria-label="Gift"
              class="relative w-9 h-9 inline-flex items-center justify-center rounded-lg hover:bg-gray-100 active:bg-gray-200"
              type="button"
              @click="goWeeklyEvent"
            >
              <Icon icon="tabler:gift" class="w-5 h-5" />
              <span class="absolute top-2 right-2 w-1.5 h-1.5 bg-yellow-400 rounded-full"></span>
            </button>

            <button
              aria-label="Chart"
              class="relative w-9 h-9 inline-flex items-center justify-center rounded-lg hover:bg-gray-100 active:bg-gray-200"
              type="button"
              :aria-pressed="showChart"
              :title="showChart ? 'Hide chart' : 'Show chart'"
              @click="toggleChart"
            >
              <Icon icon="tabler:chart-candle" class="w-5 h-5" />
            </button>
          </div>

          <div class="space-y-2 text-sm">
            <!-- Avbl -->
            <div class="flex items-center justify-between">
              <span class="text-gray-400 text-xs font-semibold">Avbl</span>
              <div class="flex items-center space-x-1 text-gray-900 font-bold text-xs">
                <span>{{ fmtUSDT(saldo) }} USDT</span>
                <Icon icon="tabler:arrows-left-right" class="w-4 h-4 text-yellow-400" />
              </div>
            </div>

            <!-- Order type -->
            <div
              class="flex items-center justify-between bg-gray-100 rounded-lg px-3 py-2 text-[12px]"
            >
              <div class="flex items-center justify-between space-x-2 w-full">
                <Icon icon="tabler:info-circle-filled" class="w-4 h-4 text-gray-400" />
                <button type="button" class="flex items-center font-semibold text-gray-900">
                  Limit
                </button>
                <Icon icon="tabler:chevron-down" class="w-4 h-4 ml-1 text-gray-500" />
              </div>
            </div>

            <!-- Price -->
            <div class="flex items-center justify-between text-[12px] w-full space-x-2">
              <div
                class="bg-gray-100 flex-row flex items-center justify-between px-2 rounded-lg w-[97%] py-[4px]"
              >
                <Icon icon="tabler:minus" class="w-4 h-4" />
                <div class="flex-1 text-center">
                  <div class="text-[10px] text-gray-400 leading-none mb-1">Price (USDT)</div>
                  <div class="font-semibold text-[12px] text-gray-900 leading-tight">
                    {{
                      marketPrice
                        ? marketPrice.toLocaleString('en-US', { maximumFractionDigits: 2 })
                        : '-'
                    }}
                  </div>
                </div>
                <Icon icon="tabler:plus" class="w-4 h-4" />
              </div>

              <div class="flex items-center space-x-2 bg-gray-100 rounded-lg py-[4px]">
                <button type="button" class="h-8 px-3 text-gray-900 font-semibold">BBO</button>
              </div>
            </div>

            <!-- Amount -->
            <div
              class="flex items-center justify-between bg-gray-100 rounded-lg px-2 py-[4px] text-[12px]"
            >
              <Icon icon="tabler:minus" class="w-4 h-4" />

              <div class="flex-1 text-center">
                <div class="text-[10px] text-gray-400 leading-none">Amount (USDT)</div>
                <input
                  aria-label="Order form amount input"
                  v-model="amount"
                  type="text"
                  inputmode="decimal"
                  placeholder="0.00"
                  :disabled="atCapacity"
                  class="bg-transparent w-full text-center text-[12px] font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none"
                  :class="atCapacity ? 'opacity-60 cursor-not-allowed' : ''"
                />
              </div>
              <Icon icon="tabler:plus" class="w-4 h-4" />
              <div class="flex items-center space-x-2">
                <button
                  type="button"
                  class="h-8 px-3 rounded-md text-gray-900 font-semibold flex items-center"
                >
                  USDT
                  <Icon icon="tabler:chevron-down" class="w-4 h-4 ml-1 text-gray-500" />
                </button>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4">
            <div>
              <label for="slForm" class="text-gray-400 text-xs mb-1 block">Stop Loss</label>
              <div class="relative no-ios-zoom">
                <select
                  id="slForm"
                  v-model.number="sl"
                  :disabled="false"
                  class="w-full h-10 bg-gray-100 rounded-md px-3 pr-12 text-xs font-semibold text-black focus:outline-none"
                >
                  <option disabled value="">Select</option>
                  <option v-for="n in 10" :key="n" :value="n * 10">{{ n * 10 }}%</option>
                </select>
                <span
                  class="absolute inset-y-0 right-5 flex items-center text-xs font-semibold text-gray-700 pointer-events-none"
                >
                  %
                </span>
              </div>
            </div>
          </div>

          <form class="space-y-4 text-sm text-gray-800" @submit.prevent>
            <!-- Options -->
            <fieldset class="space-y-2">
              <legend class="sr-only">Order options</legend>

              <div class="flex items-center justify-between gap-3">
                <label for="opt-tpsl" class="flex items-center gap-2 cursor-pointer whitespace-nowrap">
                  <input id="opt-tpsl" type="radio" name="orderType" class="h-4 w-4 accent-teal-500" />
                  <span>TP/SL</span>
                </label>

                <!-- Open Position (pair mengikuti dropdown utama) -->
                <button
                  class="shrink-0 bg-teal-400 hover:bg-teal-500 text-white text-xs rounded-md py-1 px-3 disabled:opacity-50"
                  type="button"
                  :disabled="loadingSubmit || atCapacity || !hasPairSelected"
                  @click="toggleSideChooser"
                >
                  {{
                    loadingSubmit
                      ? 'Processing…'
                      : atCapacity
                        ? 'Capacity Reached (5/5)'
                        : !hasPairSelected
                          ? 'Select Pair'
                          : 'Open Position'
                  }}
                </button>
              </div>
            </fieldset>

            <div v-if="showSideChooser" class="space-x-2">
              <!-- Sell / Short -->
              <button
                class="hover:opacity-90 text-white text-xs rounded-md py-1 px-3 disabled:opacity-50 transition-shadow duration-150 shadow-md active:shadow-[0_10px_24px_rgba(255,49,49,0.55)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400"
                type="button"
                :style="{ backgroundColor: '#ff3131' }"
                :disabled="!canSubmitOrder"
                :class="{ 'ring-2 ring-offset-2 ring-red-400': selectedSide === 'SELL' }"
                @click="submitWithSide('SELL')"
              >
                Sell / Short
              </button>

              <!-- Buy / Long -->
              <button
                class="hover:opacity-90 text-white text-xs rounded-md py-1 px-3 disabled:opacity-50 transition-shadow duration-150 shadow-md active:shadow-[0_10px_24px_rgba(28,166,157,0.55)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-400"
                type="button"
                :style="{ backgroundColor: '#1ca69d' }"
                :disabled="!canSubmitOrder"
                :class="{ 'ring-2 ring-offset-2 ring-teal-400': selectedSide === 'BUY' }"
                @click="submitWithSide('BUY')"
              >
                Buy / Long
              </button>
            </div>
          </form>
        </div>
      </div>

      <div
        v-if="showRestrict"
        class="fixed inset-0 z-[1000] flex items-center justify-center"
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          class="absolute inset-0 bg-black/40"
          aria-label="Close"
          @click="closeRestrict"
        />

        <div class="relative mx-4 w-full max-w-sm rounded-lg bg-white p-4 shadow-lg">
          <div class="flex items-start gap-2">
            <div>
              <h3 class="font-semibold text-black mb-1">⚠️ Notice</h3>
              <p class="text-sm text-gray-700">
                Your account is still new.<br />
                The Futures Trading feature will be available once your account has been active for
                a longer period.
              </p>
              <p class="text-sm text-gray-500 mt-2">
                This is to ensure security and provide you with the best trading experience.<br />
                Thank you for your understanding.
              </p>
            </div>
          </div>
          <div class="mt-4 flex justify-end">
            <button
              type="button"
              class="px-3 py-1.5 rounded-md border border-gray-300 text-sm"
              @click="closeRestrict"
            >
              OK
            </button>
          </div>
        </div>
      </div>

      <!-- === Open Positions List (max 5) === -->
      <section class="mb-8">
        <div class="flex flex-row justify-between items-center mb-2">
          <h2 class="font-semibold text-base">Open Positions</h2>
          <button
            v-if="trader?.slug"
            type="button"
            class="inline-flex items-center text-gray-600 hover:text-black"
            @click="goHistory"
            aria-label="Open futures history"
          >
            <Icon icon="tabler:file-description" class="w-4 h-4" />
          </button>
        </div>

        <div v-if="!pendingList.length" class="text-xs text-gray-400">No Data Available.</div>

        <ul v-else class="space-y-3">
          <li
            v-for="(tx) in sortedPending"
            :key="tx.id"
            class="rounded-md border border-gray-200 bg-white p-4"
          >
            <!-- TOP: Pair/Type + leverage (kiri) | ROE (kanan) -->
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-center gap-2 min-w-0">
                <!-- BUY: B hijau | SELL: S merah -->
                <span
                  class="h-5 w-5 rounded inline-flex items-center justify-center"
                  :class="
                    tx.side === 'SELL'
                      ? 'bg-red-500/15 border border-red-200'
                      : 'bg-teal-500/15 border border-teal-200'
                  "
                >
                  <span
                    class="text-[10px] font-bold"
                    :class="tx.side === 'SELL' ? 'text-red-600' : 'text-teal-600'"
                  >{{ tx.side === 'SELL' ? 'S' : 'B' }}</span>
                </span>

                <div class="min-w-0">
                  <div class="flex items-baseline gap-2 min-w-0">
                    <div class="truncate text-sm font-semibold text-gray-900">
                      {{ formatPairFromSymbol(tx.pair || tx.symbol) || 'BTC/USDT' }}
                    </div>
                    <div class="shrink-0 text-xs text-gray-500">
                      {{ tx.contractType || 'Perpetual' }}
                    </div>
                  </div>
                </div>
              </div>


            </div>

            <!-- MIDDLE: Unrealized PNL + ROE (aligned) -->
            <div class="mt-4 flex items-start justify-between">
              <div>
                <div class="text-[11px] text-gray-400">Unrealized PNL (USDT)</div>
                <div
                  class="mt-1 text-2xl font-semibold tracking-tight"
                  :class="pnlFor(tx) >= 0 ? 'text-teal-600' : 'text-red-600'"
                >
                  {{ fmtMoney(pnlFor(tx), 2) }}
                </div>
              </div>

              <div>
                <div class="text-[11px] text-right text-gray-400">ROE</div>
                <div
                  class="mt-1 text-2xl font-semibold tracking-tight"
                  :class="roeFor(tx) >= 0 ? 'text-teal-600' : 'text-red-600'"
                >
                  {{ roeFor(tx) >= 0 ? '+' : '' }}{{ fmtMoney(roeFor(tx), 2) }}%
                </div>
              </div>
            </div>

            <!-- BOTTOM: Est. Total / Open Position / SL -->
            <div class="mt-4 grid grid-cols-3 gap-3 text-[10px]">
              <div class="flex flex-col">
                <span class="text-gray-400">Est. Total</span>
                <span class="font-semibold text-gray-900">
                  {{ fmtMoney(currentTotalFor(tx), 4) }}
                </span>
              </div>

              <div class="flex flex-col text-center">
                <span class="text-gray-400 whitespace-nowrap">Open Position</span>
                <span class="font-semibold text-gray-900">
                  {{ fmtMoney(tx.amount, 2) }}
                </span>
              </div>

              <div class="flex flex-col text-right">
                <span class="text-gray-400">SL</span>
                <span class="font-semibold text-teal-600">
                  {{ Number.isFinite(tx.sl) ? Math.round(Math.abs(tx.sl)) + '%' : '—' }}
                </span>
              </div>
            </div>

          </li>
        </ul>
      </section>


      <ChatCard />
    </template>
  </main>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApiAlertStore } from '@/stores/apiAlert'
import ChatCard from '@/components/futures/ChatCard.vue'
import LightChart from '@/components/trade/LightChart.vue'
import type { AreaData, CandlestickData, LineData, UTCTimestamp } from 'lightweight-charts'

/* ===== ALERT via Pinia store ===== */
const apiAlert = useApiAlertStore()
const alertSuccess = (msg: string, onClose?: () => void) => apiAlert.open('Success', msg, onClose)
const alertError = (msg: string, onClose?: () => void) => apiAlert.open('Error', msg, onClose)

/* ===== Helpers API ===== */
const API_BASE = 'https://tech.oneled.io/api'

type Side = 'BUY' | 'SELL'
const selectedSide = ref<Side | ''>('')
const sideByTxId = new Map<number, Side>()
const pairByTxId = new Map<number, string>()

const showSideChooser = ref(false)

/* ===== Chart (adapted from NewMarketCoin.vue) ===== */
const showChart = ref(false)
type SeriesKind = 'candlestick' | 'line' | 'area'
const kind = ref<SeriesKind>('candlestick')

type TF = '5m' | '15m' | '1h' | '1d'
const tfs: TF[] = ['5m', '15m', '1h', '1d']
const tf = ref<TF>('15m')

function toggleChart() {
  showChart.value = !showChart.value
  if (showChart.value) {
    void loadHistoryForCurrentTF()
    scheduleResubscribe()
  }
}

const amountOk = computed(() => {
  const normalized = (amount.value || '').replace(',', '.').trim()
  if (!normalized) return false
  const n = Number(normalized)
  if (!Number.isFinite(n) || n <= 0) return false
  if (amountError.value) return false
  return true
})

const stopLossOk = computed(() => {
  const v = Number(sl.value)
  return Number.isFinite(v) && v >= 10
})

const takeProfitOk = computed(() => {
  const v = Number(tp.value)
  return Number.isFinite(v) && v >= 1
})

const canSubmitOrder = computed(() => {
  return (
    hasPairSelected.value &&
    !loadingSubmit.value &&
    !atCapacity.value &&
    amountOk.value &&
    stopLossOk.value &&
    takeProfitOk.value
  )
})

function toggleSideChooser() {
  if (loadingSubmit.value || atCapacity.value || !hasPairSelected.value) return
  showSideChooser.value = !showSideChooser.value
}

async function submitWithSide(side: Side) {
  if (!canSubmitOrder.value) return
  selectedSide.value = side
  showSideChooser.value = true
  await submitWinLose()
}
const availablePairs = ref<string[]>(['BTC/USDT',
  'ETH/USDT',
  'BNB/USDT',
  'SOL/USDT',
  'LTC/USDT',
  'LINK/USDT',
  'TON/USDT',
  'SUI/USDT',
  'XRP/USDT',
  'QTUM/USDT',
  'THETA/USDT',
  'ADA/USDT',
  'RAD/USDT',
  'BAND/USDT',
  'ALGO/USDT',
  'POL/USDT',
  'DOGE/USDT',
  'LUNA/USDT',
  'GALA/USDT',
  'PEPE/USDT',
  'CFX/USDT',
  'TRX/USDT',
  'TRUMP/USDT',
  'SHIB/USDT',
  'ARB/USDT',
  'FIL/USDT',
  'API3/USDT',
  'ENA/USDT',
  'BIO/USDT',
  'UNI/USDT',
  'BTT/USDT',
  'SATS/USDT',
  'MEME/USDT',
  'GT/USDT',
  'OP/USDT',
  'AAVE/USDT',
  'SNAKES/USDT',
  'TIA/USDT',
  'SOON/USDT',
  'ONDO/USDT',
  'NEO/USDT',
  'SKL/USDT',
  'MX/USDT',
  'FARTCOIN/USDT',
  'RATS/USDT',
  'ETC/USDT',
  'TRB/USDT',
  'AVAX/USDT',
  'BCH/USDT',
  'BSV/USDT',
  'IOTA/USDT',
  'CYBER/USDT',
  'WIF/USDT',
  'CORE/USDT',
  'WLD/USDT',
  'SEI/USDT',
  'VIRTUAL/USDT',
  'RENDER/USDT',
  'MOODENG/USDT',
  'JUP/USDT',
  'PONKE/USDT',
  'MNT/USDT',
  'PNUT/USDT',
  'EIGEN/USDT',
  'GRASS/USDT',
  'RAY/USDT',
  'EPIC/USDT',
  'ZRO/USDT',
  'BERA/USDT',
  'CA/USDT',
  'IP/USDT',
  'KAITO/USDT',
  'OMNI/USDT',
  'A8/USDT',
  'OBOL/USDT',
  'SAGA/USDT',
  'ORCA/USDT',
  'SHELL/USDT',
  'NAKA/USDT'])
const selectedPair = ref<string>('BTC/USDT') // UI only
const hasPairSelected = computed(() => !!selectedPair.value)

// header dropdown (UI copied from FutureClone.vue)
const headerDropdownOpen = ref(false)
const headerSelectedPair = computed(() => selectedPair.value || 'BTC/USDT')
function selectHeaderPair(pair: string) {
  selectedPair.value = pair
  headerDropdownOpen.value = false
}

// PRICE + CHANGE header (UI only; no market feed)
const headerPrice = ref<number>(0)
const headerOpenPrice = ref<number>(0)

function basePriceForPair(pair: string): number {
  const p = (pair || '').toUpperCase().trim()
  const base = p.split('/')[0] || p
  switch (base) {
    case 'BTC':
      return 43000
    case 'ETH':
      return 2300
    case 'BNB':
      return 300
    case 'SOL':
      return 95
    case 'XRP':
      return 0.55
    case 'DOGE':
      return 0.08
    default:
      return 10
  }
}

function initHeaderMarket(pair: string) {
  const base = basePriceForPair(pair)
  headerPrice.value = base
  headerOpenPrice.value = base
}

function stepHeaderMarket() {
  if (!Number.isFinite(headerPrice.value) || headerPrice.value <= 0) return
  // random walk kecil supaya UI terasa hidup
  const vol = headerPrice.value * 0.0012
  const step = (Math.random() - 0.5) * 2 * vol
  const drift = (headerOpenPrice.value - headerPrice.value) * 0.002
  const next = headerPrice.value + step + drift
  headerPrice.value = Math.max(1e-8, next)
}

const headerPercentChange = computed(() => {
  const open = headerOpenPrice.value
  const cur = headerPrice.value
  if (!Number.isFinite(open) || open <= 0 || !Number.isFinite(cur)) return 0
  return ((cur - open) / open) * 100
})

const headerPriceText = computed(() =>
  (headerPrice.value || 0).toLocaleString('en-US', { maximumFractionDigits: 2 }),
)

const headerPercentChangeText = computed(() => {
  const v = headerPercentChange.value
  if (!Number.isFinite(v)) return '-'
  return `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`
})

/* ===== Orderbook + Form (UI-only, copied from FutureClone.vue) ===== */
type DepthTick = {
  asks: [number, number][]
  bids: [number, number][]
}
type DepthData = {
  ch?: string
  ts?: number
  tick: DepthTick
}

function pairToQuery(pair: string): string {
  return pair.replace('/', '').toLowerCase()
}

const orderbookPair = computed(() =>
  selectedPair.value && availablePairs.value.includes(selectedPair.value)
    ? selectedPair.value
    : 'BTC/USDT',
)

const depthData = ref<DepthData | null>(null)
const asksTop = ref<[number, number][]>([])
const bidsTop = ref<[number, number][]>([])

const baseAsset = computed(() => {
  const p = (selectedPair.value || 'BTC/USDT').toUpperCase()
  return p.includes('/') ? p.split('/')[0] : p.replace(/USDT$/i, '') || 'BTC'
})

function bestBid(): number {
  const bids = depthData.value?.tick?.bids
  return Array.isArray(bids) && bids.length ? Number(bids[0][0]) : 0
}
function bestAsk(): number {
  const asks = depthData.value?.tick?.asks
  return Array.isArray(asks) && asks.length ? Number(asks[0][0]) : 0
}

const marketPrice = computed(() => bestBid() || headerPrice.value || 0)

const top12Bids = computed(() => bidsTop.value.slice(0, 5))
const top12Asks = computed(() => asksTop.value.slice(0, 5))

const maxBidAmount = computed(() => Math.max(1, ...top12Bids.value.map((b) => Number(b[1]) || 0)))
const maxAskAmount = computed(() => Math.max(1, ...top12Asks.value.map((a) => Number(a[1]) || 0)))

/* ===== Kline buffers (for chart) ===== */
type OriginPeriod = '5min' | '15min' | '60min' | '1day'
function isOriginPeriod(p: string): p is OriginPeriod {
  return p === '5min' || p === '15min' || p === '60min' || p === '1day'
}

const WANT_BARS = 300

type CandleBuf = {
  time: UTCTimestamp
  open: number
  high: number
  low: number
  close: number
  vol: number
}
const buf5m = new Map<number, CandleBuf>()
const buf15m = new Map<number, CandleBuf>()
const buf60m = new Map<number, CandleBuf>()
const buf1d = new Map<number, CandleBuf>()

function mapForPeriod(p: OriginPeriod) {
  if (p === '5min') return buf5m
  if (p === '15min') return buf15m
  if (p === '60min') return buf60m
  return buf1d
}
function periodMs(p: OriginPeriod) {
  if (p === '5min') return 300_000
  if (p === '15min') return 900_000
  if (p === '60min') return 3_600_000
  return 86_400_000
}
function bucketSec(tsMs: number, p: OriginPeriod) {
  const ms = periodMs(p)
  return Math.floor(tsMs / ms) * (ms / 1000)
}
function upsertCandleBuffer(
  p: OriginPeriod,
  tsMs: number,
  ohlc: { open: number; high: number; low: number; close: number; vol: number },
) {
  const m = mapForPeriod(p)
  const key = bucketSec(tsMs, p)
  const prev = m.get(key)
  if (!prev) {
    m.set(key, { time: key as UTCTimestamp, ...ohlc })
  } else {
    prev.high = Math.max(prev.high, ohlc.high)
    prev.low = Math.min(prev.low, ohlc.low)
    prev.close = ohlc.close
    prev.vol = (prev.vol || 0) + (ohlc.vol || 0)
  }
}

function tfPlan(x: TF): { base: OriginPeriod } {
  if (x === '5m') return { base: '5min' }
  if (x === '15m') return { base: '15min' }
  if (x === '1h') return { base: '60min' }
  return { base: '1day' }
}

const chartCandles = ref<CandlestickData[]>([])
const chartLine = ref<LineData[]>([])
const chartArea = ref<AreaData[]>([])
let chartFlushTimer: number | undefined

function seriesFromBufferForTF(): CandlestickData[] {
  const { base } = tfPlan(tf.value)
  const m = mapForPeriod(base)
  const keys = Array.from(m.keys()).sort((a, b) => a - b)
  const data = keys.map((k) => {
    const c = m.get(k)!
    return { time: c.time, open: c.open, high: c.high, low: c.low, close: c.close }
  })
  return data.slice(-WANT_BARS)
}
function scheduleChartFlush() {
  if (chartFlushTimer) return
  chartFlushTimer = window.setTimeout(() => {
    const candles = seriesFromBufferForTF()
    chartCandles.value = candles
    chartLine.value = candles.map((k) => ({ time: k.time, value: k.close }))
    chartArea.value = chartLine.value
    chartFlushTimer = undefined
  }, 60)
}

const dataForChart = computed(() => {
  if (kind.value === 'candlestick') return { candleData: chartCandles.value, data: [] as LineData[] }
  if (kind.value === 'line') return { candleData: [] as CandlestickData[], data: chartLine.value }
  return { candleData: [] as CandlestickData[], data: chartArea.value }
})

function resetChartData() {
  buf5m.clear()
  buf15m.clear()
  buf60m.clear()
  buf1d.clear()
  chartCandles.value = []
  chartLine.value = []
  chartArea.value = []
  scheduleChartFlush()
}

// ===== REST history loader (Huobi) untuk isi awal candle =====
async function loadHistoryForCurrentTF() {
  try {
    const sym = pairToQuery(orderbookPair.value)
    if (!sym.endsWith('usdt')) return

    let period = ''
    let origin: OriginPeriod | null = null
    if (tf.value === '5m') {
      period = '5min'
      origin = '5min'
    } else if (tf.value === '15m') {
      period = '15min'
      origin = '15min'
    } else if (tf.value === '1h') {
      period = '60min'
      origin = '60min'
    } else {
      period = '1day'
      origin = '1day'
    }
    if (!origin) return

    const url = `https://api.huobi.pro/market/history/kline?symbol=${sym}&period=${period}&size=${WANT_BARS}`
    const res = await fetch(url)
    if (!res.ok) return
    const json = await res.json()
    if (!json || !Array.isArray(json.data)) return

    for (const k of json.data as any[]) {
      const tsMs = Number(k.id) * 1000
      const open = Number(k.open)
      const close = Number(k.close)
      const high = Number(k.high)
      const low = Number(k.low)
      const vol = Number(k.vol ?? k.amount ?? 0)
      if (!Number.isFinite(open) || !Number.isFinite(close)) continue
      upsertCandleBuffer(origin, tsMs, { open, high, low, close, vol })
    }
    scheduleChartFlush()
  } catch {
    // silent
  }
}

/** =========================
 *  WebSocket (depth + kline)
 *  ========================= */
const aggWS = ref<WebSocket | null>(null)
let reconnectTimer: number | undefined
let flushTimer: number | undefined
let resubTimer: number | undefined
let pendingDepth: {
  ts: number
  asks: [number, number][]
  bids: [number, number][]
  sym: string
} | null = null

function wsSend(obj: unknown) {
  if (aggWS.value && aggWS.value.readyState === WebSocket.OPEN) {
    try {
      aggWS.value.send(JSON.stringify(obj))
    } catch {}
  }
}
function subscribeFor(symLower: string, periods: OriginPeriod[], limit: number, withDepth = false) {
  const channels = withDepth ? ['depth', 'kline'] : ['kline']
  wsSend({ type: 'subscribe', channels, symbols: [symLower], periods, limit })
}
function snapshotFor(symLower: string, periods: OriginPeriod[], limit: number) {
  wsSend({ type: 'snapshot', symbols: [symLower], periods, limit })
}
function doUnsubscribe(symLower: string, periods: OriginPeriod[]) {
  wsSend({
    type: 'unsubscribe',
    channels: ['depth', 'kline'],
    symbols: [symLower],
    periods,
  })
}

let subscribedSym: string | null = null
const subscribedPeriods = new Set<OriginPeriod>()
function scheduleResubscribe() {
  if (resubTimer) return
  resubTimer = window.setTimeout(() => {
    resubTimer = undefined
    const ws = aggWS.value
    if (!ws || ws.readyState !== WebSocket.OPEN) return

    const sym = pairToQuery(orderbookPair.value)
    const plan = tfPlan(tf.value)
    const wantPeriods = new Set<OriginPeriod>([plan.base])

    if (subscribedSym && subscribedSym !== sym) {
      if (subscribedPeriods.size) doUnsubscribe(subscribedSym, Array.from(subscribedPeriods))
      subscribedPeriods.clear()
      resetChartData()
    } else if (subscribedSym === sym) {
      const toUnsub: OriginPeriod[] = []
      subscribedPeriods.forEach((p) => {
        if (!wantPeriods.has(p)) toUnsub.push(p)
      })
      if (toUnsub.length) doUnsubscribe(sym, toUnsub)
      for (const p of toUnsub) subscribedPeriods.delete(p)
    }

    const needDepth = !subscribedSym || subscribedSym !== sym || subscribedPeriods.size === 0

    if (!subscribedPeriods.has(plan.base)) {
      subscribeFor(sym, [plan.base], WANT_BARS, needDepth)
      snapshotFor(sym, [plan.base], WANT_BARS)
      subscribedPeriods.add(plan.base)
    }

    subscribedSym = sym
  }, 150)
}

function scheduleFlush() {
  if (flushTimer) return
  flushTimer = window.setTimeout(() => {
    const curPairKey = pairToQuery(orderbookPair.value)
    if (pendingDepth && pendingDepth.sym === curPairKey) {
      const asksAsc = [...pendingDepth.asks].sort((a, b) => a[0] - b[0])
      const bidsDesc = [...pendingDepth.bids].sort((a, b) => b[0] - a[0])
      depthData.value = {
        ch: `market.${curPairKey}.depth.step0`,
        ts: pendingDepth.ts,
        tick: {
          asks: asksAsc.slice(0, 20),
          bids: bidsDesc.slice(0, 20),
        },
      }
      asksTop.value = asksAsc.slice(0, 5)
      bidsTop.value = bidsDesc.slice(0, 5)
      pendingDepth = null
    }
    flushTimer = undefined
  }, 80)
}

function connectAggregatorWS() {
  if (typeof window === 'undefined' || typeof WebSocket === 'undefined') return
  try {
    aggWS.value?.close()
  } catch {}
  aggWS.value = new WebSocket('wss://ws.hyper-led.com')

  aggWS.value.onopen = () => {
    subscribedSym = null
    subscribedPeriods.clear()
    scheduleResubscribe()
  }
  aggWS.value.onclose = () => {
    if (reconnectTimer) clearTimeout(reconnectTimer)
    reconnectTimer = window.setTimeout(connectAggregatorWS, 2000)
  }
  aggWS.value.onerror = () => {
    try {
      aggWS.value?.close()
    } catch {}
  }
  aggWS.value.onmessage = (e: MessageEvent) => {
    try {
      const msg = JSON.parse(e.data as string)

      // Snapshot
      if (msg?.type === 'snapshot' && Array.isArray(msg.items)) {
        const want = pairToQuery(orderbookPair.value)
        for (const it of msg.items) {
          const symLower = String(it.symbol || '').toLowerCase()
          if (!symLower || symLower !== want) continue
          if (it.type === 'depth') {
            const bids = Array.isArray(it.bids) ? (it.bids as [number, number][]) : []
            const asks = Array.isArray(it.asks) ? (it.asks as [number, number][]) : []
            pendingDepth = { ts: Number(it.ts) || Date.now(), asks, bids, sym: symLower }
          } else if (it.type === 'kline') {
            const pRaw = String(it.period || '')
            if (!isOriginPeriod(pRaw)) continue
            const open = Number(it.open)
            const close = Number(it.close)
            const high = Number(it.high)
            const low = Number(it.low)
            const vol = Number(it.vol)
            const ts = Number(it.ts)
            if (Number.isFinite(open) && Number.isFinite(close)) {
              upsertCandleBuffer(pRaw, ts, { open, high, low, close, vol })
              scheduleChartFlush()
            }
          }
        }
        scheduleFlush()
        scheduleChartFlush()
        return
      }

      // Stream
      const type: string | undefined = msg?.type
      const symLower = String(msg.symbol || '').toLowerCase()
      if (!type || !symLower || symLower !== pairToQuery(orderbookPair.value)) return

      if (type === 'depth') {
        const bids = Array.isArray(msg.bids) ? (msg.bids as [number, number][]) : []
        const asks = Array.isArray(msg.asks) ? (msg.asks as [number, number][]) : []
        pendingDepth = { ts: Number(msg.ts) || Date.now(), asks, bids, sym: symLower }
        scheduleFlush()
        return
      }

      if (type === 'kline') {
        const pRaw = String(msg.period || '')
        if (!isOriginPeriod(pRaw)) return
        const open = Number(msg.open)
        const close = Number(msg.close)
        const high = Number(msg.high)
        const low = Number(msg.low)
        const vol = Number(msg.vol)
        const ts = Number(msg.ts)
        if (Number.isFinite(open) && Number.isFinite(close)) {
          upsertCandleBuffer(pRaw, ts, { open, high, low, close, vol })
          scheduleChartFlush()
        }
        return
      }
    } catch {
      /* ignore */
    }
  }
}

// Restrict modal (UI-only)
const showRestrict = ref(false)
function openRestrict() {
  showRestrict.value = true
}
function closeRestrict() {
  showRestrict.value = false
}

function formatPairFromSymbol(sym?: string): string | null {
  const s = (sym ?? '').trim()
  if (!s) return null
  if (s.includes('/')) return s
  if (s.toUpperCase().endsWith('USDT') && s.length > 4) return `${s.slice(0, -4)}/USDT`
  return s
}

// abortable fetch dengan timeout sederhana
function withTimeout<T>(p: Promise<T>, ms = 10000): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, rej) => {
      const t = setTimeout(() => {
        clearTimeout(t)
        rej(new Error('timeout'))
      }, ms)
    }),
  ])
}

async function authFetch(path: string, init: RequestInit = {}) {
  const token = localStorage.getItem('token')
  if (!token) throw new Error('Token not found')

  const headers: HeadersInit = {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
    ...(init.headers || {}),
  }

  const res = await withTimeout(
    fetch(`${API_BASE}${path}`, { ...init, headers, cache: 'no-store' }),
  )
  const text = await res.text()
  if (!res.ok) throw new Error(text.trim() || `HTTP ${res.status}`)
  return { text, json: () => JSON.parse(text) }
}

// deteksi error jaringan / SW no-response
function isIgnorableNetworkError(e: unknown): boolean {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return true
  const msg = (e instanceof Error ? e.message : String(e ?? '')).toLowerCase()
  return (
    msg.includes('no-response') ||
    msg.includes('failed to fetch') ||
    msg.includes('networkerror') ||
    msg.includes('abort') ||
    msg.includes('timeout')
  )
}

/* ===== Formatters ===== */
function fmtUSDT(n: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 8,
  }).format(n)
}
function fmtMoney(n: number, dp = 4): string {
  if (!Number.isFinite(n)) return '0'
  return n.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp })
}

/* ===== Types & state ===== */
type Trader = {
  id: number
  name: string
  description: string | null
  slug: string
  avatar_url?: string | null
  is_featured: boolean
  copies_used: number
  copies_limit: number
  text_pnl_30d: string
  text_roi_30d_pct: string
  text_mdd_30d_pct: string
  text_aum: string
  text_sharpe_ratio: string
  pnl_30d: number
  roi_30d_pct: number
  mdd_30d_pct: number
  aum: number
  min_buy: number | null
  sharpe_ratio: number
  time_op?: number | null
  created_at?: string
  updated_at?: string
  status?: 'draft' | 'published'
}

type PendingTx = {
  id: number
  amount: number
  tp: number
  sl: number
  createdAtUtc: string
  orderTimeMin: number

  side?: Side

  // optional display fields (fallbacks are handled in template)
  pair?: string
  symbol?: string
  contractType?: string
  marginMode?: string
  leverage?: string | number
  size?: number | null
}

const router = useRouter()
const route = useRoute()

const trader = ref<Trader | null>(null)
const loading = ref(true)
const pageError = ref<string | null>(null)
const avatarBroken = ref(false)
const kickedOut = ref(false)

function kickToFuturesCopy(message: string) {
  if (kickedOut.value) return
  kickedOut.value = true
  alertError(message)
  router.replace('/futures')
}

function ensureAbsoluteUrl(u?: string | null): string | null {
  if (!u) return null
  if (/^https?:\/\//i.test(u)) return u
  const base = 'https://tech.oneled.io/'
  return base + u.replace(/^\/+/, '')
}
const avatarUrl = computed(() => {
  const u = ensureAbsoluteUrl(trader.value?.avatar_url || null)
  return avatarBroken.value || !u ? 'https://placehold.co/48x48/png?text=?' : u
})
function onAvatarError() {
  avatarBroken.value = true
}
function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/copy')
}

const paramSlug = computed(() => {
  const p = route.params as Record<string, unknown>
  const raw = (p.slug ?? p.username ?? p.trader ?? p.id ?? '') as string
  return (raw ?? '').toString().trim()
})

/* ===== [ACCESS GUARD] ===== */
async function ensureAccess(slug: string): Promise<boolean> {
  try {
    const code = sessionStorage.getItem(`copy_access:${slug}`) || ''
    const { json } = await authFetch(`/copy-traders/${encodeURIComponent(slug)}/access-verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: code }),
    })
    const res = json() as { status: 'success' | 'error'; code: string }
    if (res.status === 'success') return true
    kickToFuturesCopy('Access denied')
  } catch {
    kickToFuturesCopy('Failed to verify access')
  }
  return false
}

/* ===== helper: room closed ===== */
const roomClosedWarned = ref(false)
function maybeHandleRoomClosed(t?: Trader | null) {
  const trg = t ?? trader.value
  if (!trg) return
  if (roomClosedWarned.value) return
  const isFull =
    typeof trg.copies_limit === 'number' &&
    trg.copies_limit > 0 &&
    typeof trg.copies_used === 'number' &&
    trg.copies_used >= trg.copies_limit

  if (isFull) {
    roomClosedWarned.value = true
    apiAlert.open('Room Closed', 'This room has reached maximum followers.', () => {
      router.replace('/futures')
    })
  }
}

/* ===== Load Trader (initial) ===== */
async function loadTrader(slug: string) {
  loading.value = true
  pageError.value = null
  trader.value = null
  avatarBroken.value = false
  roomClosedWarned.value = false
  kickedOut.value = false
  try {
    const ok = await ensureAccess(slug)
    if (!ok) return

    const { json } = await authFetch(`/data-lable-copy-trading/${encodeURIComponent(slug)}`)
    const t = (json() as Trader) ?? null

    // jika draft (jaga-jaga kalau backend suatu saat tak filter)
    if (!t || t.status === 'draft') {
      kickToFuturesCopy('This copy trader is not available.')
      return
    }

    trader.value = t
    maybeHandleRoomClosed(t)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e ?? '')
    if (msg.startsWith('HTTP 404')) {
      // slug ketemu tapi status bukan published (backend sudah filter) => redirect
      kickToFuturesCopy('This copy trader is not available.')
      return
    }
    pageError.value = msg || 'Failed to load data.'
    trader.value = null
  } finally {
    loading.value = false
  }
}

function goHistory() {
  const slug = trader.value?.slug
  if (!slug) return
  router.push({ path: `/futures/${slug}/history` })
}

function goWeeklyEvent() {
  router.push('/event')
}

/* ===== Balance & amount validation ===== */
interface SaldoApi {
  status: 'success' | 'unauthorized'
  saldo?: string
  komisi?: string
}
const saldo = ref<number>(0)
const komisi = ref<number>(0)
const loadingSaldo = ref<boolean>(true)

async function fetchSaldo() {
  loadingSaldo.value = true
  try {
    const { json } = await authFetch('/get-saldo')
    const data = json() as SaldoApi
    if (data.status !== 'success') throw new Error('API status != success')
    saldo.value = Number(data.saldo ?? 0)
    komisi.value = Number(data.komisi ?? 0)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : ''
    alertError(msg || 'Failed to load balance')
  } finally {
    loadingSaldo.value = false
  }
}

const amount = ref<string>('') // input value
const amountError = ref<string>('') // input-level error

watch(amount, (val) => {
  const normalized = (val || '').replace(',', '.').trim()
  if (!normalized) {
    amountError.value = ''
    return
  }
  const num = Number(normalized)
  if (!Number.isFinite(num) || num <= 0) amountError.value = 'Invalid amount'
  else if (num > saldo.value) amountError.value = 'Amount cannot exceed available balance'
  else amountError.value = ''
})

watch(
  selectedPair,
  (p) => {
    initHeaderMarket(p || 'BTC/USDT')
    scheduleResubscribe()
  },
  { immediate: true },
)

watch(tf, () => {
  scheduleResubscribe()
  if (showChart.value) void loadHistoryForCurrentTF()
})

/* ===== TP / SL ===== */
const tp = ref<number | null>(null)
const sl = ref<number | null>(null)

async function fetchTakeProfit(): Promise<void> {
  try {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Unauthorized.')

    const res = await fetch(`${API_BASE}/users/me/take-profit`, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (!res.ok) {
      let msg = `HTTP ${res.status}`
      try {
        msg = await res.text()
      } catch { }
      throw new Error(msg)
    }
    const data = await res.json()
    const v = Number(data?.take_profit)
    tp.value = Number.isInteger(v) && v > 0 ? v : null
  } catch {
    tp.value = null
  }
}

/* ===== Pending TX (server source of truth) ===== */
const MAX_CONCURRENT = 5
const pendingList = ref<PendingTx[]>([])

// random-walk PNL per TX (UI updates are driven by nowTick)
const pnlMap = new Map<number, number>()

const nowTick = ref(Date.now())
let tickHandle: number | undefined
let pollHandle: number | undefined
let pendingPollBusy = false

const atCapacity = computed(() => pendingList.value.length >= MAX_CONCURRENT)
const sortedPending = computed(() => pendingList.value.slice())

function startAtFor(p: PendingTx) {
  return Date.parse(p.createdAtUtc)
}
function durMsFor(p: PendingTx) {
  return Math.max(1, p.orderTimeMin) * 60 * 1000
}
function expiresAtFor(p: PendingTx) {
  return startAtFor(p) + durMsFor(p)
}


/* ==== RANDOM WALK PNL (visual only) ==== */
function stepRandomWalk(p: PendingTx) {
  const maxProfit = p.amount * (p.tp / 100) // target akhir (+)
  const current = pnlMap.get(p.id) ?? 0

  const dur = durMsFor(p)
  const prog = Math.max(0, Math.min(1, (nowTick.value - startAtFor(p)) / dur))
  const baseVol = maxProfit * 0.015

  let next = current
  if (prog < 0.8) {
    const step = (Math.random() - 0.5) * 2 * baseVol
    const meanRevert = -current * 0.02
    next = current + step + meanRevert
  } else {
    const remainingMs = Math.max(1000, expiresAtFor(p) - nowTick.value)
    const remainingTicks = Math.ceil(remainingMs / 1000)
    const requiredPerTick = (maxProfit - current) / remainingTicks
    const noise = (Math.random() - 0.5) * 2 * baseVol * 0.3
    const phase = (prog - 0.8) / 0.2
    const ease = phase * phase * (3 - 2 * phase)
    next = current + requiredPerTick * (1 + 0.5 * ease) + noise
    const minDip = current - baseVol * 0.1
    if (next < minDip) next = minDip
  }
  if (next > maxProfit) next = maxProfit
  if (next < -maxProfit) next = -maxProfit
  pnlMap.set(p.id, next)
}

function pnlFor(p: PendingTx) {
  return pnlMap.get(p.id) ?? 0
}
function roeFor(p: PendingTx) {
  const amt = Number(p.amount)
  if (!Number.isFinite(amt) || amt === 0) return 0
  return (pnlFor(p) / amt) * 100
}
function currentTotalFor(p: PendingTx) {
  return p.amount + pnlFor(p)
}

/* ===== API pending ===== */
async function fetchPending(opts: { silent?: boolean } = {}) {
  const { silent = false } = opts
  try {
    const { json } = await authFetch('/win-lose/pending')
    const payload = json() as { data: unknown[] }

    const list: PendingTx[] = (payload.data || []).map((row): PendingTx => {
      const x = (row ?? {}) as Record<string, unknown>

      const id = Number(x.id)
      const amount = Number(x.amount ?? 0)
      const tp = Number(x.take_profit ?? 0)
      const sl = Number(x.stop_loss ?? 0)
      const createdAtUtc = String(x.created_at_utc ?? '')
      const otRaw = Number(x.order_time_min)
      const orderTimeMin = Number.isFinite(otRaw) && otRaw > 0 ? otRaw : 5

      const symRaw =
        typeof x.coin === 'string'
          ? x.coin
          : typeof x.symbol === 'string'
            ? x.symbol
            : typeof x.pair === 'string'
              ? x.pair
              : ''

      // prefer server-provided pair, fallback to locally remembered pair
      const pair = (symRaw || pairByTxId.get(id) || '').trim() || undefined
      const symbol = symRaw ? symRaw.replace(/\//g, '') : undefined

      const leverageRaw = x.leverage
      const leverage =
        typeof leverageRaw === 'number'
          ? `${leverageRaw}x`
          : typeof leverageRaw === 'string'
            ? leverageRaw
            : undefined

      const sizeRaw = x.size
      const size = typeof sizeRaw === 'number' && Number.isFinite(sizeRaw) ? sizeRaw : null

      const sideRaw = x.keterangan ?? x.side
      const sideText = typeof sideRaw === 'string' ? sideRaw.trim().toUpperCase() : ''
      const sideTextNorm = sideText.replace(/\s+/g, ' ')
      const parsedSide: Side | undefined =
        /(^|\b)(SELL|SHORT|S)(\b|$)/.test(sideTextNorm)
          ? 'SELL'
          : /(^|\b)(BUY|LONG|B)(\b|$)/.test(sideTextNorm)
            ? 'BUY'
            : undefined
      const side: Side | undefined = parsedSide ?? sideByTxId.get(id)

      return {
        id,
        amount,
        tp,
        sl,
        createdAtUtc,
        orderTimeMin,
        side,
        pair,
        symbol,
        contractType: typeof x.contractType === 'string' ? x.contractType : undefined,
        marginMode: typeof x.marginMode === 'string' ? x.marginMode : undefined,
        leverage,
        size,
      }
    })

    // sinkronkan PNL map
    const newIds = new Set(list.map((t) => t.id))
    for (const id of Array.from(pnlMap.keys())) {
      if (!newIds.has(id)) {
        pnlMap.delete(id)
        sideByTxId.delete(id)
        pairByTxId.delete(id)
      }
    }
    for (const t of list) if (!pnlMap.has(t.id)) pnlMap.set(t.id, 0)

    pendingList.value = list
  } catch (e: unknown) {
    if (silent || isIgnorableNetworkError(e)) return
    const msg = e instanceof Error ? e.message : ''
    alertError(msg || 'Failed to load pending list')
  }
}

/* ===== finalize per TX (dipakai saat kadaluarsa jika belum ada scheduler server) ===== */
async function finalizeWinLose(txId: number) {
  try {
    const { json } = await authFetch('/win-lose/finalize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transaction_id: txId }),
    })
    const data = json() as { status: string; hasil?: number }
    await Promise.all([fetchSaldo(), fetchPending({ silent: true })])
    if (data?.hasil === 1) alertSuccess('Position closed: Win (TP).')
    else if (data?.hasil === 2) alertSuccess('Position closed: Lose (SL).')
    else alertSuccess('Position closed.')
    return data
  } catch (e: unknown) {
    throw e
  }
}

async function finalizeIfExpired() {
  const now = Date.now()
  for (const tx of pendingList.value) {
    if (expiresAtFor(tx) <= now) {
      try {
        await finalizeWinLose(tx.id)
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e ?? '')
        if (msg.includes('already processed')) continue
        if (msg.includes('Transaction not found')) continue
      }
    }
  }
}

/* ===== Submit ===== */
const loadingSubmit = ref(false)

const submitWinLose = async () => {
  if (atCapacity.value) return alertError('Full position capacity (5/5). Complete one first.')
  if (!hasPairSelected.value) return alertError('Select Pair Required')
  if (!selectedSide.value) return alertError('Select Buy or Sell')

  const normalized = (amount.value || '').replace(',', '.').trim()
  const amt = Number(normalized)
  if (!Number.isFinite(amt) || amt <= 0) return alertError('Amount is invalid')
  if (amountError.value) return alertError(amountError.value)
  if (!tp.value || tp.value < 1)
    return alertError('Your order quantity or price exceeds the range. please adjust your order')
  if (!sl.value || sl.value < 10)
    return alertError('Your order quantity or price exceeds the range. please adjust your order')

  loadingSubmit.value = true
  try {
    const orderTime = trader.value?.time_op ?? 5
    const { json } = await authFetch('/win-lose/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_copy_traders: trader.value?.id,
        amount: amt,
        take_profit: tp.value,
        stop_loss: sl.value,
        order_time: orderTime,
        keterangan: selectedSide.value,     // 'BUY' | 'SELL'
        coin: selectedPair.value,           // contoh: 'BTC/USDT'
      }),
    })
    const res = json() as { status: 'success'; transaction_id: number }
    if (res?.transaction_id && (selectedSide.value === 'BUY' || selectedSide.value === 'SELL')) {
      sideByTxId.set(res.transaction_id, selectedSide.value)
      if (selectedPair.value) pairByTxId.set(res.transaction_id, selectedPair.value)
    }
    alertSuccess('Order created.')
    showSideChooser.value = false
    selectedSide.value = ''
    amount.value = ''
    await Promise.all([fetchSaldo(), fetchPending({ silent: true })])
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : ''
    alertError(msg || 'Submit failed')
  } finally {
    loadingSubmit.value = false
  }
}
/* ===== Polling status/min_buy (dan beberapa field penting) per 10 detik ===== */
const MINBUY_POLL_MS = 10000
let traderPollHandle: number | undefined
let traderPollBusy = false

async function pollTraderMinBuy() {
  if (traderPollBusy) return
  const slug = trader.value?.slug
  if (!slug) return
  if (document.hidden) return

  traderPollBusy = true
  try {
    const { json } = await authFetch(`/data-lable-copy-trading/${encodeURIComponent(slug)}`)
    const fresh = json() as Trader

    // kalau server suatu saat kirim status selain published
    if (fresh?.status && fresh.status !== 'published') {
      kickToFuturesCopy('This copy trader is not available.')
      return
    }

    maybeHandleRoomClosed(fresh)

    if (trader.value) {
      const changed =
        trader.value.min_buy !== fresh.min_buy ||
        trader.value.copies_used !== fresh.copies_used ||
        trader.value.copies_limit !== fresh.copies_limit ||
        trader.value.is_featured !== fresh.is_featured ||
        trader.value.time_op !== fresh.time_op

      if (changed) {
        trader.value = {
          ...trader.value,
          min_buy: fresh.min_buy,
          copies_used: fresh.copies_used,
          copies_limit: fresh.copies_limit,
          is_featured: fresh.is_featured,
          time_op: fresh.time_op,
          updated_at: fresh.updated_at ?? trader.value.updated_at,
        }
      }
    } else {
      trader.value = fresh
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e ?? '')
    if (msg.startsWith('HTTP 404')) {
      // status berubah jadi draft (endpoint Anda memang filter published)
      kickToFuturesCopy('This copy trader is not available.')
      return
    }
    // error jaringan: diamkan
    if (!isIgnorableNetworkError(e)) {
      // optional: alertError('Failed to refresh trader data')
    }
  } finally {
    traderPollBusy = false
  }
}

/* ===== Lifecycle ===== */
watch(
  paramSlug,
  (s) => {
    if (!s) {
      loading.value = false
      trader.value = null
    } else {
      loadTrader(s)
    }
  },
  { immediate: true },
)

onMounted(() => {
  fetchTakeProfit()
  connectAggregatorWS()

  // 1s ticker: waktu & random-walk animasi
  tickHandle = window.setInterval(() => {
    nowTick.value = Date.now()
    for (const tx of pendingList.value) stepRandomWalk(tx)
    stepHeaderMarket()
  }, 1000)

  // load awal
  fetchSaldo()
  fetchPending({ silent: false })

  // polling pending + auto finalize client-side
  pollHandle = window.setInterval(async () => {
    if (pendingPollBusy) return
    pendingPollBusy = true
    try {
      await fetchPending({ silent: true })
      await finalizeIfExpired()
    } finally {
      pendingPollBusy = false
    }
  }, 3000)

  // polling trader.min_buy (dan field penting) tiap 5 detik
  traderPollHandle = window.setInterval(() => {
    void pollTraderMinBuy()
  }, MINBUY_POLL_MS)
})

onUnmounted(() => {
  if (tickHandle) clearInterval(tickHandle)
  if (pollHandle) clearInterval(pollHandle)
  if (traderPollHandle) clearInterval(traderPollHandle)
  if (reconnectTimer) clearTimeout(reconnectTimer)
  if (flushTimer) clearTimeout(flushTimer)
  if (resubTimer) clearTimeout(resubTimer)
  if (chartFlushTimer) clearTimeout(chartFlushTimer)
  try {
    aggWS.value?.close()
  } catch {}
  aggWS.value = null
})
</script>
