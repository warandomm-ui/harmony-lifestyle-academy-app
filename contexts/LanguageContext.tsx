import React, { createContext, useContext, useState } from 'react';

export type Lang = 'ms' | 'en';

export const translations = {
  ms: {
    // Language selector
    welcome: 'Selamat Datang ke Harmony Lifestyle Academy',
    tagline: 'Akademi Kemahiran Hidup untuk Pelajar 7-17 Tahun',
    choose: 'Pilih Bahasa Anda',
    continue: 'Teruskan',
    student: 'Saya Pelajar',
    parent: 'Saya Ibu Bapa',
    // Auth
    memberPortal: 'Portal Ahli',
    joinAcademy: 'Sertai Akademi',
    passwordRecovery: 'Pemulihan Kata Laluan',
    welcomeBack: 'Selamat Datang Semula',
    beginJourney: 'Mulakan Perjalanan Anda',
    resetPassword: 'Tetapkan Semula Kata Laluan Anda',
    signInSubtitle: 'Log masuk untuk meneruskan perjalanan pertumbuhan anda.',
    registerSubtitle: 'Buat akaun anda dan mula berubah hari ini.',
    forgotSubtitle: 'Masukkan e-mel anda dan kami akan menghantar pautan tetapan semula.',
    fullName: 'Nama Penuh',
    emailAddress: 'Alamat E-mel',
    password: 'Kata Laluan',
    forgotPassword: 'Lupa kata laluan?',
    sendResetLink: 'Hantar Pautan Tetapan Semula',
    signIn: 'Log Masuk',
    orContinueWith: 'atau teruskan dengan',
    dontHaveAccount: 'Tiada akaun?',
    register: 'Daftar',
    alreadyMember: 'Sudah ahli?',
    backToSignIn: 'Kembali ke Log Masuk',
    rememberPassword: 'Ingat kata laluan anda?',
    // General
    loading: 'Memuatkan...',
    syncingRecords: 'Menyegerakkan Rekod Akademi...',
    // Onboarding
    analysisInProgress: 'Analisis Harmony sedang berjalan...',
    dbSyncFailed: 'Sinkronisasi gagal. Menggunakan storan tempatan.',
    analysisFailed: 'Maaf, analisis tidak berjaya. Sila cuba lagi.',
    // Footer
    allRightsReserved: 'Hak cipta terpelihara.',
    authenticatedReady: 'disahkan dan bersedia untuk peningkatan diri anda.',
  },
  en: {
    // Language selector
    welcome: 'Welcome to Harmony Lifestyle Academy',
    tagline: 'Life Skills Academy for Students Aged 7-17',
    choose: 'Choose Your Language',
    continue: 'Continue',
    student: "I'm a Student",
    parent: "I'm a Parent",
    // Auth
    memberPortal: 'Member Portal',
    joinAcademy: 'Join the Academy',
    passwordRecovery: 'Password Recovery',
    welcomeBack: 'Welcome Back',
    beginJourney: 'Begin Your Journey',
    resetPassword: 'Reset Your Password',
    signInSubtitle: 'Sign in to continue your path of growth.',
    registerSubtitle: 'Create your account and start transforming today.',
    forgotSubtitle: "Enter your email and we'll send you a reset link.",
    fullName: 'Full Name',
    emailAddress: 'Email Address',
    password: 'Password',
    forgotPassword: 'Forgot password?',
    sendResetLink: 'Send Reset Link',
    signIn: 'Sign In',
    orContinueWith: 'or continue with',
    dontHaveAccount: "Don't have an account?",
    register: 'Register',
    alreadyMember: 'Already a member?',
    backToSignIn: 'Back to Sign In',
    rememberPassword: 'Remember your password?',
    // General
    loading: 'Loading...',
    syncingRecords: 'Syncing Academy Records...',
    // Onboarding
    analysisInProgress: 'Harmony Analysis in Progress...',
    dbSyncFailed: 'Database sync failed. Using local storage instead.',
    analysisFailed: "Sorry, we couldn't analyze your results. Please try again.",
    // Footer
    allRightsReserved: 'All rights reserved.',
    authenticatedReady: 'authenticated and ready for your glow up.',
  },
} as const;

export type TranslationKey = keyof typeof translations['en'];

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: typeof translations['en'];
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem('hla_lang');
    return saved === 'ms' || saved === 'en' ? saved : 'ms';
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem('hla_lang', l);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextValue => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
