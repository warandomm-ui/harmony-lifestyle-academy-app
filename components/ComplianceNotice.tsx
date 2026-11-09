import { useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';
import { COMPLIANCE_EVENT, type PublicComplianceInfo } from '../services/aiProxyService';

/**
 * Surfaces the compliance agent's decisions to the learner, whichever
 * feature made the AI call. Feature code may still show its own fallback;
 * this guarantees the learner learns *why* (and, for self-harm blocks,
 * sees the helplines included in the message).
 */
const ComplianceNotice: React.FC = () => {
  const { addToast } = useToast();

  useEffect(() => {
    const onCompliance = (e: Event) => {
      const info = (e as CustomEvent<PublicComplianceInfo>).detail;
      if (!info?.message) return;
      const ref = info.reviewId ? ` (Rujukan semakan: ${info.reviewId.slice(0, 8)})` : '';
      if (info.verdict === 'block') addToast(info.message, 'error');
      else if (info.verdict === 'hold') addToast(info.message + ref, 'info');
      else addToast(info.message, 'info');
    };
    window.addEventListener(COMPLIANCE_EVENT, onCompliance);
    return () => window.removeEventListener(COMPLIANCE_EVENT, onCompliance);
  }, [addToast]);

  return null;
};

export default ComplianceNotice;
