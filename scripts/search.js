export function filterTransactions(transactions, keyword) {
    if (!keyword) return transactions;
    keyword = keyword.trim().toLowerCase();
    return transactions.filter(tx =>
        (tx.description && tx.description.toLowerCase().includes(keyword)) ||
        (tx.category && tx.category.toLowerCase().includes(keyword))
    );
}