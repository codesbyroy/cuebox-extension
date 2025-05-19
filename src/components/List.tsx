/**
* List Component
* 
* Container component that displays a list of bookmarks.
* Filters bookmarks based on search query.
* Fetches bookmarks from Chrome storage.
*/
import { useEffect, useState } from 'react';
import Bookmark from './Bookmark';
import { useSearch } from '../context/SearchContext';
import { type CueBoxBookmark, getBookmarks } from '../utils/storage';

interface ListProps {
    isMaxHeight?: boolean;
}

const List = ({ isMaxHeight = false }: ListProps) => {
    const { searchQuery } = useSearch();
    const [bookmarks, setBookmarks] = useState<CueBoxBookmark[]>([]);
                
    // Fetch bookmarks from storage when component mounts
    useEffect(() => {
        const fetchBookmarks = async () => {
            const storedBookmarks = await getBookmarks();
            setBookmarks(storedBookmarks);
        };
                                
        fetchBookmarks();
                                
        // Listen for storage changes
        const handleStorageChange = () => {
            fetchBookmarks();
        };
                                
        chrome.storage.onChanged.addListener(handleStorageChange);
                                
        return () => {
            chrome.storage.onChanged.removeListener(handleStorageChange);
        };
    }, []);
                
    // Filter bookmarks based on search query and sort by timestamp (newest first)
    const filteredBookmarks = bookmarks
        .filter(bookmark => 
            searchQuery === '' || 
            bookmark.text.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return (
        <ul className={`list rounded-box shadow-md mt-2 ${isMaxHeight ? 'mb-3' : ''}`}>
            {filteredBookmarks.length > 0 ? (
                filteredBookmarks.map(bookmark => (
                    <Bookmark key={bookmark.id} bookmark={bookmark} />
                ))
            ) : (
                <li className="py-4 px-6 text-center text-sm opacity-60 empty-state-message">No bookmarks found</li>
            )}
        </ul>
    );
};

export default List;