export let state = {
  transactions: [],
};

// Load seed.json data into state
export async function loadSeedData() {
  try {
    const res = await fetch('./seed.json'); // path depends on your structure
    const data = await res.json();
    state.transactions = data;
    console.log("Seed data loaded:", state.transactions);
  } catch (err) {
    console.error("Failed to load seed.json:", err);
  }
}


// Module pattern for state management
const records = (function () {
    let transactions = [];
    let listeners = [];
    
    function notify() {
        listeners.forEach(listener => listener(transactions));
    }
    function initFromState() {
    transactions = Array.isArray(state.transactions) ? JSON.parse(JSON.stringify(state.transactions)) : [];
    notify();
    }

    function generateId() {
    const maxId = transactions.reduce((max, t) => {
      const transactionId = parseInt(t.id, 10) || 0;
      return transactionId > max ? transactionId : max;
    }, 0);
    return (maxId + 1).toString();
    }

    function getCurrentTimestamp() {
        return new Date().toISOString().slice(0, 10);
    }

    return {
        initFromState,
        getTransactions: function () {
            return [...transactions];
        },
        getIncome: function () {
            return transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        },
        getExpenses: function () {
            return transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        },
        getBalance: function () {
            return this.getIncome() - this.getExpenses();
        },
        getByCategory: function (category) {
            return transactions.filter(t => t.category === category);
        },
        getByDateRange: function (startDate, endDate) {
            return transactions.filter(t => {
                const date = new Date(t.date);
                return date >= new Date(startDate) && date <= new Date(endDate);
            });
        },
        addTransaction: function (transaction) {
            const requiredFields = ['type', 'amount', 'category', 'description'];
            for (const field of requiredFields) {
                if (!(field in transaction) || transaction[field] === '') {
                    throw new Error(`Missing required field: ${field}`);
                }
            }
            if (transaction.type !== 'income' && transaction.type !== 'expense') {
                throw new Error("Type must be 'income' or 'expense'");
            }
            if (typeof transaction.amount !== 'number' || transaction.amount <= 0) {
                throw new Error("Amount must be a positive number");
            }
            transaction.id = generateId();
            transaction.date = transaction.date || getCurrentTimestamp();
            transactions.push(transaction);
            notify();
        },
        updateTransaction: function (updated) {
            const idx = transactions.findIndex(t => t.id == updated.id);
            if (idx === -1) throw new Error("Transaction not found");
            transactions[idx] = { ...transactions[idx], ...updated };
            notify();
        },
        deleteTransactionById: function (id) {
            const idx = transactions.findIndex(t => t.id == id);
            if (idx !== -1) {
                transactions.splice(idx, 1);
                notify();
            }
        },
        subscribe: function (listener) {
            listeners.push(listener);
            listener(transactions);
        }
    };
})();

export default records;