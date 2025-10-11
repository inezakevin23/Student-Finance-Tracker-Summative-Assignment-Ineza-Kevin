import seedData from '../seed.json' assert { type: 'json' };

const records = (function() {
    let transactions = JSON.parse(JSON.stringify(seedData));
    let listeners = [];
    
    function notify() {
        listeners.forEach(listener => listener(transactions));
    }

    // Private: Generate unique ID
    function generateId() {
        const maxId = transactions.reduce((max, transaction) =>
            const transactionId = parseInt(transaction.id, 10);
            return transactionId > max ? transactionId : max;
        , 0);
        return (maxId + 1).toString();
    }

    // Initialize IDs for seed data if not present
    transactions = transactions.map((transaction, index) => ({
        id: transaction.id || generateId(),
        ...transaction
    }));

    // Private: Get current timestamp
    function getCurrentTimestamp() {
        return new Date().toISOString();
    }

    // Public API
    return {
        getTransactions: function() {
            return transactions;
        },
        getIncome: function() {
            return transactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0);
        },
        getExpenses: function() {
            return transactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);
        },
        getBalance: function() {
            return this.getIncome() - this.getExpenses();
        },
        getByCategory: function(category) {
            return transactions.filter(t => t.category === category);
        },
        getByDateRange: function(startDate, endDate) {
            return transactions.filter(t => {
                const date = new Date(t.date);
                return date >= new Date(startDate) && date <= new Date(endDate);
            });
        },
        addIncome: function(amount, category, description) {
            const transaction = {
                id: generateId(),
                type: 'income',
                amount,
                category,
                description,
                date: getCurrentTimestamp()
            };
            this.addTransaction(transaction);
        },
        addExpense: function(amount, category, description) {
            const transaction = {
                id: generateId(),
                type: 'expense',
                amount,
                category,
                description,
                date: getCurrentTimestamp()
            };
            this.addTransaction(transaction);
        },

        addTransaction: function(transaction) {
            const requiredFields = ['type', 'amount', 'category', 'description'];
            for (const field of requiredFields) {
                if (!(field in transaction)) {
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
        deleteTransaction: function(index) {
            transactions.splice(index, 1);
            notify();
        },
        subscribe: function(listener) {
            listeners.push(listener);
        }
    };
})();

export default records;

