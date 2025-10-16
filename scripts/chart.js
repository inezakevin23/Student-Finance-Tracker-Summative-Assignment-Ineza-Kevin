let categoryChartInstance;
let balanceChartInstance;
let incomeCategoryChartInstance;

export function getCategoryTotals(transactions) {
  const totals = {};
  transactions.forEach((tx) => {
    if (tx.type === "expense") {
      if (!totals[tx.category]) totals[tx.category] = 0;
      totals[tx.category] += tx.amount;
    }
  });
  return totals;
}

export function getIncomeCategoryTotals(transactions) {
  const totals = {};
  transactions.forEach((tx) => {
    if (tx.type === "income") {
      if (!totals[tx.category]) totals[tx.category] = 0;
      totals[tx.category] += tx.amount;
    }
  });
  return totals;
}

export function getBalanceOverTime(transactions) {
  const sorted = [...transactions].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );
  let balance = 0;
  return sorted.map((tx) => {
    balance += tx.type === "income" ? tx.amount : -tx.amount;
    return { date: tx.date, balance: balance.toFixed(2) };
  });
}

// expense per category graph
export function renderCategoryChart(transactions) {
  const ctx = document.getElementById("categoryChart").getContext("2d");
  const data = getCategoryTotals(transactions);
  const labels = Object.keys(data);
  const amounts = Object.values(data);

  if (categoryChartInstance) categoryChartInstance.destroy();

  categoryChartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          data: amounts,
          backgroundColor: [
            "#F44336",
            "#FF9800",
            "#2196F3",
            "#4CAF50",
            "#9C27B0",
            "#FFC107",
          ],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom" },
        title: { display: true, text: "Expenses by Category" },
      },
    },
  });
}

// income per category graph
export function renderIncomeCategoryChart(transactions) {
  const ctx = document.getElementById("incomeCategoryChart").getContext("2d");
  const data = getIncomeCategoryTotals(transactions);
  const labels = Object.keys(data);
  const amounts = Object.values(data);

  if (incomeCategoryChartInstance) incomeCategoryChartInstance.destroy();

  incomeCategoryChartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          data: amounts,
          backgroundColor: [
            "#4CAF50",
            "#2196F3",
            "#FF9800",
            "#F44336",
            "#9C27B0",
            "#FFC107",
          ],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom" },
        title: { display: true, text: "Income by Category" },
      },
    },
  });
}

// balance over time graph
export function renderBalanceChart(transactions) {
  const ctx = document.getElementById("balanceChart").getContext("2d");
  const dataPoints = getBalanceOverTime(transactions);

  if (balanceChartInstance) balanceChartInstance.destroy();

  balanceChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: dataPoints.map((d) => d.date),
      datasets: [
        {
          label: "Balance Over Time",
          data: dataPoints.map((d) => d.balance),
          fill: false,
          borderColor: "#2196F3",
          tension: 0.1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true },
        title: { display: true, text: "Balance Trend" },
      },
      scales: { y: { beginAtZero: true } },
    },
  });
}
