import {
  loadFromLocalStorage,
  saveToLocalStorage,
  loadSettingsFromLocalStorage,
  saveSettingsToLocalStorage,
} from "./storage.js";

export let state = {
  transactions: [],
  settings: {
    preferredCurrency: "USD",
    availableCurrencies: ["USD", "RWF", "UGX"],
    currencySymbols: { USD: "$", RWF: "FRw", UGX: "USh" },
    exchangeRates: { USD: 1, RWF: 1447.5, UGX: 3465.23 },
  },
};

function persistSettings() {
  saveSettingsToLocalStorage(state.settings);
}

export function setCurrency(currency) {
  if (state.settings.availableCurrencies.includes(currency)) {
    state.settings.preferredCurrency = currency;
    persistSettings();
  }
}

export function setExchangeRate(currency, rate) {
  state.settings.exchangeRates[currency] = rate;
  persistSettings();
}

export function loadPersistedSettings() {
  const stored = loadSettingsFromLocalStorage();
  if (stored) {
    state.settings = { ...state.settings, ...stored };
  }
}

export async function loadSeedData() {
  loadPersistedSettings();
  let localData = loadFromLocalStorage();
  if (localData && Array.isArray(localData)) {
    state.transactions = localData;
    return;
  }
  try {
    const res = await fetch("./seed.json");
    const data = await res.json();
    state.transactions = Array.isArray(data) ? data : data.transactions || [];
    saveToLocalStorage(state.transactions);
  } catch (err) {
    console.error("Failed to load seed.json:", err);
    state.transactions = [];
  }
}

const records = (function () {
  let transactions = [];
  let listeners = [];

  function notify() {
    saveToLocalStorage(transactions);
    listeners.forEach((listener) => listener(transactions));
  }
  function generateId() {
    const maxId = transactions.reduce(
      (max, t) => Math.max(max, parseInt(t.id || 0)),
      0
    );
    return (maxId + 1).toString();
  }

  function initFromState() {
    transactions = state.transactions.map((t, i) => ({
      ...t,
      id: t.id || (i + 1).toString(),
    }));
    notify();
  }

  return {
    initFromState,
    getTransactions: () => [...transactions],
    addTransaction: function (tx) {
      tx.id = generateId();
      tx.date = tx.date || new Date().toISOString().slice(0, 10);
      transactions.push(tx);
      notify();
    },
    updateTransaction: function (updated) {
      const idx = transactions.findIndex((t) => t.id == updated.id);
      if (idx !== -1) {
        transactions[idx] = { ...transactions[idx], ...updated };
        notify();
      }
    },
    deleteTransactionById: function (id) {
      const idx = transactions.findIndex((t) => t.id == id);
      if (idx !== -1) {
        transactions.splice(idx, 1);
        notify();
      }
    },
    subscribe: function (fn) {
      listeners.push(fn);
    },
  };
})();

export default records;

export function replaceTransactions(newArr) {
  state.transactions = newArr;
  records.initFromState();
}
