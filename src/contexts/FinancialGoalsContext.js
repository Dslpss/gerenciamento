import React, { createContext, useContext, useState, useEffect } from "react";
import { db } from "../firebase/config";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { useAuth } from "./AuthContext";

const FinancialGoalsContext = createContext();

export const FinancialGoalsProvider = ({ children }) => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  // Carregar metas do Firebase
  useEffect(() => {
    if (!currentUser) return;

    const userRef = doc(db, "users", currentUser.uid);
    const goalsRef = collection(userRef, "financialGoals");
    const q = query(goalsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const goalsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGoals(goalsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Adicionar nova meta
  const addGoal = async (goalData) => {
    try {
      const userRef = doc(db, "users", currentUser.uid);
      const goalsRef = collection(userRef, "financialGoals");

      const newGoal = {
        ...goalData,
        progress: 0,
        createdAt: serverTimestamp(),
        userId: currentUser.uid,
        status: "active",
      };

      const docRef = await addDoc(goalsRef, newGoal);
      return docRef.id;
    } catch (error) {
      console.error("Erro ao adicionar meta:", error);
      throw error;
    }
  };

  // Atualizar meta existente
  const updateGoal = async (goalId, updates) => {
    try {
      const userRef = doc(db, "users", currentUser.uid);
      const goalRef = doc(collection(userRef, "financialGoals"), goalId);

      await updateDoc(goalRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Erro ao atualizar meta:", error);
      throw error;
    }
  };

  // Atualizar progresso da meta
  const updateGoalProgress = async (goalId, currentAmount) => {
    try {
      const userRef = doc(db, "users", currentUser.uid);
      const goalRef = doc(collection(userRef, "financialGoals"), goalId);

      const goal = goals.find((g) => g.id === goalId);
      if (!goal) return;

      const progress = (currentAmount / goal.targetAmount) * 100;

      await updateDoc(goalRef, {
        currentAmount,
        progress,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Erro ao atualizar progresso da meta:", error);
      throw error;
    }
  };

  // Remover meta
  const removeGoal = async (goalId) => {
    try {
      const userRef = doc(db, "users", currentUser.uid);
      const goalRef = doc(collection(userRef, "financialGoals"), goalId);
      await deleteDoc(goalRef);
    } catch (error) {
      console.error("Erro ao remover meta:", error);
      throw error;
    }
  };

  // Calcular progresso da meta
  const calculateGoalProgress = (goalId, currentAmount) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return 0;
    return (currentAmount / goal.targetAmount) * 100;
  };

  const value = {
    goals,
    loading,
    addGoal,
    updateGoal,
    removeGoal,
    calculateGoalProgress,
    updateGoalProgress,
  };

  return (
    <FinancialGoalsContext.Provider value={value}>
      {children}
    </FinancialGoalsContext.Provider>
  );
};

export const useFinancialGoals = () => useContext(FinancialGoalsContext);
