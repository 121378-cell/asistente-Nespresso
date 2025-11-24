import { useEffect, useRef } from 'react';

/**
 * Custom hook to trap focus within a modal or dialog
 * Ensures keyboard users stay within the modal when tabbing
 */
export const useFocusTrap = (isOpen: boolean) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;

        const container = containerRef.current;
        if (!container) return;

        // Get all focusable elements
        const focusableElements = container.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        // Handle tab key to trap focus
        const handleTabKey = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                // Shift + Tab
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    e.preventDefault();
                }
            } else {
                // Tab
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    e.preventDefault();
                }
            }
        };

        // Focus first element when modal opens
        firstElement?.focus();

        // Add event listener
        container.addEventListener('keydown', handleTabKey);

        // Cleanup
        return () => {
            container.removeEventListener('keydown', handleTabKey);
        };
    }, [isOpen]);

    return containerRef;
};
