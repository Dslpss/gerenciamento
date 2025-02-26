import { db, auth } from "./config";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  getDocs,
  getDoc, // Adicionar getDoc para documentos únicos
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

// Funções relacionadas a despesas - Atualizada para garantir userId
export const adicionarDespesa = async (despesa, userId) => {
  if (!userId) {
    throw new Error("Usuário não autenticado");
  }

  try {
    const despesaCompleta = {
      ...despesa,
      userId, // Importante para as regras de segurança
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

// Corrigir a função obterDadosSalario
export const obterDadosSalario = async (userId) => {
  try {
    console.log("Obtendo dados de salário para usuário:", userId);
    const docRef = doc(db, "salaries", userId);
    const docSnap = await getDoc(docRef); // Usar getDoc em vez de getDocs

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

// Função corrigida para verificar dados
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

// Função para salvar despesa no Firestore
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

// Função para salvar dados de salário no Firestore
export const atualizarDadosSalario = async (userId, dados) => {
  try {
    console.log("Atualizando dados de salário:", dados);

    const salaryRef = doc(db, "salaries", userId);

    // Garantir que todos os campos necessários estejam presentes
    const dadosAtualizados = {
      defaultSalary: dados.defaultSalary || 0,
      monthlySalaries: dados.monthlySalaries || {},
      salaryHistory: dados.salaryHistory || [],
      updatedAt: new Date(),
    };

    await setDoc(salaryRef, dadosAtualizados);

    console.log("Dados de salário atualizados com sucesso");
    return true;
  } catch (error) {
    console.error("Erro ao atualizar dados de salário:", error);
    throw error;
  }
};

// Função para carregar dados iniciais do usuário
export const carregarDadosIniciais = async (userId) => {
  try {
    console.log("Iniciando carregamento de dados para usuário:", userId);

    // Carregar dados do salário
    const salaryRef = doc(db, "salaries", userId);
    const salarySnap = await getDoc(salaryRef);

    let dadosSalario = {
      defaultSalary: 0,
      monthlySalaries: {},
      salaryHistory: [],
    };

    if (salarySnap.exists()) {
      dadosSalario = salarySnap.data();
      console.log("Dados de salário encontrados:", dadosSalario);
    } else {
      console.log("Nenhum dado de salário encontrado, usando valores padrão");
    }

    // Carregar despesas
    const expensesQuery = query(
      collection(db, "expenses"),
      where("userId", "==", userId)
    );
    const expensesSnap = await getDocs(expensesQuery);
    const despesas = expensesSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const dadosCarregados = {
      salario: dadosSalario.defaultSalary || 0,
      monthlySalaries: dadosSalario.monthlySalaries || {},
      salaryHistory: dadosSalario.salaryHistory || [],
      expenses: despesas,
    };

    console.log("Dados carregados com sucesso:", dadosCarregados);
    return dadosCarregados;
  } catch (error) {
    console.error("Erro ao carregar dados iniciais:", error);
    throw error;
  }
};
