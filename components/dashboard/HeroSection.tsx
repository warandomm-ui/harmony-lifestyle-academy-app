import React, { useState, useEffect } from 'react';
import { AnalysisResult, UserProfile } from '../../types';
import DailyQuote from './shared/DailyQuote';

interface HeroSectionProps {
  userProfile: UserProfile;
  userResults: AnalysisResult;
}

const HeroSection: React.FC<HeroSectionProps> = ({ userProfile, userResults }) => {
    // In a real app, this would be fetched or come from user profile
    const userName = userProfile.name || "User"; 

    // Mock weather data. In a real app, you'd use the geolocation to fetch this.
    const [weather, setWeather] = useState("☀️ 32°C, Sunny");

    const today = new Date();
    const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = today.toLocaleDateString('en-US', dateOptions);

    return (
        <section className="mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-[var(--foreground)]">What's the vibe, {userName}? ✨</h1>
            <p className="text-lg text-[var(--muted)] mt-1">
                You're giving <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]">{userResults.personalityType}</span> energy — let's make today iconic!
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[var(--muted-foreground)]">
                <span>{formattedDate}</span>
                <span>{weather}</span>
                <span className="italic">"Trust the process. Your journey is the aesthetic."</span>
            </div>

            <DailyQuote />
        </section>
    );
};

export default HeroSection;