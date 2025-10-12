// --- Utility: Fetch seed.json and return parsed data ---
async function loadSeedData() {
    try {
        const response = await fetch('seed.json');
        if (!response.ok) throw new Error('Failed to load seed.json');
        return await response.json();
    } catch (err) {
        console.error('Error loading seed.json:', err);
        return { transactions: [] };
    }
}

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

// --- Edit and Delete Handlers ---
function setupTransactionActions(transactions, updateUI) {
    // Cards
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.onclick = function() {
            const id = btn.getAttribute('data-id');
            alert(`Edit transaction ${id} - Connect this to your edit form!`);
        };
    });
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.onclick = function() {
            const id = btn.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this transaction?')) {
                // Remove transaction from array and update UI
                const idx = transactions.findIndex(tx => tx.id == id);
                if (idx !== -1) {
                    transactions.splice(idx, 1);
                    updateUI();
                }
            }
        };
    });
}

// --- Responsive menu toggle ---
function setupMenuToggle() {
    const menuBtn = document.getElementById('menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    if (!menuBtn || !navMenu) return;
    menuBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        menuBtn.classList.toggle('open');
        navMenu.classList.toggle('open');
    });
    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function() {
            menuBtn.classList.remove('open');
            navMenu.classList.remove('open');
        });
    });
    document.addEventListener('click', function(e) {
        if (!menuBtn.contains(e.target) && !navMenu.contains(e.target)) {
            menuBtn.classList.remove('open');
            navMenu.classList.remove('open');
        }
    });
}

// --- Main UI initialization ---
document.addEventListener('DOMContentLoaded', async function() {
    setupMenuToggle();

    // Load seed.json and render dashboard
    const data = await loadSeedData();
    // Ensure each transaction has a unique id
    data.transactions.forEach((tx, i) => { if (!tx.id) tx.id = i + 1; });

    function updateUI() {
        renderStats(calculateStats(data.transactions));
        renderCards(data.transactions);
        renderTable(data.transactions);
        setupTransactionActions(data.transactions, updateUI);
    }

    updateUI();
});