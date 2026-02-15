import React, { useState } from 'react';
import { STUDENT_360_SURVEY } from '../constants';
import type { SurveyAnswers, Question as QuestionType } from '../types';

interface AssessmentStepProps {
  onComplete: (answers: SurveyAnswers) => void;
  onSkip: () => void;
}

const AssessmentStep: React.FC<AssessmentStepProps> = ({ onComplete, onSkip }) => {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [answers, setAnswers] = useState<SurveyAnswers>({});

  const currentSection = STUDENT_360_SURVEY[currentSectionIndex];
  const progress = ((currentSectionIndex) / STUDENT_360_SURVEY.length) * 100;

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
    } else {
        onComplete(answers);
    }
  };

  const isSectionComplete = () => {
    const sectionAnswers = answers[currentSection.id] || {};
    return currentSection.questions.every(q => sectionAnswers[q.id] !== undefined);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-green-700 dark:text-green-500">Student 360° Survey</span>
          <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{currentSectionIndex + 1} / {STUDENT_360_SURVEY.length}</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div className="bg-green-600 dark:bg-green-500 h-2.5 rounded-full" style={{ width: `${progress}%`, transition: 'width 0.5s ease-in-out' }}></div>
        </div>
      </div>
      
      <div key={currentSection.id} className="animate-fade-in">
        <div className="text-center mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">{currentSection.title}</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{currentSection.description}</p>
        </div>
        <div className="space-y-6">
          {currentSection.questions.map((question) => (
            <Question key={question.id} question={question} onAnswer={handleAnswer} answer={answers[currentSection.id]?.[question.id]} />
          ))}
        </div>
      </div>

       <div className="text-center mt-10 pt-6 border-t dark:border-gray-700 flex items-center justify-center gap-6">
        <button
            onClick={onSkip}
            className="text-gray-500 dark:text-gray-400 font-medium hover:underline focus:outline-none"
        >
            Skip for now
        </button>
        <button
          onClick={handleNextSection}
          disabled={!isSectionComplete()}
          className="bg-green-600 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed dark:disabled:bg-gray-600 enabled:hover:bg-green-700 enabled:hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
        >
          {currentSectionIndex < STUDENT_360_SURVEY.length - 1 ? 'Next Section' : 'Finish & Analyze'}
        </button>
      </div>
    </div>
  );
};

// --- Question Renderer ---
// FIX: Explicitly type the Question component as a React.FC to correctly handle the 'key' prop and resolve the TypeScript error.
interface QuestionProps {
  question: QuestionType;
  onAnswer: (qId: string, val: any) => void;
  answer: any;
}

const Question: React.FC<QuestionProps> = ({ question, onAnswer, answer }) => {
  switch (question.type) {
    case 'multiple-choice':
      return (
        <div>
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">{question.text}</h3>
          <div className="space-y-3">
            {question.options?.map(opt => (
              <button
                key={opt.value.toString()}
                onClick={() => onAnswer(question.id, opt.value)}
                className={`w-full text-left p-3 border-2 rounded-lg transition-all duration-200 text-gray-700 dark:text-gray-200 ${answer === opt.value ? 'bg-green-100 border-green-500 ring-2 ring-green-500 dark:bg-green-500/20 dark:border-green-500' : 'bg-white border-gray-200 hover:border-green-400 hover:bg-green-50 dark:bg-gray-700 dark:border-gray-600 dark:hover:border-green-500 dark:hover:bg-gray-600'}`}
              >
                {opt.text}
              </button>
            ))}
          </div>
        </div>
      );
    case 'rating-scale':
      return (
        <div>
           <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">{question.text}</h3>
           <div className="flex justify-between items-center space-x-2">
             {Array.from({ length: question.scale!.max }, (_, i) => i + 1).map(val => (
                <button 
                  key={val}
                  onClick={() => onAnswer(question.id, {question: question.value, score: val})}
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold transition-all ${answer?.score === val ? 'bg-green-600 border-green-600 text-white' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-green-500'}`}
                >{val}</button>
             ))}
           </div>
        </div>
      );
    case 'selection': // Similar to multiple choice, but with more text, better for single-question sections
       return (
        <div>
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3 text-center">{question.text}</h3>
          <div className="space-y-4">
            {question.options?.map(opt => (
               <button
                key={opt.value.toString()}
                onClick={() => onAnswer(question.id, opt.value)}
                className={`w-full text-left p-4 border-2 rounded-xl transition-all duration-200 ${answer === opt.value ? 'bg-green-100 border-green-500 ring-2 ring-green-500 dark:bg-green-500/20 dark:border-green-500' : 'bg-white border-gray-200 hover:border-green-400 hover:bg-green-50 dark:bg-gray-700 dark:border-gray-600 dark:hover:border-green-500 dark:hover:bg-gray-600'}`}
              >
                <p className="font-bold text-gray-800 dark:text-gray-100">{opt.text.split(':')[0]}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{opt.text.split(':')[1]}</p>
              </button>
            ))}
          </div>
        </div>
       )
    default:
      return null;
  }
};

export default AssessmentStep;