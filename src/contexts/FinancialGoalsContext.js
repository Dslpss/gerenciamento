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
  getDocs,
} from "firebase/firestore";
import { useAuth } from "./AuthContext";
import logger from "../utils/logger"; // Adicionar importação do logger

const FinancialGoalsContext = createContext();

export const FinancialGoalsProvider = ({ children }) => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const [salaryAdvances, setSalaryAdvances] = useState([]);
  const [vales, setVales] = useState([]); // Adicionar estado para vales

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

      const newAdvance = {
        ...advanceData,
        createdAt: serverTimestamp(),
        userId: currentUser.uid,
        status: "pending",
        expectedDate: advanceData.expectedDate || null,
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

      // Buscar o vale atual
      const advance = salaryAdvances.find((adv) => adv.id === advanceId);
      if (!advance) return;

      // Registrar a data de recebimento
      const receivedAt = serverTimestamp();

      // Atualizar o status do vale
      await updateDoc(advanceRef, {
        status: "received",
        receivedAt: receivedAt,
      });

      // Registrar a dedução do salário
      const salaryDeductionsRef = collection(userRef, "salaryDeductions");
      await addDoc(salaryDeductionsRef, {
        amount: advance.amount,
        type: "salaryAdvance",
        description: "Vale salarial",
        date: receivedAt,
        advanceId: advanceId,
        createdAt: receivedAt,
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

  const loadVales = async () => {
    if (!currentUser) return;

    try {
      const userRef = doc(db, "users", currentUser.uid);
      const valesRef = collection(userRef, "vales");
      const valesSnapshot = await getDocs(valesRef);

      const valesData = valesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      logger.debug("Dados atualizados"); // Log genérico sem informações sensíveis
      setVales(valesData);
    } catch (error) {
      logger.error("Erro ao carregar dados");
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
    vales, // Adicionar vales ao contexto
    loadVales, // Adicionar função de carregamento ao contexto
  };

  return (
    <FinancialGoalsContext.Provider value={value}>
      {children}
    </FinancialGoalsContext.Provider>
  );
};

export const useFinancialGoals = () => useContext(FinancialGoalsContext);
