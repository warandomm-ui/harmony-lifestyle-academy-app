import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Sparkles, Target, Heart, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import IntelligenceQuiz from './IntelligenceQuiz';
import type { UserProfile, AnalysisResult, UserStatus, LifeVision, IntelligenceResult } from '../types';
import { GOAL_CATEGORIES, SKILLS_LIST, DEFAULT_ANALYSIS_RESULT } from '../constants';

interface OnboardingFlowProps {
  onOnboardingComplete: (
    profile: UserProfile,
    results: AnalysisResult,
    status: UserStatus,
    vision: LifeVision,
    skills: string[],
    intelligenceResult: IntelligenceResult
  ) => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onOnboardingComplete }) => {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const totalSteps = 5;

  const handleGoalToggle = (goalValue: string) => {
    setSelectedGoals(prev =>
      prev.includes(goalValue) ? prev.filter(g => g !== goalValue) : [...prev, goalValue]
    );
  };

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleQuizComplete = (intelligenceResult: IntelligenceResult) => {
    const profile: UserProfile = {
      id: crypto.randomUUID(),
      name,
      email,
      createdAt: new Date(),
      preferences: { notifications: true, emailUpdates: true, theme: 'system' },
    };

    const results: AnalysisResult = {
      ...DEFAULT_ANALYSIS_RESULT,
      overallScore: 50,
      strengths: selectedSkills.slice(0, 3),
      areasForImprovement: ['Consistency', 'Time management'],
    };

    const status: UserStatus = {
      level: 1, xp: 0, xpToNextLevel: 100,
      streak: 1, lastActive: new Date(), badges: [],
    };

    const vision: LifeVision = {
      id: crypto.randomUUID(),
      title: 'My Life Vision',
      description: 'Living my best life with purpose and harmony.',
      goals: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    onOnboardingComplete(profile, results, status, vision, selectedSkills, intelligenceResult);
  };

  const canProceed = () => {
    switch (step) {
      case 0: return true;
      case 1: return name.trim().length > 0 && email.includes('@');
      case 2: return selectedGoals.length > 0;
      case 3: return selectedSkills.length > 0;
      case 4: return true; // Quiz handles its own flow
      default: return true;
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction < 0 ? 300 : -300, opacity: 0 }),
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <motion.div key="welcome" custom={1} variants={slideVariants} initial="enter" animate="center" exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="text-center space-y-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-primary animate-pulse-glow">
              <Sparkles className="w-12 h-12 text-primary-foreground" />
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-gradient">Welcome to Harmony</h1>
              <p className="text-xl text-muted-foreground max-w-lg mx-auto">
                Your personal journey to a balanced, fulfilling life starts here.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto text-sm">
              {[
                { icon: '🧠', label: 'Intelligence Assessment', desc: 'Discover your unique type' },
                { icon: '🎯', label: 'Career Matching', desc: 'Find perfect careers' },
                { icon: '📚', label: 'Study Planner', desc: 'Organize your schedule' },
                { icon: '🤖', label: 'AI Assistant', desc: 'Get personalized guidance' },
              ].map((item) => (
                <div key={item.label} className="glass-card p-4 rounded-xl text-center">
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <div className="font-medium text-xs">{item.label}</div>
                  <div className="text-muted-foreground text-xs mt-1">{item.desc}</div>
                </div>
              ))}
            </div>
          </motion.div>
        );

      case 1:
        return (
          <motion.div key="profile" custom={1} variants={slideVariants} initial="enter" animate="center" exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="space-y-8 w-full max-w-md mx-auto">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">Tell us about yourself</h2>
              <p className="text-muted-foreground">We&apos;ll personalize your experience.</p>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input id="name" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} className="h-12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12" />
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div key="goals" custom={1} variants={slideVariants} initial="enter" animate="center" exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="space-y-8 w-full max-w-2xl mx-auto">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">What areas matter most?</h2>
              <p className="text-muted-foreground">Select the life areas you want to focus on.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {GOAL_CATEGORIES.map((category) => (
                <button key={category.value} onClick={() => handleGoalToggle(category.value)}
                  className={`glass-card p-4 rounded-xl text-left transition-all duration-200 hover:scale-[1.02] ${
                    selectedGoals.includes(category.value) ? 'ring-2 ring-primary shadow-lg' : ''
                  }`}>
                  <div className="text-3xl mb-2">{category.icon}</div>
                  <div className="font-medium text-sm">{category.label}</div>
                </button>
              ))}
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div key="skills" custom={1} variants={slideVariants} initial="enter" animate="center" exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="space-y-8 w-full max-w-2xl mx-auto">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">Skills to develop</h2>
              <p className="text-muted-foreground">Choose skills you&apos;d like to master.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {SKILLS_LIST.map((skill) => (
                <label key={skill}
                  className={`glass-card p-4 rounded-xl flex items-center gap-3 cursor-pointer transition-all duration-200 hover:bg-secondary/50 ${
                    selectedSkills.includes(skill) ? 'ring-2 ring-primary' : ''
                  }`}>
                  <Checkbox checked={selectedSkills.includes(skill)} onCheckedChange={() => handleSkillToggle(skill)} />
                  <span className="text-sm font-medium">{skill}</span>
                </label>
              ))}
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div key="quiz" custom={1} variants={slideVariants} initial="enter" animate="center" exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="w-full">
            <IntelligenceQuiz onComplete={handleQuizComplete} />
          </motion.div>
        );

      default:
        return null;
    }
  };

  // Quiz step has its own navigation
  const showNav = step < 4;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Progress indicator */}
      <div className="w-full max-w-md mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Step {step + 1} of {totalSteps}</span>
          <span className="text-sm font-medium text-primary">{Math.round(((step + 1) / totalSteps) * 100)}%</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div className="h-full bg-gradient-primary rounded-full" initial={{ width: 0 }}
            animate={{ width: `${((step + 1) / totalSteps) * 100}%` }} transition={{ duration: 0.3 }} />
        </div>
      </div>

      {/* Step content */}
      <div className="w-full max-w-4xl min-h-[400px] flex items-center justify-center">
        <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
      </div>

      {/* Navigation */}
      {showNav && (
        <div className="flex items-center gap-4 mt-8">
          {step > 0 && (
            <Button variant="ghost" size="lg" onClick={() => setStep(step - 1)} className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          )}
          <Button variant="hero" size="lg" onClick={() => setStep(step + 1)} disabled={!canProceed()} className="gap-2 min-w-[140px]">
            Continue <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default OnboardingFlow;
