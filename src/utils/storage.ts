/**
* Storage Utility
* 
* Provides functions for interacting with Chrome's storage API.
* Used for saving and retrieving bookmarks.
*/


export interface CueBoxBookmark {
    id: string;
    text: string;
    url: string;
    timestamp: string;
    siteName: 'chatgpt' | 'gemini' | 'claude' | 'perplexity';
    icon?: string;
}

/**
* Get current storage type (local or sync)
*/
export const getCurrentStorage = (): Promise<'local' | 'sync'> => {
    return new Promise((resolve) => {
        chrome.storage.local.get('storagePreference', (localResult) => {
            if (localResult.storagePreference) {
                resolve(localResult.storagePreference);
            } else {
                chrome.storage.sync.get('storagePreference', (syncResult) => {
                    resolve(syncResult.storagePreference || 'local');
                });
            }
        });
    });
};


/**
* Get all bookmarks from storage
*/
export const getBookmarks = async (): Promise<CueBoxBookmark[]> => {
    const storageType = await getCurrentStorage();
    
    return new Promise((resolve) => {
        chrome.storage[storageType].get('bookmarks', (result) => {
            resolve(result.bookmarks || []);
        });
    });
};

/**
* Save a bookmark to storage
* Only shows notification if saving fails
*/
export const saveBookmark = async (bookmark: CueBoxBookmark): Promise<void> => {
    const storageType = await getCurrentStorage();
    
    return new Promise((resolve, reject) => {
        getBookmarks().then((bookmarks) => {
            bookmarks.push(bookmark);
            chrome.storage[storageType].set({ bookmarks }, () => {
                if (chrome.runtime.lastError) {
                    // Show notification only on error
                    chrome.notifications.create({
                        type: 'basic',
                        iconUrl: chrome.runtime.getURL('icon/icon128.png'),
                        title: 'Error Saving to CueBox',
                        message: 'Failed to save the cue. Please try again.'
                    });
                    reject(chrome.runtime.lastError);
                } else {
                    resolve();
                }
            });
        });
    });
};

/**
* Delete a bookmark from storage
*/
export const deleteBookmark = async (id: string): Promise<void> => {
    const storageType = await getCurrentStorage();
    
    return new Promise((resolve) => {
        getBookmarks().then((bookmarks) => {
            const updatedBookmarks = bookmarks.filter((bookmark) => bookmark.id !== id);
            chrome.storage[storageType].set({ bookmarks: updatedBookmarks }, resolve);
        });
    });
};