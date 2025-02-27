import React, { createContext, useState, useContext, useEffect } from "react";
// Corrigir a importação do Firestore
import { db } from "../firebase/config"; // Ajustado para importar do arquivo correto
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
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const { currentUser } = useAuth();

  useEffect(() => {
    let unsubscribe = () => {};

    if (currentUser) {
      try {
        console.log(
          "Iniciando carregamento de despesas do usuário:",
          currentUser.uid
        );
        // Referência à subcoleção de despesas do usuário
        const expensesRef = collection(
          db, // Usando a referência correta ao db
          "users",
          currentUser.uid,
          "expenses"
        );

        unsubscribe = onSnapshot(
          expensesRef,
          (snapshot) => {
            // Conjunto para verificar IDs duplicados
            const seenIds = new Set();

            const expenseData = snapshot.docs.map((doc) => {
              const data = doc.data();

              // Verificar se já vimos este ID ou se não tem ID
              let id = doc.id;
              if (seenIds.has(id)) {
                id = `${id}_${Date.now()}_${Math.random()
                  .toString(36)
                  .substr(2, 9)}`;
                console.warn(`ID duplicado detectado e corrigido: ${id}`);
              }
              seenIds.add(id);

              // Garantir que as despesas possuam todos os campos necessários
              return {
                id: id,
                description: data.description || "",
                amount: data.amount || 0,
                date: data.date || new Date().toISOString().split("T")[0],
                category: data.category || "Outros",
                createdAt: data.createdAt
                  ? data.createdAt.toDate().toISOString()
                  : new Date().toISOString(),
                ...data,
              };
            });

            console.log(
              "Despesas carregadas do Firestore:",
              expenseData.length
            );
            setExpenses(expenseData);
            setLastUpdate(Date.now());
            setLoading(false);
          },
          (error) => {
            console.error("Erro ao carregar despesas do Firestore:", error);
            setLoading(false);
          }
        );
      } catch (error) {
        console.error("Erro ao configurar listener para Firestore:", error);
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

      const expensesRef = collection(
        db, // Usando a referência correta ao db
        "users",
        currentUser.uid,
        "expenses"
      );

      // Dados com timestamp do servidor para melhor consistência
      const newExpenseData = {
        ...expenseData,
        createdAt: serverTimestamp(),
        userId: currentUser.uid,
        // Adicionar campos que garantem persistência adequada
        date: expenseData.date,
        amount: Number(expenseData.amount), // Garantir que seja número
        description: expenseData.description || "",
        category: expenseData.category || "Outros",
      };

      const docRef = await addDoc(expensesRef, newExpenseData);
      console.log("Despesa salva no Firestore com ID:", docRef.id);

      // Atualizar estado local imediatamente para feedback instantâneo
      const newExpense = {
        id: docRef.id, // Usar o ID gerado pelo Firestore
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

      const expenseRef = doc(
        db, // Usando a referência correta ao db
        "users",
        currentUser.uid,
        "expenses",
        id
      );

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

      const expenseRef = doc(
        db, // Usando a referência correta ao db
        "users",
        currentUser.uid,
        "expenses",
        id
      );
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

  // Função para limpar todas as despesas (para uso com a função de reset de dados)
  const clearExpenses = () => {
    setExpenses([]);
    setLastUpdate(Date.now());
    console.log("Estado de despesas limpo");
    return true;
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
        clearExpenses, // Adicionando a nova função ao contexto
      }}>
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => useContext(ExpenseContext);
