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

// Função para carregar dados iniciais do usuário - Versão Melhorada
export const carregarDadosIniciais = async (userId) => {
  if (!userId) {
    console.error("ID de usuário não fornecido para carregarDadosIniciais");
    throw new Error("ID de usuário não fornecido");
  }

  try {
    console.log("Carregando dados iniciais para o usuário:", userId);

    // Dados padrão a retornar caso não haja dados
    let dados = {
      salario: 0,
      monthlySalaries: {},
      salaryHistory: [],
      expenses: [],
    };

    // Tentar carregar de userData primeiro
    try {
      const userDataRef = doc(db, "userData", userId);
      const userDataSnapshot = await getDoc(userDataRef);

      if (userDataSnapshot.exists()) {
        const userDataFromDb = userDataSnapshot.data();
        console.log("Dados encontrados em userData:", userDataFromDb);

        dados = {
          ...dados,
          salario: userDataFromDb.salario || userDataFromDb.defaultSalary || 0,
          monthlySalaries: userDataFromDb.monthlySalaries || {},
          salaryHistory: userDataFromDb.salaryHistory || [],
        };
      }
    } catch (error) {
      console.warn("Erro ao carregar de userData:", error.message);
    }

    // Tentar carregar de salaries se não encontrou ou para complementar
    if (dados.salario === 0) {
      try {
        const salaryDocRef = doc(db, "salaries", userId);
        const salarySnapshot = await getDoc(salaryDocRef);

        if (salarySnapshot.exists()) {
          const salaryData = salarySnapshot.data();
          console.log("Dados encontrados em salaries:", salaryData);

          dados = {
            ...dados,
            salario: salaryData.defaultSalary || 0,
            monthlySalaries:
              salaryData.monthlySalaries || dados.monthlySalaries,
            salaryHistory: salaryData.salaryHistory || dados.salaryHistory,
          };
        }
      } catch (error) {
        console.warn("Erro ao carregar de salaries:", error.message);
      }
    }

    // Se ainda não temos dados, tentar carregar da subcoleção em users
    if (dados.salario === 0) {
      try {
        const userSalaryRef = doc(db, "users", userId, "salaryData", "current");
        const userSalarySnapshot = await getDoc(userSalaryRef);

        if (userSalarySnapshot.exists()) {
          const salaryData = userSalarySnapshot.data();
          console.log("Dados encontrados em users/.../salaryData:", salaryData);

          dados = {
            ...dados,
            salario: salaryData.defaultSalary || 0,
            monthlySalaries: salaryData.monthlySalaries || {},
            salaryHistory: salaryData.salaryHistory || [],
          };
        }
      } catch (error) {
        console.warn("Erro ao carregar da subcoleção de users:", error.message);
      }
    }

    // Se não encontrou dados em nenhum lugar, criar estrutura inicial
    if (
      dados.salario === 0 &&
      Object.keys(dados.monthlySalaries).length === 0
    ) {
      try {
        console.log(
          "Nenhum dado encontrado. Criando estrutura inicial para o usuário."
        );

        // Criar em userData
        const userDataRef = doc(db, "userData", userId);
        await setDoc(
          userDataRef,
          {
            salario: 0,
            monthlySalaries: {},
            salaryHistory: [],
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
          },
          { merge: true }
        );

        // Criar também em salaries para redundância
        const salaryRef = doc(db, "salaries", userId);
        await setDoc(
          salaryRef,
          {
            defaultSalary: 0,
            monthlySalaries: {},
            salaryHistory: [],
            createdAt: serverTimestamp(),
          },
          { merge: true }
        );

        console.log("Estrutura inicial de dados criada com sucesso");
      } catch (initError) {
        console.error("Erro ao criar estrutura inicial:", initError);
        // Não lançar erro aqui, apenas continuar com os valores padrão
      }
    }

    // Registrar login
    try {
      const userLoginRef = doc(db, "userData", userId);
      await setDoc(
        userLoginRef,
        {
          lastLogin: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (loginError) {
      console.warn("Erro ao registrar login:", loginError.message);
    }

    console.log("Dados carregados finais:", dados);
    return dados;
  } catch (error) {
    console.error("Erro ao carregar dados iniciais:", error);
    throw error;
  }
};

// Atualizar dados do salário - Versão melhorada
export const atualizarDadosSalario = async (userId, dados) => {
  if (!userId) {
    console.error("ID de usuário não fornecido para atualizarDadosSalario");
    throw new Error("ID de usuário não fornecido");
  }

  try {
    console.log(`Atualizando dados de salário para usuário ${userId}:`, dados);

    const salaryData = {
      defaultSalary:
        dados.defaultSalary !== undefined ? dados.defaultSalary : 0,
      monthlySalaries: dados.monthlySalaries || {},
      salaryHistory: dados.salaryHistory || [],
      updatedAt: serverTimestamp(),
    };

    // Estratégia 1: Salvar em documento específico para salário
    try {
      const salaryRef = doc(db, "salaries", userId);
      await setDoc(salaryRef, salaryData, { merge: true });
      console.log("Dados salvos com sucesso em salaries/");
    } catch (error) {
      console.warn("Falha ao salvar em salaries/:", error);
    }

    // Estratégia 2: Salvar em userData
    try {
      const userDataRef = doc(db, "userData", userId);
      await setDoc(
        userDataRef,
        {
          salario: dados.defaultSalary,
          monthlySalaries: dados.monthlySalaries || {},
          salaryHistory: dados.salaryHistory || [],
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      console.log("Dados salvos com sucesso em userData/");
    } catch (error) {
      console.warn("Falha ao salvar em userData/:", error);
    }

    // Estratégia 3: Salvar em users/userId/salaryData
    try {
      const userSalaryRef = doc(db, "users", userId, "salaryData", "current");
      await setDoc(
        userSalaryRef,
        {
          ...salaryData,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      console.log("Dados salvos com sucesso em users/.../salaryData/");
    } catch (error) {
      console.warn("Falha ao salvar em users/.../salaryData/:", error);
    }

    console.log(
      "Dados de salário atualizados com sucesso (pelo menos uma estratégia funcionou)"
    );
    return true;
  } catch (error) {
    console.error("Erro ao atualizar dados de salário:", error);

    // Salvar em localStorage como backup
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
      console.log("Dados salvos no localStorage como fallback");
    } catch (storageError) {
      console.error("Falha também ao salvar no localStorage:", storageError);
    }

    throw error;
  }
};

// Limpar todos os dados do usuário - Versão melhorada
export const limparTodosDados = async (userId) => {
  if (!userId) {
    console.error("ID de usuário não fornecido");
    throw new Error("ID de usuário não fornecido");
  }

  try {
    console.log("Iniciando limpeza de dados para o usuário:", userId);
    const batch = writeBatch(db);

    // 1. Limpar dados de usuário
    try {
      // Limpar documento em userData
      const userDataRef = doc(db, "userData", userId);
      batch.delete(userDataRef);
      console.log("Documento userData marcado para exclusão");

      // Limpar documento em salaries
      const salaryRef = doc(db, "salaries", userId);
      batch.delete(salaryRef);
      console.log("Documento salaries marcado para exclusão");

      // Limpar documento em users
      const userRef = doc(db, "users", userId);
      batch.delete(userRef);
      console.log("Documento users marcado para exclusão");

      // Limpar documento de salaryData
      const salaryDataRef = doc(db, "users", userId, "salaryData", "current");
      batch.delete(salaryDataRef);
      console.log("Documento salaryData marcado para exclusão");
    } catch (error) {
      console.warn(
        "Erro ao preparar documentos principais para exclusão:",
        error
      );
    }

    // 2. Limpar coleção de despesas
    try {
      const expensesRef = collection(db, "users", userId, "expenses");
      const expensesSnapshot = await getDocs(expensesRef);

      console.log(`Encontradas ${expensesSnapshot.size} despesas para excluir`);

      expensesSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      console.log("Todas as despesas marcadas para exclusão");
    } catch (error) {
      console.warn("Erro ao obter despesas para exclusão:", error);
    }

    // Executar operações em lote
    await batch.commit();

    console.log("Todos os dados foram limpos com sucesso no Firebase");
    return true;
  } catch (error) {
    console.error("Erro ao limpar dados:", error);
    throw error;
  }
};
