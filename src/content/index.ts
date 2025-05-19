/**
 * Content Script
 * 
 * Injected into web pages that match the patterns defined in the manifest.
 * Allows the extension to interact with web page content.
 * Listens for messages from the background script and handles scroll-to-text logic.
 */
// Handle scroll-to-text if query parameter is present

function normalize(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
}

function scrollToBookmarkedText() {
    const params = new URLSearchParams(window.location.search);
    const scrollText = params.get("scrollText");

    if (!scrollText) return;
    const target = normalize(scrollText);

    const cleanUpUrl = () => {
        const url = new URL(window.location.href);
        url.searchParams.delete("scrollText");
        window.history.replaceState({}, document.title, url.toString());
    };

    const tryScroll = (target: string): boolean => {
        const skipTags = new Set(['script', 'style', 'noscript', 'head', 'meta', 'svg', 'iframe']);
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode(node) {
                    let parent = node.parentElement;
                    while (parent) {
                        if (skipTags.has(parent.tagName.toLowerCase())) {
                            return NodeFilter.FILTER_REJECT;
                        }
                        parent = parent.parentElement;
                    }
                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );

        let fullText = "";
        const textNodes: { node: Text; start: number; end: number }[] = [];
        let currentNode: Node | null;
        let currentPos = 0;

        // Flatten all text and track node ranges
        while ((currentNode = walker.nextNode())) {
            const text = currentNode.textContent || '';
            const normText = normalize(text);
            const start = currentPos;
            const end = start + normText.length;

            textNodes.push({ node: currentNode as Text, start, end });
            fullText += normText;
            currentPos = end;
        }

        const matchIndex = fullText.indexOf(target);
        if (matchIndex === -1) return false;

        const matchEnd = matchIndex + target.length;

        // Create DOM Range from matched text
        const range = document.createRange();
        let rangeStarted = false;

        for (const { node, start, end } of textNodes) {
            if (!rangeStarted && matchIndex >= start && matchIndex < end) {
                // Ensure offset doesn't exceed node length
                const startOffset = Math.min(matchIndex - start, node.length);
                try {
                    range.setStart(node, startOffset);
                    rangeStarted = true;
                } catch (e) {
                    continue;
                }
            }
            if (rangeStarted && matchEnd <= end) {
                // Ensure offset doesn't exceed node length
                const endOffset = Math.min(matchEnd - start, node.length);
                try {
                    range.setEnd(node, endOffset);
                    break;
                } catch (e) {
                    rangeStarted = false;
                    break;
                }
            }
        }

        // Fallback in case range is invalid
        if (!rangeStarted || range.collapsed) return false;

        // Highlight
        const span = document.createElement("span");
        span.style.backgroundColor = "rgba(227, 246, 252, 0.5)";
        span.style.outline = "2px solid #4dabf7";
        span.style.borderRadius = "4px";
        try {
            range.surroundContents(span);
        } catch (e) {
            // Some cases like partial tag wrapping can throw
            const temp = document.createElement("span");
            temp.appendChild(range.extractContents());
            span.appendChild(temp);
            range.insertNode(span);
        }

        setTimeout(() => {
            span.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 50);

        // Auto-remove highlight after a while
        setTimeout(() => {
            span.style.backgroundColor = "";
            span.style.outline = "";
            span.style.borderRadius = "";
        }, 3000);

        return true;
    };

    // Use observer for delayed content (like SPAs)
    const observer = new MutationObserver((_mutations, obs) => {
        if (tryScroll(target)) {
            obs.disconnect();
        }
    });

    const scrollSucceeded = tryScroll(target);
    if (!scrollSucceeded) {
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });

        setTimeout(() => {
            observer.disconnect();
            cleanUpUrl(); // ✅ cleanup after timeout, scroll may or may not succeed
        }, 10000);
    } else {
        cleanUpUrl(); // ✅ cleanup immediately if scroll succeeds
    }
}

// Function to run after page has completely loaded
function runAfterPageLoad(callback: () => void) {
    if (document.readyState === 'complete') {
        callback();
    } else {
        window.addEventListener('load', callback);
    }
}

// Run scroll logic
runAfterPageLoad(scrollToBookmarkedText);

// Function to handle pasting text
function handlePasteText(message: any, sendResponse: (response: any) => void) {
    // Find the appropriate input element
    let textareaField: HTMLTextAreaElement | null = null;
    let editableField: HTMLElement | null = null;

    const url = window.location.href;

    if (
        url.includes('chatgpt.com') ||
        url.includes('gemini.google.com') ||
        url.includes('claude.ai')
    ) {
        editableField = document.querySelector('[contenteditable="true"]') as HTMLElement;
    } else if (url.includes('perplexity.ai')) {
        textareaField = document.querySelector('textarea[placeholder*="Ask"]') as HTMLTextAreaElement;
    }

    // Handle ProseMirror-style contenteditable field
    if (editableField && editableField.isContentEditable) {
        editableField.focus();

        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) {
            sendResponse({ success: false, message: "No selection found" });
            return;
        }

        const range = selection.getRangeAt(0);
        range.deleteContents();

        const textNode = document.createTextNode(message.text);
        range.insertNode(textNode);

        // Move caret after inserted text
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        selection.removeAllRanges();
        selection.addRange(range);

        // Trigger any reactive listeners
        editableField.dispatchEvent(new Event('input', { bubbles: true }));

        sendResponse({ success: true });
    }

    // Handle regular textarea (Perplexity)
    else if (textareaField) {
        textareaField.focus();
        textareaField.value = message.text;
        textareaField.dispatchEvent(new Event('input', { bubbles: true }));

        sendResponse({ success: true });
    }

    // No suitable input found
    else {
        sendResponse({ success: false, message: "No editable field or textarea found" });
    }
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.action === 'getSelectedText') {
        const selectedText = window.getSelection()?.toString() || '';
        sendResponse({ selectedText });
        return true;
    }
    
    if (message.action === 'pasteText') {
        runAfterPageLoad(() => handlePasteText(message, sendResponse));
        return true;
    }

    return true;
});
