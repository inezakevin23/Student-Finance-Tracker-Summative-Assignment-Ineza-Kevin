// Validate description: at least 3 chars, no only spaces, no repeated words (back-reference)
export function validateDescription(desc) {
    // At least 3 non-space chars, no repeated words (e.g. "food food")
    const repeatedWord = /\b(\w+)\b\s+\1\b/i; // back-reference
    return typeof desc === 'string' &&
        desc.trim().length >= 3 &&
        !repeatedWord.test(desc);
}

// Validate amount: positive number, no leading zeros (lookahead)
export function validateAmount(amount) {
    // Positive number, no leading zeros except for decimals
    const valid = /^(?=.+)(?!0\d)\d+(\.\d{1,2})?$/;
    return valid.test(String(amount)) && parseFloat(amount) > 0;
}

// Validate category: letters only, optional
export function validateCategory(cat) {
    return cat === '' || /^[a-zA-Z\s]{0,30}$/.test(cat);
}

// Regex-powered search (advanced: lookahead for type, back-reference for repeated word)
export function regexSearch(transactions, pattern) {
    let regex;
    try {
        regex = new RegExp(pattern, 'i');
    } catch (e) {
        return [];
    }
    return transactions.filter(tx =>
        regex.test(tx.description) ||
        regex.test(tx.category) ||
        regex.test(tx.amount) ||
        regex.test(tx.type)
    );
}