import React, { createContext, useState, useEffect, useContext } from "react";
import { auth, db } from "../firebase/config";
import {
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Monitorar mudanças no estado de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Funções de autenticação
  const login = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };

  const resetPassword = async (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  const updateUserProfile = async (profileData) => {
    if (!auth.currentUser) throw new Error("Nenhum usuário autenticado");
    return updateProfile(auth.currentUser, profileData);
  };

  // Inicializar dados do usuário no Firestore após o cadastro
  const initializeUserData = async (userId, initialData = {}) => {
    try {
      // Criar documento de usuário
      await setDoc(doc(db, "users", userId), {
        createdAt: new Date(),
        ...initialData,
      });

      // Inicializar documento de salário vazio
      await setDoc(doc(db, "salaries", userId), {
        defaultSalary: 0,
        monthlySalaries: {},
        salaryHistory: [],
        updatedAt: new Date(),
      });

      return true;
    } catch (error) {
      console.error("Erro ao inicializar dados do usuário:", error);
      throw error;
    }
  };

  const value = {
    currentUser,
    login,
    signup,
    logout,
    resetPassword,
    updateUserProfile,
    initializeUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
