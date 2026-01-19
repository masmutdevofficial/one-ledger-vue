<template>
  <div class="min-h-screen flex justify-center bg-black text-gray-900">
    <div class="w-full relative max-w-md bg-white min-h-screen flex flex-col">
      <!-- Tombol Login -->
      <div class="absolute top-4 right-6">
        <RouterLink to="/login" class="text-sm font-bold text-gray-700">Login</RouterLink>
      </div>
      <div class="mx-6 mt-12 no-ios-zoom">
        <h2 class="text-lg font-semibold mb-4">Sign Up</h2>

        <!-- Email -->
        <input
          v-model="email"
          type="email"
          placeholder="Email"
          class="w-full border border-gray-300 rounded-md py-2 px-3 mb-3 text-sm placeholder-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400"
        />
        <!-- Password -->
        <input
          v-model="password"
          type="password"
          placeholder="Password (min 6 characters)"
          class="w-full border border-gray-300 rounded-md py-2 px-3 mb-3 text-sm placeholder-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400"
        />
        <!-- Referral -->
        <input
          v-model="referral"
          type="text"
          placeholder="Referral Code (Required)"
          class="w-full border border-gray-300 rounded-md py-2 px-3 mb-4 text-sm placeholder-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400"
        />

        <!-- Agreement -->
        <div class="mb-2 flex items-center gap-2">
          <input
            id="privacy"
            v-model="agreePrivacy"
            type="checkbox"
            class="h-4 w-4 text-gray-800 focus:ring-gray-400 border-gray-300 rounded"
          />
          <label for="privacy" class="text-xs text-gray-700">
            I have read and agree to the
            <button
              type="button"
              class="underline text-black font-semibold"
              @click="openPrivacy"
            >
              Privacy Policy
            </button>.
          </label>
        </div>
        <div class="mb-6 flex items-center gap-2">
          <input
            id="terms"
            v-model="agreeTerms"
            type="checkbox"
            class="h-4 w-4 text-gray-800 focus:ring-gray-400 border-gray-300 rounded"
          />
          <label for="terms" class="text-xs text-gray-700">
            I have read and agree to the
            <button
              type="button"
              class="underline text-black font-semibold"
              @click="openTerms"
            >
              Terms of Use
            </button>.
          </label>
        </div>

        <button
          type="button"
          :disabled="loading"
          @click="handleRegister"
          class="w-full bg-gray-800 text-white font-semibold text-sm rounded-full py-2 hover:bg-gray-700 disabled:opacity-60"
        >
          <span v-if="loading">Registering...</span>
          <span v-else>Create Account</span>
        </button>
      </div>

      <!-- Privacy Policy Modal -->
      <div
        v-if="showPrivacy"
        class="fixed inset-0 z-[60] flex items-center justify-center"
        role="dialog"
        aria-modal="true"
      >
        <div class="absolute inset-0 bg-black/30" @click="closeModals"></div>

        <div class="relative z-10 w-full max-w-md mx-4 rounded-2xl bg-white shadow-xl" @click.stop>
          <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 class="text-sm font-semibold">Privacy Policy</h3>
            <button type="button" class="p-1 rounded hover:bg-gray-100" @click="closeModals" aria-label="Close">
              <Icon icon="tabler:x" class="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div class="max-h-[70dvh] overflow-y-auto px-4 py-3 text-xs leading-relaxed text-gray-700 space-y-4">
            <div>
              <p>
                This Privacy Policy explains how <i>OneLedger Exchange</i> ("OneLedger", "we", "our", or "us")
                collects, uses, stores, discloses, and protects your personal information when you access or use our
                digital asset trading platform, website, mobile applications, and related services (collectively, the
                "Platform").
              </p>
              <p class="mt-2">
                By accessing or using the Platform, you acknowledge that you have read, understood, and agreed to the
                practices described in this Privacy Policy.
              </p>
            </div>

            <div>
              <h4 class="font-semibold">1. Information We Collect</h4>
              <p class="mt-1">We may collect the following categories of information:</p>

              <div class="mt-2">
                <div class="font-semibold">1.1 Personal Information</div>
                <ul class="list-disc pl-5 mt-1 space-y-1">
                  <li>Full name</li>
                  <li>Email address</li>
                  <li>Phone number</li>
                  <li>Date of birth</li>
                  <li>Government-issued identification (for KYC/AML purposes)</li>
                  <li>Residential address</li>
                </ul>
              </div>

              <div class="mt-3">
                <div class="font-semibold">1.2 Account &amp; Transaction Information</div>
                <ul class="list-disc pl-5 mt-1 space-y-1">
                  <li>Account credentials (hashed passwords)</li>
                  <li>Wallet addresses</li>
                  <li>Transaction history</li>
                  <li>Deposit and withdrawal records</li>
                  <li>Trading activity</li>
                </ul>
              </div>

              <div class="mt-3">
                <div class="font-semibold">1.3 Technical &amp; Usage Information</div>
                <ul class="list-disc pl-5 mt-1 space-y-1">
                  <li>IP address</li>
                  <li>Device information</li>
                  <li>Browser type and version</li>
                  <li>Operating system</li>
                  <li>Log files and usage data</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>

              <div class="mt-3">
                <div class="font-semibold">1.4 Communication Data</div>
                <ul class="list-disc pl-5 mt-1 space-y-1">
                  <li>Customer support messages</li>
                  <li>Emails, chats, or other communications with OneLedger</li>
                </ul>
              </div>
            </div>

            <div>
              <h4 class="font-semibold">2. How We Use Your Information</h4>
              <p class="mt-1">We use your information for the following purposes:</p>
              <ul class="list-disc pl-5 mt-1 space-y-1">
                <li>To create and manage your account</li>
                <li>To provide, operate, and improve the Platform</li>
                <li>To process transactions and withdrawals</li>
                <li>To comply with legal, regulatory, KYC, and AML obligations</li>
                <li>To prevent fraud, unauthorized access, and illegal activities</li>
                <li>To communicate with you regarding updates, security notices, or support requests</li>
                <li>To analyze usage and improve user experience</li>
              </ul>
            </div>

            <div>
              <h4 class="font-semibold">3. Legal Basis for Processing</h4>
              <p class="mt-1">Where required by applicable law, we process your personal data based on one or more of the following legal grounds:</p>
              <ul class="list-disc pl-5 mt-1 space-y-1">
                <li>Performance of a contract</li>
                <li>Compliance with legal obligations</li>
                <li>Legitimate business interests</li>
                <li>Your consent, where applicable</li>
              </ul>
            </div>

            <div>
              <h4 class="font-semibold">4. Sharing and Disclosure of Information</h4>
              <p class="mt-1">We do <i>not</i> sell your personal information. We may share your information only in the following circumstances:</p>
              <ul class="list-disc pl-5 mt-1 space-y-1">
                <li><b>Service Providers:</b> Third-party vendors assisting with identity verification, payment processing, cloud hosting, analytics, or security.</li>
                <li><b>Legal Requirements:</b> When required by law, regulation, court order, or government request.</li>
                <li><b>Business Transfers:</b> In connection with a merger, acquisition, restructuring, or sale of assets.</li>
                <li><b>Security &amp; Compliance:</b> To investigate, prevent, or take action regarding illegal activities, fraud, or security threats.</li>
              </ul>
              <p class="mt-2">All third parties are required to maintain appropriate confidentiality and security measures.</p>
            </div>

            <div>
              <h4 class="font-semibold">5. Data Retention</h4>
              <p class="mt-1">We retain personal information only for as long as necessary to:</p>
              <ul class="list-disc pl-5 mt-1 space-y-1">
                <li>Fulfill the purposes outlined in this Privacy Policy</li>
                <li>Comply with legal, regulatory, and accounting requirements</li>
                <li>Resolve disputes and enforce agreements</li>
              </ul>
              <p class="mt-2">When data is no longer required, it will be securely deleted or anonymized.</p>
            </div>

            <div>
              <h4 class="font-semibold">6. Data Security</h4>
              <p class="mt-1">OneLedger implements industry-standard technical and organizational security measures, including:</p>
              <ul class="list-disc pl-5 mt-1 space-y-1">
                <li>Data encryption</li>
                <li>Secure servers and access controls</li>
                <li>Regular security monitoring and audits</li>
              </ul>
              <p class="mt-2">However, no system is completely secure. You acknowledge that transmission of data over the internet involves inherent risks.</p>
            </div>

            <div>
              <h4 class="font-semibold">7. Your Rights</h4>
              <p class="mt-1">Depending on your jurisdiction, you may have the right to:</p>
              <ul class="list-disc pl-5 mt-1 space-y-1">
                <li>Access your personal data</li>
                <li>Correct inaccurate or incomplete information</li>
                <li>Request deletion of your data</li>
                <li>Restrict or object to certain processing activities</li>
                <li>Withdraw consent where processing is based on consent</li>
              </ul>
              <p class="mt-2">Requests can be submitted via our official support channels.</p>
            </div>

            <div>
              <h4 class="font-semibold">8. Cookies &amp; Tracking Technologies</h4>
              <p class="mt-1">We use cookies and similar technologies to:</p>
              <ul class="list-disc pl-5 mt-1 space-y-1">
                <li>Maintain session security</li>
                <li>Analyze platform performance</li>
                <li>Enhance user experience</li>
              </ul>
              <p class="mt-2">You may control cookies through your browser settings; however, disabling cookies may affect Platform functionality.</p>
            </div>

            <div>
              <h4 class="font-semibold">9. International Data Transfers</h4>
              <p class="mt-1">Your information may be transferred to and processed in countries outside your jurisdiction. We take reasonable steps to ensure adequate data protection consistent with this Privacy Policy.</p>
            </div>

            <div>
              <h4 class="font-semibold">10. Third-Party Links</h4>
              <p class="mt-1">The Platform may contain links to third-party websites or services. We are not responsible for the privacy practices or content of such third parties.</p>
            </div>

            <div>
              <h4 class="font-semibold">11. Changes to This Privacy Policy</h4>
              <p class="mt-1">We may update this Privacy Policy from time to time. Any changes will be effective upon posting on the Platform. Continued use of the Platform constitutes acceptance of the revised policy.</p>
            </div>

            <div>
              <h4 class="font-semibold">12. Contact Us</h4>
              <p class="mt-1">If you have questions or concerns regarding this Privacy Policy or our data practices, please contact us through our official support channels on the OneLedger Platform.</p>
            </div>

            <div class="pt-2 border-t border-gray-100">
              <div class="font-semibold"><i>OneLedger Exchange</i></div>
              <div class="mt-1">Trade responsibly. Digital assets involve risk.</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Terms of Use Modal -->
      <div
        v-if="showTerms"
        class="fixed inset-0 z-[60] flex items-center justify-center"
        role="dialog"
        aria-modal="true"
      >
        <div class="absolute inset-0 bg-black/30" @click="closeModals"></div>

        <div class="relative z-10 w-full max-w-md mx-4 rounded-2xl bg-white shadow-xl" @click.stop>
          <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 class="text-sm font-semibold">Terms of Use</h3>
            <button type="button" class="p-1 rounded hover:bg-gray-100" @click="closeModals" aria-label="Close">
              <Icon icon="tabler:x" class="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div class="max-h-[70dvh] overflow-y-auto px-4 py-3 text-xs leading-relaxed text-gray-700 space-y-4">
            <div>
              <p class="mt-2">
                These Terms of Use ("Terms") govern your access to and use of <i>OneLedger Exchange</i> ("OneLedger",
                "we", "our", or "us"), including our website, applications, and digital asset trading services
                (collectively, the "Platform").
              </p>
              <p class="mt-2">
                By accessing or using the Platform, you confirm that you have read, understood, and agreed to be
                legally bound by these Terms. If you do not agree, you must not use the Platform.
              </p>
            </div>

            <div>
              <h4 class="font-semibold">1. Eligibility</h4>
              <p class="mt-1">To use OneLedger Exchange, you must:</p>
              <ul class="list-disc pl-5 mt-1 space-y-1">
                <li>Be at least 18 years old (or the legal age in your jurisdiction)</li>
                <li>Have full legal capacity to enter into a binding agreement</li>
                <li>Not be prohibited from using digital asset services under applicable laws</li>
              </ul>
              <p class="mt-2">By using the Platform, you represent and warrant that you meet all eligibility requirements.</p>
            </div>

            <div>
              <h4 class="font-semibold">2. Account Registration</h4>
              <p class="mt-1">To access certain features, you must create an account. You agree to:</p>
              <ul class="list-disc pl-5 mt-1 space-y-1">
                <li>Provide accurate, complete, and up-to-date information</li>
                <li>Maintain the confidentiality of your login credentials</li>
                <li>Be fully responsible for all activities conducted under your account</li>
              </ul>
              <p class="mt-2">OneLedger reserves the right to suspend or terminate accounts that provide false or misleading information.</p>
            </div>

            <div>
              <h4 class="font-semibold">3. KYC &amp; AML Compliance</h4>
              <p class="mt-1">OneLedger complies with applicable <i>Know Your Customer (KYC)</i> and <i>Anti-Money Laundering (AML)</i> regulations. You agree to:</p>
              <ul class="list-disc pl-5 mt-1 space-y-1">
                <li>Complete identity verification when requested</li>
                <li>Provide valid and lawful documentation</li>
              </ul>
              <p class="mt-2">Failure to comply may result in account restriction, suspension, or termination.</p>
            </div>

            <div>
              <h4 class="font-semibold">4. Platform Services</h4>
              <p class="mt-1">OneLedger provides a digital asset trading platform that may include:</p>
              <ul class="list-disc pl-5 mt-1 space-y-1">
                <li>Spot trading and related services</li>
                <li>Digital asset deposits and withdrawals</li>
                <li>Account management and market data</li>
              </ul>
              <p class="mt-2">All services are provided on an <i>"as-is"</i> and <i>"as-available"</i> basis.</p>
            </div>

            <div>
              <h4 class="font-semibold">5. Trading Risks</h4>
              <p class="mt-1">You acknowledge and agree that:</p>
              <ul class="list-disc pl-5 mt-1 space-y-1">
                <li>Digital asset prices are highly volatile</li>
                <li>Trading cryptocurrencies involves substantial risk of loss</li>
                <li>Past performance does not guarantee future results</li>
              </ul>
              <p class="mt-2">You are solely responsible for your trading decisions and any resulting losses.</p>
            </div>

            <div>
              <h4 class="font-semibold">6. Fees</h4>
              <p class="mt-1">You agree to pay all applicable fees, commissions, or charges associated with the use of the Platform. Fee structures may be updated at any time and will be disclosed on the Platform.</p>
            </div>

            <div>
              <h4 class="font-semibold">7. Prohibited Activities</h4>
              <p class="mt-1">You agree <i>not</i> to:</p>
              <ul class="list-disc pl-5 mt-1 space-y-1">
                <li>Use the Platform for illegal, fraudulent, or unauthorized purposes</li>
                <li>Engage in market manipulation, wash trading, or abusive trading practices</li>
                <li>Attempt to gain unauthorized access to the Platform or other users’ accounts</li>
                <li>Upload malware, viruses, or harmful code</li>
                <li>Circumvent security or compliance mechanisms</li>
              </ul>
              <p class="mt-2">Violation may result in immediate account termination and legal action.</p>
            </div>

            <div>
              <h4 class="font-semibold">8. Account Suspension &amp; Termination</h4>
              <p class="mt-1">OneLedger reserves the right to suspend, restrict, or terminate your account at any time if:</p>
              <ul class="list-disc pl-5 mt-1 space-y-1">
                <li>You violate these Terms</li>
                <li>You breach applicable laws or regulations</li>
                <li>Suspicious, fraudulent, or harmful activity is detected</li>
              </ul>
              <p class="mt-2">OneLedger shall not be liable for any losses resulting from such actions.</p>
            </div>

            <div>
              <h4 class="font-semibold">9. Withdrawals &amp; Deposits</h4>
              <ul class="list-disc pl-5 mt-1 space-y-1">
                <li>Withdrawals are subject to security checks and compliance reviews</li>
                <li>Processing times may vary due to network conditions or regulatory requirements</li>
                <li>OneLedger is not responsible for blockchain delays or third-party failures</li>
              </ul>
              <p class="mt-2">You are responsible for ensuring the accuracy of wallet addresses.</p>
            </div>

            <div>
              <h4 class="font-semibold">10. Intellectual Property</h4>
              <p class="mt-1">All content, trademarks, logos, software, and materials on the Platform are the exclusive property of OneLedger or its licensors. Unauthorized use is strictly prohibited.</p>
            </div>

            <div>
              <h4 class="font-semibold">11. Limitation of Liability</h4>
              <p class="mt-1">To the maximum extent permitted by law, OneLedger shall not be liable for:</p>
              <ul class="list-disc pl-5 mt-1 space-y-1">
                <li>Any indirect, incidental, or consequential damages</li>
                <li>Loss of profits, data, or digital assets</li>
                <li>Errors, interruptions, or security breaches beyond reasonable control</li>
              </ul>
              <p class="mt-2">Your sole remedy is to discontinue use of the Platform.</p>
            </div>

            <div>
              <h4 class="font-semibold">12. Indemnification</h4>
              <p class="mt-1">You agree to indemnify and hold harmless OneLedger, its affiliates, officers, and employees from any claims, damages, losses, or expenses arising from:</p>
              <ul class="list-disc pl-5 mt-1 space-y-1">
                <li>Your use of the Platform</li>
                <li>Your violation of these Terms</li>
                <li>Your breach of any applicable law or regulation</li>
              </ul>
            </div>

            <div>
              <h4 class="font-semibold">13. Governing Law</h4>
              <p class="mt-1">These Terms shall be governed by and construed in accordance with the laws of the applicable jurisdiction determined by OneLedger, without regard to conflict of law principles.</p>
            </div>

            <div>
              <h4 class="font-semibold">14. Amendments</h4>
              <p class="mt-1">OneLedger may update these Terms at any time. Changes become effective upon publication on the Platform. Continued use constitutes acceptance of the updated Terms.</p>
            </div>

            <div>
              <h4 class="font-semibold">15. Contact Information</h4>
              <p class="mt-1">For questions regarding these Terms, please contact OneLedger through official support channels available on the Platform.</p>
            </div>

            <div class="pt-2 border-t border-gray-100">
              <div class="font-semibold"><i>OneLedger Exchange</i></div>
              <div class="mt-1">Use at your own risk. Digital assets are speculative and involve high risk.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useApiAlertStore } from '@/stores/apiAlert'
import { Icon } from '@iconify/vue'

const email = ref('')
const password = ref('')
const referral = ref('')
const agreePrivacy = ref(false)
const agreeTerms = ref(false)
const loading = ref(false)

const showPrivacy = ref(false)
const showTerms = ref(false)

function closeModals() {
  showPrivacy.value = false
  showTerms.value = false
}
function openPrivacy() {
  showTerms.value = false
  showPrivacy.value = true
}
function openTerms() {
  showPrivacy.value = false
  showTerms.value = true
}

const modal = useApiAlertStore()
const router = useRouter()

const handleRegister = async () => {
  if (!password.value || password.value.length < 6) {
    modal.open('Failed', 'Password must be at least 6 characters.')
    return
  }
  if (!email.value) {
    modal.open('Failed', 'Email is required.')
    return
  }

  const referralNormalized = referral.value.trim().toUpperCase()
  if (!referralNormalized) {
    modal.open('Failed', 'Referral code is required.')
    return
  }

  if (!agreePrivacy.value || !agreeTerms.value) {
    modal.open('Failed', 'You must agree to Privacy Policy and Terms.')
    return
  }

  loading.value = true
  try {
    const res = await fetch('https://tech.oneled.io/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value,
        referral: referralNormalized,
      }),
    })

    const data = await res.json()

    if (!res.ok || data.status !== 'success') {
      let msg = data.message || 'Registration failed.'
      if (data.errors_log) {
        msg += ' ' + Object.values(data.errors_log).join(' ')
      }
      modal.open('Failed', msg)
      return
    }

    // ✅ Simpan user_id ke localStorage
    localStorage.setItem('idReg', data.user_id)

    modal.open('Success', data.message || 'Registration successful.')
    setTimeout(() => {
      modal.close()
      router.push('/verification')
    }, 1500)
  } catch {
    modal.open('Failed', 'Network error. Please try again.')
  } finally {
    loading.value = false
  }
}
</script>
