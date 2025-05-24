/**
* Bookmark Component
* 
* Represents a single bookmark item in the list.
* Includes action buttons for copy, navigate, and delete operations.
*/
import { useState, useRef, useEffect } from "react";
import { SiClaude, SiOpenai, SiGooglegemini, SiPerplexity } from "react-icons/si";
import { FaCircleChevronUp, FaCircleChevronDown } from "react-icons/fa6";
import { PiCopyBold, PiPlayBold, PiTrashBold } from "react-icons/pi";
import { TbWorldSearch } from "react-icons/tb";
import { BsThreeDotsVertical, BsArrowUpRightCircleFill } from "react-icons/bs";
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
    // State to track if site menu is open
    const [isSiteMenuOpen, setIsSiteMenuOpen] = useState(false);
    // Ref for the menu container
    const menuRef = useRef<HTMLDivElement>(null);
    // Ref for the site menu container
    const siteMenuRef = useRef<HTMLDivElement>(null);
    
    // Handle clicks outside the menus
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
            if (siteMenuRef.current && !siteMenuRef.current.contains(event.target as Node)) {
                setIsSiteMenuOpen(false);
            }
        };
        
        if (isMenuOpen || isSiteMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen, isSiteMenuOpen]);
    /**
    * Get the appropriate icon based on the site name
    */
   // Common style for site icons
    const iconStyle = "relative top-[-5px] pb-0";

    const getIcon = () => {
        switch (bookmark.siteName) {
            case 'chatgpt':
                return <SiOpenai size={24} className={iconStyle}/>;
            case 'gemini':
                return <SiGooglegemini size={24} className={iconStyle}/>;
            case 'claude':
                return <SiClaude size={24} className={iconStyle}/>;
            case 'perplexity':
                return <SiPerplexity size={24} className={iconStyle}/>;
            default:
                return <TbWorldSearch size={24} className={iconStyle} />;
        }
    };
    
    /**
    * Handles clicking on the site icon to open the site and paste text
    */
    const handleSiteIconClick = (siteName = bookmark.siteName) => {
        // Copy text to clipboard as fallback
        navigator.clipboard.writeText(bookmark.text);
        
        // Send message to background script to handle site opening and text pasting
        chrome.runtime.sendMessage({
            action: 'openSiteAndPasteText',
            siteName: siteName,
            text: bookmark.text
        }, (response) => {
            console.log('Background script response:', response);
        });
        
        // Close the site menu if it's open
        setIsSiteMenuOpen(false);
    };
    
    /**
    * Event handler wrapper for the main site icon click
    */
    const handleMainIconClick = () => {
        handleSiteIconClick(bookmark.siteName);
    };

    /**
    * Handles copying bookmark content to clipboard and hides the action menu
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
    const truncateText = (text: string, maxLength: number = 220) => {
        return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
    };
    
    // Check if text is truncated
    const isTextTruncated = bookmark.text.length > 220;

    return (
        <li className="list-row relative gap-1 px-2 min-h-[80px]">
            {/* Bookmark icon - clickable to open site */}
            <div className="cursor-pointer">
                <div className="bookmark-button-group" onClick={handleMainIconClick} style={{ paddingBottom: 0 }}>
                    {getIcon()}
                    <span className="bookmark-tooltip ml-5 mb-1">
                        {`Fresh in ${bookmark.siteName.charAt(0).toUpperCase() + bookmark.siteName.slice(1)}`}
                    </span>
                </div>

                <div className="flex flex-col items-center relative" ref={siteMenuRef}>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsSiteMenuOpen(!isSiteMenuOpen);
                        }}
                        className="cursor-pointer"
                    >
                        <BsArrowUpRightCircleFill size={16} className="menu-icon absolute left-3" />
                    </button>
                    
                    {/* Site selection menu */}
                    <div 
                        className={`cursor-pointer absolute left-9 top-[-44px] flex items-center rounded-lg py-2 transition-all duration-300 ${
                            isSiteMenuOpen ? 'opacity-100 translate-x-0 z-1' : 'opacity-0 translate-x-[-10px] pointer-events-none'
                        }`}
                    >
                        {bookmark.siteName !== 'claude' && (
                            <BookmarkButton 
                                icon={<SiClaude size={24} className={iconStyle}/>}
                                tooltip="Try in Claude"
                                onClick={() => handleSiteIconClick('claude')}
                            />
                        )}
                        
                        {bookmark.siteName !== 'chatgpt' && (
                            <BookmarkButton 
                                icon={<SiOpenai size={24} className={iconStyle}/>}
                                tooltip="Try in ChatGPT"
                                onClick={() => handleSiteIconClick('chatgpt')}
                            />
                        )}
                        
                        {bookmark.siteName !== 'gemini' && (
                            <BookmarkButton 
                                icon={<SiGooglegemini size={24} className={iconStyle}/>}
                                tooltip="Try in Gemini"
                                onClick={() => handleSiteIconClick('gemini')}
                            />
                        )}
                        
                        {bookmark.siteName !== 'perplexity' && (
                            <BookmarkButton 
                                icon={<SiPerplexity size={24} className={iconStyle}/>}
                                tooltip="Try in Perplexity"
                                onClick={() => handleSiteIconClick('perplexity')}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Bookmark content */}
            <div className="text-xs font-semibold">
                <span className={isMenuOpen || isSiteMenuOpen ? 'opacity-10 transition-opacity duration-300' : 'opacity-60 transition-opacity duration-300'}>  
                    {isExpanded ? bookmark.text : truncateText(bookmark.text)}
                </span>
                <span className="inline-block" style={{ opacity: isMenuOpen || isSiteMenuOpen ? 0.1 : 1 }}>
                    {isTextTruncated && !isExpanded && (
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsExpanded(true);
                            }}
                            className="ml-1 inline-flex items-cente cursor-pointer"
                            disabled={isMenuOpen || isSiteMenuOpen }
                        >
                            <FaCircleChevronDown size={14} className="menu-icon absolute bottom-4" />
                        </button>
                    )}
                    {isExpanded && (
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsExpanded(false);
                            }}
                            className="ml-1 inline-flex items-center cursor-pointer"
                            disabled={ isMenuOpen || isSiteMenuOpen }
                        >
                            <FaCircleChevronUp size={14} className="menu-icon absolute bottom-4" />
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
                    className={`absolute right-6 -top-[7px] flex items-center rounded-lg mr-2 py-2 transition-all duration-300 ${
                        isMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10 pointer-events-none'
                    }`}
                >
                    <BookmarkButton 
                        icon={<PiCopyBold size={21} className="menu-icon"/>}
                        tooltip="Copy"
                        onClick={handleCopy}
                        showCopiedState={true}
                    />

                    <BookmarkButton 
                        icon={<PiPlayBold size={21} className="menu-icon"/>}
                        tooltip="Resume Session"
                        onClick={handleNavigate}
                    />

                    <BookmarkButton 
                        icon={<PiTrashBold size={21} className="menu-icon"/>}
                        tooltip="Delete"
                        onClick={handleDelete}
                    />
                </div>
            </div>
        </li>
    );
};

export default Bookmark;