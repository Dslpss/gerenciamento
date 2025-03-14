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
  const [salaryAdvances, setSalaryAdvances] = useState([]);

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

  // Carregar vales
  useEffect(() => {
    if (!currentUser) return;

    const userRef = doc(db, "users", currentUser.uid);
    const advancesRef = collection(userRef, "salaryAdvances");
    const q = query(advancesRef, orderBy("requestedAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const advances = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSalaryAdvances(advances);
        console.log("Vales carregados:", advances);
      },
      (error) => {
        console.error("Erro ao carregar vales:", error);
      }
    );

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

  // Adicionar vale/adiantamento
  const addSalaryAdvance = async (advanceData) => {
    try {
      const userRef = doc(db, "users", currentUser.uid);
      const advanceRef = collection(userRef, "salaryAdvances");

      // Corrigir problema com a data
      let dateToUse = new Date(advanceData.expectedDate);

      // Manter a data exata como inserida pelo usuário
      const newAdvance = {
        ...advanceData,
        createdAt: serverTimestamp(),
        userId: currentUser.uid,
        status: "pending",
        // Salvar a data como uma string no formato YYYY-MM-DD para evitar problemas de fuso horário
        expectedDate: dateToUse.toISOString().split("T")[0],
        requestedAt: serverTimestamp(),
      };

      const docRef = await addDoc(advanceRef, newAdvance);
      return docRef.id;
    } catch (error) {
      console.error("Erro ao adicionar vale:", error);
      throw error;
    }
  };

  // Confirmar recebimento do vale
  const confirmSalaryAdvance = async (advanceId) => {
    try {
      const userRef = doc(db, "users", currentUser.uid);
      const advanceRef = doc(collection(userRef, "salaryAdvances"), advanceId);

      const advance = salaryAdvances.find((adv) => adv.id === advanceId);
      if (!advance) return;

      // Criar uma data local em formato string para evitar problemas de fuso horário
      const now = new Date();
      const localDateStr = now.toISOString().split("T")[0]; // YYYY-MM-DD

      await updateDoc(advanceRef, {
        status: "received",
        receivedAt: localDateStr,
      });

      const salaryDeductionsRef = collection(userRef, "salaryDeductions");
      await addDoc(salaryDeductionsRef, {
        amount: advance.amount,
        type: "salaryAdvance",
        description: "Vale salarial",
        date: localDateStr,
        advanceId: advanceId,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Erro ao confirmar vale:", error);
      throw error;
    }
  };

  // Adicionar função para atualizar vale
  const updateSalaryAdvance = async (advanceId, updates) => {
    try {
      const userRef = doc(db, "users", currentUser.uid);
      const advanceRef = doc(collection(userRef, "salaryAdvances"), advanceId);

      await updateDoc(advanceRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Erro ao atualizar vale:", error);
      throw error;
    }
  };

  // Adicionar função para excluir vale
  const deleteSalaryAdvance = async (advanceId) => {
    try {
      const userRef = doc(db, "users", currentUser.uid);
      const advanceRef = doc(collection(userRef, "salaryAdvances"), advanceId);
      await deleteDoc(advanceRef);
    } catch (error) {
      console.error("Erro ao excluir vale:", error);
      throw error;
    }
  };

  // Adicionar função para remover dedução salarial
  const removeSalaryDeduction = async (deductionId) => {
    try {
      const userRef = doc(db, "users", currentUser.uid);
      const deductionRef = doc(
        collection(userRef, "salaryDeductions"),
        deductionId
      );
      await deleteDoc(deductionRef);
    } catch (error) {
      console.error("Erro ao remover dedução:", error);
      throw error;
    }
  };

  const value = {
    goals,
    loading,
    addGoal,
    updateGoal,
    removeGoal,
    calculateGoalProgress,
    updateGoalProgress,
    salaryAdvances,
    addSalaryAdvance,
    confirmSalaryAdvance,
    updateSalaryAdvance,
    deleteSalaryAdvance,
    removeSalaryDeduction,
  };

  return (
    <FinancialGoalsContext.Provider value={value}>
      {children}
    </FinancialGoalsContext.Provider>
  );
};

export const useFinancialGoals = () => useContext(FinancialGoalsContext);
