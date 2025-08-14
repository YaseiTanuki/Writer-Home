const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export interface GoogleAuthResponse {
  success: boolean;
  token: string;
  guest: {
    id: string;
    email: string;
    displayName: string;
    picture?: string;
    lastLogin: string;
  };
}

export interface GuestInfo {
  id: string;
  email: string;
  displayName: string;
  picture?: string;
  lastLogin: string;
}

class GoogleAuthService {
  private static instance: GoogleAuthService;
  private guestToken: string | null = null;
  private guestInfo: GuestInfo | null = null;

  private constructor() {
    // Load token from localStorage on initialization
    if (typeof window !== 'undefined') {
      this.guestToken = localStorage.getItem('guestToken');
      this.guestInfo = JSON.parse(localStorage.getItem('guestInfo') || 'null');
      console.log('GoogleAuthService: Constructor - Token:', this.guestToken ? 'exists' : 'null');
      console.log('GoogleAuthService: Constructor - Guest info:', this.guestInfo);
    }
  }

  public static getInstance(): GoogleAuthService {
    if (!GoogleAuthService.instance) {
      GoogleAuthService.instance = new GoogleAuthService();
    }
    return GoogleAuthService.instance;
  }

  public async signInWithGoogle(): Promise<GoogleAuthResponse> {
    return new Promise((resolve, reject) => {
      if (!GOOGLE_CLIENT_ID) {
        reject(new Error('Google Client ID not configured'));
        return;
      }

      console.log('Google OAuth: Starting sign-in process');
      console.log('Google OAuth: Client ID:', GOOGLE_CLIENT_ID);
      console.log('Google OAuth: Current origin:', window.location.origin);

      // Load Google Sign-In script
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        if (window.google) {
          console.log('Google OAuth: Script loaded successfully');
          
          // Create a temporary container for the button
          const tempContainer = document.createElement('div');
          tempContainer.id = 'google-signin-container';
          tempContainer.style.position = 'absolute';
          tempContainer.style.left = '-9999px';
          tempContainer.style.top = '-9999px';
          document.body.appendChild(tempContainer);

          // Initialize Google Sign-In
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: async (response: any) => {
              try {
                console.log('Google OAuth: Callback received');
                
                // Remove temporary container
                if (document.body.contains(tempContainer)) {
                  document.body.removeChild(tempContainer);
                }
                
                const result = await this.authenticateWithBackend(response.credential);
                resolve(result);
              } catch (error) {
                console.error('Google OAuth: Callback error:', error);
                
                // Remove temporary container on error too
                if (document.body.contains(tempContainer)) {
                  document.body.removeChild(tempContainer);
                }
                reject(error);
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true,
            prompt_parent_id: 'google-signin-container',
            use_fedcm_for_prompt: false, // Explicitly disable FedCM
          });

          console.log('Google OAuth: Initialized, rendering button');

          // Render the button to trigger popup
          window.google.accounts.id.renderButton(tempContainer, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left',
          });

          // Programmatically click the button to trigger popup
          setTimeout(() => {
            const button = tempContainer.querySelector('div[role="button"]');
            if (button) {
              console.log('Google OAuth: Button found, clicking...');
              (button as HTMLElement).click();
            } else {
              console.error('Google OAuth: Button not found');
              reject(new Error('Google Sign-In button not found'));
            }
          }, 100);

        } else {
          console.error('Google OAuth: Failed to load Google OAuth');
          reject(new Error('Failed to load Google OAuth'));
        }
      };

      script.onerror = (error) => {
        console.error('Google OAuth: Script load error:', error);
        reject(new Error('Failed to load Google OAuth script'));
      };

      document.head.appendChild(script);
    });
  }

  private async authenticateWithBackend(idToken: string): Promise<GoogleAuthResponse> {
    const response = await fetch('/api/auth/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Authentication failed');
    }

    return response.json();
  }

  public async getCurrentGuest(): Promise<GuestInfo | null> {
    console.log('GoogleAuthService: getCurrentGuest called, token:', this.guestToken ? 'exists' : 'null');
    if (!this.guestToken) {
      console.log('GoogleAuthService: No token, returning null');
      return null;
    }

    try {
      console.log('GoogleAuthService: Fetching guest info from API...');
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${this.guestToken}`,
        },
      });

      if (!response.ok) {
        console.log('GoogleAuthService: API response not ok, signing out');
        this.signOut();
        return null;
      }

      const result = await response.json();
      console.log('GoogleAuthService: API response:', result);
      this.guestInfo = result.guest;
      this.setGuestInfo(result.guest);
      return result.guest;
    } catch (error) {
      console.error('GoogleAuthService: Error fetching guest info:', error);
      this.signOut();
      return null;
    }
  }

  public getGuestToken(): string | null {
    console.log('GoogleAuthService: getGuestToken called, returning:', this.guestToken ? 'token exists' : 'null');
    return this.guestToken;
  }

  public getGuestInfo(): GuestInfo | null {
    console.log('GoogleAuthService: getGuestInfo called, returning:', this.guestInfo);
    return this.guestInfo;
  }

  public isAuthenticated(): boolean {
    const authenticated = !!this.guestToken;
    console.log('GoogleAuthService: isAuthenticated called, returning:', authenticated);
    return authenticated;
  }

  public setGuestToken(token: string): void {
    console.log('GoogleAuthService: setGuestToken called with:', token ? 'token exists' : 'null');
    this.guestToken = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('guestToken', token);
      console.log('GoogleAuthService: Token saved to localStorage');
    }
  }

  public setGuestInfo(guest: GuestInfo): void {
    console.log('GoogleAuthService: setGuestInfo called with:', guest);
    this.guestInfo = guest;
    if (typeof window !== 'undefined') {
      localStorage.setItem('guestInfo', JSON.stringify(guest));
      console.log('GoogleAuthService: Guest info saved to localStorage');
    }
  }

  public signOut(): void {
    console.log('GoogleAuthService: signOut called');
    this.guestToken = null;
    this.guestInfo = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('guestToken');
      localStorage.removeItem('guestInfo');
      console.log('GoogleAuthService: Token and guest info removed from localStorage');
    }
  }
}

// Add Google types to window
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, options: any) => void;
        };
      };
    };
  }
}

export default GoogleAuthService;
