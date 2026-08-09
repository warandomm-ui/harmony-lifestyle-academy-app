
import React from 'react';
import MoneyMattersSection from '../sections/MoneyMattersSection';
import BillingSection from '../sections/BillingSection';
import StoreSection from '../sections/StoreSection';
import DealsHubSection from '../sections/DealsHubSection';
import RecommendedProductsSection from '../sections/RecommendedProductsSection';
import type { PaymentMethod, Product, SubscriptionPlan, Transaction } from '../../../types';

interface FinancialPageProps {
  onAddToCart: (product: Product) => void;
  currentPlan: SubscriptionPlan;
  paymentMethods: PaymentMethod[];
  transactions: Transaction[];
  onAddPaymentMethod: () => void;
  onRemovePaymentMethod: (id: string) => void;
  onChangePlan: () => void;
}

const FinancialPage: React.FC<FinancialPageProps> = (props) => {
  return (
    <div className="space-y-6">
      {/* Deals & Partnerships Hub */}
      <DealsHubSection />

      <MoneyMattersSection />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BillingSection 
          currentPlan={props.currentPlan}
          paymentMethods={props.paymentMethods}
          transactions={props.transactions}
          onAddPaymentMethod={props.onAddPaymentMethod}
          onRemovePaymentMethod={props.onRemovePaymentMethod}
          onChangePlan={props.onChangePlan}
        />
        {/* Placeholder for future financial tools */}
        <div className="bento-card h-full flex flex-col justify-center items-center text-center">
            <h3 className="text-xl font-bold text-[var(--foreground)]">Investment & Savings Tools</h3>
            <p className="text-[var(--muted)] mt-2">Coming soon: Track your savings goals, learn about investing in the Malaysian market, and more!</p>
        </div>
      </div>
      <StoreSection onAddToCart={props.onAddToCart} />
      <RecommendedProductsSection />
    </div>
  );
};

export default FinancialPage;
