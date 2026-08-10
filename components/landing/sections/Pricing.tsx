import React from 'react';
import { SectionHeading } from '../Bilingual';
import { SUBSCRIPTION_PLANS } from '../../../constants';

// Plans come from constants.ts (SUBSCRIPTION_PLANS) — the same list the
// in-app PlanSelectionModal uses, so marketed prices cannot drift.

const Pricing: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => (
  <section id="pricing" className="py-20 border-t border-[var(--border)] scroll-mt-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <SectionHeading
        en="Simple pricing"
        bm="Harga yang mudah"
        subEn="Start free. Upgrade only if you want unlimited access and mentorship."
        subBm="Mula percuma. Naik taraf hanya jika mahukan akses tanpa had dan bimbingan."
      />

      <div className="mt-12 grid md:grid-cols-3 gap-5 items-start">
        {SUBSCRIPTION_PLANS.map(plan => {
          const featured = plan.isRecommended;
          return (
            <div
              key={plan.id}
              className="rounded-3xl border p-8 flex flex-col h-full"
              style={
                featured
                  ? { borderColor: 'var(--primary)', background: 'var(--card)', boxShadow: '0 0 40px rgba(109,40,217,0.10)' }
                  : { borderColor: 'var(--border)', background: 'var(--card)' }
              }
            >
              {featured && (
                <span
                  className="self-start mb-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white"
                  style={{ background: 'var(--primary)' }}
                >
                  Most popular · Paling popular
                </span>
              )}

              <h3 className="font-playfair text-2xl font-bold text-[var(--foreground)]">{plan.name}</h3>

              <p className="mt-4 flex items-baseline gap-1">
                <span className="font-playfair text-4xl font-bold text-[var(--foreground)]">
                  {plan.price === 0 ? 'Free' : `RM${plan.price}`}
                </span>
                {plan.price > 0 && (
                  <span className="text-sm text-[var(--muted)]">/{plan.billingCycle}</span>
                )}
              </p>
              {plan.price === 0 && (
                <p lang="ms" className="text-sm text-[var(--muted)]">
                  Percuma selamanya
                </p>
              )}

              <ul className="mt-6 space-y-3 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex gap-2.5 text-sm text-[var(--foreground)] opacity-85">
                    <svg
                      className="h-4 w-4 shrink-0 mt-0.5"
                      style={{ color: 'var(--primary)' }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={onGetStarted}
                className="mt-8 w-full px-6 py-3 rounded-full font-semibold transition-opacity hover:opacity-90"
                style={
                  featured
                    ? { background: 'var(--primary)', color: '#fff' }
                    : { background: 'transparent', color: 'var(--foreground)', border: '1px solid var(--border)' }
                }
              >
                {plan.price === 0 ? 'Start free · Mula percuma' : `Choose ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>

      <p className="mt-8 text-center text-xs text-[var(--muted)]">
        Prices in Malaysian Ringgit. Cancel any time.
        <span lang="ms" className="block mt-1">
          Harga dalam Ringgit Malaysia. Batal bila-bila masa.
        </span>
      </p>
    </div>
  </section>
);

export default Pricing;
