import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const CONTACT_EMAIL = 'contact@followthehole.com';
const LAST_UPDATED  = 'May 29, 2026';

function Section({ title, children }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mb-8"
    >
      <h2 className="font-display text-2xl text-fg mb-3">{title}</h2>
      <div className="font-body text-fg-muted leading-relaxed space-y-3">{children}</div>
    </motion.section>
  );
}

export default function Terms() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 pb-24 md:pb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <Link to="/" className="font-body text-sm text-fg-muted hover:text-fg transition-colors mb-6 inline-block">
          ← Back
        </Link>
        <h1 className="font-display text-5xl text-fg leading-none mb-2">Terms of Service</h1>
        <p className="font-body text-sm text-fg-muted">Last updated: {LAST_UPDATED}</p>
      </motion.div>

      <Section title="Who we are">
        <p>
          followthehole.com is an independent project operated by an individual developer.
          By using this site you agree to these terms.
          Questions can be sent to{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#E8432D] underline">{CONTACT_EMAIL}</a>.
        </p>
      </Section>

      <Section title="Using the service">
        <p>You agree not to:</p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>Create accounts by automated means or under false pretences.</li>
          <li>Attempt to disrupt, overload, or gain unauthorised access to the service.</li>
          <li>Use the service for any unlawful purpose.</li>
          <li>Choose a display name that is offensive, impersonates someone else, or violates any law.</li>
        </ul>
        <p className="mt-3">
          You must be at least 13 years old to create an account. By signing up you confirm that you are.
        </p>
      </Section>

      <Section title="Your account">
        <p>
          You are responsible for keeping your password secure and for all activity that occurs
          under your account. If you suspect unauthorised access, contact us immediately.
        </p>
        <p>
          We reserve the right to suspend or delete accounts that violate these terms, including
          display names we deem offensive, without prior notice.
        </p>
      </Section>

      <Section title="The leaderboard">
        <p>
          Your display name and gameplay statistics (total dives, daily wins) are visible to all
          visitors of the site. By creating an account you consent to this.
          You can request deletion of your account and all associated data at any time —
          see our <Link to="/privacy" className="text-[#E8432D] underline">Privacy Policy</Link>.
        </p>
      </Section>

      <Section title="Wikipedia content">
        <p>
          Article text and summaries displayed on this site are sourced from Wikipedia via its
          public REST API and are published under the{' '}
          <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer" className="text-[#E8432D] underline">
            Creative Commons Attribution-ShareAlike 4.0
          </a>{' '}
          licence. followthehole.com is not affiliated with or endorsed by the Wikimedia Foundation.
        </p>
      </Section>

      <Section title="Service availability">
        <p>
          The service is provided free of charge and <strong>as is</strong>, without any guarantee
          of availability, accuracy, or fitness for a particular purpose. We may change, suspend,
          or discontinue any part of the service at any time without notice.
        </p>
      </Section>

      <Section title="Limitation of liability">
        <p>
          To the fullest extent permitted by law, followthehole.com and its operator shall not be
          liable for any indirect, incidental, or consequential damages arising from your use of
          the service, including loss of data. Our total liability for any claim is limited to
          the amount you paid us in the past twelve months — which, for a free service, is zero.
        </p>
      </Section>

      <Section title="Governing law">
        <p>
          These terms are governed by the laws of Canada. Any disputes shall be subject to the
          exclusive jurisdiction of the courts of Canada, unless mandatory consumer protection
          laws in your country of residence require otherwise.
        </p>
      </Section>

      <Section title="Changes to these terms">
        <p>
          We may update these terms from time to time. We will update the date at the top of this
          page when we do. Continued use of the service after changes constitutes acceptance.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#E8432D] underline">{CONTACT_EMAIL}</a>
        </p>
      </Section>
    </div>
  );
}
