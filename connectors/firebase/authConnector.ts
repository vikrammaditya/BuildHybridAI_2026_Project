// Connector for Firebase Authentication

export interface AuthUser {
  uid: string;
  isAnonymous: boolean;
  displayName?: string | null;
  email?: string | null;
}

export interface AuthPort {
  getCurrentUser(): AuthUser | null;
  initAnonymousAuth(): Promise<AuthUser>;
  signInWithGoogle(): Promise<AuthUser>;
  signOut(): Promise<void>;
  subscribeAuth(callback: (user: AuthUser | null) => void): () => void;
}

export class FirebaseAuthConnector implements AuthPort {
  private currentUser: AuthUser | null = null;
  private listeners: Set<(user: AuthUser | null) => void> = new Set();

  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  async initAnonymousAuth(): Promise<AuthUser> {
    if (this.currentUser) return this.currentUser;

    const guestId =
      typeof window !== "undefined" && window.localStorage
        ? window.localStorage.getItem("hybrid_guest_uid") || `guest-${Date.now().toString(36)}`
        : `guest-${Date.now().toString(36)}`;

    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem("hybrid_guest_uid", guestId);
    }

    const user: AuthUser = {
      uid: guestId,
      isAnonymous: true,
      displayName: "Guest Researcher",
    };

    this.currentUser = user;
    this.notify();
    return user;
  }

  async signInWithGoogle(): Promise<AuthUser> {
    const user: AuthUser = {
      uid: `google-${Date.now().toString(36)}`,
      isAnonymous: false,
      displayName: "Aditya Vikramm Singhal",
      email: "vikrammaditya05@gmail.com",
    };
    this.currentUser = user;
    this.notify();
    return user;
  }

  async signOut(): Promise<void> {
    this.currentUser = null;
    this.notify();
  }

  subscribeAuth(callback: (user: AuthUser | null) => void): () => void {
    this.listeners.add(callback);
    callback(this.currentUser);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notify(): void {
    this.listeners.forEach((cb) => cb(this.currentUser));
  }
}
