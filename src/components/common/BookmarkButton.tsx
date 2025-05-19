/**
* BookmarkButton Component
* 
* A reusable button component with tooltip and copy state functionality.
* Used for bookmark-related actions like copy, navigate, and delete.
*/
import { useState, useRef } from "react";
import type { ReactNode } from 'react';
import { FaCheck } from "react-icons/fa";

/**
* Props interface for the BookmarkButton component
*/
interface BookmarkButtonProps {
    icon: ReactNode;           // Icon to display in the button
    tooltip: string;           // Text to show in the tooltip
    onClick?: () => void;      // Optional click handler
    showCopiedState?: boolean; // Whether to show "Copied!" state
    cursorStyle?: string;      // Custom cursor style
}

const BookmarkButton = ({
    icon,
    tooltip,
    onClick,
    showCopiedState = false,
    cursorStyle = "cursor-pointer"
}: BookmarkButtonProps) => {
    // State to track if content has been copied
    const [copied, setCopied] = useState(false);
    // Ref to store timeout ID for cleanup
    const timeoutRef = useRef<number | null>(null);

    /**
    * Handles button click events
    * Executes the provided onClick callback and manages copied state
    */
    const handleClick = () => {
        if (onClick) {
            onClick();
        }
                                
        if (showCopiedState) {
            // Clear any existing timeout
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
                                                
            setCopied(true);
            // Reset copied state after 2 seconds
            timeoutRef.current = window.setTimeout(() => {
                setCopied(false);
                timeoutRef.current = null;
            }, 2000);
        }
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className={`bookmark-button-group ${cursorStyle} active:scale-90`}
        >
            {/* Icon */}
            {icon}

            {/* Tooltip */}
            <span className="bookmark-tooltip">
                {showCopiedState && copied ? (
                    <>
                        <FaCheck size={12} className="text-green-400" /> Copied!
                    </>
                ) : (
                    tooltip
                )}
            </span>
        </button>
    );
};

export default BookmarkButton;