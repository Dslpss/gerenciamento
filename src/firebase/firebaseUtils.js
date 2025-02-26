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
export const salvarDespesaFirestore = async (despesa, userId) => {
  try {
    const despesaRef = await addDoc(collection(db, "expenses"), {
      ...despesa,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log("Despesa salva com sucesso:", despesaRef.id);
    return { id: despesaRef.id, ...despesa };
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
    console.log("Iniciando carregamento de dados para usuário:", userId);

    // Tentar carregar dos dados do usuário primeiro
    const userDataRef = doc(db, "userData", userId);
    const userDataSnap = await getDoc(userDataRef);

    let dadosUsuario = {
      salary: 0,
      monthlySalaries: {},
      salaryHistory: [],
    };

    // Se tiver dados em userData, use-os
    if (userDataSnap.exists()) {
      const userData = userDataSnap.data();
      dadosUsuario = {
        salary: userData.salary || 0,
        monthlySalaries: userData.monthlySalaries || {},
        salaryHistory: userData.salaryHistory || [],
      };
      console.log("Dados do usuário encontrados em userData:", dadosUsuario);
    }
    // Se não, tente carregar do salaries
    else {
      const salaryRef = doc(db, "salaries", userId);
      const salarySnap = await getDoc(salaryRef);

      if (salarySnap.exists()) {
        const salaryData = salarySnap.data();
        dadosUsuario = {
          salary: salaryData.defaultSalary || 0,
          monthlySalaries: salaryData.monthlySalaries || {},
          salaryHistory: salaryData.salaryHistory || [],
        };
        console.log("Dados do usuário encontrados em salaries:", dadosUsuario);
      } else {
        console.log("Nenhum dado encontrado, inicializando dados do usuário");
        await initializeUserData(userId);
      }
    }

    // Carregar despesas - tenta primeiro na subcoleção
    let expenses = [];
    try {
      const expensesRef = collection(db, "users", userId, "expenses");
      const expensesSnap = await getDocs(expensesRef);

      if (!expensesSnap.empty) {
        expenses = expensesSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("Despesas encontradas na subcoleção:", expenses.length);
      } else {
        // Se não houver na subcoleção, busca na coleção principal
        const expensesQuery = query(
          collection(db, "expenses"),
          where("userId", "==", userId)
        );
        const legacyExpensesSnap = await getDocs(expensesQuery);

        expenses = legacyExpensesSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log(
          "Despesas encontradas na coleção principal:",
          expenses.length
        );
      }
    } catch (error) {
      console.error("Erro ao carregar despesas:", error);
    }

    const dadosCarregados = {
      salario: dadosUsuario.salary,
      monthlySalaries: dadosUsuario.monthlySalaries,
      salaryHistory: dadosUsuario.salaryHistory,
      expenses,
    };

    console.log("Dados carregados com sucesso:", dadosCarregados);
    return dadosCarregados;
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

// Função para limpar todos os dados do usuário
export const limparTodosDados = async (userId) => {
  try {
    if (!userId) throw new Error("Usuário não autenticado");

    console.log("Iniciando limpeza de todos os dados para usuário:", userId);

    // Arrays para armazenar todas as promessas
    const batchPromises = [];

    // 1. Limpar coleção principal de despesas
    try {
      const expensesQuery = query(
        collection(db, "expenses"),
        where("userId", "==", userId)
      );
      const expensesSnap = await getDocs(expensesQuery);

      if (!expensesSnap.empty) {
        console.log(
          `Excluindo ${expensesSnap.size} despesas da coleção principal`
        );
        expensesSnap.forEach((doc) => {
          batchPromises.push(deleteDoc(doc.ref));
        });
      }
    } catch (error) {
      console.warn("Erro ao excluir despesas da coleção principal:", error);
    }

    // 2. Limpar subcoleção de despesas
    try {
      const userExpensesRef = collection(db, "users", userId, "expenses");
      const userExpensesSnap = await getDocs(userExpensesRef);

      if (!userExpensesSnap.empty) {
        console.log(
          `Excluindo ${userExpensesSnap.size} despesas da subcoleção`
        );
        userExpensesSnap.forEach((doc) => {
          batchPromises.push(deleteDoc(doc.ref));
        });
      }
    } catch (error) {
      console.warn("Erro ao excluir despesas da subcoleção:", error);
    }

    // 3. Resetar documentos de usuário
    const resetData = {
      defaultSalary: 0,
      salary: 0,
      monthlySalaries: {},
      salaryHistory: [],
      updatedAt: new Date().toISOString(),
    };

    // Tentar resetar os documentos em vez de excluí-los
    try {
      const userDataRef = doc(db, "userData", userId);
      batchPromises.push(setDoc(userDataRef, resetData, { merge: true }));
    } catch (error) {
      console.warn("Erro ao resetar dados de usuário:", error);
    }

    try {
      const salaryRef = doc(db, "salaries", userId);
      batchPromises.push(setDoc(salaryRef, resetData, { merge: true }));
    } catch (error) {
      console.warn("Erro ao resetar dados de salário:", error);
    }

    // Executar todas as operações em paralelo
    if (batchPromises.length > 0) {
      await Promise.allSettled(batchPromises);
      console.log(`${batchPromises.length} operações de limpeza concluídas`);
    } else {
      console.log("Nenhum dado encontrado para limpar");
    }

    // Limpar localStorage também
    localStorage.removeItem("expenses");
    localStorage.removeItem("salary");
    localStorage.removeItem("monthlySalaries");
    localStorage.removeItem("salaryHistory");

    console.log("Todos os dados foram limpos com sucesso!");
    return true;
  } catch (error) {
    console.error("Erro ao limpar todos os dados:", error);
    throw error;
  }
};
