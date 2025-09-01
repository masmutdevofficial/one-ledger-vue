<template>
  <section class="px-6 pt-1 max-w-md mx-auto w-full">
    <h1 class="font-bold text-[16px] mb-8">Help &amp; Support</h1>

    <!-- Nav: trigger modal by menu -->
    <nav class="flex flex-col space-y-3 text-[14px] font-normal text-black">
      <button type="button" class="text-left block hover:underline" @click="openModal('about')">
        About Us
      </button>
      <button type="button" class="text-left block hover:underline" @click="openModal('terms')">
        Terms &amp; Conditions
      </button>
      <button type="button" class="text-left block hover:underline" @click="openModal('privacy')">
        Privacy Policy
      </button>
      <button type="button" class="text-left block hover:underline" @click="openModal('risk')">
        Risk Disclosure
      </button>
      <button type="button" class="text-left block hover:underline" @click="openModal('faq')">
        FAQ
      </button>
      <button type="button" class="text-left block hover:underline" @click="openModal('contact')">
        Contact Us / Support Center
      </button>
    </nav>
  </section>

  <!-- Bottom Nav -->
  <div
    class="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white shadow-md z-50"
  >
    <div class="flex justify-center items-center py-2 space-x-3">
      <RouterLink to="/dashboard" class="flex flex-col items-center text-gray-400">
        <img alt="Home" src="/img/home-alt.png" class="w-4 h-4 object-contain" />
        <span class="text-xs mt-1 font-semibold">Home</span>
      </RouterLink>
    </div>
  </div>

  <!-- Modal -->
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center"
    aria-modal="true"
    role="dialog"
    @keydown.esc="close"
  >
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/30" @click="close"></div>

    <!-- Panel -->
    <div
      class="relative z-10 w-full max-w-lg mx-4 rounded-2xl bg-white shadow-xl"
      @click.stop
      role="document"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 class="text-[12px] font-semibold">{{ title }}</h3>
        <button
          type="button"
          class="p-1 rounded hover:bg-gray-100"
          @click="close"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <!-- Body -->
      <div
        class="max-h-[70dvh] overflow-y-auto px-4 py-3 text-[12px] leading-relaxed text-gray-700"
      >
        <!-- About -->
        <template v-if="active === 'about'">
          <p class="font-semibold">About Us – Ledger Wallet Exchange</p>
          <p class="mt-2">
            At Ledger Wallet Exchange, we are committed to building a secure, transparent, and
            user-friendly trading environment for digital assets. Our mission is to bridge the gap
            between self-custody wallet security and the convenience of a global exchange, giving
            users full control of their funds while enjoying seamless trading experiences.
          </p>
          <p class="mt-2">
            We believe in empowering individuals to truly own their digital assets. By combining
            Ledger-grade wallet technology with our advanced exchange platform, we provide a
            solution where security and accessibility go hand in hand.
          </p>

          <h4 class="mt-3 font-semibold">What We Stand For</h4>
          <ul class="list-disc pl-5 space-y-1">
            <li>
              <b>Security First</b> – Funds are protected through industry-leading cold storage and
              hardware wallet integration.
            </li>
            <li>
              <b>Transparency</b> – We maintain a clear fee structure and open communication with
              our users.
            </li>
            <li>
              <b>Innovation</b> – Continuous development of trading tools and wallet integration for
              a smoother user journey.
            </li>
            <li>
              <b>Compliance</b> – We adhere to strict KYC/AML standards to ensure a safe and
              compliant trading environment.
            </li>
          </ul>

          <h4 class="mt-3 font-semibold">Our Vision</h4>
          <p>
            To become the world’s most trusted digital asset exchange, where users can trade with
            confidence, knowing their assets remain secure in a ledger-backed wallet infrastructure.
          </p>

          <h4 class="mt-3 font-semibold">Our Mission</h4>
          <p>
            To combine the highest level of wallet security with a powerful exchange ecosystem,
            enabling users to trade, store, and grow their digital wealth securely.
          </p>
        </template>

        <!-- Terms -->
        <template v-else-if="active === 'terms'">
          <p class="font-semibold">Terms &amp; Conditions – Ledger Wallet Exchange</p>
          <p class="mt-2">
            Welcome to Ledger Wallet Exchange. By accessing, registering, or using our platform, you
            agree to comply with and be bound by these Terms &amp; Conditions (“Terms”). Please read
            them carefully before using our services.
          </p>

          <h4 class="mt-3 font-semibold">1. Eligibility</h4>
          <ul class="list-disc pl-5 space-y-1">
            <li>You must be at least 18 years old (or the legal age in your jurisdiction).</li>
            <li>
              You must comply with all applicable laws and regulations in your country of residence.
            </li>
            <li>
              By creating an account, you confirm that all information provided is accurate and
              truthful.
            </li>
          </ul>

          <h4 class="mt-3 font-semibold">2. Account Registration &amp; Security</h4>
          <ul class="list-disc pl-5 space-y-1">
            <li>
              You are responsible for maintaining the confidentiality of your login credentials.
            </li>
            <li>You agree not to share your account with third parties.</li>
            <li>Ledger Wallet Exchange will never ask for your password or private keys.</li>
          </ul>

          <h4 class="mt-3 font-semibold">3. KYC &amp; AML Compliance</h4>
          <ul class="list-disc pl-5 space-y-1">
            <li>
              Users must complete identity verification (KYC) as required by our Anti-Money
              Laundering (AML) policy.
            </li>
            <li>
              We reserve the right to suspend or terminate accounts that fail verification or raise
              compliance concerns.
            </li>
          </ul>

          <h4 class="mt-3 font-semibold">4. Services Provided</h4>
          <ul class="list-disc pl-5 space-y-1">
            <li>Buying, selling, and exchanging supported digital assets.</li>
            <li>Secure wallet integration powered by Ledger technology.</li>
            <li>Access to trading tools, market data, and APIs.</li>
          </ul>

          <h4 class="mt-3 font-semibold">5. Fees</h4>
          <ul class="list-disc pl-5 space-y-1">
            <li>
              All applicable trading, deposit, and withdrawal fees are outlined in our Fee Structure
              page.
            </li>
            <li>
              Fees may change without prior notice but will always be visible before confirming a
              transaction.
            </li>
          </ul>

          <h4 class="mt-3 font-semibold">6. Risks Disclaimer</h4>
          <ul class="list-disc pl-5 space-y-1">
            <li>Trading cryptocurrencies involves high risk and may result in loss of funds.</li>
            <li>Prices are volatile and not guaranteed by Ledger Wallet Exchange.</li>
            <li>You should not invest more than you can afford to lose.</li>
          </ul>

          <h4 class="mt-3 font-semibold">7. User Obligations</h4>
          <ul class="list-disc pl-5 space-y-1">
            <li>
              You agree not to use our platform for illegal activities (fraud, money laundering,
              terrorist financing, etc.).
            </li>
            <li>You are solely responsible for tax obligations in your jurisdiction.</li>
          </ul>

          <h4 class="mt-3 font-semibold">8. Security &amp; Wallet Responsibility</h4>
          <ul class="list-disc pl-5 space-y-1">
            <li>Assets are secured using Ledger wallet technology and cold storage solutions.</li>
            <li>
              You acknowledge that you remain responsible for safeguarding your wallet recovery
              phrase and private keys.
            </li>
          </ul>

          <h4 class="mt-3 font-semibold">9. Suspension &amp; Termination</h4>
          <ul class="list-disc pl-5 space-y-1">
            <li>
              We may suspend or terminate accounts for violating these Terms, legal requirements, or
              security concerns.
            </li>
            <li>Users will be notified in case of termination, except where prohibited by law.</li>
          </ul>

          <h4 class="mt-3 font-semibold">10. Limitation of Liability</h4>
          <ul class="list-disc pl-5 space-y-1">
            <li>
              Ledger Wallet Exchange is not liable for losses due to market volatility, system
              downtime, or unauthorized access caused by user negligence.
            </li>
            <li>Services are provided “as is” without guarantees of uninterrupted availability.</li>
          </ul>

          <h4 class="mt-3 font-semibold">11. Amendments</h4>
          <ul class="list-disc pl-5 space-y-1">
            <li>We may update these Terms at any time.</li>
            <li>
              Continued use of the platform after updates constitutes acceptance of the revised
              Terms.
            </li>
          </ul>

          <h4 class="mt-3 font-semibold">12. Governing Law</h4>
          <p>
            These Terms are governed by the laws of the State of New York, United States. Any
            disputes shall be resolved through arbitration or courts in that jurisdiction.
          </p>
        </template>

        <!-- Privacy -->
        <template v-else-if="active === 'privacy'">
          <h3 class="font-semibold text-[12px]">Privacy Policy – OneLedger Exchange</h3>

          <div class="mt-2 text-[12px] leading-relaxed text-gray-700 space-y-4">
            <p>
              OneLedger Exchange (“we,” “our,” or “us”) values your privacy and is committed to
              protecting your personal information. This Privacy Policy explains how we collect,
              use, store, and disclose your information when you access and use our platform,
              applications, and related services (collectively, the “Services”).
            </p>

            <!-- 1. Information We Collect -->
            <div>
              <h4 class="font-semibold">1. Information We Collect</h4>
              <p class="mt-1">
                When you use OneLedger Exchange, we may collect the following types of information:
              </p>
              <ol class="list-decimal pl-5 space-y-2 mt-2">
                <li>
                  <span class="font-medium">Personal Identification Information</span>
                  <ul class="list-disc pl-5 space-y-1 mt-1">
                    <li>Name, date of birth, nationality</li>
                    <li>Government-issued identification (passport, ID card, driver’s license)</li>
                    <li>Contact details (email, phone number, address)</li>
                  </ul>
                </li>
                <li>
                  <span class="font-medium">Financial Information</span>
                  <ul class="list-disc pl-5 space-y-1 mt-1">
                    <li>Bank account details, payment methods</li>
                    <li>Transaction history (deposits, withdrawals, trades)</li>
                    <li>Wallet addresses</li>
                  </ul>
                </li>
                <li>
                  <span class="font-medium">Technical and Usage Information</span>
                  <ul class="list-disc pl-5 space-y-1 mt-1">
                    <li>Device information (IP address, browser type, operating system)</li>
                    <li>Login activity and session data</li>
                    <li>Cookies and tracking technologies</li>
                  </ul>
                </li>
                <li>
                  <span class="font-medium">Compliance Information</span>
                  <ul class="list-disc pl-5 space-y-1 mt-1">
                    <li>
                      Know Your Customer (KYC) and Anti-Money Laundering (AML) verification
                      documents
                    </li>
                    <li>Risk and fraud monitoring data</li>
                  </ul>
                </li>
              </ol>
            </div>

            <!-- 2. How We Use Your Information -->
            <div>
              <h4 class="font-semibold">2. How We Use Your Information</h4>
              <ul class="list-disc pl-5 space-y-1 mt-2">
                <li>To provide and operate the Services</li>
                <li>To process transactions and account management</li>
                <li>To comply with applicable laws and regulatory requirements (KYC/AML)</li>
                <li>To detect and prevent fraud, money laundering, or illegal activities</li>
                <li>To improve user experience, security, and functionality of the platform</li>
                <li>To communicate with you regarding updates, promotions, and support</li>
              </ul>
            </div>

            <!-- 3. Sharing of Information -->
            <div>
              <h4 class="font-semibold">3. Sharing of Information</h4>
              <p class="mt-1">
                We do not sell or rent your personal data. However, we may share your information
                with:
              </p>
              <ul class="list-disc pl-5 space-y-1 mt-2">
                <li>Regulatory authorities and law enforcement where required by law</li>
                <li>
                  Third-party service providers (e.g., KYC/AML verification, payment processors,
                  cloud hosting)
                </li>
                <li>Affiliates or partners under strict confidentiality agreements</li>
                <li>Business transfers in case of merger, acquisition, or asset sale</li>
              </ul>
            </div>

            <!-- 4. Data Storage and Security -->
            <div>
              <h4 class="font-semibold">4. Data Storage and Security</h4>
              <ul class="list-disc pl-5 space-y-1 mt-2">
                <li>
                  We use industry-standard security measures such as encryption, firewalls, and
                  access controls.
                </li>
                <li>
                  Your personal data is stored securely and only accessible by authorized personnel.
                </li>
                <li>
                  While we take reasonable steps to protect your data, no system is 100% secure.
                </li>
              </ul>
            </div>

            <!-- 5. Data Retention -->
            <div>
              <h4 class="font-semibold">5. Data Retention</h4>
              <ul class="list-disc pl-5 space-y-1 mt-2">
                <li>Fulfill the purposes outlined in this policy</li>
                <li>Comply with legal and regulatory obligations</li>
                <li>Resolve disputes and enforce agreements</li>
              </ul>
            </div>

            <!-- 6. Your Rights -->
            <div>
              <h4 class="font-semibold">6. Your Rights</h4>
              <p class="mt-1">Depending on your jurisdiction, you may have the right to:</p>
              <ul class="list-disc pl-5 space-y-1 mt-2">
                <li>Access, update, or delete your personal data</li>
                <li>Restrict or object to certain data processing activities</li>
                <li>Request a copy of your personal data in portable format</li>
                <li>Withdraw consent where processing is based on consent</li>
              </ul>
              <p class="mt-2">
                To exercise these rights, please contact us at
                <a href="mailto:oneledgersupp@gmail.com" class="text-teal-600 underline"
                  >oneledgersupp@gmail.com</a
                >.
              </p>
            </div>

            <!-- 7. Cookies -->
            <div>
              <h4 class="font-semibold">7. Cookies and Tracking Technologies</h4>
              <p class="mt-1">
                We use cookies and similar technologies to enhance your experience, analyze usage,
                and provide tailored content. You may disable cookies in your browser settings, but
                this may affect functionality.
              </p>
            </div>

            <!-- 8. International Transfers -->
            <div>
              <h4 class="font-semibold">8. International Data Transfers</h4>
              <p class="mt-1">
                Your information may be transferred and stored outside your country of residence. We
                ensure that such transfers comply with applicable data protection laws.
              </p>
            </div>

            <!-- 9. Third-Party Links -->
            <div>
              <h4 class="font-semibold">9. Third-Party Links</h4>
              <p class="mt-1">
                Our Services may contain links to third-party websites. We are not responsible for
                the privacy practices of those websites.
              </p>
            </div>

            <!-- 10. Changes -->
            <div>
              <h4 class="font-semibold">10. Changes to This Privacy Policy</h4>
              <p class="mt-1">
                We may update this Privacy Policy from time to time. Changes will be posted on our
                website with an updated “Last Updated” date.
              </p>
            </div>
          </div>
        </template>

        <!-- Risk -->
        <template v-else-if="active === 'risk'">
          <p class="font-semibold">Risk Disclosure – Ledger Wallet Exchange</p>
          <p class="mt-2">
            Trading and holding digital assets involve significant risk. Before using Ledger Wallet
            Exchange, please read and understand the following risk disclosures. By accessing or
            using our services, you acknowledge that you fully understand and accept these risks.
          </p>

          <h4 class="mt-3 font-semibold">1. Market Risk</h4>
          <ul class="list-disc pl-5 space-y-1">
            <li>The value of cryptocurrencies is highly volatile and can change rapidly.</li>
            <li>You may experience substantial gains or losses within short periods of time.</li>
            <li>Past performance of digital assets does not guarantee future results.</li>
          </ul>

          <h4 class="mt-3 font-semibold">2. Liquidity Risk</h4>
          <ul class="list-disc pl-5 space-y-1">
            <li>
              Some digital assets may have low trading volumes, making it difficult to buy or sell
              quickly.
            </li>
            <li>You may not always be able to exit a position at your desired price.</li>
          </ul>

          <h4 class="mt-3 font-semibold">3. Technology &amp; Security Risks</h4>
          <ul class="list-disc pl-5 space-y-1">
            <li>Transactions on blockchain networks are irreversible.</li>
            <li>
              While Ledger Wallet Exchange employs industry-leading security measures, no system is
              completely immune to cyber-attacks, technical failures, or operational errors.
            </li>
            <li>
              Losses caused by unauthorized access to your account due to weak passwords, phishing,
              or negligence are your responsibility.
            </li>
          </ul>

          <h4 class="mt-3 font-semibold">4. Regulatory &amp; Legal Risks</h4>
          <ul class="list-disc pl-5 space-y-1">
            <li>
              The legal status of cryptocurrencies varies by jurisdiction and may change over time.
            </li>
            <li>
              New regulations, restrictions, or government actions may impact your ability to use
              our services or trade certain assets.
            </li>
          </ul>

          <h4 class="mt-3 font-semibold">5. Wallet &amp; Custody Risks</h4>
          <ul class="list-disc pl-5 space-y-1">
            <li>
              You are responsible for safeguarding your Ledger wallet, recovery phrase, and private
              keys.
            </li>
            <li>Losing access to your wallet credentials may result in permanent loss of funds.</li>
          </ul>

          <h4 class="mt-3 font-semibold">6. No Financial Advice</h4>
          <ul class="list-disc pl-5 space-y-1">
            <li>Ledger Wallet Exchange does not provide financial, tax, or investment advice.</li>
            <li>All trading decisions are made at your own discretion and risk.</li>
            <li>
              You should consult independent financial or legal professionals before making
              investment decisions.
            </li>
          </ul>

          <h4 class="mt-3 font-semibold">7. Acknowledgment</h4>
          <ul class="list-disc pl-5 space-y-1">
            <li>Trading cryptocurrencies involves substantial risk of loss.</li>
            <li>You are solely responsible for evaluating the risks before trading.</li>
            <li>
              Ledger Wallet Exchange shall not be liable for losses resulting from market
              volatility, system failures, or your own actions.
            </li>
          </ul>
        </template>

        <!-- FAQ -->
        <template v-else-if="active === 'faq'">
          <p class="font-semibold">Frequently Asked Questions (FAQ) – Ledger Wallet Exchange</p>

          <h4 class="mt-3 font-semibold">1. What is Ledger Wallet Exchange?</h4>
          <p>
            - A secure digital asset trading platform integrating Ledger wallet technology with an
            easy-to-use exchange.
          </p>

          <h4 class="mt-3 font-semibold">2. Do I need a Ledger hardware wallet?</h4>
          <p>
            - No. You can trade without it, but we recommend connecting one for maximum security.
          </p>

          <h4 class="mt-3 font-semibold">3. Is my money safe?</h4>
          <p>
            - We use industry-leading security and cold storage. You are still responsible for your
            credentials and recovery phrase.
          </p>

          <h4 class="mt-3 font-semibold">4. How to create an account?</h4>
          <p>- Sign up, verify email, create a password, and complete KYC if required.</p>

          <h4 class="mt-3 font-semibold">5. Why KYC?</h4>
          <p>- For AML compliance and a safer trading environment.</p>

          <h4 class="mt-3 font-semibold">6. Supported cryptocurrencies?</h4>
          <p>- Major assets like BTC, ETH, SOL, etc. See the Markets page for a full list.</p>

          <h4 class="mt-3 font-semibold">7. Fees?</h4>
          <p>- See the Fee Structure page. Fees vary by asset and transaction type.</p>

          <h4 class="mt-3 font-semibold">8. Deposits &amp; withdrawals?</h4>
          <p>
            - Deposit from your wallet; withdraw by entering a correct destination address
            (double-check it).
          </p>

          <h4 class="mt-3 font-semibold">9. Can I lose money?</h4>
          <p>- Yes. Crypto is volatile. Trade responsibly.</p>

          <h4 class="mt-3 font-semibold">10. Financial advice?</h4>
          <p>- We do not provide financial, tax, or investment advice.</p>

          <h4 class="mt-3 font-semibold">11. Contact support?</h4>
          <p>- Live chat, email, or support ticket via Help Center.</p>
        </template>

        <!-- Contact -->
        <template v-else-if="active === 'contact'">
          <p class="font-semibold">Contact Us / Support Center – Ledger Wallet Exchange</p>

          <h4 class="mt-3 font-semibold">📩 Email Support</h4>
          <p>
            For account assistance, technical issues, or general questions, please contact us at:<br /><b
              >oneledgersupp@gmail.com</b
            >
          </p>

          <h4 class="mt-3 font-semibold">💬 Live Chat</h4>
          <p>24/7 live chat support directly on our platform for fast assistance.</p>

          <h4 class="mt-3 font-semibold">🕒 Response Time</h4>
          <ul class="list-disc pl-5 space-y-1">
            <li>Live Chat: Immediate or within a few minutes.</li>
            <li>Email: Usually within 24 hours (business days).</li>
          </ul>
        </template>
      </div>

      <!-- Footer -->
      <div class="px-4 py-3 border-t border-gray-100 flex justify-end">
        <button
          type="button"
          class="px-4 py-2 rounded-lg text-[12px] bg-teal-600 text-white hover:bg-teal-700"
          @click="close"
        >
          Close
        </button>
      </div>
    </div>
  </div>
  <!-- /Modal -->
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

type ModalKey = 'about' | 'terms' | 'privacy' | 'risk' | 'faq' | 'contact'

const open = ref(false)
const active = ref<ModalKey | null>(null)

const title = computed(() => {
  switch (active.value) {
    case 'about':
      return 'About Us'
    case 'terms':
      return 'Terms & Conditions'
    case 'privacy':
      return 'Privacy Policy'
    case 'risk':
      return 'Risk Disclosure'
    case 'faq':
      return 'FAQ'
    case 'contact':
      return 'Contact Us / Support Center'
    default:
      return ''
  }
})

function openModal(key: ModalKey) {
  active.value = key
  open.value = true
  document.documentElement.style.overflow = 'hidden'
}
function close() {
  open.value = false
  active.value = null
  document.documentElement.style.overflow = ''
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && open.value) close()
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>
