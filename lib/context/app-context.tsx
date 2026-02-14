"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AppContextType {
  tenantId: string | null;
  unitId: string | null;
  unitName: string | null;
  setTenant: (tenantId: string) => void;
  setUnit: (unitId: string, unitName: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const TENANT_KEY = "cantina:tenantId";
const UNIT_KEY = "cantina:unitId";
const UNIT_NAME_KEY = "cantina:unitName";

export function AppProvider({ children }: { children: ReactNode }) {
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [unitId, setUnitId] = useState<string | null>(null);
  const [unitName, setUnitName] = useState<string | null>(null);

  useEffect(() => {
    // Load from localStorage on mount
    const storedTenant = localStorage.getItem(TENANT_KEY);
    const storedUnit = localStorage.getItem(UNIT_KEY);
    const storedUnitName = localStorage.getItem(UNIT_NAME_KEY);

    if (storedTenant) setTenantId(storedTenant);
    if (storedUnit) setUnitId(storedUnit);
    if (storedUnitName) setUnitName(storedUnitName);
  }, []);

  const setTenant = (id: string) => {
    setTenantId(id);
    localStorage.setItem(TENANT_KEY, id);
  };

  const setUnit = (id: string, name: string) => {
    setUnitId(id);
    setUnitName(name);
    localStorage.setItem(UNIT_KEY, id);
    localStorage.setItem(UNIT_NAME_KEY, name);
  };

  return (
    <AppContext.Provider value={{ tenantId, unitId, unitName, setTenant, setUnit }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
