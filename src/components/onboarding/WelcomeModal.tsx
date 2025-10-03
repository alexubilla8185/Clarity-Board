import React from 'react';
import { SparklesIcon, ShieldCheckIcon } from '../ui/Icons';

interface WelcomeModalProps {
  isOpen: boolean;
  onStartFresh: () => void;
  onTrySampleData: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onStartFresh, onTrySampleData }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-surface/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface-container rounded-lg shadow-3 w-full max-w-3xl text-center p-12 animate-fade-in-up">
        <img src="/favicon.svg" alt="Clarity Board Logo" className="w-20 h-20 mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-on-surface">
          Welcome to <span className="text-primary">Clarity Board</span>
        </h1>
        <p className="mt-3 text-lg text-on-surface-variant max-w-xl mx-auto">
          Your new privacy-first, offline-ready productivity hub. All your data stays on your device.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left my-10">
          <div className="flex items-start gap-4">
            <div className="bg-primary/20 text-primary p-3 rounded-full mt-1 flex-shrink-0">
                <SparklesIcon className="w-6 h-6" />
            </div>
            <div>
                <h4 className="font-semibold text-on-surface">AI-Powered</h4>
                <p className="text-sm text-on-surface-variant">Use Smart Split to generate projects from your notes, and enhance cards with AI brainstorming, summaries, and improvements.</p>
            </div>
          </div>
           <div className="flex items-start gap-4">
            <div className="bg-primary/20 text-primary p-3 rounded-full mt-1 flex-shrink-0">
                <ShieldCheckIcon className="w-6 h-6" />
            </div>
            <div>
                <h4 className="font-semibold text-on-surface">100% Private</h4>
                <p className="text-sm text-on-surface-variant">Your data is yours alone. It's stored locally on your device with no accounts, no cloud, and no tracking.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button 
            onClick={onTrySampleData}
            className="bg-primary hover:bg-primary/90 text-on-primary font-bold py-3 px-6 rounded-lg transition-all w-full sm:w-auto animate-pulse-cta"
          >
            Try with Sample Data
          </button>
           <button 
            onClick={onStartFresh}
            className="bg-surface-container hover:bg-outline/20 text-on-surface font-medium py-3 px-6 rounded-lg transition-colors w-full sm:w-auto border border-outline/40 hover:border-outline"
          >
            Start with a Blank Workspace
          </button>
        </div>
      </div>
       <style>{`
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
        @keyframes pulse-cta {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgb(var(--color-primary) / 0.4);
          }
          50% {
            transform: scale(1.02);
            box-shadow: 0 0 0 12px rgb(var(--color-primary) / 0);
          }
        }
        .animate-pulse-cta {
          animation: pulse-cta 2.5s infinite;
        }
      `}</style>
    </div>
  );
};

export default WelcomeModal;