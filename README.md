# CueBox Chrome Extension

A Chrome extension for saving and managing AI prompts. Developed by [hablar](https://cuebox.store).

---

## 🚀 Features

- Save AI prompts with metadata (prompt text, label, URL, timestamp)
- Direct links to popular AI platforms (ChatGPT, Gemini, Claude, Perplexity, etc.)
- Bookmark prompts for easy retrieval and reuse
- Link back to the original page/context where the prompt was created
- Start fresh conversation using the saved prompts
- Seamless use of prompts across supported apps. 
- Search and filter your saved prompts
- User-friendly popup UI for managing prompts

## 🛠️ Upcoming Features
- Create new prompts using AI-powered assistance
- Smart prompt enhancer for refining and optimizing inputs
- Cross-platform prompt syncing and navigation
- Prompt sharing feature among users

---

## 🛠️ Tech Stack

- **Frontend/UI:** React + TypeScript
- **Styling:** TailwindCSS
- **Build Tool:** Vite
- **Extension APIs:** Chrome Extensions APIs (Manifest V3)
- **Storage:** chrome.storage.local, Chrome Bookmarks API
- **Sync:** chrome.storage.sync, Chrome Bookmarks API
- **Background Logic:** TypeScript (background service worker)
- **Testing:** Chrome DevTools, Extension Storage Viewer

---

## 📦 Installation & Development

1. **Clone the repository:**
    ```
    git clone git@github.com:codesbyroy/cuebox-extension.git
    cd cuebox
    ```

2. **Install dependencies:**
    ```
    npm install
    ```

3. **Load the extension in Chrome:**
    - Go to `chrome://extensions`
    - Enable **Developer mode**
    - Click **Load unpacked** and select the `dist/` directory after building
    - Access the extension popup at: `chrome-extension://<your-extension-id>/src/popup/index.html`

4. **Start developing:**
    - Edit files in `/src`
    - Use TailwindCSS for styling components
    - Reload the extension in Chrome after making changes

---

## 📝 Usage

1. Click the CueBox extension icon in your Chrome toolbar.
2. Enter or paste your AI prompt in the popup.
3. Click **Save**; the extension will auto-label and store the prompt, along with the current page link.
4. Browse, search, and revisit your saved prompts anytime!

---

## 📋 Roadmap

- [x] Save and display prompts with metadata
- [x] Bookmark prompts and store original page URL
- [x] Sync across devices
- [x] Search/filter saved prompts
- [x] Start fresh convo using prompts
- [x] Seamless use of prompts across supported apps
- [ ] Prompt sharing features
- [ ] AI-powered 10-word auto-labeling

---

## 🔒 Privacy & Security

- Prompts are stored locally in your browser using `chrome.storage.local`.
- Prompts are also synced with goolge account linked to chrome using `chrome.storage.sync`.
- If using an external AI API for labeling, prompts are sent securely to the API provider.
- No data is shared with third parties without user consent.

---

## 🤝 Contact

This project is maintained by [hablar](https://cuebox.store).
While this project is open-source under the MIT License, we are not currently accepting external contributions.
For questions or feedback, please contact the maintainers at [hablar](https://cuebox.store).

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
