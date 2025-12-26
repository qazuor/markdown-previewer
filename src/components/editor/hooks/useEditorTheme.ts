import { useSettingsStore } from '@/stores/settingsStore';
import { useMemo } from 'react';

/**
 * Hook to get the current editor theme based on settings
 */
export function useEditorTheme(): 'light' | 'dark' {
    const { theme } = useSettingsStore();

    const resolvedTheme = useMemo(() => {
        if (theme === 'system') {
            // Check system preference
            if (typeof window !== 'undefined') {
                return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            }
            return 'light';
        }
        return theme;
    }, [theme]);

    return resolvedTheme;
}
