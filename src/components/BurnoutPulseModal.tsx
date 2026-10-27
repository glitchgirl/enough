import React, { useState } from 'react';
import { BURNOUT_QUESTIONS } from '../data/presetData';
import { BurnoutResult } from '../types';
import { Heart, X, CheckCircle, ShieldAlert, Sparkles, ArrowRight } from 'lucide-react';

interface BurnoutPulseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyCapacityRecommendation: (level: number) => void;
}

export const BurnoutPulseModal: React.FC<BurnoutPulseModalProps> = ({
  isOpen,
  onClose,
  onApplyCapacityRecommendation,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<BurnoutResult | null>(null);

  if (!isOpen) return null;

  const currentQ = BURNOUT_QUESTIONS[currentQuestionIndex];
  const isLast = currentQuestionIndex === BURNOUT_QUESTIONS.length - 1;

  const handleSelectOption = (score: number) => {
    const updated = { ...answers, [currentQ.id]: score };
    setAnswers(updated);

    if (!isLast) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Calculate results
      let total = 0;
      let exhaustion = 0;
      let detachment = 0;
      let inefficacy = 0;

      BURNOUT_QUESTIONS.forEach((q) => {
        const val = updated[q.id] || 0;
        total += val;
        if (q.dimension === 'exhaustion') exhaustion += val;
        if (q.dimension === 'detachment') detachment += val;
        if (q.dimension === 'inefficacy') inefficacy += val;
      });

      let message = '';
      let permissionNote = '';

      if (total >= 10) {
        message = 'Your nervous system is in Acute Exhaustion. You have been running on adrenaline and grit for far too long.';
        permissionNote = 'Prescription: Survival Mode. Radically reduce expectations. Say no to anything optional this week.';
      } else if (total >= 5) {
        message = 'You are experiencing Moderate Burnout Friction. Tasks feel heavier than usual, and self-criticism is likely elevated.';
        permissionNote = 'Prescription: Maintenance Mode. Set a firm finish time today and practice B- work without apology.';
      } else {
        message = 'Your reserves are currently balanced. Keep guarding your boundaries before fatigue creeps in.';
        permissionNote = 'Prescription: Savor your rest. Do not spend your peace filling up other people’s schedules.';
      }

      setResult({
        score: total,
        exhaustionScore: exhaustion,
        detachmentScore: detachment,
        inefficacyScore: inefficacy,
        message,
        permissionNote,
      });
    }
  };

  const handleReset = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setResult(null);
  };

  const handleAcceptRecommendation = () => {
    if (!result) return;
    if (result.score >= 10) {
      onApplyCapacityRecommendation(20);
    } else if (result.score >= 5) {
      onApplyCapacityRecommendation(50);
    } else {
      onApplyCapacityRecommendation(85);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FBF9F5] rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-stone-200 shadow-xl space-y-6 animate-fade-in relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Not finished yet */}
        {!result ? (
          <div className="space-y-6">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
                <Heart className="w-3.5 h-3.5 text-[#C86D51]" />
                <span>Burnout Compass</span>
                <span className="text-stone-400">·</span>
                <span>Question {currentQuestionIndex + 1} of {BURNOUT_QUESTIONS.length}</span>
              </div>
              <h2 className="font-serif text-2xl text-stone-900 leading-snug">
                {currentQ.question}
              </h2>
            </div>

            {/* Answer Options */}
            <div className="space-y-2.5">
              {currentQ.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(opt.score)}
                  className="w-full text-left p-4 rounded-2xl border border-stone-200 bg-white hover:border-stone-400 hover:bg-stone-50/80 transition-all text-xs sm:text-sm text-stone-800 leading-relaxed font-medium"
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Navigation back */}
            {currentQuestionIndex > 0 && (
              <button
                onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                className="text-xs text-stone-500 hover:text-stone-800 underline underline-offset-4"
              >
                ← Back to previous question
              </button>
            )}
          </div>
        ) : (
          /* Results View */
          <div className="space-y-6 text-center">
            <div className="w-12 h-12 rounded-full bg-[#E3E8DE] mx-auto flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-stone-800" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-stone-400">
                Honest Reflection Summary
              </span>
              <h3 className="font-serif text-2xl text-stone-900">
                {result.score >= 10
                  ? 'Tender & Depleted'
                  : result.score >= 5
                  ? 'Strained Capacity'
                  : 'Grounded Reserves'}
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-sm mx-auto">
                {result.message}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-stone-200 text-xs text-stone-700 italic">
              "{result.permissionNote}"
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={handleAcceptRecommendation}
                className="w-full py-3 rounded-xl bg-stone-900 text-stone-50 text-xs font-medium hover:bg-stone-800 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Sync with My Daily Battery Gauge</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleReset}
                className="w-full py-2 text-xs text-stone-500 hover:text-stone-800 transition-colors"
              >
                Retake Reflection
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
