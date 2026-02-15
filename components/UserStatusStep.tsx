

import React, { useState } from 'react';
import type { UserStatus, EducationLevel, SchoolType, TimeAvailability, LearningPreference, LearningMethod } from '../types';
import { EDUCATION_LEVELS, SCHOOL_TYPES, TIME_AVAILABILITY_OPTIONS, LEARNING_PREFERENCES, LEARNING_METHODS_OPTIONS } from '../constants';

interface UserStatusStepProps {
  onComplete: (status: UserStatus) => void;
}

const UserStatusStep: React.FC<UserStatusStepProps> = ({ onComplete }) => {
  const [status, setStatus] = useState<UserStatus>({
    educationLevel: null,
    schoolType: null,
    timeAvailability: null,
    learningPreferences: [],
    learningMethods: [], // Initialize new field
  });

  const handlePreferenceToggle = (pref: LearningPreference) => {
    setStatus(prev => {
      const newPrefs = new Set(prev.learningPreferences);
      if (newPrefs.has(pref)) {
        newPrefs.delete(pref);
      } else {
        newPrefs.add(pref);
      }
      return { ...prev, learningPreferences: Array.from(newPrefs) };
    });
  };

  const handleLearningMethodToggle = (method: LearningMethod) => {
    setStatus(prev => {
      const newMethods = new Set(prev.learningMethods);
      if (newMethods.has(method)) {
        newMethods.delete(method);
      } else {
        newMethods.add(method);
      }
      return { ...prev, learningMethods: Array.from(newMethods) };
    });
  };

  const isComplete = status.educationLevel && status.schoolType && status.timeAvailability && status.learningPreferences.length > 0 && status.learningMethods.length > 0;

  const handleSubmit = () => {
    if (isComplete) {
      onComplete(status);
    }
  };

  return (
    <div className="animate-fade-in space-y-8">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">Almost done!</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">This helps us customize your experience.</p>
      </div>

      <div className="space-y-6">
        <RadioGroup
          label="Form Level"
          options={EDUCATION_LEVELS}
          selectedValue={status.educationLevel}
          onChange={value => setStatus(prev => ({ ...prev, educationLevel: value as EducationLevel }))}
        />
        <RadioGroup
          label="School Type"
          options={SCHOOL_TYPES}
          selectedValue={status.schoolType}
          onChange={value => setStatus(prev => ({ ...prev, schoolType: value as SchoolType }))}
        />
        <RadioGroup
          label="How much time can you dedicate weekly?"
          options={TIME_AVAILABILITY_OPTIONS.map(o => o.label)}
          values={TIME_AVAILABILITY_OPTIONS.map(o => o.value)}
          selectedValue={status.timeAvailability}
          onChange={value => setStatus(prev => ({ ...prev, timeAvailability: value as TimeAvailability }))}
        />
        <CheckboxGroup<LearningPreference> // Explicitly type for LearningPreference
          label="Learning Preference"
          options={LEARNING_PREFERENCES}
          selectedValues={status.learningPreferences}
          onChange={handlePreferenceToggle}
        />
        <CheckboxGroup<LearningMethod> // New: CheckboxGroup for Learning Methods
          label="Preferred Learning Methods"
          options={LEARNING_METHODS_OPTIONS}
          selectedValues={status.learningMethods}
          onChange={handleLearningMethodToggle}
        />
      </div>

      <div className="text-center pt-6 border-t dark:border-gray-700">
        <button
          onClick={handleSubmit}
          disabled={!isComplete}
          className="bg-green-600 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed dark:disabled:bg-gray-600 enabled:hover:bg-green-700 enabled:hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
        >
          Finish
        </button>
      </div>
    </div>
  );
};

// Reusable Radio Group Component
const RadioGroup = ({ label, options, selectedValue, onChange, values }: { label: string, options: string[], selectedValue: string | null, onChange: (value: string) => void, values?: string[] }) => (
  <div>
    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3">{label}</h3>
    <div className="flex flex-wrap gap-3">
      {options.map((option, index) => {
        const value = values ? values[index] : option;
        const isSelected = selectedValue === value;
        return (
          <button
            key={value}
            onClick={() => onChange(value)}
            className={`px-4 py-2 rounded-full border-2 text-sm font-semibold transition-all duration-200
              ${isSelected
                ? 'bg-green-600 border-green-600 text-white'
                : 'bg-white text-gray-700 border-gray-300 hover:border-green-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:border-green-500'
              }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  </div>
);

// Reusable Checkbox Group Component
interface CheckboxGroupProps<T extends string> {
  label: string;
  options: (T | { label: string; value: T })[];
  selectedValues: T[];
  onChange: (value: T) => void;
}

const CheckboxGroup = <T extends string>({ label, options, selectedValues, onChange }: CheckboxGroupProps<T>) => (
  <div>
    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3">{label}</h3>
    <div className="space-y-3">
      {options.map(option => {
        const value = typeof option === 'string' ? option : option.value;
        const displayLabel = typeof option === 'string' ? option : option.label;
        const isSelected = selectedValues.includes(value);
        return (
          <label key={value} className="flex items-center p-3 rounded-lg border-2 cursor-pointer transition-colors duration-200 bg-white dark:bg-gray-700 has-[:checked]:bg-green-50 has-[:checked]:border-green-500 dark:has-[:checked]:bg-green-500/10 dark:has-[:checked]:border-green-500 border-gray-200 dark:border-gray-600">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onChange(value)}
              className="w-5 h-5 accent-green-600"
            />
            <span className="ml-3 font-medium text-gray-700 dark:text-gray-200">{displayLabel}</span>
          </label>
        );
      })}
    </div>
  </div>
);

export default UserStatusStep;