import React from 'react';
import { XIcon, CheckCircleIcon, SparklesIcon } from './Icons';
import type { SubscriptionPlan } from '../../types';

interface PlanSelectionModalProps {
  currentPlanId: string;
  plans: SubscriptionPlan[];
  onClose: () => void;
  onSelectPlan: (plan: SubscriptionPlan) => void;
}

const PlanSelectionModal: React.FC<PlanSelectionModalProps> = ({ currentPlanId, plans, onClose, onSelectPlan }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in-fast">
      <div className="bg-[var(--card)] rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <header className="flex items-center justify-between p-4 border-b border-[var(--border)] flex-shrink-0">
          <h2 className="text-xl font-bold text-[var(--foreground)]">Choose Your Plan</h2>
          <button onClick={onClose} className="p-1 rounded-full text-[var(--muted)] hover:bg-[var(--secondary)]">
            <XIcon className="h-5 w-5" />
          </button>
        </header>
        <div className="overflow-y-auto p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map(plan => (
              <div
                key={plan.id}
                className={`bento-card p-6 flex flex-col relative transition-all duration-300
                  ${plan.isRecommended ? 'border-[var(--primary)] ring-2 ring-[var(--primary)]' : ''}
                  ${currentPlanId === plan.id ? 'bg-[var(--secondary)]/50' : ''}
                `}
              >
                {plan.isRecommended && (
                  <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-[var(--primary)] text-white text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1">
                    <SparklesIcon className="h-4 w-4" />
                    RECOMMENDED
                  </div>
                )}
                <h3 className="text-2xl font-bold text-center text-[var(--foreground)]">{plan.name}</h3>
                <p className="text-center my-4">
                  <span className="text-4xl font-extrabold text-[var(--foreground)]">
                    {plan.price > 0 ? `RM${plan.price}` : 'Free'}
                  </span>
                  {plan.price > 0 && <span className="text-sm text-[var(--muted)]"> / {plan.billingCycle}</span>}
                </p>
                <ul className="space-y-3 text-sm flex-grow">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-[var(--muted-foreground)]">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => onSelectPlan(plan)}
                  disabled={currentPlanId === plan.id}
                  className={`w-full mt-8 font-bold py-3 px-4 rounded-full transition-all duration-200
                    ${currentPlanId === plan.id
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600'
                      : 'bg-[var(--primary)] text-white hover:opacity-90 transform hover:scale-105'
                    }
                  `}
                >
                  {currentPlanId === plan.id ? 'Current Plan' : 'Select Plan'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanSelectionModal;