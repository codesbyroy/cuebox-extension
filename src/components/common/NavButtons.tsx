/**
* NavButtons Component
* 
* A navigation button system that displays multiple buttons with tooltips.
* Used for the main navigation in the header.
*/
import type { ReactNode } from 'react';

/**
* Props interface for individual navigation buttons
*/
interface NavButtonProps {
    icon: ReactNode;      // Icon to display in the button
    onClick?: () => void; // Optional click handler
    tooltip?: ReactNode;  // Optional tooltip text or element
}

/**
* Individual navigation button component with tooltip and hover effects
*/
const NavButton = ({ icon, onClick, tooltip }: NavButtonProps) => {
    return (
        <button
            type="button"
            onClick={onClick}
            className="group relative inline-flex items-center justify-center rounded-full transition duration-300 ease-in-out cursor-pointer active:scale-90"
        >
            {/* Icon */}
            <div className="text-white hover:text-gray-300 transition">
                {icon}
            </div>
            
            {/* Tooltip */}
            {tooltip && (
                <span className="absolute -top-8 scale-0 rounded bg-gray-800 p-2 text-xs text-white group-hover:scale-100 whitespace-nowrap">
                    {tooltip}
                </span>
            )}
        </button>
    );
};

/**
* Props interface for the NavButtons container component
*/
interface NavButtonsProps {
    buttons: NavButtonProps[]; // Array of button configurations
}

/**
* Container component that renders multiple navigation buttons
*/
const NavButtons = ({ buttons }: NavButtonsProps) => {
    return (
        <div className="flex items-center space-x-4">
            {buttons.map((button, index) => (
                <NavButton
                    key={index}
                    icon={button.icon}
                    onClick={button.onClick}
                    tooltip={button.tooltip}
                />
            ))}
        </div>
    );
};

export default NavButtons;