import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: string;
  phoneNumber?: string | null;
  photoURL?: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const mapFirebaseUser = (firebaseUser: {
    uid: string;
    email: string | null;
    displayName: string | null;
    phoneNumber: string | null;
    photoURL: string | null;
  }): User => ({
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    role: firebaseUser.email === 'damarakeswarg1999@gmail.com' ? 'admin' : 'user',
    phoneNumber: firebaseUser.phoneNumber,
    photoURL: firebaseUser.photoURL,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const baseUser = mapFirebaseUser(firebaseUser);
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userRef);

          if (!userDoc.exists()) {
            await setDoc(userRef, {
              email: baseUser.email,
              displayName: baseUser.displayName,
              role: baseUser.role,
              phoneNumber: baseUser.phoneNumber,
              photoURL: baseUser.photoURL,
              createdAt: new Date().toISOString(),
            });
            setUser(baseUser);
          } else {
            const dbUser = userDoc.data();
            setUser({
              ...baseUser,
              ...dbUser,
              uid: firebaseUser.uid,
              role: dbUser.role || baseUser.role,
            } as User);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth state sync failed:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
