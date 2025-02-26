import React, { createContext, useState, useContext, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "./AuthContext";

const ExpenseContext = createContext();

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(Date.now()); // Estado para forçar re-renderização
  const { currentUser } = useAuth();

  useEffect(() => {
    let unsubscribe = () => {};

    if (currentUser) {
      try {
        // Referência à subcoleção de despesas do usuário
        const expensesRef = collection(
          db,
          "users",
          currentUser.uid,
          "expenses"
        );

        unsubscribe = onSnapshot(
          expensesRef,
          (snapshot) => {
            const expenseData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setExpenses(expenseData);
            setLastUpdate(Date.now()); // Atualiza o timestamp para forçar re-renderização
            setLoading(false);
          },
          (error) => {
            console.error("Erro ao carregar despesas:", error);
            setLoading(false);
          }
        );
      } catch (error) {
        console.error("Erro ao configurar listener:", error);
        setLoading(false);
      }
    } else {
      setExpenses([]);
      setLoading(false);
    }

    return () => unsubscribe();
  }, [currentUser]);

  const addExpense = async (expenseData) => {
    try {
      if (!currentUser) throw new Error("Usuário não autenticado");

      const expensesRef = collection(db, "users", currentUser.uid, "expenses");

      // Adicionar timestamp do servidor para garantir consistência
      const newExpenseData = {
        ...expenseData,
        createdAt: serverTimestamp(),
        userId: currentUser.uid,
      };

      const docRef = await addDoc(expensesRef, newExpenseData);

      // Atualizar o estado local imediatamente para feedback instantâneo
      const newExpense = {
        id: docRef.id,
        ...newExpenseData,
        createdAt: new Date().toISOString(), // Usar data local para preview até que o Firestore sincronize
      };

      // Atualizar estado local para interface responder imediatamente
      setExpenses((currentExpenses) => [...currentExpenses, newExpense]);
      setLastUpdate(Date.now());

      return docRef;
    } catch (error) {
      console.error("Erro ao adicionar despesa:", error);
      throw error;
    }
  };

  const updateExpense = async (id, updatedData) => {
    try {
      if (!currentUser) throw new Error("Usuário não autenticado");

      const expenseRef = doc(db, "users", currentUser.uid, "expenses", id);

      // Adicionar timestamp de atualização
      const dataWithTimestamp = {
        ...updatedData,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(expenseRef, dataWithTimestamp);

      // Atualizar estado local imediatamente
      setExpenses((currentExpenses) =>
        currentExpenses.map((expense) =>
          expense.id === id
            ? {
                ...expense,
                ...updatedData,
                updatedAt: new Date().toISOString(),
              }
            : expense
        )
      );
      setLastUpdate(Date.now());
    } catch (error) {
      console.error("Erro ao atualizar despesa:", error);
      throw error;
    }
  };

  const deleteExpense = async (id) => {
    try {
      if (!currentUser) throw new Error("Usuário não autenticado");

      const expenseRef = doc(db, "users", currentUser.uid, "expenses", id);
      await deleteDoc(expenseRef);

      // Atualizar estado local imediatamente
      setExpenses((currentExpenses) =>
        currentExpenses.filter((expense) => expense.id !== id)
      );
      setLastUpdate(Date.now());
    } catch (error) {
      console.error("Erro ao excluir despesa:", error);
      throw error;
    }
  };

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        loading,
        lastUpdate,
        addExpense,
        updateExpense,
        deleteExpense,
      }}>
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => useContext(ExpenseContext);
