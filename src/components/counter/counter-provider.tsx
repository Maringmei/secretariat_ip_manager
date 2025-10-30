
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/api';

export interface CountData {
  highlight: boolean;
  count: number;
}

export interface Counts {
  new?: CountData;
  pending_approval?: CountData;
  approved?: CountData;
  ready?: CountData;
  closed?: CountData;
  re_opened?: CountData;
  rejected?: CountData;
  my_pending?: CountData;
  my_approved?: CountData;
  my_rejected?: CountData;
  my_ready?: CountData;
  my_closed?: CountData;
  e_office_new?: CountData;
  e_office_in_progress?: CountData;
  e_office_engineer_assigned?: CountData;
  e_office_closed?: CountData;
  e_office_re_opened?: CountData;

  [key: string]: CountData | undefined;
}


interface CounterContextType {
  counts: Counts;
  refreshCounts: () => void;
}

const CounterContext = createContext<CounterContextType | undefined>(undefined);

export function CounterProvider({ children }: { children: ReactNode }) {
  const [counts, setCounts] = useState<Counts>({});
  const { token, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const fetchCounts = async () => {
    if (!token || !isAuthenticated) return;

    try {
      const response = await fetch(`${API_BASE_URL}/counts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.success && result.data) {
        setCounts(result.data);
      } else {
        // Don't show a toast for background refresh failures
        console.error("Failed to fetch sidebar counts:", result.message);
      }
    } catch (error) {
      console.error("Error fetching sidebar counts:", error);
    }
  };

  useEffect(() => {
    fetchCounts();
    
    // Refresh counts every 30 seconds
    const intervalId = setInterval(fetchCounts, 30000);

    return () => clearInterval(intervalId);
  }, [token, isAuthenticated]);


  const refreshCounts = () => {
    fetchCounts();
  };

  return (
    <CounterContext.Provider value={{ counts, refreshCounts }}>
      {children}
    </CounterContext.Provider>
  );
}

export function useCounter() {
  const context = useContext(CounterContext);
  if (context === undefined) {
    throw new Error('useCounter must be used within a CounterProvider');
  }
  return context;
}
