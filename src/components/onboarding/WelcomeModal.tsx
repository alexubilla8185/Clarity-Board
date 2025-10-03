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
    <div className="fixed inset-0 bg-surface z-50 flex items-center justify-center p-4">
      <div className="bg-surface-container rounded-lg shadow-3 w-full max-w-2xl text-center p-8 animate-fade-in-up">
        <img src="/favicon.svg" alt="Clarity Board Logo" className="w-16 h-16 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-on-surface">
          Welcome to <span className="text-primary">Clarity Board</span>
        </h1>
        <p className="mt-2 text-on-surface-variant max-w-md mx-auto">
          Your new privacy-first, offline-ready productivity hub. All your data stays on your device.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left my-8">
          <div className="flex items-start gap-4">
            <div className="bg-primary/20 text-primary p-3 rounded-full mt-1 flex-shrink-0">
                <SparklesIcon className="w-6 h-6" />
            </div>
            <div>
                <h4 className="font-semibold text-on-surface">AI-Powered</h4>
                <p className="text-sm text-on-surface-variant">Automatically structure notes into projects with Smart Split.</p>
            </div>
          </div>
           <div className="flex items-start gap-4">
            <div className="bg-primary/20 text-primary p-3 rounded-full mt-1 flex-shrink-0">
                <ShieldCheckIcon className="w-6 h-6" />
            </div>
            <div>
                <h4 className="font-semibold text-on-surface">100% Private</h4>
                <p className="text-sm text-on-surface-variant">No accounts, no cloud, no tracking. Your data is yours alone.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button 
            onClick={onTrySampleData}
            className="bg-primary hover:bg-primary/90 text-on-primary font-bold py-3 px-6 rounded-lg transition-colors w-full sm:w-auto"
          >
            Try with Sample Data
          </button>
           <button 
            onClick={onStartFresh}
            className="bg-surface-container hover:bg-outline/20 text-on-surface font-medium py-3 px-6 rounded-lg transition-colors w-full sm:w-auto"
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
      `}</style>
    </div>
  );
};

export default WelcomeModal;