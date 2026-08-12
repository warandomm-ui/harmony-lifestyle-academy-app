import React, { useState } from 'react';
import type { UserProfile, AnalysisResult } from '../../../types';
import { useGamification } from '../../../contexts/GamificationContext';
import { useToast } from '../../../contexts/ToastContext';
import * as Icons from '../Icons';
import { GENDERS, RACES, RELIGIONS, STATES } from '../../../constants';
import { getCareerIcon } from '../../../constants';
import HarmonyProfileSection from '../sections/HarmonyProfileSection';

interface ProfilePageProps {
  userProfile: UserProfile;
  userResults: AnalysisResult;
  onProfileUpdate: (profile: UserProfile) => void;
  selectedSkills?: string[];
}

// Helper components for form fields (scoped to this file)
const InputField: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; required?: boolean; }> = ({ label, name, value, onChange, type = 'text', required = false }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{label}{required && ' *'}</label>
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border-2 border-transparent focus:border-[var(--primary)] focus:ring-[var(--primary)] focus:outline-none transition"
    />
  </div>
);

const SelectField: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: string[]; required?: boolean; }> = ({ label, name, value, onChange, options, required = false }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{label}{required && ' *'}</label>
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border-2 border-transparent focus:border-[var(--primary)] focus:ring-[var(--primary)] focus:outline-none transition"
    >
      <option value="" disabled>Select...</option>
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

// A helper function to get an emoji for each trait
const getTraitIcon = (framework: string, value: string): string => {
    const discMap: { [key: string]: string } = {
        'Dominance': '🦁', 'Influence': '🦦', 'Steadiness': '🕊️', 'Conscientiousness': '🦉'
    };
    const enneagramMap: { [key: string]: string } = {
        'Type 1': '✅', 'Type 2': '❤️', 'Type 3': '🏆', 'Type 4': '🎨', 'Type 5': '📚',
        'Type 6': '🛡️', 'Type 7': '🎉', 'Type 8': '💪', 'Type 9': '🕊️'
    };
    const temperamentMap: { [key: string]: string } = {
        'Sanguine': '😊', 'Choleric': '🔥', 'Melancholic': '🤔', 'Phlegmatic': '💧'
    };
    const socialStylesMap: { [key: string]: string } = {
        'Driver': '🚀', 'Amiable': '🤗', 'Analytical': '📊', 'Expressive': '🎭'
    };
     const intelligencesMap: { [key: string]: string } = {
        'Linguistic': '✍️', 'Logical-Mathematical': '🧮', 'Spatial': '🗺️',
        'Bodily-Kinesthetic': '🤸', 'Musical': '🎶', 'Interpersonal': '🤝',
        'Intrapersonal': '🧘', 'Naturalist': '🌿', 'Existential': '🌌'
    };

    switch (framework) {
        case 'disc':
            return discMap[value.split(' ')[0]] || '👤';
        case 'mbti':
            return '🧠';
        case 'enneagram':
            const typeKey = value.split(':')[0]; // "Type 1"
            return enneagramMap[typeKey] || '👤';
        case 'temperament':
            return temperamentMap[value] || '👤';
        case 'socialStyles':
            return socialStylesMap[value] || '👤';
        case 'multipleIntelligences':
            return intelligencesMap[value] || '🌟';
        default:
            return '👤';
    }
};

const TraitItem: React.FC<{ icon: string; label: string; value: string; }> = ({ icon, label, value }) => (
    <div className="bg-[var(--background)] p-3 rounded-lg">
        <p className="text-sm font-semibold text-[var(--muted)]">{label}</p>
        <p className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2 mt-1">
            <span>{icon}</span>
            <span className="truncate" title={value}>{value}</span>
        </p>
    </div>
);


const ProfilePage: React.FC<ProfilePageProps> = ({ userProfile, userResults, onProfileUpdate, selectedSkills }) => {
    const { profile: gamificationProfile } = useGamification();
    const { addToast } = useToast();

    const [editableProfile, setEditableProfile] = useState<UserProfile>(userProfile);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditableProfile(prev => ({
            ...prev,
            [name]: name === 'age' ? (value ? parseInt(value) : null) : value,
        }));
    };
    
    const handleSaveChanges = () => {
        onProfileUpdate(editableProfile);
        addToast('Profile updated successfully!', 'success');
    };
    
    return (
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto bg-[var(--background)]">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Profile Header */}
                <section className="bento-card flex flex-col sm:flex-row items-center gap-6">
                    <img
                        className="h-24 w-24 rounded-full border-4 border-[var(--primary)]"
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(editableProfile.name)}&background=7F5AF0&color=fff&bold=true&size=128`}
                        alt="User profile picture"
                    />
                    <div className="flex-1 text-center sm:text-left">
                        <h1 className="text-3xl font-bold text-[var(--foreground)]">{editableProfile.name}</h1>
                        <p className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]">{userResults.personalityType}</p>
                    </div>
                    <div className="flex gap-6 text-center">
                        <div>
                            <p className="text-sm font-semibold text-[var(--muted)]">LEVEL</p>
                            <p className="text-3xl font-bold text-[var(--primary)]">{gamificationProfile.level}</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-[var(--muted)]">POINTS</p>
                            <p className="text-3xl font-bold text-[var(--foreground)]">{gamificationProfile.points.toLocaleString()}</p>
                        </div>
                    </div>
                </section>
                
                {/* Personal Information */}
                <section className="bento-card">
                    <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">Personal Information</h2>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Full Name" name="name" value={editableProfile.name} onChange={handleChange} required />
                            <InputField label="Age" name="age" type="number" value={editableProfile.age?.toString() || ''} onChange={handleChange} required />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <SelectField label="Gender" name="gender" value={editableProfile.gender} onChange={handleChange} options={GENDERS} required />
                            <SelectField label="Race" name="race" value={editableProfile.race} onChange={handleChange} options={RACES} required />
                            <SelectField label="Religion" name="religion" value={editableProfile.religion} onChange={handleChange} options={RELIGIONS} required />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Current School Name" name="schoolName" value={editableProfile.schoolName} onChange={handleChange} required />
                            <SelectField label="State" name="state" value={editableProfile.state} onChange={handleChange} options={STATES} required />
                        </div>
                        <div className="pt-4 flex justify-end">
                            <button onClick={handleSaveChanges} className="bg-[var(--primary)] text-white font-bold py-2 px-6 rounded-full hover:opacity-90 transition">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </section>

                {/* Personality Summary */}
                <section className="bento-card">
                    <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">Personality Snapshot</h2>
                    
                    <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-6 mb-6 pb-6 border-b border-[var(--border)]">
                        <div className="flex-shrink-0">
                            <span className="text-6xl">{userResults.emoji}</span>
                        </div>
                        <div>
                            <p className="font-bold text-2xl text-[var(--foreground)]">{userResults.personalityType}</p>
                            <p className="text-[var(--muted)] mt-1">{userResults.overallSummary}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        <TraitItem icon={getTraitIcon('disc', userResults.studentProfile.disc.style)} label="DISC Style" value={userResults.studentProfile.disc.style} />
                        <TraitItem icon={getTraitIcon('mbti', userResults.studentProfile.mbti.type)} label="MBTI Type" value={userResults.studentProfile.mbti.type} />
                        <TraitItem icon={getTraitIcon('enneagram', userResults.studentProfile.enneagram.type)} label="Enneagram" value={userResults.studentProfile.enneagram.type} />
                        <TraitItem icon={getTraitIcon('temperament', userResults.studentProfile.temperament.type)} label="Temperament" value={userResults.studentProfile.temperament.type} />
                        <TraitItem icon={getTraitIcon('socialStyles', userResults.studentProfile.socialStyles.style)} label="Social Style" value={userResults.studentProfile.socialStyles.style} />
                        
                        <div className="bg-[var(--background)] p-3 rounded-lg col-span-2 sm:col-span-1 lg:col-span-3">
                            <p className="text-sm font-semibold text-[var(--muted)]">Top Intelligences</p>
                            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-1">
                                {userResults.studentProfile.multipleIntelligences.topIntelligences.map(intelligence => (
                                    <p key={intelligence} className="text-md font-bold text-[var(--foreground)] flex items-center gap-2">
                                        <span>{getTraitIcon('multipleIntelligences', intelligence)}</span>
                                        <span>{intelligence}</span>
                                    </p>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-[var(--border)]">
                        <h3 className="font-semibold text-[var(--foreground)] mb-2">Top Career Matches:</h3>
                        <div className="space-y-2">
                            {userResults.careerRecommendations.slice(0, 3).map(career => (
                                <div key={career.name} className="flex items-center gap-3 text-sm p-2 rounded-lg hover:bg-[var(--background)]">
                                    <span className="text-xl">{getCareerIcon(career.name)}</span>
                                    <span className="font-medium text-[var(--foreground)]">{career.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
                
                {/* SQ / IQ / EQ / Kinetic / Akhlak analysis + skill recommendations */}
                <HarmonyProfileSection
                    userProfile={userProfile}
                    userResults={userResults}
                    selectedSkills={selectedSkills}
                />

                {/* Account Settings */}
                 <section className="bento-card">
                    <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">Account Settings</h2>
                    <div className="space-y-4">
                        <button className="w-full text-left p-3 rounded-lg bg-[var(--background)] hover:bg-[var(--secondary)] transition font-medium">Change Email or Password</button>
                         <button className="w-full text-left p-3 rounded-lg bg-red-500/10 text-red-700 dark:text-red-300 hover:bg-red-500/20 transition font-medium">Delete Account</button>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default ProfilePage;