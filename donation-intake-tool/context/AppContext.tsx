import React, { createContext, useContext, useState, useEffect } from 'react';
import { needs as seedNeeds, patients as seedPatients, Commitment, Need, Patient } from '../data/seed';

interface AppContextType {
  needs: Need[];
  patients: Patient[];
  commitments: Commitment[];
  lastDonation: { commitment: Commitment; need: Need; quantity: number } | null;
  addCommitment: (data: Omit<Commitment, 'id'>, quantity: number) => Commitment;
  fulfillNeed: (needId: string, qty: number) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [needs, setNeeds] = useState<Need[]>(seedNeeds);
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [lastDonation, setLastDonation] = useState<AppContextType['lastDonation']>(null);

  useEffect(() => {
    fetch('/api/needs')
      .then(r => r.json())
      .then((data: Need[]) => setNeeds(data))
      .catch(() => {/* keep seed data on failure */});
  }, []);

  const addCommitment = (data: Omit<Commitment, 'id'>, quantity: number): Commitment => {
    const commitment: Commitment = { ...data, id: `c_${Date.now()}` };
    const need = needs.find(n => n.id === data.needId)!;
    setCommitments(prev => [...prev, commitment]);
    setLastDonation({ commitment, need, quantity });
    return commitment;
  };

  const fulfillNeed = (needId: string, qty: number) => {
    // Optimistic update
    setNeeds(prev => prev.map(n =>
      n.id === needId
        ? { ...n, quantityFulfilled: Math.min(n.quantityFulfilled + qty, n.quantityNeeded) }
        : n
    ));
    // Persist to DB
    fetch(`/api/needs/${needId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qty }),
    }).then(r => r.json()).then((updated: Need) => {
      setNeeds(prev => prev.map(n => n.id === needId ? { ...n, ...updated } : n));
    }).catch(console.error);
  };

  return (
    <AppContext.Provider value={{ needs, patients: seedPatients, commitments, lastDonation, addCommitment, fulfillNeed }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
