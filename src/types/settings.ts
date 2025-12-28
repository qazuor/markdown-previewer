export type Theme = 'dark' | 'light' | 'system';

export type PreviewStyle = 'github' | 'gitlab' | 'notion' | 'obsidian' | 'stackoverflow' | 'devto';

export type Language = 'en' | 'es';

export interface Settings {
    // Appearance
    theme: Theme;
    previewStyle: PreviewStyle;
    editorFontSize: number;
    previewFontSize: number;
    fontFamily: string;

    // Editor
    wordWrap: boolean;
    lineNumbers: boolean;
    minimap: boolean;
    syncScroll: boolean;

    // Behavior
    autoSave: boolean;
    autoSaveInterval: number;
    formatOnSave: boolean;
    lintOnType: boolean;

    // Language
    language: Language;
}

export const DEFAULT_SETTINGS: Settings = {
    theme: 'light',
    previewStyle: 'github',
    editorFontSize: 10,
    previewFontSize: 13,
    fontFamily: 'Fira Code',
    wordWrap: true,
    lineNumbers: true,
    minimap: true,
    syncScroll: true,
    autoSave: true,
    autoSaveInterval: 2000,
    formatOnSave: false,
    lintOnType: true,
    language: 'en'
};
