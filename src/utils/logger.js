const isDevelopment = process.env.NODE_ENV === "development";

// Expandir lista de campos sensíveis
const sensitiveFields = [
  "salario",
  "defaultSalary",
  "salary",
  "monthlySalaries",
  "salaryHistory",
  "amount",
  "total",
  "value",
  "balance",
  "vales",
  "vale",
  "loan",
  "loans", // Adicionar campos relacionados a vales
  "salaryAdvances",
  "advanceData",
  "advanceAmount",
  "advanceId",
  "advances",
  "vales",
  "valesData",
  "monthlySalary",
  "monthlyAmount",
  "advancesList",
  "monthlyData",
  "monthly",
];

const sanitizeData = (data) => {
  if (!data) return data;

  if (Array.isArray(data)) {
    // Se for um array, retornar apenas o comprimento
    return `Array[${data.length}]`;
  }

  if (typeof data === "object") {
    const sanitized = {};

    for (let key in data) {
      if (
        sensitiveFields.some((field) =>
          key.toLowerCase().includes(field.toLowerCase())
        )
      ) {
        sanitized[key] = "***";
      } else if (typeof data[key] === "object") {
        sanitized[key] = sanitizeData(data[key]);
      } else {
        sanitized[key] = data[key];
      }
    }
    return sanitized;
  }

  return data;
};

// Expandir lista de termos sensíveis
const sensitiveTerms = [
  "salário",
  "salary",
  "valor",
  "total",
  "amount",
  "vale",
  "vales",
  "loan",
  "empréstimo", // Adicionar termos relacionados a vales
  "monthlySalaries",
  "vales carregados",
  "salary advance",
  "advance amount",
  "monthly",
  "total",
  "advances",
  "advance",
];

const shouldLogMessage = (message) => {
  if (!message || typeof message !== "string") return true;
  return !sensitiveTerms.some((term) =>
    message.toLowerCase().includes(term.toLowerCase())
  );
};

const logger = {
  debug: (...args) => {
    if (isDevelopment && shouldLogMessage(args[0])) {
      const sanitizedArgs = args.map((arg) => sanitizeData(arg));
      console.debug(...sanitizedArgs);
    }
  },

  log: (...args) => {
    if (isDevelopment && shouldLogMessage(args[0])) {
      const sanitizedArgs = args.map((arg) => sanitizeData(arg));
      console.log(...sanitizedArgs);
    }
  },

  info: (...args) => {
    if (isDevelopment && shouldLogMessage(args[0])) {
      const sanitizedArgs = args.map((arg) => sanitizeData(arg));
      console.info(...sanitizedArgs);
    }
  },

  warn: (...args) => {
    if (isDevelopment && shouldLogMessage(args[0])) {
      const sanitizedArgs = args.map((arg) => sanitizeData(arg));
      console.warn(...sanitizedArgs);
    }
  },

  error: (...args) => {
    // Sempre logar erros, mas sanitizar dados sensíveis mesmo em produção
    const sanitizedArgs = args.map((arg) => sanitizeData(arg));
    console.error(...sanitizedArgs);
  },
};

export default logger;
