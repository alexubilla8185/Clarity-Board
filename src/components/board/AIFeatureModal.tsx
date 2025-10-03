import React, { useState } from 'react';
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

const AIFeatureModal: React.FC<AIFeatureModalProps> = ({ isOpen, onClose, card, onUpdateCard }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [error, setError] = useState('');

  const handleAiAction = async (option: AIOption) => {
    if (!card) return;
    setIsLoading(true);
    setError('');
    setAiResult('');
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

  if (!card) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Enhance Card: "${card.title}"`}>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium text-on-surface-variant mb-2">Original Text</h3>
          <p className="bg-surface-container p-3 rounded-md text-on-surface whitespace-pre-wrap">{card.description || card.title}</p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center border-t border-b border-outline py-4">
          <button onClick={() => handleAiAction(AIOption.BRAINSTORM)} className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 font-medium py-2 px-4 rounded-sm transition-colors flex items-center gap-2">
            <SparklesIcon className="w-5 h-5" /> Brainstorm
          </button>
          <button onClick={() => handleAiAction(AIOption.SUMMARIZE)} className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 font-medium py-2 px-4 rounded-sm transition-colors flex items-center gap-2">
            <SparklesIcon className="w-5 h-5" /> Summarize
          </button>
          <button onClick={() => handleAiAction(AIOption.IMPROVE)} className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 font-medium py-2 px-4 rounded-sm transition-colors flex items-center gap-2">
            <SparklesIcon className="w-5 h-5" /> Improve
          </button>
        </div>

        {isLoading && (
          <div className="text-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-on-surface-variant">AI is thinking...</p>
          </div>
        )}

        {error && <p className="text-error bg-error/10 p-3 rounded-md">{error}</p>}
        
        {aiResult && (
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-on-surface-variant">AI Suggestion</h3>
            <div className="bg-surface-container p-3 rounded-md text-on-surface whitespace-pre-wrap max-h-60 overflow-y-auto">{aiResult}</div>
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