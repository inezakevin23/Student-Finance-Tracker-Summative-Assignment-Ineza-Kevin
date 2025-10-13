import records from './state.js';
import { filterTransactions } from './search.js';

// --- Utility: Calculate stats from transactions ---
function calculateStats(transactions) {
    let income = 0, expenses = 0;
    transactions.forEach(tx => {
        if (tx.type === 'income') income += tx.amount;
        else if (tx.type === 'expense') expenses += tx.amount;
    });
    return {
        income,
        expenses,
        balance: income - expenses
    };
}

// --- Render dashboard stats ---
function renderStats(stats) {
    const statsGrid = document.getElementById('statsGrid');
    if (!statsGrid) return;
    statsGrid.innerHTML = `
        <div class="stat-card">
            <h3>Balance</h3>
            <p class="stat-value balance">$${stats.balance.toFixed(2)}</p>
        </div>
        <div class="stat-card">
            <h3>Income</h3>
            <p class="stat-value income">$${stats.income.toFixed(2)}</p>
        </div>
        <div class="stat-card">
            <h3>Expenses</h3>
            <p class="stat-value expense">$${stats.expenses.toFixed(2)}</p>
        </div>
    `;
}

// --- Render transactions as cards (mobile) ---
function renderCards(transactions) {
    const container = document.getElementById('cardView');
    if (!container) return;
    if (transactions.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <p>No transactions yet</p>
            </div>
        `;
        return;
    }
    container.innerHTML = '';
    transactions.forEach(tx => {
        const card = document.createElement('div');
        card.className = `transaction-card ${tx.type}`;
        card.innerHTML = `
            <div class="card-header">
                <span class="badge ${tx.type}">${tx.type}</span>
                <span class="card-amount ${tx.type}">
                    ${tx.type === 'income' ? '+' : '-'}$${tx.amount.toFixed(2)}
                </span>
            </div>
            <div class="card-description">${tx.description}</div>
            <div class="card-meta">
                <span>📁 ${tx.category || ''}</span>
                <span>📅 ${tx.date}</span>
                <span>🆔 ${tx.id || ''}</span>
            </div>
            <div class="card-actions">
                <button class="btn btn-edit" data-id="${tx.id}">✏️ Edit</button>
                <button class="btn btn-delete" data-id="${tx.id}">🗑️ Delete</button>
            </div>
        `;
        container.appendChild(card);
    });
}

// --- Render transactions as table (desktop) ---
function renderTable(transactions) {
    const container = document.getElementById('tableView');
    if (!container) return;
    if (transactions.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <p>No transactions yet</p>
            </div>
        `;
        return;
    }
    let tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;
    transactions.forEach(tx => {
        tableHTML += `
            <tr>
                <td>${tx.id || ''}</td>
                <td>${tx.date}</td>
                <td><strong>${tx.description}</strong></td>
                <td>📁 ${tx.category || ''}</td>
                <td>
                    <span class="badge ${tx.type}">${tx.type}</span>
                </td>
                <td>
                    <span class="table-amount ${tx.type}">
                        ${tx.type === 'income' ? '+' : '-'}$${tx.amount.toFixed(2)}
                    </span>
                </td>
                <td>
                    <button class="btn btn-edit" data-id="${tx.id}">✏️</button>
                    <button class="btn btn-delete" data-id="${tx.id}">🗑️</button>
                </td>
            </tr>
        `;
    });
    tableHTML += `
            </tbody>
        </table>
    `;
    container.innerHTML = tableHTML;
}

// --- Render recent transactions ---
function renderRecent(transactions) {
    const list = document.getElementById('transaction-list');
    if (!list) return;
    list.innerHTML = '';
    transactions.slice(-5).reverse().forEach(tx => {
        const li = document.createElement('li');
        li.textContent = `${tx.date}: ${tx.description} (${tx.category}) ${tx.type === 'income' ? '+' : '-'}$${tx.amount}`;
        list.appendChild(li);
    });
}

// --- Responsive menu toggle ---
function setupMenuToggle() {
    const menuBtn = document.getElementById('menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    if (!menuBtn || !navMenu) return;
    menuBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        menuBtn.classList.toggle('open');
        navMenu.classList.toggle('open');
    });
    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function () {
            menuBtn.classList.remove('open');
            navMenu.classList.remove('open');
        });
    });
    document.addEventListener('click', function (e) {
        if (!menuBtn.contains(e.target) && !navMenu.contains(e.target)) {
            menuBtn.classList.remove('open');
            navMenu.classList.remove('open');
        }
    });
}

// --- Form UI helpers ---
function showSection(id) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });
    const s = document.getElementById(id);
    if (s) s.classList.remove('hidden');
}

// --- Edit and Delete Handlers ---
function setupTransactionActions(transactions, updateUI) {
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.onclick = function () {
            const id = btn.getAttribute('data-id');
            const tx = transactions.find(tx => tx.id == id);
            if (tx) {
                showSection('edit-transaction');
                const form = document.getElementById('editForm');
                form.id.value = tx.id;
                form.description.value = tx.description;
                form.amount.value = tx.amount;
                form.category.value = tx.category;
                form.type.value = tx.type;
            }
        };
    });
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.onclick = function () {
            const id = btn.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this transaction?')) {
                records.deleteTransactionById(id);
            }
        };
    });
}

// --- Main UI initialization ---
document.addEventListener('DOMContentLoaded', function () {
    setupMenuToggle();

    // Set up forms
    document.getElementById('show-income-form').onclick = () => showSection('add-income');
    document.getElementById('show-expense-form').onclick = () => showSection('add-expense');
    document.getElementById('cancel-income').onclick = () => showSection('');
    document.getElementById('cancel-expense').onclick = () => showSection('');
    document.getElementById('cancel-edit').onclick = () => showSection('');

    document.getElementById('incomeForm').onsubmit = function (e) {
        e.preventDefault();
        const form = e.target;
        try {
            records.addTransaction({
                type: 'income',
                amount: parseFloat(form.amount.value),
                category: form.category.value,
                description: form.description.value
            });
            form.reset();
            showSection('');
        } catch (err) {
            alert(err.message);
        }
    };

    document.getElementById('expenseForm').onsubmit = function (e) {
        e.preventDefault();
        const form = e.target;
        try {
            records.addTransaction({
                type: 'expense',
                amount: parseFloat(form.amount.value),
                category: form.category.value,
                description: form.description.value
            });
            form.reset();
            showSection('');
        } catch (err) {
            alert(err.message);
        }
    };

    document.getElementById('editForm').onsubmit = function (e) {
        e.preventDefault();
        const form = e.target;
        try {
            records.updateTransaction({
                id: form.id.value,
                description: form.description.value,
                amount: parseFloat(form.amount.value),
                category: form.category.value,
                type: form.type.value
            });
            showSection('');
        } catch (err) {
            alert(err.message);
        }
    };

    // Search/filter/sort
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search description/category...';
    searchInput.id = 'search-input';
    document.getElementById('records-controls').appendChild(searchInput);

    let currentFilter = '';
    searchInput.oninput = function () {
        currentFilter = searchInput.value;
        updateUI();
    };

    function updateUI() {
        let txs = records.getTransactions();
        if (currentFilter) {
            txs = filterTransactions(txs, currentFilter);
        }
        renderStats(calculateStats(txs));
        renderCards(txs);
        renderTable(txs);
        renderRecent(txs);
        setupTransactionActions(txs, updateUI);
    }

    records.subscribe(updateUI);
    updateUI();
});