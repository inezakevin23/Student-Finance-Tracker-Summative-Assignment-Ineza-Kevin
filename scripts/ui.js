import records from './state.js';
import {  filterAndHighlight } from './search.js';
import { renderCategoryChart, renderBalanceChart } from './chart.js';
import { state, loadSeedData, replaceTransactions, setCurrency, setExchangeRate } from './state.js';
import { loadThemeFromLocalStorage, saveThemeToLocalStorage } from './storage.js';
import { exportToJSON } from './storage.js';

// --- Utility: Format amount in chosen currency ---
function formatAmount(amount) {
    const currency = state.settings.preferredCurrency;
    const symbol = state.settings.currencySymbols[currency] || currency;
    const rate = state.settings.exchangeRates[currency] || 1;
    return `${symbol} ${(amount * rate).toFixed(2)}`;
}

// --- Theme helpers ---
function applyTheme(theme) {
    document.body.classList.remove('theme-dark', 'theme-light');
    document.body.classList.add(theme === 'dark' ? 'theme-dark' : 'theme-light');
    saveThemeToLocalStorage(theme);
}
function setupThemeToggle() {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    // Initial theme
    const initialTheme = loadThemeFromLocalStorage();
    applyTheme(initialTheme);
    btn.onclick = () => {
        const newTheme = document.body.classList.contains('theme-dark') ? 'light' : 'dark';
        applyTheme(newTheme);
    };
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
            <p class="stat-value balance">${formatAmount(stats.balance.toFixed(2))}</p>
        </div>
        <div class="stat-card">
            <h3>Income</h3>
            <p class="stat-value income">${formatAmount(stats.income.toFixed(2))}</p>
        </div>
        <div class="stat-card">
            <h3>Expenses</h3>
            <p class="stat-value expense">${formatAmount(stats.expenses.toFixed(2))}</p>
        </div>
    `;
}


// --- Render recent transactions ---
function renderRecent(transactions) {
    const list = document.getElementById('transaction-list');
    if (!list) return;
    list.innerHTML = '';
    transactions.slice(-7).reverse().forEach(tx => {
        const li = document.createElement('li');
        li.textContent = `${tx.date}: ${tx.description} (${tx.category}) ${tx.type === 'income' ? '+' : '-'}${formatAmount(tx.amount)}`;
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

// // Smooth scroll for navigation
// function navLinks () {
//     document.querySelectorAll('a[href^="#"]').forEach(anchor => {
//   anchor.addEventListener("click", function (e) {
//     e.preventDefault();
//     const target = document.querySelector(this.getAttribute("href"));
//     if (target) {
//       target.scrollIntoView({ behavior: "smooth" });
//       navMenu.classList.remove("active");
//     }
//   });
// });
// }

// --- show/hide section ---
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


// // --- Main UI initialization ---
// document.addEventListener('DOMContentLoaded', async function () {
//     setupMenuToggle();
//     navLinks();
//     // 1. Load seed.json
//     await loadSeedData(); 
//     records.initFromState(); 
//     // Update UI when user selects a new currency
//     document.getElementById('currencySelect').onchange = function(e) {
//     updateCurrency(e.target.value);
//     updateUI(); // refresh all amounts
 

//     // Set up forms
//     document.getElementById('show-income-form').onclick = () => showSection('add-income');
//     document.getElementById('show-expense-form').onclick = () => showSection('add-expense');
//     document.getElementById('cancel-income').onclick = () => showSection('');
//     document.getElementById('cancel-expense').onclick = () => showSection('');
//     document.getElementById('cancel-edit').onclick = () => showSection('');

//     document.getElementById('incomeForm').onsubmit = function (e) {
//         e.preventDefault();
//         const form = e.target;
//         try {
//             records.addTransaction({
//                 type: 'income',
//                 amount: parseFloat(form.amount.value),
//                 category: form.category.value,
//                 description: form.description.value
//             });
//             form.reset();
//             showSection('');
//         } catch (err) {
//             alert(err.message);
//         }
//     };

//     document.getElementById('expenseForm').onsubmit = function (e) {
//         e.preventDefault();
//         const form = e.target;
//         try {
//             records.addTransaction({
//                 type: 'expense',
//                 amount: parseFloat(form.amount.value),
//                 category: form.category.value,
//                 description: form.description.value
//             });
//             form.reset();
//             showSection('');
//         } catch (err) {
//             alert(err.message);
//         }
//     };

//     document.getElementById('editForm').onsubmit = function (e) {
//         e.preventDefault();
//         const form = e.target;
//         try {
//             records.updateTransaction({
//                 id: form.id.value,
//                 description: form.description.value,
//                 amount: parseFloat(form.amount.value),
//                 category: form.category.value,
//                 type: form.type.value
//             });
//             showSection('');
//         } catch (err) {
//             alert(err.message);
//         }
//     };

//     // Search/filter/sort
//     const searchInput = document.createElement('input');
//     searchInput.type = 'text';
//     searchInput.placeholder = 'Search description/category...';
//     searchInput.id = 'search-input';
//     document.getElementById('records-controls').appendChild(searchInput);

//     let currentFilter = '';
//     searchInput.oninput = function () {
//         currentFilter = searchInput.value;
//         updateUI();
//     };

//     function updateUI() {
//         let txs = records.getTransactions();
//         if (currentFilter) {
//             txs = filterTransactions(txs, currentFilter);
//         }
//         renderStats(calculateStats(txs));
//         renderCards(txs);
//         renderTable(txs);
//         renderRecent(txs);
//         renderBalanceChart(txs);
//         renderCategoryChart(txs);
//         setupTransactionActions(txs, updateUI);
//     }

//     records.subscribe(updateUI);
//     updateUI();
// }});

// --- Forms: Add Income/Expense ---
function setupForms(updateUI) {
    document.getElementById('show-income-form').onclick = () => showSection('add-income');
    document.getElementById('show-expense-form').onclick = () => showSection('add-expense');
    document.getElementById('cancel-income').onclick = () => showSection('transactions');
    document.getElementById('cancel-expense').onclick = () => showSection('transactions');
    document.getElementById('cancel-edit').onclick = () => showSection('transactions');

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
            showSection('transactions');
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
            showSection('transactions');
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
            showSection('transactions');
        } catch (err) {
            alert(err.message);
        }
    };
}

// --- Sorting helper ---
function sortTransactions(transactions, sortKey, sortDir) {
    let sorted = [...transactions];
    switch (sortKey) {
        case 'date':
            sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
            break;
        case 'desc':
            sorted.sort((a, b) => a.description.localeCompare(b.description));
            break;
        case 'amount':
            sorted.sort((a, b) => a.amount - b.amount);
            break;
        default:
            break;
    }
    if (sortDir === 'desc') sorted.reverse();
    return sorted;
}

// --- Render cards/table (with highlight) ---
function renderCards(transactions, highlight) {
    const container = document.getElementById('cardView');
    if (!container) return;
    if (transactions.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📭</div><p>No transactions yet</p></div>`;
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
                    ${tx.type === 'income' ? '+' : '-'}${formatAmount(tx.amount.toFixed(2))}
                </span>
            </div>
            <div class="card-description">${highlight(tx.description)}</div>
            <div class="card-meta">
                <span>📁 ${highlight(tx.category || '')}</span>
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

function renderTable(transactions, highlight) {
    const container = document.getElementById('tableView');
    if (!container) return;
    if (transactions.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📭</div><p>No transactions yet</p></div>`;
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
                <td><strong>${highlight(tx.description)}</strong></td>
                <td>📁 ${highlight(tx.category || '')}</td>
                <td>
                    <span class="badge ${tx.type}">${tx.type}</span>
                </td>
                <td>
                    <span class="table-amount ${tx.type}">
                        ${tx.type === 'income' ? '+' : '-'}${formatAmount(tx.amount.toFixed(2))}
                    </span>
                </td>
                <td>
                    <button class="btn btn-edit" data-id="${tx.id}">✏️</button>
                    <button class="btn btn-delete" data-id="${tx.id}">🗑️</button>
                </td>
            </tr>
        `;
    });
    tableHTML += `</tbody></table>`;
    container.innerHTML = tableHTML;
}

// --- Search & Sort logic ---
function setupSearchAndSort(updateUI) {
    const searchInput = document.getElementById('search-input');
    const caseBox = document.getElementById('search-case');
    const clearBtn = document.getElementById('clearSearchBtn');
    const sortSelect = document.getElementById('sort-select');
    const sortDirBtn = document.getElementById('sortDir');
    let sortKey = 'date';
    let sortDir = 'desc';

    // Sort select
    sortSelect.onchange = function () {
        let val = sortSelect.value;
        if (val.includes('date')) sortKey = 'date';
        else if (val.includes('desc')) sortKey = 'desc';
        else if (val.includes('amount')) sortKey = 'amount';
        sortDir = val.endsWith('desc') ? 'desc' : 'asc';
        updateUI();
    };
    // Sort direction toggle (for table)
    sortDirBtn.onclick = function () {
        sortDir = (sortDir === 'asc') ? 'desc' : 'asc';
        updateUI();
    };

    // Live search
    function triggerSearch() { updateUI(); }
    searchInput.oninput = triggerSearch;
    caseBox.onchange = triggerSearch;
    clearBtn.onclick = function () {
        searchInput.value = '';
        triggerSearch();
    };
}

// --- Import/Export setup ---
function setupImportExport(updateUI) {
  // Export button
  document.getElementById('exportBtn').onclick = function () {
    exportToJSON(records.getTransactions());
  };

  // Import button/file input
  const importLabel = document.querySelector('.import-label');
  const importInput = document.getElementById('importInput');
  importLabel.onclick = () => importInput.click();
  importInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    importFromJSON(file, arr => {
      replaceTransactions(arr); // update state, triggers UI update
      updateUI();
    });
  };
}

// --- Settings: Currency change and manual exchange rates ---
function setupCurrencySettings(updateUI) {
    const curSelect = document.getElementById('currencySelect');
    if (curSelect) {
        curSelect.innerHTML = state.settings.availableCurrencies
            .map(c => `<option value="${c}" ${state.settings.preferredCurrency === c ? "selected" : ""}>${c}</option>`).join('');
        curSelect.onchange = function(e) {
            setCurrency(e.target.value);
            updateUI();
        };
    }
    // Manual rate inputs
    const rateContainer = document.getElementById('manualRates');
    if (rateContainer) {
        rateContainer.innerHTML = state.settings.availableCurrencies.map(currency => {
            return `
            <div>
                <label>${currency} rate:</label>
                <input type="number" step="0.01" min="0.01" id="rate-${currency}" value="${state.settings.exchangeRates[currency]}">
            </div>
            `;
        }).join('');
        state.settings.availableCurrencies.forEach(currency => {
            const input = document.getElementById(`rate-${currency}`);
            if (input) {
                input.onchange = (e) => {
                    setExchangeRate(currency, parseFloat(e.target.value));
                    updateUI();
                };
            }
        });
    }
}

// --- Main UI initialization ---
document.addEventListener('DOMContentLoaded', async function () {
    setupMenuToggle();
    setupThemeToggle();
    await loadSeedData();
    records.initFromState();
    // Update UI when user selects a new currency
    document.getElementById('currencySelect').onchange = function(e) {
    updateCurrency(e.target.value);
    updateUI(); // refresh all amounts
    }

    setupForms(updateUI);
    setupSearchAndSort(updateUI);
    setupImportExport(updateUI);
    setupCurrencySettings(updateUI);

    function updateUI() {
        let txs = records.getTransactions();
        const searchInput = document.getElementById('search-input');
        const caseBox = document.getElementById('search-case');
        const pattern = searchInput ? searchInput.value : '';
        const caseInsensitive = caseBox ? caseBox.checked : true;
        const { filtered, highlight } = filterAndHighlight(txs, pattern, caseInsensitive);

        // Sorting
        const sortSelect = document.getElementById('sort-select');
        // const sortDirBtn = document.getElementById('sortDir');
        let sortKey = 'date', sortDir = 'desc';
        if (sortSelect) {
            let val = sortSelect.value;
            if (val.includes('date')) sortKey = 'date';
            else if (val.includes('desc')) sortKey = 'desc';
            else if (val.includes('amount')) sortKey = 'amount';
            sortDir = val.endsWith('desc') ? 'desc' : 'asc';
        }
        txs = sortTransactions(filtered, sortKey, sortDir);

        renderStats(calculateStats(txs));
        renderCards(txs, highlight);
        renderTable(txs, highlight);
        renderCategoryChart(txs);
        renderBalanceChart(txs);
        renderRecent(txs);
        setupTransactionActions(txs, updateUI);
        setupCurrencySettings(updateUI);
    }

    records.subscribe(updateUI);
    showSection('dashboard');
    updateUI();
});