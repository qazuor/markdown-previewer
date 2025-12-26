import { useCallback, useState } from 'react';

interface CursorPosition {
    line: number;
    column: number;
}

interface SelectionRange {
    from: { line: number; column: number };
    to: { line: number; column: number };
    hasSelection: boolean;
}

interface UseCursorPositionReturn {
    position: CursorPosition;
    selection: SelectionRange;
    updatePosition: (line: number, column: number) => void;
    updateSelection: (fromLine: number, fromCol: number, toLine: number, toCol: number) => void;
}

/**
 * Hook to track cursor position and selection
 */
export function useCursorPosition(): UseCursorPositionReturn {
    const [position, setPosition] = useState<CursorPosition>({ line: 1, column: 1 });
    const [selection, setSelection] = useState<SelectionRange>({
        from: { line: 1, column: 1 },
        to: { line: 1, column: 1 },
        hasSelection: false
    });

    const updatePosition = useCallback((line: number, column: number) => {
        setPosition({ line, column });
    }, []);

    const updateSelection = useCallback((fromLine: number, fromCol: number, toLine: number, toCol: number) => {
        const hasSelection = fromLine !== toLine || fromCol !== toCol;
        setSelection({
            from: { line: fromLine, column: fromCol },
            to: { line: toLine, column: toCol },
            hasSelection
        });
    }, []);

    return {
        position,
        selection,
        updatePosition,
        updateSelection
    };
}
