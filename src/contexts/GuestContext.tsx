'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import GoogleAuthService, { GuestInfo } from '../services/googleAuthService';

interface GuestContextType {
  guest: GuestInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => void;
}

const GuestContext = createContext<GuestContextType | undefined>(undefined);

export function GuestProvider({ children }: { children: React.ReactNode }) {
  const [guest, setGuest] = useState<GuestInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if guest is already logged in on mount
    const checkGuestAuth = async () => {
      try {
        const authService = GoogleAuthService.getInstance();
        
        if (authService.isAuthenticated()) {
          const currentGuest = await authService.getCurrentGuest();
          setGuest(currentGuest);
        }
      } catch (error) {
        console.error('Error checking guest auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkGuestAuth();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      const authService = GoogleAuthService.getInstance();
      const result = await authService.signInWithGoogle();
      
      // Update context state immediately after successful sign-in
      setGuest(result.guest);
      
      // Also update the service state
      authService.setGuestToken(result.token);
      authService.setGuestInfo(result.guest);
      
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    const authService = GoogleAuthService.getInstance();
    authService.signOut();
    setGuest(null);
  };

  const value: GuestContextType = {
    guest,
    isAuthenticated: !!guest,
    isLoading,
    signInWithGoogle,
    signOut,
  };

  return (
    <GuestContext.Provider value={value}>
      {children}
    </GuestContext.Provider>
  );
}

export function useGuest() {
  const context = useContext(GuestContext);
  if (context === undefined) {
    throw new Error('useGuest must be used within a GuestProvider');
  }
  return context;
}
