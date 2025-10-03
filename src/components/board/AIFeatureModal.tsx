import * as React from 'react';
import { Card, AIOption } from '../../types';
import { enhanceText } from '../../services/geminiService';
import Modal from '../ui/Modal';
import { SparklesIcon } from '../ui/Icons';

interface AIFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: Card | null;
  onUpdateCard: (updatedCard: Card) => void;
}

const loadingMessages = [
    "Brewing up some ideas...",
    "Consulting the digital thesaurus...",
    "Asking the AI for a second opinion...",
    "Just a moment, polishing the prose...",
    "Reticulating splines...",
    "Generating creative sparks..."
];

const AIFeatureModal: React.FC<AIFeatureModalProps> = ({ isOpen, onClose, card, onUpdateCard }) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [aiResult, setAiResult] = React.useState('');
  const [error, setError] = React.useState('');
  const [loadingMessage, setLoadingMessage] = React.useState(loadingMessages[0]);
  
  React.useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingMessage(prev => loadingMessages[(loadingMessages.indexOf(prev) + 1) % loadingMessages.length]);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  const handleAiAction = async (option: AIOption) => {
    if (!card) return;
    setIsLoading(true);
    setError('');
    setAiResult('');
    setLoadingMessage(loadingMessages[0]);
    try {
      const textToEnhance = card.description || card.title;
      const result = await enhanceText(option, textToEnhance);
      setAiResult(result);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyResult = () => {
    if (card && aiResult) {
      onUpdateCard({ ...card, description: aiResult });
      onClose();
    }
  };
  
  // Reset state when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setIsLoading(false);
      setAiResult('');
      setError('');
    }
  }, [isOpen])

  if (!card) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Enhance Card: "${card.title}"`}>
      <div className="flex flex-col space-y-4 max-h-[70vh]">
        <div>
          <h3 className="text-lg font-medium text-on-surface-variant mb-2">Original Text</h3>
          <p className="bg-surface-container p-3 rounded-md text-on-surface whitespace-pre-wrap max-h-28 overflow-y-auto">{card.description || card.title}</p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center border-t border-b border-outline py-4 flex-shrink-0">
          <button onClick={() => handleAiAction(AIOption.BRAINSTORM)} disabled={isLoading} className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 font-medium py-2 px-4 rounded-sm transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            <SparklesIcon className="w-5 h-5" /> Brainstorm
          </button>
          <button onClick={() => handleAiAction(AIOption.SUMMARIZE)} disabled={isLoading} className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 font-medium py-2 px-4 rounded-sm transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            <SparklesIcon className="w-5 h-5" /> Summarize
          </button>
          <button onClick={() => handleAiAction(AIOption.IMPROVE)} disabled={isLoading} className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 font-medium py-2 px-4 rounded-sm transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            <SparklesIcon className="w-5 h-5" /> Improve
          </button>
        </div>

        <div className="flex-grow overflow-y-auto pr-2 space-y-3 min-h-[100px]">
            {isLoading && (
              <div className="text-center p-4 flex flex-col items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-on-surface-variant animate-pulse">{loadingMessage}</p>
              </div>
            )}

            {error && <p className="text-error bg-error/10 p-3 rounded-md">{error}</p>}
            
            {aiResult && (
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-on-surface-variant">AI Suggestion</h3>
                <div className="bg-surface-container p-3 rounded-md text-on-surface whitespace-pre-wrap">{aiResult}</div>
              </div>
            )}
        </div>
        
        {aiResult && !isLoading && (
            <div className="pt-4 border-t border-outline flex-shrink-0">
                <button
                onClick={handleApplyResult}
                className="w-full bg-primary hover:bg-primary/90 text-on-primary font-bold py-2 px-4 rounded-sm transition-colors"
                >
                Apply to Card Description
                </button>
            </div>
        )}
      </div>
    </Modal>
  );
};

export default AIFeatureModal;