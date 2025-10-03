import { useEffect, useRef } from 'react';

export function useFocusTrap<T extends HTMLElement>(isOpen: boolean) {
    const trapRef = useRef<T>(null);

    useEffect(() => {
        if (!isOpen || !trapRef.current) return;

        const trapElement = trapRef.current;
        const focusableElements = trapElement.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const handleKeyDown = (e: KeyboardEvent) => {
            const isTabPressed = e.key === 'Tab';
            if (!isTabPressed) return;

            if (e.shiftKey) { // Shift + Tab
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    e.preventDefault();
                }
            } else { // Tab
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    e.preventDefault();
                }
            }
        };

        trapElement.addEventListener('keydown', handleKeyDown);

        firstElement.focus();

        return () => {
            trapElement.removeEventListener('keydown', handleKeyDown);
        };

    }, [isOpen]);

    return trapRef;
}
