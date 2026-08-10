import React from 'react';
import LandingNav from './sections/LandingNav';
import Hero from './sections/Hero';
import TwoTracks from './sections/TwoTracks';
import SubjectCatalog from './sections/SubjectCatalog';
import IslamicShowcase from './sections/IslamicShowcase';
import HowItWorks from './sections/HowItWorks';
import Features from './sections/Features';
import Pricing from './sections/Pricing';
import Faq from './sections/Faq';
import LandingFooter from './sections/LandingFooter';

// ───────────────────────────────────────────────────────────
// PUBLIC LANDING PAGE
//
// Shown to logged-out visitors before AuthScreen. Bilingual
// EN/BM throughout, aimed at students aged 15 and above, and
// built on constants/curriculum.ts so the catalogue advertised
// here is exactly the catalogue delivered in the dashboard.
// ───────────────────────────────────────────────────────────

interface LandingPageProps {
  /** Opens the auth screen in register mode. */
  onGetStarted: () => void;
  /** Opens the auth screen in login mode. */
  onLogIn: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogIn }) => (
  <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
    <LandingNav onGetStarted={onGetStarted} onLogIn={onLogIn} />
    <main>
      <Hero onGetStarted={onGetStarted} />
      <TwoTracks onGetStarted={onGetStarted} />
      <SubjectCatalog />
      <IslamicShowcase onGetStarted={onGetStarted} />
      <HowItWorks />
      <Features />
      <Pricing onGetStarted={onGetStarted} />
      <Faq />
      <LandingFooter onGetStarted={onGetStarted} />
    </main>
  </div>
);

export default LandingPage;
