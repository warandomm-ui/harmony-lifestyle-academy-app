import React, { useState } from 'react';
import { STUDENT_360_SURVEY } from '../constants';
import type { SurveyAnswers, Question as QuestionType } from '../types';
import { CheckCircleIcon, ChevronRightIcon, SparklesIcon } from './dashboard/Icons';

interface AssessmentStepProps {
  onComplete: (answers: SurveyAnswers) => void;
  onSkip: () => void;
}

const AssessmentStep: React.FC<AssessmentStepProps> = ({ onComplete, onSkip }) => {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [answers, setAnswers] = useState<SurveyAnswers>({});

  const currentSection = STUDENT_360_SURVEY[currentSectionIndex];
  const progress = ((currentSectionIndex + 1) / STUDENT_360_SURVEY.length) * 100;

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [currentSection.id]: {
        ...prev[currentSection.id],
        [questionId]: value,
      },
    }));
  };
  
  const handleNextSection = () => {
    if (currentSectionIndex < STUDENT_360_SURVEY.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onComplete(answers);
    }
  };

  const isSectionComplete = () => {
    const sectionAnswers = answers[currentSection.id] || {};
    return currentSection.questions.every(q => {
      const answer = sectionAnswers[q.id];
      if (q.id === 'mi1') {
        return Array.isArray(answer) && answer.length > 0 && answer.length <= 3;
      }
      return answer !== undefined;
    });
  };

  const sectionComplete = isSectionComplete();

  return (
    <div className="flex flex-col h-full animate-fade-in max-w-3xl mx-auto">
      {/* Progress Header */}
      <div className="mb-8 sticky top-0 bg-card z-20 py-4 border-b border-border shadow-sm -mx-6 px-6 md:mx-0 md:px-0 md:static md:shadow-none md:border-none md:bg-transparent transition-all duration-300">
        <div className="flex justify-between items-end mb-2">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-primary mb-1 block">Harmony Assessment</span>
            <h2 className="text-lg font-bold text-foreground leading-none">Section {currentSectionIndex + 1} <span className="text-muted-foreground text-sm font-medium">of {STUDENT_360_SURVEY.length}</span></h2>
          </div>
          <span className="text-xs font-bold text-muted-foreground">{Math.round(progress)}% Complete</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
          <div 
            className="bg-gradient-primary h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_hsl(var(--primary)/0.5)]" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      
      <div key={currentSection.id} className="animate-fade-in space-y-8 pb-40">
        <div className="text-center mb-8 bg-secondary/30 p-6 rounded-2xl border border-border">
          <h2 className="text-2xl md:text-3xl font-black text-foreground mb-3">{currentSection.title}</h2>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-xl mx-auto">{currentSection.description}</p>
        </div>

        <div className="space-y-8">
          {currentSection.questions.map((question) => (
            <Question 
              key={question.id} 
              question={question} 
              onAnswer={handleAnswer} 
              answer={answers[currentSection.id]?.[question.id]} 
            />
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-card border-t border-border shadow-[0_-5px_20px_rgba(0,0,0,0.05)] md:relative md:bg-transparent md:border-none md:shadow-none md:p-0 mt-8 flex flex-col items-center gap-3 z-30">
        {!sectionComplete && (
          <div className="text-xs font-bold text-warning animate-pulse bg-warning/10 px-4 py-2 rounded-full border border-warning/20">
            Please complete all questions to continue
          </div>
        )}
        <div className="flex items-center justify-between w-full gap-4 max-w-3xl mx-auto">
          <button
            onClick={onSkip}
            className="text-muted-foreground font-bold hover:text-foreground transition-colors px-6 py-3 rounded-xl hover:bg-secondary text-sm"
          >
            Skip Analysis
          </button>
          <button
            onClick={handleNextSection}
            disabled={!sectionComplete}
            className="flex-1 md:flex-none bg-primary text-primary-foreground font-bold py-4 px-10 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed enabled:hover:opacity-90 enabled:hover:shadow-xl enabled:hover:-translate-y-1 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
          >
            {currentSectionIndex < STUDENT_360_SURVEY.length - 1 ? 'Next Section' : 'Analyze Profile'}
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

interface QuestionProps {
  question: QuestionType;
  onAnswer: (qId: string, val: any) => void;
  answer: any;
}

const Question: React.FC<QuestionProps> = ({ question, onAnswer, answer }) => {
  const isAnswered = answer !== undefined && (Array.isArray(answer) ? answer.length > 0 : true);

  // Specific logic for Multiple Intelligences limit
  const isMultiSelect = question.id === 'mi1';
  const selectionCount = Array.isArray(answer) ? answer.length : 0;
  const selectionLimit = 3;

  return (
    <div className={`p-6 md:p-8 rounded-2xl bg-card border shadow-sm transition-all duration-300 hover:shadow-md 
        ${isAnswered ? 'border-success/40 bg-success/5 shadow-success/10' : 'border-border'}`}>
        
      <div className="flex items-start justify-between mb-6">
        <h3 className="font-bold text-foreground text-lg md:text-xl leading-snug pr-4">
          {question.text}
        </h3>
        {isAnswered ? (
          <CheckCircleIcon className="h-7 w-7 text-success flex-shrink-0 animate-scale-in drop-shadow-sm" />
        ) : (
          <div className="h-7 w-7 rounded-full border-2 border-border flex-shrink-0 bg-background"></div>
        )}
      </div>

      {isMultiSelect && (
        <div className="mb-6 flex items-center gap-3 bg-secondary/50 p-2 rounded-lg">
          <div className="h-2 flex-1 bg-secondary rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${selectionCount === selectionLimit ? 'bg-success' : 'bg-primary'}`} 
              style={{ width: `${(selectionCount / selectionLimit) * 100}%` }}
            />
          </div>
          <span className={`text-xs font-bold whitespace-nowrap ${selectionCount > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
            {selectionCount}/{selectionLimit} Selected
          </span>
        </div>
      )}

      <div>
        {question.type === 'multiple-choice' && (
          <div className="grid grid-cols-1 gap-3">
            {question.options?.map(opt => {
              const isSelected = isMultiSelect 
                ? Array.isArray(answer) && answer.includes(opt.value) 
                : answer === opt.value;
              
              const handleSelect = () => {
                if (isMultiSelect) {
                  const currentSelection = new Set<string | number>(Array.isArray(answer) ? answer : []);
                  if (currentSelection.has(opt.value)) {
                    currentSelection.delete(opt.value);
                  } else if (currentSelection.size < selectionLimit) {
                    currentSelection.add(opt.value);
                  }
                  onAnswer(question.id, Array.from(currentSelection));
                } else {
                  onAnswer(question.id, opt.value);
                }
              };

              return (
                <button
                  key={opt.value.toString()}
                  onClick={handleSelect}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/20 flex items-center justify-between group
                    ${isSelected 
                      ? 'bg-primary border-primary text-primary-foreground shadow-lg transform scale-[1.01]' 
                      : 'bg-background border-border text-foreground hover:border-primary/50 hover:bg-secondary'}`}
                >
                  <span>{opt.text}</span>
                  {isSelected && <SparklesIcon className="h-4 w-4 text-primary-foreground animate-pulse" />}
                </button>
              );
            })}
          </div>
        )}

        {question.type === 'rating-scale' && (
          <div className="py-2">
            <div className="flex justify-between items-center gap-2 mb-4">
              {Array.from({ length: question.scale!.max }, (_, i) => i + 1).map(val => {
                const isSelected = answer?.score === val;
                return (
                  <button 
                    key={val}
                    onClick={() => onAnswer(question.id, { question: question.value, score: val })}
                    className={`
                      relative w-10 h-10 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center font-black text-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary/20
                      ${isSelected 
                        ? 'bg-primary text-primary-foreground scale-110 shadow-lg ring-2 ring-primary ring-offset-2 ring-offset-background z-10' 
                        : 'bg-secondary text-muted-foreground hover:bg-border hover:text-foreground'
                      }
                    `}
                  >
                    {val}
                    {isSelected && <div className="absolute -bottom-2 w-1.5 h-1.5 rounded-full bg-primary"></div>}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
              <span>Not like me</span>
              <span>Very like me</span>
            </div>
          </div>
        )}

        {question.type === 'selection' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {question.options?.map(opt => (
              <button
                key={opt.value.toString()}
                onClick={() => onAnswer(question.id, opt.value)}
                className={`w-full text-left p-6 rounded-2xl border-2 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary/20 h-full flex flex-col justify-center relative overflow-hidden group
                  ${answer === opt.value 
                    ? 'bg-primary border-primary text-primary-foreground shadow-xl scale-[1.02]' 
                    : 'bg-background border-border hover:border-primary/50 hover:bg-secondary'}`}
              >
                <div className={`relative z-10 font-bold text-lg mb-1 ${answer === opt.value ? 'text-primary-foreground' : 'text-foreground'}`}>
                  {opt.text.split(':')[0]}
                </div>
                <div className={`relative z-10 text-sm leading-relaxed ${answer === opt.value ? 'text-primary-foreground/90' : 'text-muted-foreground'}`}>
                  {opt.text.split(':')[1]}
                </div>
                {/* Decorative background element for selection */}
                {answer === opt.value && (
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary-foreground/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentStep;
