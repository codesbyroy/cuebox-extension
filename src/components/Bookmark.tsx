/**
* Bookmark Component
* 
* Represents a single bookmark item in the list.
* Includes action buttons for copy, navigate, and delete operations.
*/
import { useState, useRef, useEffect } from "react";
import { SiClaude, SiOpenai, SiGooglegemini, SiPerplexity } from "react-icons/si";
import { FaRegCopy } from "react-icons/fa6";
import { IoNavigateCircleOutline } from "react-icons/io5";
import { FaRegTrashCan, FaCircleChevronUp, FaCircleChevronDown } from "react-icons/fa6";
import { TbWorldSearch } from "react-icons/tb";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FiX } from "react-icons/fi";
import BookmarkButton from "./common/BookmarkButton";
import { type CueBoxBookmark, deleteBookmark } from "../utils/storage";

interface BookmarkProps {
    bookmark: CueBoxBookmark;
}

const Bookmark = ({ bookmark }: BookmarkProps) => {
    // State to track if menu is open
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    // State to track if text is expanded
    const [isExpanded, setIsExpanded] = useState(false);
    // Ref for the menu container
    const menuRef = useRef<HTMLDivElement>(null);
    
    // Handle clicks outside the menu
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        
        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen]);
    /**
    * Get the appropriate icon based on the site name
    */
    const getIcon = () => {
        switch (bookmark.siteName) {
            case 'chatgpt':
                return <SiOpenai size={24} />;
            case 'gemini':
                return <SiGooglegemini size={24} />;
            case 'claude':
                return <SiClaude size={24} />;
            case 'perplexity':
                return <SiPerplexity size={24} />;
            default:
                return <TbWorldSearch size={24} />;
        }
    };
    
    /**
    * Handles clicking on the site icon to open the site and paste text
    */
    const handleSiteIconClick = () => {

        // Copy text to clipboard as fallback
        navigator.clipboard.writeText(bookmark.text);
        
        // Send message to background script to handle site opening and text pasting
        chrome.runtime.sendMessage({
            action: 'openSiteAndPasteText',
            siteName: bookmark.siteName,
            text: bookmark.text
        }, (response) => {
            console.log('Background script response:', response);
        });
    };

    /**
    * Handles copying bookmark content to clipboard
    */
    const handleCopy = () => {
        navigator.clipboard.writeText(bookmark.text);
    };

    /**
    * Handles navigation to the bookmark URL
    */
    const handleNavigate = () => {
        const encodedText = encodeURIComponent(bookmark.text);
        const urlWithScrollText = `${bookmark.url}?scrollText=${encodedText}`;
        chrome.tabs.create({ url: urlWithScrollText });
    };

    /**
    * Handles deletion of the bookmark
    */
    const handleDelete = () => {
        deleteBookmark(bookmark.id);
    };

    // Truncate text if it's too long
    const truncateText = (text: string, maxLength: number = 180) => {
        return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
    };
    
    // Check if text is truncated
    const isTextTruncated = bookmark.text.length > 180;

    return (
        <li className="list-row relative">
            {/* Bookmark icon - clickable to open site */}
            <div className="flex items-center cursor-pointer bookmark-button-group" onClick={handleSiteIconClick}>
                {getIcon()}
                <span className="bookmark-tooltip ml-5">
                    {`Fresh in ${bookmark.siteName.charAt(0).toUpperCase() + bookmark.siteName.slice(1)}`}
                </span>
            </div>
            
            {/* Bookmark content */}
            <div className="text-xs font-semibold">
                <span className={isMenuOpen ? 'opacity-30 transition-opacity duration-300' : 'opacity-60 transition-opacity duration-300'}>  
                    {isExpanded ? bookmark.text : truncateText(bookmark.text)}
                </span>
                <span className="inline-block" style={{ opacity: 1 }}>
                    {isTextTruncated && !isExpanded && (
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsExpanded(true);
                            }}
                            className="ml-1 inline-flex items-cente cursor-pointer"
                        >
                            <FaCircleChevronDown size={15} className="menu-icon absolute bottom-4" />
                        </button>
                    )}
                    {isExpanded && (
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsExpanded(false);
                            }}
                            className="ml-1 inline-flex items-center cursor-pointer"
                        >
                            <FaCircleChevronUp size={15} className="menu-icon absolute bottom-4" />
                        </button>
                    )}
                </span>
            </div>

            {/* Menu button */}
            <div className="relative" ref={menuRef}>
                <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="bookmark-button-group cursor-pointer active:scale-90"
                >
                    {isMenuOpen ? <FiX size={24} /> : <BsThreeDotsVertical size={20} />}
                    {!isMenuOpen && <span className="bookmark-tooltip">Actions</span>}
                </button>
                
                {/* Sliding menu */}
                <div 
                    className={`absolute right-6 -top-[8px] flex items-center rounded-lg mr-2 py-2 transition-all duration-300 ${
                        isMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10 pointer-events-none'
                    }`}
                >
                    <BookmarkButton 
                        icon={<FaRegCopy size={19} className="menu-icon"/>}
                        tooltip="Copy"
                        onClick={handleCopy}
                        showCopiedState={true}
                    />

                    <BookmarkButton 
                        icon={<IoNavigateCircleOutline size={23} className="menu-icon"/>}
                        tooltip="Resume Session"
                        onClick={handleNavigate}
                    />

                    <BookmarkButton 
                        icon={<FaRegTrashCan size={19} className="menu-icon"/>}
                        tooltip="Delete"
                        onClick={handleDelete}
                    />
                </div>
            </div>
        </li>
    );
};

export default Bookmark;