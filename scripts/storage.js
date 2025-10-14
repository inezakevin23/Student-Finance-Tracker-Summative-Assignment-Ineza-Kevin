import { validateRecord, validateRecordsArray } from './validators.js';

const STORAGE_KEY = 'finance-tracker:data';
const SETTINGS_KEY = 'finance-tracker:settings';
const THEME_KEY = 'finance-tracker:theme';

// Load array of records from localStorage, or null if not present
export function loadFromLocalStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return null;
    return data;
  } catch (err) {
    console.error('Failed to load data from localStorage:', err);
    return null;
  }
}

// --- Currency Settings ---
export function loadSettingsFromLocalStorage() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}
export function saveSettingsToLocalStorage(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings to localStorage:', err);
  }
}

// --- Theme ---
export function loadThemeFromLocalStorage() {
  return localStorage.getItem(THEME_KEY) || 'light';
}
export function saveThemeToLocalStorage(theme) {
  localStorage.setItem(THEME_KEY, theme);
}

// Save array of records to localStorage
export function saveToLocalStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save data to localStorage:', err);
  }
}

// Export records as JSON file
export function exportToJSON(data) {
  try {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'finance_data_backup.json';
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Export failed:', err);
  }
}

// Import and validate JSON file. Callback updates app state.
export function importFromJSON(file, callback) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const json = JSON.parse(e.target.result);
      if (!validateRecordsArray(json)) {
        alert('❌ Invalid JSON format. Please check your file.');
        return;
      }
      saveToLocalStorage(json);
      callback(json); // update app state/UI
      alert('✅ Data imported successfully!');
    } catch (err) {
      console.error('Import failed:', err);
      alert('❌ Could not import file. Invalid JSON or format.');
    }
  };
  reader.readAsText(file);
}

// Clear localStorage (for testing or reset)
export function clearLocalStorage() {
  localStorage.removeItem(STORAGE_KEY);
}