import * as React from 'react';
import { SettingsIcon, ArrowLeftOnRectangleIcon } from '../ui/Icons';

interface AvatarMenuProps {
    onClose: () => void;
    onOpenSettings: () => void;
    onLogOut: () => void;
}

const AvatarMenu: React.FC<AvatarMenuProps> = ({ onClose, onOpenSettings, onLogOut }) => {
    const menuRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    return (
        <div 
            ref={menuRef}
            className="absolute bottom-16 right-2 w-56 bg-surface rounded-md shadow-3 z-20 p-2 border border-outline animate-fade-in-up"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="user-menu-button"
        >
            <button 
                onClick={() => { onOpenSettings(); onClose(); }} 
                className="w-full text-left px-3 py-2 text-sm rounded-sm hover:bg-surface-container flex items-center gap-3 text-on-surface-variant hover:text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                role="menuitem"
            >
                <SettingsIcon className="w-5 h-5" />
                <span>Settings</span>
            </button>
            <button 
                onClick={() => { onLogOut(); onClose(); }} 
                className="w-full text-left px-3 py-2 text-sm rounded-sm hover:bg-error/10 text-error flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-primary"
                role="menuitem"
            >
                <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                <span>Log Out</span>
            </button>
            <style>{`
                @keyframes fade-in-up {
                    0% { opacity: 0; transform: translateY(10px) scale(0.95); }
                    100% { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-fade-in-up { 
                    animation: fade-in-up 0.1s ease-out forwards;
                    transform-origin: bottom right;
                }
            `}</style>
        </div>
    );
};

export default AvatarMenu;