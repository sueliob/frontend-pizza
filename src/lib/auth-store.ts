// 🔐 Simple Token-based Authentication Store
interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isLoggedIn: boolean;
}

class AuthStore {
  private static STORAGE_KEY = 'admin_token';

  // Check if string is a valid JWT format
  private static isJWT(str: string): boolean {
    return /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(str);
  }

  // Get current auth state from localStorage
  static getState(): AuthState {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        return { token: null, user: null, isLoggedIn: false };
      }

      // Try to parse as JSON first
      try {
        const parsed = JSON.parse(stored);
        
        // Validate structure
        if (parsed && typeof parsed === 'object' && parsed.token) {
          return {
            token: parsed.token || null,
            user: parsed.user || null,
            isLoggedIn: !!(parsed.token && parsed.user)
          };
        }
      } catch {
        // If JSON parse fails, check if it's a raw JWT token
        if (this.isJWT(stored)) {
          console.warn('🔧 Migrating raw JWT token to proper JSON format');
          // Auto-migrate: convert raw JWT to proper JSON structure
          const migrated = { token: stored, user: null };
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(migrated));
          return {
            token: stored,
            user: null,
            isLoggedIn: false // User needs to login again to get user info
          };
        }
        
        // Invalid data - clear it
        console.warn('🗑️ Clearing invalid auth data from localStorage');
        this.clearState();
      }
    } catch (error) {
      console.error('Error reading auth state:', error);
      this.clearState();
    }
    
    return { token: null, user: null, isLoggedIn: false };
  }

  // Save auth state to localStorage
  static setState(token: string, user: AuthUser) {
    const authState = { token, user };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(authState));
  }

  // Clear auth state
  static clearState() {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Get token for Authorization header
  static getToken(): string | null {
    return this.getState().token;
  }

  // Get current user
  static getUser(): AuthUser | null {
    return this.getState().user;
  }

  // Check if user is logged in
  static isLoggedIn(): boolean {
    return this.getState().isLoggedIn;
  }
}

export { AuthStore };
export type { AuthUser, AuthState };