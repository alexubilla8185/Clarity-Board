import React from 'react';
import { MenuIcon } from '../ui/Icons';

interface HeaderProps {
    onToggleSidebar: () => void;
    isSidebarOpen: boolean;
    pageTitle?: string;
    isProjectView?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, isSidebarOpen, pageTitle, isProjectView }) => {
    return (
        <header className="bg-surface/80 backdrop-blur-sm sticky top-0 z-20 border-b border-outline flex-shrink-0">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                         <button 
                            onClick={onToggleSidebar} 
                            className="mr-4 text-on-surface-variant hover:text-on-surface md:hidden"
                            aria-label="Toggle sidebar"
                        >
                            <MenuIcon className="h-6 w-6" />
                        </button>
                        <h1 className="text-xl md:text-2xl font-bold text-on-surface">
                             {pageTitle ? (
                                <>
                                    {isProjectView && <span className="text-on-surface-variant hidden sm:inline">Projects / </span>}
                                    {pageTitle}
                                </>
                            ) : (
                                <>
                                    <span className="text-primary">Clarity</span> Board
                                </>
                            )}
                        </h1>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;