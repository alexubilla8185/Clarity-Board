import * as React from 'react';
import { MenuIcon } from '../ui/Icons';

interface HeaderProps {
    onToggleSidebar: () => void;
    pageTitle: string;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, pageTitle }) => {
    return (
        <header className="bg-surface/80 backdrop-blur-sm sticky top-0 z-20 border-b border-outline flex-shrink-0">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative flex items-center justify-center h-16">
                    {/* Mobile Menu Toggle */}
                    <div className="absolute left-0 flex items-center md:hidden">
                        <button 
                            onClick={onToggleSidebar} 
                            className="text-on-surface-variant hover:text-on-surface"
                            aria-label="Toggle sidebar"
                        >
                            <MenuIcon className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Page Title */}
                    <div className="flex-1 min-w-0 px-12 md:px-0">
                        <h1 className="text-xl font-bold text-on-surface text-center truncate">
                            {pageTitle}
                        </h1>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;