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
  query,
  orderBy,
  Timestamp, // Adicionar esta importação
} from "firebase/firestore";
import { useAuth } from "./AuthContext";

const ExpenseContext = createContext();

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [extraIncomes, setExtraIncomes] = useState([]); // Novo estado
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
                  ? typeof data.createdAt.toDate === "function"
                    ? data.createdAt.toDate().toISOString()
                    : new Date(data.createdAt).toISOString()
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

  // Carregar ganhos extras
  useEffect(() => {
    if (!currentUser) return;

    const loadExtraIncomes = async () => {
      const userRef = doc(db, "users", currentUser.uid);
      const extraIncomesRef = collection(userRef, "extraIncomes");
      const q = query(extraIncomesRef, orderBy("date", "desc"));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const extraIncomesList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setExtraIncomes(extraIncomesList);
      });

      return () => unsubscribe();
    };

    loadExtraIncomes();
  }, [currentUser]);

  // Função para adicionar despesa
  const addExpense = async (expenseData) => {
    try {
      console.log("Salvando despesa:", expenseData);
      setLoading(true);

      // Adicionar ao Firestore
      const docRef = await addDoc(
        collection(db, "users", currentUser.uid, "expenses"),
        {
          ...expenseData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }
      );

      console.log("Despesa salva no Firestore com ID:", docRef.id);

      // Importante: Não adicionar a despesa diretamente ao estado
      // Em vez disso, confiar no listener do Firestore para atualizar o estado
      // Isso evitará duplicações quando o listener for acionado

      return docRef.id;
    } catch (error) {
      console.error("Erro ao adicionar despesa:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Carregar despesas - simplificar a consulta para evitar necessidade de índice
  useEffect(() => {
    if (!currentUser) {
      setExpenses([]);
      return;
    }

    const expensesRef = collection(db, "users", currentUser.uid, "expenses");
    // Usar apenas um campo de ordenação para evitar a necessidade de índice composto
    const q = query(expensesRef, orderBy("date", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const expensesData = [];
        const processedIds = new Set();

        snapshot.forEach((doc) => {
          const id = doc.id;

          if (!processedIds.has(id)) {
            processedIds.add(id);

            const data = doc.data();
            const createdAt =
              data.createdAt instanceof Timestamp
                ? data.createdAt.toDate().toISOString()
                : data.createdAt || new Date().toISOString();

            const updatedAt =
              data.updatedAt instanceof Timestamp
                ? data.updatedAt.toDate().toISOString()
                : data.updatedAt || new Date().toISOString();

            expensesData.push({
              id,
              ...data,
              createdAt,
              updatedAt,
            });
          }
        });

        // Se precisar de ordenação secundária, podemos fazer isso no cliente
        expensesData.sort((a, b) => {
          // Primeiro comparar por data
          const dateComparison = b.date.localeCompare(a.date);
          if (dateComparison !== 0) return dateComparison;

          // Se as datas forem iguais, ordenar por createdAt
          return b.createdAt.localeCompare(a.createdAt);
        });

        console.log("Despesas carregadas do Firestore:", expensesData.length);
        setExpenses(expensesData);
        setLoading(false);
      },
      (error) => {
        console.error("Erro ao carregar despesas:", error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [currentUser]);

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

  // Adicionar função para gerenciar ganhos extras
  const addExtraIncome = async (extraIncomeData) => {
    try {
      if (!currentUser) throw new Error("Usuário não autenticado");

      const userRef = doc(db, "users", currentUser.uid);
      const extraIncomeRef = collection(userRef, "extraIncomes");

      const newExtraIncome = {
        ...extraIncomeData,
        createdAt: serverTimestamp(),
        userId: currentUser.uid,
        date: extraIncomeData.date,
        amount: Number(extraIncomeData.amount),
        description: extraIncomeData.description || "",
      };

      const docRef = await addDoc(extraIncomeRef, newExtraIncome);

      // Atualizar estado local imediatamente
      setExtraIncomes((prev) => [
        ...prev,
        { ...newExtraIncome, id: docRef.id },
      ]);

      return docRef;
    } catch (error) {
      console.error("Erro ao adicionar ganho extra:", error);
      throw error;
    }
  };

  // Atualizar função para editar ganho extra
  const updateExtraIncome = async (id, updatedData) => {
    try {
      if (!currentUser) throw new Error("Usuário não autenticado");

      const userRef = doc(db, "users", currentUser.uid);
      const extraIncomeRef = doc(collection(userRef, "extraIncomes"), id);

      const dataWithTimestamp = {
        ...updatedData,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(extraIncomeRef, dataWithTimestamp);

      setExtraIncomes((prev) =>
        prev.map((income) =>
          income.id === id ? { ...income, ...updatedData } : income
        )
      );
    } catch (error) {
      console.error("Erro ao atualizar ganho extra:", error);
      throw error;
    }
  };

  const removeExtraIncome = async (id) => {
    try {
      const userRef = doc(db, "users", currentUser.uid);
      const extraIncomeRef = doc(collection(userRef, "extraIncomes"), id);

      await deleteDoc(extraIncomeRef);
      setExtraIncomes((prev) => prev.filter((income) => income.id !== id));
    } catch (error) {
      console.error("Erro ao remover ganho extra:", error);
    }
  };

  // Função para limpar todas as despesas (para uso com a função de reset de dados)
  const clearExpenses = () => {
    setExpenses([]);
    setLastUpdate(Date.now());
    console.log("Estado de despesas limpo");
    return true;
  };

  const value = {
    expenses,
    loading,
    lastUpdate,
    addExpense,
    updateExpense,
    deleteExpense,
    clearExpenses, // Adicionando a nova função ao contexto
    extraIncomes, // Novo
    addExtraIncome, // Novo
    removeExtraIncome, // Novo
    updateExtraIncome, // Novo
  };

  return (
    <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>
  );
};

export const useExpenses = () => useContext(ExpenseContext);
