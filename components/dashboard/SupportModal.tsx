import React from 'react';
import { XIcon, LifebuoyIcon } from './Icons';
import { SUPPORT_HOTLINES } from '../../constants';

interface SupportModalProps {
  onClose: () => void;
}

const SupportModal: React.FC<SupportModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in-fast">
      <div className="bg-[var(--card)] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <header className="flex items-center justify-between p-4 border-b border-[var(--border)] flex-shrink-0">
          <h2 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
            <LifebuoyIcon className="h-6 w-6 text-red-500" />
            Need to Talk? Help is Available
          </h2>
          <button onClick={onClose} className="p-1 rounded-full text-[var(--muted)] hover:bg-[var(--secondary)]">
            <XIcon className="h-5 w-5" />
          </button>
        </header>

        <div className="overflow-y-auto p-6 space-y-6">
          <div className="bg-red-500/10 text-red-800 dark:text-red-200 p-4 rounded-lg border border-red-500/20">
            <p className="font-bold">For Immediate Danger, Please Call Emergency Services: 999</p>
            <p className="text-sm mt-1">
              If you or someone you know is in immediate danger, please do not hesitate to contact emergency services. The resources below are for support and counseling.
            </p>
          </div>

          <div>
            <p className="text-[var(--muted)] mb-4">
              It's okay to not be okay. Reaching out is a sign of strength. Here are some confidential and free resources available in Malaysia if you need someone to talk to.
            </p>

            <div className="space-y-4">
              {SUPPORT_HOTLINES.map(hotline => (
                <div key={hotline.name} className="bg-[var(--background)] p-4 rounded-lg border border-[var(--border)]">
                  <h3 className="font-bold text-[var(--foreground)]">{hotline.name}</h3>
                  <p className="text-sm text-[var(--muted)] mt-1">{hotline.description}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
                    <a href={`tel:${hotline.phone}`} className="font-bold text-lg text-[var(--primary)] hover:underline">
                      {hotline.phoneDisplay}
                    </a>
                    <div className="text-sm">
                      <span className="font-semibold text-[var(--foreground)]">Hours: </span>
                      <span className="text-[var(--muted)]">{hotline.hours}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <footer className="p-4 border-t border-[var(--border)] flex-shrink-0 flex justify-end">
            <button
                onClick={onClose}
                className="bg-[var(--primary)] text-white font-bold py-2 px-6 rounded-full hover:opacity-90 transition"
            >
                Close
            </button>
        </footer>
      </div>
    </div>
  );
};

export default SupportModal;