
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
                <div className="relative flex items-center h-16">
                    {/* Left: Mobile Menu Toggle & Logo */}
                    <div className="flex items-center">
                        <div className="md:hidden mr-4">
                            <button 
                                onClick={onToggleSidebar} 
                                className="text-on-surface-variant hover:text-on-surface"
                                aria-label="Toggle sidebar"
                            >
                                <MenuIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <img src="public/favicon.svg" alt="" className="w-8 h-8 md:hidden" aria-hidden="true" />
                    </div>

                    {/* Center: Page Title */}
                    <div className="flex-1 min-w-0 flex justify-center items-center gap-2">
                        <img src="public/favicon.svg" alt="" className="w-6 h-6 hidden md:block" aria-hidden="true" />
                        <h1 className="text-on-surface truncate title-large">
                            {pageTitle}
                        </h1>
                    </div>

                    {/* Right: Empty space to balance the layout */}
                    <div className="w-10 md:hidden"></div>
                </div>
            </div>
        </header>
    );
};

export default Header;
