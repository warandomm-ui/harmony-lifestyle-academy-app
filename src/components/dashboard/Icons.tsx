import React from 'react';
import { 
  Home, 
  Target, 
  Trophy, 
  User, 
  Settings, 
  BookOpen, 
  TrendingUp,
  MessageCircle,
  Linkedin
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface IconProps {
  className?: string;
}

export const HomeIcon: React.FC<IconProps> = ({ className }) => (
  <Home className={cn("w-5 h-5", className)} />
);

export const GoalsIcon: React.FC<IconProps> = ({ className }) => (
  <Target className={cn("w-5 h-5", className)} />
);

export const AchievementsIcon: React.FC<IconProps> = ({ className }) => (
  <Trophy className={cn("w-5 h-5", className)} />
);

export const ProfileIcon: React.FC<IconProps> = ({ className }) => (
  <User className={cn("w-5 h-5", className)} />
);

export const SettingsIcon: React.FC<IconProps> = ({ className }) => (
  <Settings className={cn("w-5 h-5", className)} />
);

export const LearnIcon: React.FC<IconProps> = ({ className }) => (
  <BookOpen className={cn("w-5 h-5", className)} />
);

export const ProgressIcon: React.FC<IconProps> = ({ className }) => (
  <TrendingUp className={cn("w-5 h-5", className)} />
);

export const ChatIcon: React.FC<IconProps> = ({ className }) => (
  <MessageCircle className={cn("w-5 h-5", className)} />
);

export const LinkedInIcon: React.FC<IconProps> = ({ className }) => (
  <Linkedin className={cn("w-5 h-5", className)} />
);
