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
        console.log('GuestContext: Checking guest authentication...');
        const authService = GoogleAuthService.getInstance();
        console.log('GuestContext: Auth service instance:', authService);
        console.log('GuestContext: Is authenticated:', authService.isAuthenticated());
        
        if (authService.isAuthenticated()) {
          console.log('GuestContext: Guest is authenticated, fetching current guest...');
          const currentGuest = await authService.getCurrentGuest();
          console.log('GuestContext: Current guest:', currentGuest);
          setGuest(currentGuest);
        } else {
          console.log('GuestContext: Guest is not authenticated');
        }
      } catch (error) {
        console.error('GuestContext: Error checking guest auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkGuestAuth();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      console.log('GuestContext: Starting Google sign-in...');
      const authService = GoogleAuthService.getInstance();
      const result = await authService.signInWithGoogle();
      console.log('GuestContext: Google sign-in result:', result);
      
      // Update context state immediately after successful sign-in
      setGuest(result.guest);
      console.log('GuestContext: Guest state updated:', result.guest);
      
      // Also update the service state
      authService.setGuestToken(result.token);
      authService.setGuestInfo(result.guest);
      console.log('GuestContext: Service state updated');
      
    } catch (error) {
      console.error('GuestContext: Google sign-in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    console.log('GuestContext: Signing out...');
    const authService = GoogleAuthService.getInstance();
    authService.signOut();
    setGuest(null);
    console.log('GuestContext: Sign out completed');
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
