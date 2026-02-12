import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, Target, Flame, Star, ArrowUpRight,
  Calendar, Zap, CheckCircle, BookOpen
} from 'lucide-react';
import { INTELLIGENCE_TYPES } from '../../constants/intelligenceData';
import type { UserProfile, UserStatus, AnalysisResult, LifeVision, IntelligenceResult } from '../../types';
import { GOAL_CATEGORIES } from '../../constants';
import { useGamification } from '../../contexts/GamificationContext';

interface DashboardHomeProps {
  userProfile: UserProfile;
  userResults: AnalysisResult;
  userStatus: UserStatus;
  lifeVision: LifeVision;
  intelligenceResult: IntelligenceResult | null;
}

const DashboardHome: React.FC<DashboardHomeProps> = ({
  userProfile,
  userResults,
  lifeVision,
  intelligenceResult,
}) => {
  const { userStatus } = useGamification();
  const dominantType = intelligenceResult ? INTELLIGENCE_TYPES[intelligenceResult.dominantType] : null;

  const [focusTasks, setFocusTasks] = useState([
    { id: '1', text: 'Complete study revision', done: false },
    { id: '2', text: 'Research university programs', done: false },
    { id: '3', text: 'Practice coding for 1 hour', done: false },
  ]);

  const completedFocus = focusTasks.filter(t => t.done).length;

  const stats = [
    { label: 'Overall Score', value: `${userResults.overallScore}%`, icon: TrendingUp, color: 'text-primary', bgColor: 'bg-primary/10' },
    { label: 'Current Streak', value: `${userStatus.streak} days`, icon: Flame, color: 'text-accent', bgColor: 'bg-accent/10' },
    { label: 'Level', value: userStatus.level, icon: Star, color: 'text-warning', bgColor: 'bg-warning/10' },
    { label: 'XP Earned', value: userStatus.xp, icon: Zap, color: 'text-success', bgColor: 'bg-success/10' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 md:space-y-8">
      {/* Hero Section */}
      <motion.div variants={itemVariants} className="bg-gradient-primary rounded-3xl p-8 md:p-12 text-primary-foreground shadow-2xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Welcome back, {userProfile.name}! 👋
        </h1>
        {dominantType && (
          <p className="opacity-90 text-lg mb-6">
            Your intelligence type: <span className="font-bold">{dominantType.icon} {dominantType.name}</span>
          </p>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-primary-foreground/20 backdrop-blur-sm rounded-xl p-4">
              <div className="text-sm opacity-80 mb-1">{stat.label}</div>
              <div className="text-3xl font-bold">{stat.value}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="grid md:grid-cols-3 gap-4">
        {[
          { emoji: '📅', title: 'Study Planner', desc: 'Organize your schedule and tasks' },
          { emoji: '🤖', title: 'AI Assistant', desc: 'Get help with your studies' },
          { emoji: '🎯', title: 'Career Path', desc: 'Review your career matches' },
        ].map((action) => (
          <motion.div
            key={action.title}
            whileHover={{ scale: 1.02 }}
            className="glass-card p-6 rounded-2xl cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="text-3xl mb-3">{action.emoji}</div>
            <h3 className="text-lg font-bold mb-1">{action.title}</h3>
            <p className="text-sm text-muted-foreground">{action.desc}</p>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's Focus */}
        <motion.div variants={itemVariants} className="lg:col-span-2 glass-card p-6 rounded-2xl">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-6">
            📋 Today&apos;s Focus
            <span className="text-xs text-muted-foreground ml-auto">{completedFocus}/{focusTasks.length}</span>
          </h2>
          <div className="space-y-3">
            {focusTasks.map((task) => (
              <div key={task.id} className="flex items-center gap-4 p-4 bg-secondary/30 rounded-xl">
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() => setFocusTasks(prev => prev.map(t => t.id === task.id ? { ...t, done: !t.done } : t))}
                  className="w-5 h-5 rounded accent-primary"
                />
                <span className={`${task.done ? 'line-through text-muted-foreground' : ''}`}>{task.text}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Vision Card */}
        <motion.div variants={itemVariants} className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Life Vision
            </h2>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {lifeVision.description || 'Define your vision for a harmonious life.'}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {GOAL_CATEGORIES.slice(0, 4).map((category, index) => {
              const score = userResults.categories.find(c => c.category === category.value)?.score || 0;
              return (
                <div key={category.value} className="text-center">
                  <div className="relative w-14 h-14 mx-auto mb-1">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" strokeWidth="3" className="text-secondary" />
                      <motion.circle cx="28" cy="28" r="24" fill="none" stroke={category.color} strokeWidth="3" strokeLinecap="round"
                        strokeDasharray={151} initial={{ strokeDashoffset: 151 }}
                        animate={{ strokeDashoffset: 151 - (151 * score) / 100 }}
                        transition={{ duration: 1, delay: index * 0.1 }} />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-lg">{category.icon}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{category.label.split(' ')[0]}</div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Learning Journey */}
      <motion.div variants={itemVariants} className="glass-card p-6 rounded-2xl bg-primary/5">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          🚀 Your Learning Journey
        </h2>
        <div className="space-y-4">
          {[
            { label: 'Intelligence Assessment', status: 'Complete', progress: 100, color: 'bg-success' },
            { label: 'Career Exploration', status: 'In Progress', progress: 60, color: 'bg-primary' },
            { label: 'University Applications', status: 'Not Started', progress: 0, color: 'bg-muted' },
          ].map((item) => (
            <div key={item.label} className="bg-background/80 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">{item.label}</span>
                <span className={`text-sm font-medium ${
                  item.status === 'Complete' ? 'text-success' :
                  item.status === 'In Progress' ? 'text-primary' :
                  'text-muted-foreground'
                }`}>
                  {item.status === 'Complete' && '✓ '}{item.status}
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recommendations */}
      <motion.div variants={itemVariants} className="glass-card p-6 rounded-2xl">
        <h2 className="text-xl font-semibold mb-6">💡 Recommended for You</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { emoji: '📚', title: 'Study Resources', desc: `Curated materials${dominantType ? ` for ${dominantType.name}` : ''}`, color: 'bg-primary/5 border-primary/10' },
            { emoji: '🎓', title: 'Universities', desc: 'Best programs for your profile', color: 'bg-accent/5 border-accent/10' },
            { emoji: '💰', title: 'Scholarships', desc: 'Funding opportunities for you', color: 'bg-success/5 border-success/10' },
          ].map((rec) => (
            <div key={rec.title} className={`p-6 rounded-xl border ${rec.color}`}>
              <div className="text-3xl mb-3">{rec.emoji}</div>
              <h4 className="font-bold mb-1">{rec.title}</h4>
              <p className="text-sm text-muted-foreground">{rec.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Strengths & Improvements */}
      <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <span className="text-success">✓</span> Your Strengths
          </h3>
          <ul className="space-y-2">
            {userResults.strengths.length > 0 ? (
              userResults.strengths.map((s, i) => (
                <li key={i} className="flex items-center gap-2 text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-success" />{s}
                </li>
              ))
            ) : (
              <li className="text-muted-foreground">Complete more activities to discover your strengths!</li>
            )}
          </ul>
        </div>
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <span className="text-accent">↗</span> Areas to Improve
          </h3>
          <ul className="space-y-2">
            {userResults.areasForImprovement.length > 0 ? (
              userResults.areasForImprovement.map((a, i) => (
                <li key={i} className="flex items-center gap-2 text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />{a}
                </li>
              ))
            ) : (
              <li className="text-muted-foreground">Keep going!</li>
            )}
          </ul>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DashboardHome;
