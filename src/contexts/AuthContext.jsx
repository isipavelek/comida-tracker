import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, hasFirebaseConfig } from '../lib/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Use mock if Firebase Env is missing
  const isMockMode = !hasFirebaseConfig;

  useEffect(() => {
    if (isMockMode) {
      console.warn("[AuthContext] No Firebase Setup detected. Using local storage mock mode.");
      const mockUser = JSON.parse(localStorage.getItem('mockUser'));
      if (mockUser) {
        setUser(mockUser);
        setProfile(mockUser.profile);
      }
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.uid);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [isMockMode]);

  const fetchProfile = async (userId) => {
    try {
      const docRef = doc(db, 'profiles', userId);
      const docSnap = await getDoc(docRef);
        
      if (docSnap.exists()) {
        setProfile({ id: userId, ...docSnap.data() });
      } else {
        console.warn("No profile found for user:", userId, "Using default patient profile.");
        setProfile({ id: userId, role: 'patient', full_name: 'Usuario sin Perfil' });
      }
    } catch (error) {
      console.error("Error fetching profile (Check Firestore Rules):", error);
      // Fallback on error so the app doesn't hang
      setProfile({ id: userId, role: 'patient', full_name: 'Error de Conexión' });
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    if (isMockMode) {
      // Simulate network
      await new Promise(r => setTimeout(r, 800));
      const role = email.includes('nutri') || email.includes('psico') ? 'professional' : 'patient';
      const mock = { 
        id: `mock-${Date.now()}`, 
        email, 
        uid: `mock-${Date.now()}`,
        profile: { role, full_name: 'Usuario Prueba', id: `mock-${Date.now()}` } 
      };
      localStorage.setItem('mockUser', JSON.stringify(mock));
      setUser(mock);
      setProfile(mock.profile);
      return { error: null };
    }
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { data: userCredential, error: null };
    } catch (error) {
      return { error };
    }
  };

  const signUp = async (email, password, role, fullName) => {
    if (isMockMode) {
      await new Promise(r => setTimeout(r, 800));
      const mock = { 
        id: `mock-${Date.now()}`, 
        email, 
        uid: `mock-${Date.now()}`,
        profile: { role, full_name: fullName, id: `mock-${Date.now()}` } 
      };
      localStorage.setItem('mockUser', JSON.stringify(mock));
      setUser(mock);
      setProfile(mock.profile);
      return { error: null };
    }
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Create user profile in Firestore
      await setDoc(doc(db, 'profiles', user.uid), {
        full_name: fullName,
        role: role,
        created_at: new Date().toISOString()
      });
      
      return { data: userCredential, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signOut = async () => {
    if (isMockMode) {
      localStorage.removeItem('mockUser');
      setUser(null);
      setProfile(null);
      return { error: null };
    }
    try {
      await firebaseSignOut(auth);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, isMockMode }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
