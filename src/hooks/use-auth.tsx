import {
  createContext, useContext, useState, useEffect, type ReactNode,
} from "react";
import {
  auth, googleProvider, db,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  firebaseSignOut,
  onAuthStateChanged,
  saveUserProfile,
  getUserProfile,
  type UserProfile,
  type User,
} from "@/lib/firebase";
import { OAuthProvider } from "firebase/auth";

export type { UserProfile };

type AuthContextType = {
  firebaseUser: User | null;
  profile: UserProfile | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  needsOnboarding: boolean;
  signUpWithEmail: (email: string, password: string) => Promise<string | null>;
  signInWithEmail: (email: string, password: string) => Promise<string | null>;
  signInWithGoogle: () => Promise<string | null>;
  signInWithApple: () => Promise<string | null>;
  signOut: () => Promise<void>;
  completeOnboarding: (data: { name: string; phone: string; address: string }) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        const p = await getUserProfile(user.uid);
        setProfile(p);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });
    return unsub;
  }, []);

  const signUpWithEmail = async (email: string, password: string): Promise<string | null> => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      // Create bare profile — onboarding will fill the rest
      await saveUserProfile(cred.user.uid, {
        uid: cred.user.uid,
        email: cred.user.email || email,
        name: "",
        phone: "",
        address: "",
        onboardingComplete: false,
      });
      return null;
    } catch (e: any) {
      return friendlyError(e.code);
    }
  };

  const signInWithEmail = async (email: string, password: string): Promise<string | null> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return null;
    } catch (e: any) {
      return friendlyError(e.code);
    }
  };

  const signInWithGoogle = async (): Promise<string | null> => {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const existing = await getUserProfile(cred.user.uid);
      if (!existing) {
        await saveUserProfile(cred.user.uid, {
          uid: cred.user.uid,
          email: cred.user.email || "",
          name: cred.user.displayName || "",
          phone: "",
          address: "",
          onboardingComplete: false,
        });
      }
      return null;
    } catch (e: any) {
      return friendlyError(e.code);
    }
  };

  const signInWithApple = async (): Promise<string | null> => {
    try {
      const appleProvider = new OAuthProvider("apple.com");
      appleProvider.addScope("email");
      appleProvider.addScope("name");
      const cred = await signInWithPopup(auth, appleProvider);
      const existing = await getUserProfile(cred.user.uid);
      if (!existing) {
        await saveUserProfile(cred.user.uid, {
          uid: cred.user.uid,
          email: cred.user.email || "",
          name: cred.user.displayName || "",
          phone: "",
          address: "",
          onboardingComplete: false,
        });
      }
      return null;
    } catch (e: any) {
      return friendlyError(e.code);
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setProfile(null);
  };

  const completeOnboarding = async (data: { name: string; phone: string; address: string }) => {
    if (!firebaseUser) return;
    const updated: Partial<UserProfile> = { ...data, onboardingComplete: true };
    await saveUserProfile(firebaseUser.uid, updated);
    setProfile((p) => p ? { ...p, ...updated } : null);
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!firebaseUser) return;
    await saveUserProfile(firebaseUser.uid, data);
    setProfile((p) => p ? { ...p, ...data } : null);
  };

  const needsOnboarding = !!firebaseUser && profile !== null && !profile.onboardingComplete;

  return (
    <AuthContext.Provider value={{
      firebaseUser, profile, isLoggedIn: !!firebaseUser, isLoading,
      needsOnboarding, signUpWithEmail, signInWithEmail, signInWithGoogle,
      signInWithApple, signOut, completeOnboarding, updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

function friendlyError(code: string): string {
  switch (code) {
    case "auth/email-already-in-use": return "An account with this email already exists.";
    case "auth/invalid-email": return "Please enter a valid email address.";
    case "auth/weak-password": return "Password must be at least 6 characters.";
    case "auth/user-not-found": return "No account found with this email.";
    case "auth/wrong-password": return "Incorrect password. Please try again.";
    case "auth/invalid-credential": return "Incorrect email or password.";
    case "auth/popup-closed-by-user": return "Sign-in was cancelled.";
    case "auth/cancelled-popup-request": return "Sign-in was cancelled.";
    case "auth/network-request-failed": return "Network error. Please check your connection.";
    default: return "Something went wrong. Please try again.";
  }
}
