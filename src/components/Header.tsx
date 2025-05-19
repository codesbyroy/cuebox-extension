/**
* Header Component
* 
* Main header component for the CueBox application.
* Contains the logo and navigation buttons.
*/
import { useState, useRef } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { FaCloudArrowUp } from "react-icons/fa6";
import { IoCloudDone } from "react-icons/io5";
import { TbLamp2 } from "react-icons/tb";
import { MdLightMode } from "react-icons/md";
import { FaCheck } from "react-icons/fa";
import NavButtons from './common/NavButtons';
import { useTheme } from '../context/ThemeContext';
import { useSearch } from '../context/SearchContext';
import { useStorage } from '../context/StorageContext';

const Header = () => {
    // State to track if search is active
    const [isSearchActive, setIsSearchActive] = useState(false);
    // Get theme context for toggling functionality
    const { toggleTheme, theme } = useTheme();
    // Get search context
    const { setSearchQuery } = useSearch();
    // Get storage context
    const { isCloudConnected, toggleCloudConnection } = useStorage();

    // Reference to search input
    const searchInputRef = useRef<HTMLInputElement>(null);
    
    // Toggle search state
    const toggleSearch = () => {
        const newState = !isSearchActive;
        setIsSearchActive(newState);
        
        // Focus the input after state update and DOM changes
        if (newState) {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 50);
        }
    };

    // Configuration for navigation buttons - filtered based on search state
    const getNavButtons = () => {
        const buttons = [
            {
                icon: <FiSearch size={22} />,
                onClick: toggleSearch
            },
            {
                icon: isCloudConnected ? <IoCloudDone className="text-green-500 dark:text-green-400" size={27} /> : <FaCloudArrowUp className="text-[#f4a996] dark:text-[#f4a996]" size={27} />,
                onClick: toggleCloudConnection,
                tooltip: isCloudConnected ? (
                    <div className="flex items-center gap-1">
                        <FaCheck size={12} className="text-green-400" />
                        <span>Synced</span>
                    </div>
                ) : "Sync with Google"
            },
            {
                icon: theme === 'dark' ? <MdLightMode size={24} /> : <TbLamp2 size={24} />,
                onClick: toggleTheme
            }
        ];
                                
        // Filter out search button when search is active
        return isSearchActive ? buttons.filter((_, index) => index !== 0) : buttons;
    };

    return (
        <div className="mt-4 w-full px-2">
            <header className="w-full h-14 flex items-center justify-between px-4 bg-white/10 backdrop-blur-md rounded-xl shadow-md border border-white/20 bg-gradient-to-br from-[#1f2c38] to-[#0f1720] mx-auto transform-isolate">
                {/* Logo */}
                <div className={`flex items-center gap-3 py-2 transition-opacity duration-300 ${isSearchActive ? 'opacity-0 absolute' : 'opacity-100'}`}>
                    <img src="/icon/icon48.png" alt="CueBox" className="w-7 h-7 object-contain" />
                    <span className="text-[18px] font-medium">CueBox</span>
                </div>
                                                                
                {/* Search input with animation */}
                <div 
                    className={`flex-1 relative transition-all duration-300 ease-in-out search-container ${
                        isSearchActive 
                            ? 'opacity-100 mr-2' 
                            : 'opacity-0 absolute left-full'
                    }`}
                >
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search Cue"
                        className="w-full bg-white/5 backdrop-blur-md border border-white/20 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-white/30 pr-8"
                        autoFocus={isSearchActive}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button 
                        onClick={() => {
                            setSearchQuery('');
                            toggleSearch();
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition"
                    >
                        <FiX size={16} />
                    </button>
                </div>
                                                                
                {/* Navigation buttons */}
                <div className="mr-2">
                    <NavButtons buttons={getNavButtons()} />
                </div>
            </header>
        </div>
    );
};

export default Header;