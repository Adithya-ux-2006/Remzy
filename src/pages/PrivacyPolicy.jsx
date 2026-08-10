import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <h1 className="text-3xl font-bold text-ink mb-2">Privacy Policy</h1>
      <p className="text-sm text-ink-muted mb-8">Last updated: August 2026</p>

      <div className="prose prose-sm max-w-none space-y-6 text-ink leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-ink mb-3">1. What We Collect</h2>
          <p>Remzy collects only the information you choose to provide:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Account data:</strong> Name and email address (when you create an account)</li>
            <li><strong>Health profile:</strong> Age range, gender, known allergies, and medical conditions (optional, entered during onboarding)</li>
            <li><strong>Search queries:</strong> Symptoms you search for, used to provide results</li>
            <li><strong>Usage data:</strong> Pages visited, remedies viewed, favorites saved</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink mb-3">2. How We Use Your Data</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>To personalize remedy recommendations based on your health profile</li>
            <li>To filter out remedies that may conflict with your allergies or conditions</li>
            <li>To improve search accuracy and remedy relevance</li>
            <li>To display your saved favorites and schedules</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink mb-3">3. Third-Party Processing</h2>
          <p>Your search queries may be processed through Google Gemini (an AI service) to improve search accuracy for complex or ambiguous symptom descriptions. This processing is anonymized and not linked to your personal identity. We do not sell your data to any third party.</p>
          <p className="mt-2">We use the following services that may process data on our behalf:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Supabase:</strong> Database hosting and authentication</li>
            <li><strong>Netlify:</strong> Website hosting and serverless functions</li>
            <li><strong>Google:</strong> Optional account authentication when you choose Continue with Google</li>
            <li><strong>Google Gemini:</strong> AI-powered search interpretation (server-side only)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink mb-3">4. Data Storage &amp; Security</h2>
          <p>Your data is stored in encrypted databases hosted by Supabase. We use industry-standard security measures including HTTPS encryption, authentication tokens, and access controls. Guest data (non-logged-in users) is stored only in your browser&apos;s local storage and is deleted when you clear your browser data.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink mb-3">5. Data Retention</h2>
          <p>We retain your account data and health profile for as long as your account is active. Search queries are retained for up to 12 months for analytics purposes. You can request deletion of your data at any time.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink mb-3">6. Your Rights</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Access:</strong> You can view your stored data in your Profile page</li>
            <li><strong>Deletion:</strong> You can delete your account and all associated data from your Profile page</li>
            <li><strong>Export:</strong> You can request a copy of your data by contacting us</li>
            <li><strong>Opt-out:</strong> You can use Remzy without creating an account — all data stays in your browser</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink mb-3">7. Children&apos;s Privacy (COPPA)</h2>
          <p>Remzy is not intended for children under 13. We do not knowingly collect personal information from children under 13. If you are under 13, please do not create an account or provide personal information. If we become aware that we have collected data from a child under 13, we will delete it promptly.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink mb-3">8. Cookies &amp; Analytics</h2>
          <p>Remzy uses essential cookies for authentication and functionality. We may use privacy-respecting analytics to understand how the app is used. We do not use advertising trackers or sell browsing data.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink mb-3">9. Changes to This Policy</h2>
          <p>We may update this policy from time to time. Changes will be posted on this page with an updated date. Continued use of Remzy after changes constitutes acceptance of the updated policy.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink mb-3">10. Contact</h2>
          <p>For questions about this privacy policy or your data, please contact us through the app or open an issue on our GitHub repository.</p>
        </section>
      </div>

      <div className="mt-12 pt-6 border-t border-ink/5 text-center">
        <Link to="/" className="text-sm text-primary hover:underline">Return to Home</Link>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
