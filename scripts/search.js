// Returns filtered transactions and a highlight function
export function filterAndHighlight(transactions, pattern, caseInsensitive) {
  let regex;
  let flags = caseInsensitive ? "gi" : "g";
  try {
    regex = pattern ? new RegExp(pattern, flags) : null;
  } catch (e) {
    return { filtered: [], highlight: (s) => s }; // invalid regex
  }
  function highlight(text) {
    if (!regex || !text) return text;
    // Accessible: <mark> with aria-label
    return text.replace(
      regex,
      (match) => `<mark aria-label="match">${match}</mark>`
    );
  }
  if (!regex) return { filtered: transactions, highlight };
  return {
    filtered: transactions.filter(
      (tx) =>
        regex.test(tx.description) ||
        regex.test(tx.category) ||
        regex.test(tx.type) ||
        regex.test(String(tx.amount))
    ),
    highlight,
  };
}
