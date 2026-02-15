import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import type { AdminRole } from '../types';

interface AdminContextType {
  isAdminMode: boolean;
  adminRole: AdminRole | null;
  toggleAdminMode: () => void;
  setAdminRole: (role: AdminRole | null) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [adminRole, setAdminRole] = useState<AdminRole | null>(null);

  const isAdminMode = adminRole !== null;

  const toggleAdminMode = useCallback(() => {
    setAdminRole(prev => (prev === null ? 'admin' : null));
  }, []);

  return (
    <AdminContext.Provider value={{ isAdminMode, adminRole, toggleAdminMode, setAdminRole }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = (): AdminContextType => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within a AdminProvider');
  }
  return context;
};