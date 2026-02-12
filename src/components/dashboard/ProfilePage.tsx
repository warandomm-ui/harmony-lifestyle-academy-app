import React from 'react';
import { motion } from 'framer-motion';
import { Download, Share2, RotateCcw, TrendingUp } from 'lucide-react';
import { Button } from '../ui/button';
import { INTELLIGENCE_TYPES } from '../../constants/intelligenceData';
import type { UserProfile, IntelligenceResult } from '../../types';

interface ProfilePageProps {
  userProfile: UserProfile;
  selectedSkills: string[];
  intelligenceResult: IntelligenceResult | null;
  onRetakeAssessment?: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({
  userProfile,
  selectedSkills,
  intelligenceResult,
  onRetakeAssessment,
}) => {
  const dominantType = intelligenceResult
    ? INTELLIGENCE_TYPES[intelligenceResult.dominantType]
    : null;

  const sortedScores = intelligenceResult
    ? Object.entries(intelligenceResult.scores)
        .sort(([, a], [, b]) => b - a)
    : [];

  const maxScore = sortedScores.length > 0 ? sortedScores[0][1] : 1;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold">👤 Your Profile</h1>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Intelligence Profile */}
          <motion.div variants={itemVariants} className="glass-card p-8 rounded-2xl">
            <h3 className="text-2xl font-bold mb-6">🧠 Intelligence Profile</h3>
            {dominantType ? (
              <div className="space-y-6">
                <div className="bg-gradient-primary rounded-2xl p-8 text-center text-primary-foreground">
                  <div className="text-6xl mb-4">{dominantType.icon}</div>
                  <h4 className="text-2xl font-bold mb-2">{dominantType.name}</h4>
                  <p className="opacity-90">{dominantType.description}</p>
                </div>

                {/* Score bars */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">All Intelligence Scores</h4>
                  {sortedScores.map(([key, score]) => {
                    const type = INTELLIGENCE_TYPES[key];
                    return (
                      <div key={key} className="flex items-center gap-3">
                        <span className="text-xl w-8">{type?.icon}</span>
                        <span className="text-sm w-40 truncate">{type?.name}</span>
                        <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-primary rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${(score / maxScore) * 100}%` }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                          />
                        </div>
                        <span className="text-sm font-bold w-8 text-right">{score}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Complete the intelligence assessment to see your profile.
              </p>
            )}
          </motion.div>

          {/* Career Matches */}
          {dominantType && (
            <motion.div variants={itemVariants} className="glass-card p-8 rounded-2xl">
              <h3 className="text-2xl font-bold mb-6">💼 Your Career Matches</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {dominantType.careers.map((career) => (
                  <div key={career.title} className="p-5 bg-secondary/30 rounded-xl border border-border hover:border-primary/30 transition-colors">
                    <h4 className="font-bold mb-2">{career.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>💰 {career.salary}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        career.demand === 'Very High' ? 'bg-success/10 text-success' :
                        career.demand === 'High' ? 'bg-primary/10 text-primary' :
                        career.demand === 'Growing' ? 'bg-warning/10 text-warning' :
                        'bg-secondary text-muted-foreground'
                      }`}>
                        {career.demand} demand
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* User Card */}
          <motion.div variants={itemVariants} className="glass-card p-6 rounded-2xl text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center text-3xl font-bold text-primary-foreground mx-auto mb-4">
              {userProfile.name.charAt(0).toUpperCase()}
            </div>
            <h3 className="text-xl font-semibold">{userProfile.name}</h3>
            <p className="text-muted-foreground text-sm">{userProfile.email}</p>
            {dominantType && (
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-sm text-primary font-medium">
                {dominantType.icon} {dominantType.name}
              </div>
            )}
          </motion.div>

          {/* Skills */}
          <motion.div variants={itemVariants} className="glass-card p-6 rounded-2xl">
            <h4 className="font-bold mb-3">Selected Skills</h4>
            <div className="flex flex-wrap gap-2">
              {selectedSkills.map((skill) => (
                <span key={skill} className="px-3 py-1 bg-secondary rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div variants={itemVariants} className="glass-card p-6 rounded-2xl">
            <h4 className="font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Stats
            </h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Profile Strength</span>
                  <span className="font-medium">85%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-success rounded-full" style={{ width: '85%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Goals Progress</span>
                  <span className="font-medium">60%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '60%' }} />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div variants={itemVariants} className="glass-card p-6 rounded-2xl space-y-3">
            <h4 className="font-bold mb-2">⚙️ Actions</h4>
            {onRetakeAssessment && (
              <Button variant="ghost" className="w-full justify-start" onClick={onRetakeAssessment}>
                <RotateCcw className="w-4 h-4 mr-2" /> Retake Assessment
              </Button>
            )}
            <Button variant="ghost" className="w-full justify-start" onClick={() => alert('Download feature coming soon!')}>
              <Download className="w-4 h-4 mr-2" /> Download Profile
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => alert('Share feature coming soon!')}>
              <Share2 className="w-4 h-4 mr-2" /> Share Profile
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfilePage;
