import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'markview:hints-seen';

export type HintId = 'heading' | 'bold' | 'link' | 'code' | 'list' | 'image' | 'table';

interface HintConfig {
    id: HintId;
    messageKey: string;
}

interface HintState {
    activeHint: HintConfig | null;
    position: { x: number; y: number } | null;
}

const HINTS: Record<HintId, HintConfig> = {
    heading: {
        id: 'heading',
        messageKey: 'hints.heading'
    },
    bold: {
        id: 'bold',
        messageKey: 'hints.bold'
    },
    link: {
        id: 'link',
        messageKey: 'hints.link'
    },
    code: {
        id: 'code',
        messageKey: 'hints.code'
    },
    list: {
        id: 'list',
        messageKey: 'hints.list'
    },
    image: {
        id: 'image',
        messageKey: 'hints.image'
    },
    table: {
        id: 'table',
        messageKey: 'hints.table'
    }
};

/**
 * Hook for managing contextual hints
 * Shows helpful tips when users perform actions for the first time
 */
export function useContextualHints() {
    const [seenHints, setSeenHints] = useState<Set<HintId>>(new Set());
    const [hintState, setHintState] = useState<HintState>({
        activeHint: null,
        position: null
    });

    // Load seen hints from localStorage
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored) as HintId[];
                setSeenHints(new Set(parsed));
            }
        } catch (error) {
            console.error('Failed to load hints state:', error);
        }
    }, []);

    /**
     * Check if a hint has been seen
     */
    const hasSeenHint = useCallback(
        (hintId: HintId): boolean => {
            return seenHints.has(hintId);
        },
        [seenHints]
    );

    /**
     * Show a hint at a specific position
     */
    const showHint = useCallback(
        (hintId: HintId, position: { x: number; y: number }) => {
            if (seenHints.has(hintId)) return;

            const hint = HINTS[hintId];
            if (!hint) return;

            setHintState({
                activeHint: hint,
                position
            });
        },
        [seenHints]
    );

    /**
     * Dismiss the current hint and mark it as seen
     */
    const dismissHint = useCallback(() => {
        if (hintState.activeHint) {
            const newSeenHints = new Set(seenHints);
            newSeenHints.add(hintState.activeHint.id);

            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(newSeenHints)));
            } catch (error) {
                console.error('Failed to save hints state:', error);
            }

            setSeenHints(newSeenHints);
        }

        setHintState({
            activeHint: null,
            position: null
        });
    }, [hintState.activeHint, seenHints]);

    /**
     * Auto-dismiss after a delay
     */
    const showHintWithAutoDismiss = useCallback(
        (hintId: HintId, position: { x: number; y: number }, delay = 5000) => {
            showHint(hintId, position);

            // Auto-dismiss after delay if not manually dismissed
            setTimeout(() => {
                setHintState((current) => {
                    if (current.activeHint?.id === hintId) {
                        return { activeHint: null, position: null };
                    }
                    return current;
                });
            }, delay);
        },
        [showHint]
    );

    /**
     * Reset all hints (for testing/debugging)
     */
    const resetHints = useCallback(() => {
        try {
            localStorage.removeItem(STORAGE_KEY);
            setSeenHints(new Set());
            setHintState({ activeHint: null, position: null });
        } catch (error) {
            console.error('Failed to reset hints:', error);
        }
    }, []);

    return {
        activeHint: hintState.activeHint,
        hintPosition: hintState.position,
        hasSeenHint,
        showHint,
        showHintWithAutoDismiss,
        dismissHint,
        resetHints
    };
}
