/**
 * Extension Initialization
 * 
 * Initializes default values for storage type and theme when the extension is loaded
 */

// Initialize default values for storage type and theme
const initializeDefaultValues = async (): Promise<void> => {
    try {
        // Check if storage type is already set
        const localStorageResult = await chrome.storage.local.get('storagePreference');
        const syncStorageResult = await chrome.storage.sync.get('storagePreference');

        if (!localStorageResult.storagePreference && !syncStorageResult.storagePreference) {
            // Set default storage type to 'local'
            await chrome.storage.local.set({ storagePreference: 'local' });
            await chrome.storage.local.set({ theme: 'dark' });
        }
    } catch (error) {
        console.error('Error initializing default values:', error);
    }
};

// Run initialization when extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  initializeDefaultValues();
});

// Run initialization when extension is loaded
initializeDefaultValues();

export { initializeDefaultValues };