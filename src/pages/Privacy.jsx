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

export default function Privacy() {
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
        <h1 className="font-display text-5xl text-fg leading-none mb-2">Privacy Policy</h1>
        <p className="font-body text-sm text-fg-muted">Last updated: {LAST_UPDATED}</p>
      </motion.div>

      <Section title="Who we are">
        <p>
          followthehole.com is an independent project that lets you dive through Wikipedia rabbit holes.
          It is operated by an individual developer, not a company.
          Questions can be sent to{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#E8432D] underline">{CONTACT_EMAIL}</a>.
        </p>
      </Section>

      <Section title="What we collect">
        <p>When you create an account we collect:</p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li><strong>Email address</strong> — used to identify your account and for password resets.</li>
          <li><strong>Password</strong> — stored as a secure hash; we never see it in plain text.</li>
          <li><strong>Display name</strong> — the name you choose to appear on the leaderboard.</li>
        </ul>
        <p className="mt-3">
          We also store gameplay statistics linked to your account: total dives, daily wins, and
          daily streak. These power the leaderboard.
        </p>
        <p>
          If you play without an account, no personal data leaves your device — everything is
          stored in your browser's localStorage and never sent to our servers.
        </p>
      </Section>

      <Section title="How we use it">
        <ul className="list-disc list-inside space-y-1">
          <li>To authenticate you when you sign in.</li>
          <li>To display your stats on the public leaderboard.</li>
          <li>We do not use your data for advertising, profiling, or sell it to third parties.</li>
          <li>We do not send marketing emails.</li>
        </ul>
      </Section>

      <Section title="Where it's stored">
        <p>
          Accounts and game stats are stored in{' '}
          <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-[#E8432D] underline">Supabase</a>
          , a hosted database platform. Data is stored in the US West (Oregon) region.
          Supabase is SOC 2 compliant, covers standard contractual clauses for GDPR, and acts as a data processor on our behalf.
        </p>
      </Section>

      <Section title="How long we keep it">
        <p>
          Your account data is kept for as long as your account exists.
          You can request deletion at any time (see below) and we will remove your account and
          all associated data within 120 days.
        </p>
      </Section>

      <Section title="Your rights">
        <p>
          This service is operated from Canada and complies with{' '}
          <strong>PIPEDA</strong> (Canada's federal privacy law). EU and UK users are also covered
          by <strong>GDPR</strong>; Quebec users by <strong>Law 25</strong>. Regardless of where
          you are, you have the right to:
        </p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li><strong>Access</strong> — request a copy of the data we hold about you.</li>
          <li><strong>Correction</strong> — ask us to fix inaccurate data.</li>
          <li><strong>Erasure</strong> — ask us to delete your account and all associated data.</li>
          <li><strong>Portability</strong> — receive your data in a machine-readable format.</li>
          <li><strong>Objection</strong> — object to processing of your data.</li>
        </ul>
        <p className="mt-3">
          To exercise any of these rights, email{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#E8432D] underline">{CONTACT_EMAIL}</a>{' '}
          with the subject line <em>"Privacy request"</em>. We will respond within 30 days.
        </p>
      </Section>

      <Section title="Cookies & local storage">
        <p>
          We do not use tracking cookies. We use your browser's <strong>localStorage</strong> to
          remember your theme preference, language choice, dive history, and daily win state.
          This data never leaves your device unless you create an account.
        </p>
      </Section>

      <Section title="Children">
        <p>
          This service is not directed at children under 13. We do not knowingly collect data
          from anyone under 13. If you believe a child has created an account, please contact us
          and we will delete it promptly.
        </p>
      </Section>

      <Section title="Changes to this policy">
        <p>
          If we make material changes we will update the date at the top of this page.
          Continued use of the service after changes constitutes acceptance.
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
