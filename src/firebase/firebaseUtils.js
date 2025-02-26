import { db, auth } from "./config";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  setDoc,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

// Funções relacionadas à autenticação
export const criarUsuario = async (email, senha) => {
  try {
    console.log("Tentando criar usuário:", { email });
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      senha
    );
    console.log("Usuário criado com sucesso:", userCredential.user.uid);
    return userCredential;
  } catch (error) {
    console.error("Erro detalhado ao criar usuário:", {
      code: error.code,
      message: error.message,
      email,
    });
    throw error;
  }
};

export const fazerLogin = async (email, senha) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, senha);
    return userCredential.user;
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    throw error;
  }
};

export const fazerLogout = async () => {
  try {
    await signOut(auth);
    console.log("Logout realizado com sucesso");
    return true;
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
    throw error;
  }
};

// Funções relacionadas a despesas
export const adicionarDespesa = async (despesa, userId) => {
  if (!userId) {
    throw new Error("Usuário não autenticado");
  }

  try {
    const despesaCompleta = {
      ...despesa,
      userId,
      timestamp: new Date(),
    };

    const docRef = await addDoc(collection(db, "expenses"), despesaCompleta);
    return { id: docRef.id, ...despesaCompleta };
  } catch (error) {
    console.error("Erro ao adicionar despesa:", error);
    throw error;
  }
};

export const atualizarDespesa = async (id, despesa) => {
  try {
    const despesaRef = doc(db, "expenses", id);
    await updateDoc(despesaRef, {
      ...despesa,
      updatedAt: new Date(),
    });
    return { id, ...despesa };
  } catch (error) {
    console.error("Erro ao atualizar despesa:", error);
    throw error;
  }
};

export const excluirDespesa = async (id) => {
  try {
    await deleteDoc(doc(db, "expenses", id));
    return id;
  } catch (error) {
    console.error("Erro ao excluir despesa:", error);
    throw error;
  }
};

export const obterDespesas = async (userId) => {
  try {
    const q = query(collection(db, "expenses"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    const despesas = [];
    querySnapshot.forEach((doc) => {
      despesas.push({ id: doc.id, ...doc.data() });
    });

    return despesas;
  } catch (error) {
    console.error("Erro ao obter despesas:", error);
    throw error;
  }
};

// Funções relacionadas a salários
export const salvarDadosSalario = async (userId, dados) => {
  try {
    await setDoc(doc(db, "salaries", userId), {
      ...dados,
      updatedAt: new Date(),
    });
    return dados;
  } catch (error) {
    console.error("Erro ao salvar dados de salário:", error);
    throw error;
  }
};

export const obterDadosSalario = async (userId) => {
  try {
    console.log("Obtendo dados de salário para usuário:", userId);
    const docRef = doc(db, "salaries", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const dados = docSnap.data();
      console.log("Dados de salário encontrados:", dados);
      return dados;
    } else {
      console.log("Nenhum dado de salário encontrado");
      return null;
    }
  } catch (error) {
    console.error("Erro ao obter dados de salário:", error);
    throw error;
  }
};

// Sincronização entre Firebase e localStorage
export const sincronizarDadosComFirebase = async (userId) => {
  try {
    // Implementar lógica para sincronizar dados entre localStorage e Firebase
    // ...
  } catch (error) {
    console.error("Erro ao sincronizar dados:", error);
    throw error;
  }
};

// Verificar dados do Firestore
export const verificarDadosFirestore = async (userId) => {
  try {
    console.log("Verificando dados para usuário:", userId);

    // Verificar despesas usando query
    const expensesQuery = query(
      collection(db, "expenses"),
      where("userId", "==", userId)
    );
    const expensesSnapshot = await getDocs(expensesQuery);

    // Verificar salário usando getDoc para documento único
    const salaryRef = doc(db, "salaries", userId);
    const salarySnapshot = await getDoc(salaryRef);

    const dados = {
      expenses: expensesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })),
      salary: salarySnapshot.exists() ? salarySnapshot.data() : null,
    };

    console.log("Dados encontrados no Firestore:", dados);
    return dados;
  } catch (error) {
    console.error("Erro ao verificar dados:", error);
    throw error;
  }
};

// Salvar despesa no Firestore
export const salvarDespesaFirestore = async (expense, userId) => {
  try {
    // Referência à coleção de despesas do usuário
    const expensesRef = collection(db, "users", userId, "expenses");

    // Dados da despesa com timestamp
    const expenseData = {
      ...expense,
      createdAt: serverTimestamp(),
      userId,
    };

    // Adicionar à coleção
    const docRef = await addDoc(expensesRef, expenseData);
    console.log("Despesa salva com sucesso - ID:", docRef.id);
    return docRef;
  } catch (error) {
    console.error("Erro ao salvar despesa:", error);
    throw error;
  }
};

// Inicializar dados do usuário
export const initializeUserData = async (userId) => {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDataRef = doc(db, "userData", userId);

    // Criar documento do usuário se não existir
    await setDoc(
      userDocRef,
      {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    // Criar dados iniciais do usuário
    await setDoc(
      userDataRef,
      {
        salary: 0,
        monthlySalaries: {},
        salaryHistory: [],
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return true;
  } catch (error) {
    console.error("Erro ao inicializar dados do usuário:", error);
    throw error;
  }
};

// Função para carregar dados iniciais do usuário - VERSÃO CORRIGIDA
export const carregarDadosIniciais = async (userId) => {
  try {
    console.log("Carregando dados iniciais para o usuário:", userId);

    // Verificar e inicializar dados do usuário
    const userDocRef = doc(db, "userData", userId);
    const userDoc = await getDoc(userDocRef);

    // Dados padrão a retornar caso não haja dados
    let dados = {
      salario: 0,
      monthlySalaries: {},
      salaryHistory: [],
      expenses: [],
    };

    // Se o usuário já existir, carregamos os dados
    if (userDoc.exists()) {
      dados = { ...dados, ...userDoc.data() };
      console.log("Dados do usuário encontrados:", dados);
    } else {
      // Criar documento de usuário caso não exista
      await setDoc(userDocRef, {
        lastLogin: serverTimestamp(),
        createdAt: serverTimestamp(),
        ...dados,
      });
      console.log("Documento de usuário criado com dados padrão");
    }

    // Carregar despesas do usuário - serão carregadas pelo ExpenseContext

    return dados;
  } catch (error) {
    console.error("Erro ao carregar dados iniciais:", error);
    throw error;
  }
};

// Atualizar dados do salário
export const atualizarDadosSalario = async (userId, dados) => {
  try {
    console.log("Atualizando dados de salário:", dados);

    const salaryData = {
      defaultSalary: dados.defaultSalary || 0,
      monthlySalaries: dados.monthlySalaries || {},
      salaryHistory: dados.salaryHistory || [],
      updatedAt: new Date().toISOString(),
    };

    // Tentar com documento separado no salaries
    try {
      const salaryRef = doc(db, "salaries", userId);
      await setDoc(salaryRef, salaryData, { merge: true });
      console.log("Dados de salário atualizados em salaries");
    } catch (error) {
      console.warn("Erro ao atualizar em salaries:", error.message);
    }

    // Tentar com subcoleção dentro de users
    try {
      const userSalaryRef = doc(db, "users", userId, "salaryData", "current");
      await setDoc(userSalaryRef, salaryData, { merge: true });
      console.log("Dados de salário atualizados na subcoleção");
    } catch (error) {
      console.warn("Erro ao atualizar na subcoleção:", error.message);
    }

    // Tentar com userData
    try {
      const userDataRef = doc(db, "userData", userId);
      await setDoc(
        userDataRef,
        {
          salary: dados.defaultSalary || 0,
          monthlySalaries: dados.monthlySalaries || {},
          salaryHistory: dados.salaryHistory || [],
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      console.log("Dados de salário atualizados em userData");
    } catch (error) {
      console.warn("Erro ao atualizar em userData:", error.message);
    }

    return true;
  } catch (error) {
    console.error("Erro ao atualizar dados de salário:", error);

    // Salvar no localStorage como backup
    try {
      localStorage.setItem("salary", JSON.stringify(dados.defaultSalary || 0));
      localStorage.setItem(
        "monthlySalaries",
        JSON.stringify(dados.monthlySalaries || {})
      );
      localStorage.setItem(
        "salaryHistory",
        JSON.stringify(dados.salaryHistory || [])
      );
      console.log("Dados de salário salvos no localStorage como backup");
    } catch (storageError) {
      console.warn("Falha também ao salvar no localStorage:", storageError);
    }

    throw error;
  }
};

// Limpar todos os dados do usuário
export const limparTodosDados = async (userId) => {
  try {
    const batch = writeBatch(db);

    // 1. Apagar documento de usuário
    const userDocRef = doc(db, "userData", userId);
    batch.delete(userDocRef);

    // 2. Apagar todas as despesas do usuário
    const expensesRef = collection(db, "users", userId, "expenses");
    const expensesSnapshot = await getDocs(expensesRef);

    expensesSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Executar todas as operações em lote
    await batch.commit();

    console.log("Todos os dados foram limpos com sucesso");
    return true;
  } catch (error) {
    console.error("Erro ao limpar dados:", error);
    throw error;
  }
};
