
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { UserProfile } from '../types';
import { GENDERS, RACES, RELIGIONS, STATES } from '../constants';

interface PersonalInfoStepProps {
  onComplete: (profile: UserProfile) => void;
  onSkip: () => void;
}

// 1. Define Zod Schema for Validation
const personalInfoSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  age: z.number({ invalid_type_error: "Age is required" }).min(5, "Age must be valid").max(100, "Age must be valid"),
  gender: z.string().min(1, "Please select a gender"),
  race: z.string().min(1, "Please select a race"),
  religion: z.string().min(1, "Please select a religion"),
  schoolName: z.string().min(2, "School name is required"),
  state: z.string().min(1, "Please select a state"),
  country: z.string().min(1, "Country is required"),
  // Optional fields that exist in UserProfile but might not be in this specific form step
  email: z.string().email().optional().or(z.literal('')),
  role: z.enum(['student', 'admin', 'instructor']).optional(),
  timezone: z.string().optional(),
});

type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;

const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({ onComplete, onSkip }) => {
  // 2. Initialize React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
    mode: 'onChange', // Validate on change for immediate feedback
    defaultValues: {
      country: 'Malaysia',
      name: '',
      gender: '',
      race: '',
      religion: '',
      schoolName: '',
      state: '',
    },
  });

  const onSubmit = (data: PersonalInfoFormData) => {
    // Cast to UserProfile since the schema ensures structure matches required fields
    onComplete(data as UserProfile);
  };

  return (
    <div className="animate-fade-in text-center">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">Tell Us a Bit About Yourself</h2>
      <p className="text-[var(--muted)] mt-2">This helps us personalize your experience. (Optional)</p>
      
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 text-left space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField 
            label="Full Name" 
            {...register("name")} 
            error={errors.name?.message} 
            required 
          />
          <InputField 
            label="Age" 
            type="number" 
            {...register("age", { valueAsNumber: true })} 
            error={errors.age?.message} 
            required 
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SelectField 
            label="Gender" 
            {...register("gender")} 
            options={GENDERS} 
            error={errors.gender?.message} 
            required 
          />
          <SelectField 
            label="Race" 
            {...register("race")} 
            options={RACES} 
            error={errors.race?.message} 
            required 
          />
          <SelectField 
            label="Religion" 
            {...register("religion")} 
            options={RELIGIONS} 
            error={errors.religion?.message} 
            required 
          />
        </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField 
            label="Current School Name" 
            {...register("schoolName")} 
            error={errors.schoolName?.message} 
            required 
          />
          <SelectField 
            label="State" 
            {...register("state")} 
            options={STATES} 
            error={errors.state?.message} 
            required 
          />
        </div>
         <div className="grid grid-cols-1">
          <InputField 
            label="Country" 
            {...register("country")} 
            error={errors.country?.message} 
            required 
          />
        </div>

        <div className="text-center mt-10 pt-6 border-t dark:border-gray-700 flex items-center justify-center gap-6">
          <button type="button" onClick={onSkip} className="text-gray-500 dark:text-gray-400 font-medium hover:underline focus:outline-none">
            Skip for now
          </button>
          <button
            type="submit"
            disabled={!isValid}
            className="bg-green-600 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed dark:disabled:bg-gray-600 enabled:hover:bg-green-700 enabled:hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
          >
            Next
          </button>
        </div>
      </form>
    </div>
  );
};

// --- Refactored Helper Components to support React Hook Form ---

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
}

const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, required, className = '', ...props }, ref) => (
    <div className={className}>
      <label htmlFor={props.name} className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
        {label}{required && ' *'}
      </label>
      <input
        ref={ref}
        id={props.name}
        className={`w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border-2 focus:outline-none transition ${
          error 
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
            : 'border-transparent focus:border-green-500 focus:ring-green-500'
        }`}
        {...props}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
);
InputField.displayName = "InputField";

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: string[];
  error?: string;
  required?: boolean;
}

const SelectField = React.forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, options, error, required, ...props }, ref) => (
    <div>
      <label htmlFor={props.name} className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
        {label}{required && ' *'}
      </label>
      <select
        ref={ref}
        id={props.name}
        className={`w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border-2 focus:outline-none transition ${
          error 
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
            : 'border-transparent focus:border-green-500 focus:ring-green-500'
        }`}
        {...props}
      >
        <option value="" disabled>Select...</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
);
SelectField.displayName = "SelectField";

export default PersonalInfoStep;
