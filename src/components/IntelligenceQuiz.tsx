import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { INTELLIGENCE_QUESTIONS, INTELLIGENCE_TYPES } from '../constants/intelligenceData';
import type { IntelligenceResult } from '../types';

interface IntelligenceQuizProps {
  onComplete: (result: IntelligenceResult) => void;
}

const IntelligenceQuiz: React.FC<IntelligenceQuizProps> = ({ onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({
    logical: 0, linguistic: 0, spatial: 0, musical: 0,
    kinesthetic: 0, interpersonal: 0, intrapersonal: 0, naturalistic: 0,
  });
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const question = INTELLIGENCE_QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / INTELLIGENCE_QUESTIONS.length) * 100;
  const typeData = INTELLIGENCE_TYPES[question.type];

  const handleSelect = (optionIndex: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(optionIndex);

    const option = question.options[optionIndex];
    const newScores = { ...scores };
    newScores[option.intelligence] = (newScores[option.intelligence] || 0) + option.score;
    if (option.secondary) {
      Object.entries(option.secondary).forEach(([intel, score]) => {
        newScores[intel] = (newScores[intel] || 0) + score;
      });
    }
    setScores(newScores);

    setTimeout(() => {
      setSelectedOption(null);
      if (currentQuestion < INTELLIGENCE_QUESTIONS.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        // Calculate result
        const sorted = Object.entries(newScores).sort(([, a], [, b]) => b - a);
        const dominantType = sorted[0][0];
        const allScores: Record<string, number> = {};
        sorted.forEach(([key, val]) => {
          allScores[key] = val;
        });
        onComplete({
          dominantType,
          scores: allScores,
        });
      }
    }, 400);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Intelligence Assessment</h2>
        <p className="text-muted-foreground">Discover your unique intelligence type</p>
      </div>

      {/* Progress */}
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">
            Question {currentQuestion + 1} of {INTELLIGENCE_QUESTIONS.length}
          </span>
          <span className="font-medium text-primary">{Math.round(progress)}%</span>
        </div>
        <div className="h-3 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-primary rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Intelligence type badge */}
      <div className="flex justify-center">
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold">
          {typeData?.icon} Testing: {typeData?.name}
        </span>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="space-y-6"
        >
          <h3 className="text-2xl font-bold text-center">{question.question}</h3>

          <div className="space-y-3">
            {question.options.map((option, index) => {
              const isSelected = selectedOption === index;
              return (
                <motion.button
                  key={index}
                  whileHover={selectedOption === null ? { scale: 1.01 } : {}}
                  whileTap={selectedOption === null ? { scale: 0.99 } : {}}
                  onClick={() => handleSelect(index)}
                  disabled={selectedOption !== null}
                  className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 ${
                    isSelected
                      ? 'bg-primary border-primary text-primary-foreground shadow-lg scale-[1.01]'
                      : 'glass-card border-border hover:border-primary/50 hover:bg-secondary/50'
                  } ${selectedOption !== null && !isSelected ? 'opacity-50' : ''}`}
                >
                  <span className="text-base font-medium">{option.text}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default IntelligenceQuiz;
