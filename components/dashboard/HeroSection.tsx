import React from 'react';
import { AnalysisResult, UserProfile } from '../../types';
import DailyQuote from './shared/DailyQuote';

interface HeroSectionProps {
  userProfile: UserProfile;
  userResults: AnalysisResult;
}

const HeroSection: React.FC<HeroSectionProps> = ({ userProfile, userResults }) => {
    const userName = userProfile.name || "User";
    const weather = "☀️ 32°C, Sunny";

    const today = new Date();
    const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = today.toLocaleDateString('en-US', dateOptions);

    // First-name greeting
    const firstName = userName.split(' ')[0];

    return (
        <section className="animate-fade-in mb-6">
            {/* Top gold accent line */}
            <div className="hla-gold-divider mb-8" />

            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                    <p
                        className="text-xs uppercase tracking-[0.3em] mb-2 font-light"
                        style={{ color: '#8a8a9a', fontFamily: "'DM Sans', sans-serif" }}
                    >
                        Selamat Kembali
                    </p>
                    <h1
                        className="text-4xl md:text-5xl font-bold leading-tight"
                        style={{
                            fontFamily: "'Playfair Display', Georgia, serif",
                            fontStyle: 'italic',
                            background: 'linear-gradient(135deg, #c9a84c 0%, #e8c97a 40%, #f0d990 60%, #c9a84c 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}
                    >
                        Hai, {firstName}
                    </h1>
                    <p
                        className="mt-2 text-lg italic"
                        style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: 'rgba(201,168,76,0.8)' }}
                    >
                        {userResults.personalityType} &mdash; jom sambung belajar hari ini!
                    </p>
                </div>

                {/* Date + weather pill */}
                <div
                    className="flex items-center gap-3 text-sm px-4 py-2 rounded-full self-start md:self-auto"
                    style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', color: '#8a8a9a', fontFamily: "'DM Sans', sans-serif" }}
                >
                    <span>{formattedDate}</span>
                    <span style={{ color: 'rgba(201,168,76,0.4)' }}>·</span>
                    <span>{weather}</span>
                </div>
            </div>

            {/* Daily Quote */}
            <div className="mt-6">
                <DailyQuote />
            </div>

            {/* Bottom gold accent line */}
            <div className="hla-gold-divider mt-8" />
        </section>
    );
};

export default HeroSection;
