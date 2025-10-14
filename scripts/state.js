import { loadFromLocalStorage, saveToLocalStorage } from './storage.js';

export let state = {
  transactions: [],
  settings: {
    preferredCurrency: 'USD',
    availableCurrencies: ['USD', 'RWF', 'UGX'],
    currencySymbols: { USD: '$', RWF: 'FRw', UGX: 'USh' },
    exchangeRates: { USD: 1, RWF: 1447.50, UGX: 3465.23 }
  }
};

export function setCurrency(currency) {
  if (state.settings.availableCurrencies.includes(currency)) {
    state.settings.preferredCurrency = currency;
    saveToLocalStorage(state.transactions);
  }
}

export function setExchangeRate(currency, rate) {
  state.settings.exchangeRates[currency] = rate;
}

// Load initial data: try localStorage, fallback to seed.json
export async function loadSeedData() {
  let localData = loadFromLocalStorage();
  if (localData && Array.isArray(localData)) {
    state.transactions = localData;
    return;
  }
  try {
    const res = await fetch('./seed.json');
    const data = await res.json();
    state.transactions = Array.isArray(data) ? data : data.transactions || [];
    saveToLocalStorage(state.transactions); // Save initial seed to localStorage
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
    listeners.forEach(listener => listener(transactions));
  }
  function generateId() {
    const maxId = transactions.reduce((max, t) => Math.max(max, parseInt(t.id || 0)), 0);
    return (maxId + 1).toString();    
  }
    
  function initFromState() {
    transactions = state.transactions.map((t, i) => ({
      ...t,
      id: t.id || (i + 1).toString()
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
      const idx = transactions.findIndex(t => t.id == updated.id);
      if (idx !== -1) {
        transactions[idx] = { ...transactions[idx], ...updated };
        notify();
      }
    },
    deleteTransactionById: function (id) {
      const idx = transactions.findIndex(t => t.id == id);
      if (idx !== -1) {
        transactions.splice(idx, 1);
        notify();
      }
    },
    subscribe: function (fn) { listeners.push(fn); }
  };
})();

export default records;

// For importing new JSON data
export function replaceTransactions(newArr) {
  state.transactions = newArr;
  records.initFromState();
}

//   // function getCurrentTimestamp() {
//   //     return new Date().toISOString().slice(0, 10);
//   // }

//   return {
//       initFromState,
//       getTransactions: () => [...transactions],
//       // getIncome: function () {
//       //     return transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
//       // },
//       // getExpenses: function () {
//       //     return transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
//       // },
//       // getBalance: function () {
//       //     return this.getIncome() - this.getExpenses();
//       // },
//       // getByCategory: function (category) {
//       //     return transactions.filter(t => t.category === category);
//       // },
//       // getByDateRange: function (startDate, endDate) {
//       //     return transactions.filter(t => {
//       //         const date = new Date(t.date);
//       //         return date >= new Date(startDate) && date <= new Date(endDate);
//       //     });
//       // },
//       // 
//       addTransaction: function (tx) {
//             tx.id = generateId();
//             tx.date = tx.date || new Date().toISOString().slice(0, 10);
//             transactions.push(tx);
//             notify();
//       },
//       updateTransaction: function (updated) {
//           const idx = transactions.findIndex(t => t.id == updated.id);
//           if (idx !== -1) {
//                 transactions[idx] = { ...transactions[idx], ...updated };
//                 notify();
//             }
//       },
//       deleteTransactionById: function (id) {
//           const idx = transactions.findIndex(t => t.id == id);
//           // if (idx !== -1) {
//           //     transactions.splice(idx, 1);
//               notify();
//           // }
//       },
//       // subscribe: function (listener) {
//       //     listeners.push(listener);
//       //     listener(transactions);
//       // }
//       subscribe: function (fn) { listeners.push(fn); }
//     };
// })();

// export default records;

// // export function updateCurrency(currency) {
// //     state.settings.preferredCurrency = currency;
// //     localStorage.setItem('appSettings', JSON.stringify(state.settings));
// // }

// // export function loadSettings() {
// //     const saved = localStorage.getItem('appSettings');
// //     if (saved) state.settings = JSON.parse(saved);
// // }

// // let rec = [];


// // export async function initState() {
// //   // Try to load from localStorage
// //   const stored = loadFromLocalStorage();
// //   if (stored && Array.isArray(stored)) {
// //     rec = stored;
// //     console.log('✅ Loaded from localStorage');
// //   } else {
// //     // If no localStorage, load from seed.json
// //     const res = await fetch('./seed.json');
// //     records = await res.json();
// //     saveToLocalStorage(rec);
// //     console.log('🌱 Loaded from seed.json and saved to localStorage');
// //   }
// // }

// // /* ---------- State Getters/Setters ---------- */

// // export function getRecords() {
// //   return rec;
// // }

// // export function addRecord(rec) {
// //   rec.push(record);
// //   saveToLocalStorage(rec);
// // }

// // export function updateRecord(id, updated) {
// //   const index = rec.findIndex((r) => r.id === id);
// //   if (index !== -1) {
// //     rec[index] = { ...rec[index], ...updated, updatedAt: new Date().toISOString() };
// //     saveToLocalStorage(rec);
// //   }
// // }

// // export function deleteRecord(id) {
// //   rec = rec.filter((r) => r.id !== id);
// //   saveToLocalStorage(rec);
// // }
