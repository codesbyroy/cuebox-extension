/**
* Background Service Worker
* 
* Runs in the background when the extension is installed.
* Handles events and operations that need to run independently of the popup UI.
* Creates and manages the context menu for saving text to CueBox.
* Handles opening sites and pasting text from bookmarks.
* Initializes default values for storage type and theme.
*/
import './initialize';
import { type CueBoxBookmark, getCurrentStorage } from '../utils/storage';

// Helper function to save bookmark to storage
async function saveBookmarkToStorage(bookmark: CueBoxBookmark): Promise<void> {
    const storageType = await getCurrentStorage();
    
    chrome.storage[storageType].get('bookmarks', (result) => {
    const bookmarks = result.bookmarks || [];
    bookmarks.push(bookmark);
    chrome.storage[storageType].set({ bookmarks }, () => {
        // Only show notification if there was an error
        if (chrome.runtime.lastError) {
            chrome.notifications.create({
                type: 'basic',
                iconUrl: chrome.runtime.getURL('icon/icon128.png'),
                title: 'Error Saving to CueBox',
                    message: 'This page isn\'t supported yet. CueBox currently works only on ChatGPT, Gemini, Claude, and Perplexity.'

            });
        }
    });
    });
}

/**
* Normalize text by removing excess spaces
*/
function normalizeText(text: string): string {
    return text
    .replace(/[\u200B-\u200D\uFEFF]/g, '')    // remove zero-width chars
    .replace(/\s+/g, ' ')                     // collapse all whitespace (space, tab, newline, NBSP)
    .trim();
};

// Create context menu item when extension is installed
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'saveToCueBox',
        title: 'Save to CueBox',
        contexts: ['selection'],
        documentUrlPatterns: [
            '*://*.chatgpt.com/*',
            '*://*.gemini.google.com/*',
            '*://*.claude.ai/*',
            '*://*.perplexity.ai/*'
        ]
    });
});

// Site URLs mapping
const siteUrls = {
    'chatgpt': 'https://chatgpt.com/',
    'gemini': 'https://gemini.google.com/app',
    'claude': 'https://claude.ai/new',
    'perplexity': 'https://www.perplexity.ai/'
};

/**
 * Opens a site and pastes text into it
 */
type SiteName = keyof typeof siteUrls;

function openSiteAndPasteText(siteName: SiteName, text: string) {
    const url = siteUrls[siteName];
    
    // Open the site in a new tab and wait for it to load
    chrome.tabs.create({ url }, (tab) => {
        // Set up a listener for tab updates
        const tabUpdateListener = (tabId: number, changeInfo: chrome.tabs.TabChangeInfo) => {
            // Only proceed when the tab is completely loaded
            if (tabId === tab.id && changeInfo.status === 'complete') {
                // Remove the listener to avoid multiple calls
                chrome.tabs.onUpdated.removeListener(tabUpdateListener);
                
                // Give a little extra time for SPA frameworks to initialize
                setTimeout(() => {
                    chrome.tabs.sendMessage(tab.id!, {
                        action: 'pasteText',
                        text: text
                    }, (response) => {
                        console.log('Paste response:', response);
                    });
                }, 1000);
            }
        };
        
        // Add the listener
        chrome.tabs.onUpdated.addListener(tabUpdateListener);
    });
}

// Remove scrollText parameter from URL if it exists
function cleanUrl(url: string): string {
    try {
        const urlObj = new URL(url);
        urlObj.searchParams.delete('scrollText');
        return urlObj.toString();
    } catch (e) {
        return url;
    }
}

// Handle context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'saveToCueBox' && info.selectionText && tab?.url) {
        const selectedText = normalizeText(info.selectionText);
        const url = cleanUrl(tab.url);
        const timestamp = new Date().toISOString();
                
        // Determine site name based on URL
        let siteName: 'chatgpt' | 'gemini' | 'claude' | 'perplexity' | null = null;
        if (url.includes('chatgpt.com')) {
            siteName = 'chatgpt';
        } else if (url.includes('gemini.google.com')) {
            siteName = 'gemini';
        } else if (url.includes('claude.ai')) {
            siteName = 'claude';
        } else if (url.includes('perplexity.ai')) {
            siteName = 'perplexity';
        }
                
        // Create bookmark with the basic information we already have
        const bookmark: CueBoxBookmark = {
            id: Date.now().toString(),
            text: selectedText,
            url: url,
            timestamp: timestamp,
            siteName: siteName as 'chatgpt' | 'gemini' | 'claude' | 'perplexity'
        };
                        
        saveBookmarkToStorage(bookmark);
    }
});

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.action === 'openSiteAndPasteText') {
        const { siteName, text } = message;
        openSiteAndPasteText(siteName, text);
        sendResponse({ success: true });
        return true; // Indicates we'll send a response asynchronously
    }
});