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
// Description/title: no leading/trailing spaces
const descriptionRegex = /^\S(?:.*\S)?$/;

// Amount: number with up to 2 decimals
const amountRegex = /^(0|[1-9]\d*)(\.\d{1,2})?$/;

// Date: YYYY-MM-DD format
const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

// Category: letters/spaces/hyphens only
const categoryRegex = /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/;

// Validate a single record object
export function validateRecord(rec) {
  if (typeof rec !== 'object' || rec === null) return false;

  const requiredFields = [
    'id',
    'description',
    'amount',
    'category',
    'date',
    'createdAt',
    'updatedAt',
  ];

  // Check all required fields exist
  for (const field of requiredFields) {
    if (!(field in rec)) return false;
  }
  // Validate field formats
  if (!descriptionRegex.test(rec.description)) return false;
  if (!amountRegex.test(String(rec.amount))) return false;
  if (!categoryRegex.test(rec.category)) return false;
  if (!dateRegex.test(rec.date)) return false;

  // Optional: check timestamps are strings
  if (typeof rec.createdAt !== 'string' || typeof rec.updatedAt !== 'string')
    return false;

  return true;
}

// Validate array of records (e.g., for import)
export function validateRecordsArray(arr) {
  if (!Array.isArray(arr)) return false;
  return arr.every(validateRecord);
}

/* ---------- Export regexes (for tests/docs) ---------- */
export const regexCatalog = {
  descriptionRegex,
  amountRegex,
  dateRegex,
  categoryRegex,
};