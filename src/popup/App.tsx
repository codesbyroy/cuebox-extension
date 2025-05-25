/**
* App Component
* 
* Main application component for CueBox.
* Serves as the root component for the popup interface.
*/
import { useState, useEffect, useMemo } from 'react';
import './App.scss'
import Header from '../components/Header';
import List from '../components/List';
import Footer from '../components/Footer';
import { ThemeProvider } from '../context/ThemeContext';
import { SearchProvider } from '../context/SearchContext';
import { StorageProvider } from '../context/StorageContext';
import { getBookmarks } from '../utils/storage';

function App() {
    const [bookmarkCount, setBookmarkCount] = useState(3);
                
    // Fetch bookmark count on mount and when storage changes
    useEffect(() => {
        const fetchBookmarkCount = async () => {
            const bookmarks = await getBookmarks();
            setBookmarkCount(bookmarks.length);
        };
                                
        fetchBookmarkCount();
                                
        // Listen for storage changes
        const handleStorageChange = (changes: any) => {
            // Only update if bookmarks have changed
            if (changes.bookmarks) {
                fetchBookmarkCount();
            }
        };
                                
        // Listen to both local and sync storage changes
        chrome.storage.onChanged.addListener(handleStorageChange);
                                
        return () => {
            chrome.storage.onChanged.removeListener(handleStorageChange);
        };
    }, []);
                
    // Calculate dynamic height based on bookmark count
    // Base height (header + footer) + height per bookmark
    const bookmarkHeight = 120; // Height of a single bookmark in pixels
    const minHeight = 400;      // Minimum container height in pixels
    const maxHeight = 600;      // Maximum container height in pixels

    // Use useMemo to recalculate height only when bookmarkCount changes
    const dynamicHeight = useMemo(() => {
        return Math.max(
            minHeight,
            Math.min(maxHeight, bookmarkCount * bookmarkHeight)
        );
    }, [bookmarkCount, bookmarkHeight, minHeight, maxHeight]);
                
    // Force a re-render when bookmark count changes to update the popup size
    useEffect(() => {
        // Set both min and max height to force the popup to exactly match our desired height
        document.body.style.minHeight = `${dynamicHeight}px`;
        document.body.style.maxHeight = `${dynamicHeight}px`;
        document.body.style.height = `${dynamicHeight}px`;
                                
        // Set html element height too for better control
        document.documentElement.style.height = `${dynamicHeight}px`;
                                
        // This helps Chrome extension to recognize the size change
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 10);
    }, [dynamicHeight]);

    return (
        <ThemeProvider>
            <SearchProvider>
                <StorageProvider>
                    <div 
                        className="w-[400px] flex flex-col text-gray-100 mx-auto items-center justify-between app-background overflow-hidden"
                        style={{ height: `${dynamicHeight}px` }}
                    >
                        {/* Header with navigation */}
                        <Header />
                                                                                    
                        {/* Main content area with fixed height based on bookmark count */}
                        <main className="px-2 w-full mt-3 overflow-x-hidden" style={{ height: `${dynamicHeight - 90}px` }}>
                            <List isMaxHeight={dynamicHeight === maxHeight} />
                        </main>
                                                                                    
                        {/* Footer with copyright */}
                        <Footer />
                    </div>
                </StorageProvider>
            </SearchProvider>
        </ThemeProvider>
    );
}

export default App