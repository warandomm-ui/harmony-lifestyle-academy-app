import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Target, 
  Flame, 
  Star,
  ArrowUpRight,
  Calendar,
  Zap
} from 'lucide-react';
import type { UserProfile, UserStatus, AnalysisResult, LifeVision } from '../../types';
import { GOAL_CATEGORIES } from '../../constants';
import { useGamification } from '../../contexts/GamificationContext';

interface DashboardHomeProps {
  userProfile: UserProfile;
  userResults: AnalysisResult;
  userStatus: UserStatus;
  lifeVision: LifeVision;
}

const DashboardHome: React.FC<DashboardHomeProps> = ({
  userProfile,
  userResults,
  lifeVision,
}) => {
  const { userStatus } = useGamification();
  
  const stats = [
    { 
      label: 'Overall Score', 
      value: `${userResults.overallScore}%`, 
      icon: TrendingUp, 
      color: 'text-primary',
      bgColor: 'bg-primary/10' 
    },
    { 
      label: 'Current Streak', 
      value: `${userStatus.streak} days`, 
      icon: Flame, 
      color: 'text-accent',
      bgColor: 'bg-accent/10' 
    },
    { 
      label: 'Level', 
      value: userStatus.level, 
      icon: Star, 
      color: 'text-warning',
      bgColor: 'bg-warning/10' 
    },
    { 
      label: 'XP Earned', 
      value: userStatus.xp, 
      icon: Zap, 
      color: 'text-success',
      bgColor: 'bg-success/10' 
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 md:space-y-8"
    >
      {/* Welcome Header */}
      <motion.div variants={itemVariants} className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold">
          Welcome back, <span className="text-gradient">{userProfile.name}</span>
        </h1>
        <p className="text-muted-foreground">
          <Calendar className="inline w-4 h-4 mr-1" />
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="glass-card p-4 md:p-6 rounded-2xl"
            >
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${stat.bgColor} mb-3`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="text-2xl md:text-3xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Vision Card */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 glass-card p-6 rounded-2xl"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Your Life Vision
            </h2>
            <button className="text-sm text-primary hover:underline flex items-center gap-1">
              Edit <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            {lifeVision.description || 'Define your vision to unlock personalized guidance and track your journey to a harmonious life.'}
          </p>
          
          {/* Category Progress */}
          <div className="mt-6 space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Life Balance</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {GOAL_CATEGORIES.slice(0, 4).map((category, index) => {
                const score = userResults.categories.find(c => c.category === category.value)?.score || 0;
                return (
                  <div key={category.value} className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-2">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="4"
                          className="text-secondary"
                        />
                        <motion.circle
                          cx="32"
                          cy="32"
                          r="28"
                          fill="none"
                          stroke={category.color}
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeDasharray={176}
                          initial={{ strokeDashoffset: 176 }}
                          animate={{ strokeDashoffset: 176 - (176 * score) / 100 }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-lg">
                        {category.icon}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">{category.label.split(' ')[0]}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          variants={itemVariants}
          className="glass-card p-6 rounded-2xl space-y-4"
        >
          <h2 className="text-xl font-semibold">Quick Actions</h2>
          <div className="space-y-3">
            {[
              { label: 'Log daily reflection', emoji: '📝', color: 'bg-primary/10 hover:bg-primary/20' },
              { label: 'Complete a challenge', emoji: '🎯', color: 'bg-accent/10 hover:bg-accent/20' },
              { label: 'Review your goals', emoji: '✨', color: 'bg-success/10 hover:bg-success/20' },
              { label: 'Start a lesson', emoji: '📚', color: 'bg-warning/10 hover:bg-warning/20' },
            ].map((action) => (
              <motion.button
                key={action.label}
                whileHover={{ x: 4 }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${action.color}`}
              >
                <span className="text-xl">{action.emoji}</span>
                <span className="font-medium">{action.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Strengths & Improvements */}
      <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <span className="text-success">✓</span> Your Strengths
          </h3>
          <ul className="space-y-2">
            {userResults.strengths.length > 0 ? (
              userResults.strengths.map((strength, i) => (
                <li key={i} className="flex items-center gap-2 text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-success" />
                  {strength}
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
              userResults.areasForImprovement.map((area, i) => (
                <li key={i} className="flex items-center gap-2 text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  {area}
                </li>
              ))
            ) : (
              <li className="text-muted-foreground">Keep going - we'll identify growth areas soon!</li>
            )}
          </ul>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DashboardHome;
