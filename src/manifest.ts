/**
* Chrome Extension Manifest
* 
* Defines the configuration for the CueBox Chrome extension.
* Includes permissions, resources, and component entry points.
*/
import { defineManifest } from '@crxjs/vite-plugin'

export default defineManifest({
    manifest_version: 3,
    name: "CueBox - Save, organize, and reuse AI prompts",
    version: "1.1.1",
    description: "Resume chats, filter and organize prompts, and switch platforms seamlessly — all for faster, streamlined workflows.",
                
    // Extension icons
    icons: {
        "16": "icon/icon16.png",
        "48": "icon/icon48.png",
        "128": "icon/icon128.png"
    },
                
    // Popup configuration
    action: {
        default_popup: "src/popup/index.html",
        default_icon: {
            "16": "icon/icon16.png",
            "48": "icon/icon48.png",
            "128": "icon/icon128.png"
        }
    },
                
    // Background service worker
    background: {
        service_worker: "src/background/index.ts",
        type: "module"
    },
                
    // Content scripts injected into web pages
    content_scripts: [
        {
            matches: [
                "https://chat.openai.com/*",
                "https://chatgpt.com/*",
                "https://claude.ai/*",
                "https://gemini.google.com/*",
                "https://www.perplexity.ai/*"
            ],
            js: ["src/content/index.ts"],
            run_at: "document_idle"
        }
    ],
                
    // Required permissions
    permissions: ["storage", "contextMenus", "notifications", "clipboardWrite", "activeTab"],
    host_permissions: [
        "https://chat.openai.com/*",
        "https://chatgpt.com/*",
        "https://claude.ai/*",
        "https://gemini.google.com/*",
        "https://www.perplexity.ai/*"
    ],
                
    // Resources accessible from web pages
    web_accessible_resources: [
        {
            resources: ["assets/*", "images/*", "icon/*"],
            matches: [
                "https://chat.openai.com/*",
                "https://chatgpt.com/*",
                "https://claude.ai/*",
                "https://gemini.google.com/*",
                "https://www.perplexity.ai/*"
            ]
        }
    ]
})