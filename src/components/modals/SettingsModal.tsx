import { useAuth } from '@/components/auth/AuthProvider';
import { Modal } from '@/components/ui';
import { checkConnection as checkGDriveConnection } from '@/services/gdrive';
import { checkConnection as checkGitHubConnection } from '@/services/github';
import { useGoogleDriveStore } from '@/stores/gdriveStore';
import { useGitHubStore } from '@/stores/githubStore';
import { useSettingsStore } from '@/stores/settingsStore';
import type { ConflictResolution, Language, PreviewStyle, Theme } from '@/types/settings';
import { cn } from '@/utils/cn';
import { Github, HardDrive, Loader2, Unplug } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type SettingsTab = 'appearance' | 'editor' | 'behavior' | 'sync';

const themes: { value: Theme; label: string }[] = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' }
];

const previewStyles: { value: PreviewStyle; label: string }[] = [
    { value: 'github', label: 'GitHub' },
    { value: 'gitlab', label: 'GitLab' },
    { value: 'notion', label: 'Notion' },
    { value: 'obsidian', label: 'Obsidian' },
    { value: 'stackoverflow', label: 'Stack Overflow' },
    { value: 'devto', label: 'Dev.to' }
];

const languages: { value: Language; label: string }[] = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' }
];

const fontFamilies = ['JetBrains Mono', 'Fira Code', 'Source Code Pro', 'Consolas', 'Monaco', 'monospace'];

const conflictResolutions: { value: ConflictResolution; labelKey: string }[] = [
    { value: 'ask', labelKey: 'settings.sync.conflictAsk' },
    { value: 'local', labelKey: 'settings.sync.conflictLocal' },
    { value: 'server', labelKey: 'settings.sync.conflictServer' }
];

/**
 * Settings modal for app configuration
 */
export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');
    const { t, i18n } = useTranslation();
    const { isAuthenticated } = useAuth();

    // GitHub state
    const githubConnected = useGitHubStore((s) => s.isConnected);
    const githubUser = useGitHubStore((s) => s.user);
    const githubLoading = useGitHubStore((s) => s.isLoading);
    const setGitHubConnected = useGitHubStore((s) => s.setConnected);
    const setGitHubLoading = useGitHubStore((s) => s.setLoading);
    const disconnectGitHub = useGitHubStore((s) => s.disconnect);

    // Google Drive state
    const gdriveConnected = useGoogleDriveStore((s) => s.isConnected);
    const gdriveUser = useGoogleDriveStore((s) => s.user);
    const gdriveLoading = useGoogleDriveStore((s) => s.isLoading);
    const setGDriveConnected = useGoogleDriveStore((s) => s.setConnected);
    const setGDriveLoading = useGoogleDriveStore((s) => s.setLoading);
    const disconnectGDrive = useGoogleDriveStore((s) => s.disconnect);

    // Check connections when sync tab is active
    const checkConnections = useCallback(async () => {
        // Check GitHub
        if (!githubConnected) {
            setGitHubLoading(true);
            try {
                const status = await checkGitHubConnection();
                if (status.connected && status.user) {
                    setGitHubConnected(true, {
                        id: 0,
                        login: status.user.login,
                        name: status.user.name,
                        avatarUrl: status.user.avatar,
                        email: null
                    });
                }
            } finally {
                setGitHubLoading(false);
            }
        }

        // Check Google Drive
        if (!gdriveConnected) {
            setGDriveLoading(true);
            try {
                const status = await checkGDriveConnection();
                if (status.connected && status.user) {
                    setGDriveConnected(true, status.user);
                }
            } finally {
                setGDriveLoading(false);
            }
        }
    }, [githubConnected, gdriveConnected, setGitHubConnected, setGitHubLoading, setGDriveConnected, setGDriveLoading]);

    // Check connections when modal opens on sync tab
    useEffect(() => {
        if (isOpen && activeTab === 'sync') {
            checkConnections();
        }
    }, [isOpen, activeTab, checkConnections]);

    const settings = useSettingsStore();
    const {
        theme,
        previewStyle,
        editorFontSize,
        previewFontSize,
        fontFamily,
        wordWrap,
        lineNumbers,
        minimap,
        syncScroll,
        autoSave,
        autoSaveInterval,
        formatOnSave,
        lintOnType,
        language,
        cloudSyncEnabled,
        cloudSyncDebounceMs,
        cloudSyncOnAppOpen,
        cloudSyncConflictResolution,
        updateSetting,
        resetSettings
    } = settings;

    // Sync language with i18n
    useEffect(() => {
        if (i18n.language !== language) {
            i18n.changeLanguage(language);
        }
    }, [language, i18n]);

    const tabs: { id: SettingsTab; label: string; requiresAuth?: boolean }[] = [
        { id: 'appearance', label: t('settings.tabs.appearance') },
        { id: 'editor', label: t('settings.tabs.editor') },
        { id: 'behavior', label: t('settings.tabs.behavior') },
        { id: 'sync', label: t('settings.tabs.sync'), requiresAuth: true }
    ];

    const visibleTabs = tabs.filter((tab) => !tab.requiresAuth || isAuthenticated);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('settings.title')} size="lg">
            {/* Tabs */}
            <div className="flex border-b border-border mb-4">
                {visibleTabs.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            'px-4 py-2 text-sm font-medium -mb-px',
                            'border-b-2 transition-colors',
                            activeTab === tab.id
                                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                : 'border-transparent text-text-muted hover:text-text-secondary'
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="space-y-6 overflow-y-auto max-h-[60vh] pr-2">
                {/* Appearance Tab */}
                {activeTab === 'appearance' && (
                    <>
                        <SettingGroup title={t('settings.theme')}>
                            <Select value={theme} onChange={(v) => updateSetting('theme', v as Theme)} options={themes} />
                        </SettingGroup>

                        <SettingGroup title={t('settings.previewStyle')}>
                            <Select
                                value={previewStyle}
                                onChange={(v) => updateSetting('previewStyle', v as PreviewStyle)}
                                options={previewStyles}
                            />
                        </SettingGroup>

                        <SettingGroup title={t('settings.fontFamily')}>
                            <Select
                                value={fontFamily}
                                onChange={(v) => updateSetting('fontFamily', v)}
                                options={fontFamilies.map((f) => ({ value: f, label: f }))}
                            />
                        </SettingGroup>

                        <SettingGroup title={t('settings.editorFontSize')}>
                            <NumberInput
                                value={editorFontSize}
                                onChange={(v) => updateSetting('editorFontSize', v)}
                                min={10}
                                max={32}
                                suffix="px"
                            />
                        </SettingGroup>

                        <SettingGroup title={t('settings.previewFontSize')}>
                            <NumberInput
                                value={previewFontSize}
                                onChange={(v) => updateSetting('previewFontSize', v)}
                                min={10}
                                max={32}
                                suffix="px"
                            />
                        </SettingGroup>

                        <SettingGroup title={t('settings.language')}>
                            <Select value={language} onChange={(v) => updateSetting('language', v as Language)} options={languages} />
                        </SettingGroup>
                    </>
                )}

                {/* Editor Tab */}
                {activeTab === 'editor' && (
                    <>
                        <SettingGroup title={t('settings.wordWrap')} description={t('settings.descriptions.wordWrap')}>
                            <Toggle checked={wordWrap} onChange={(v) => updateSetting('wordWrap', v)} />
                        </SettingGroup>

                        <SettingGroup title={t('settings.lineNumbers')} description={t('settings.descriptions.lineNumbers')}>
                            <Toggle checked={lineNumbers} onChange={(v) => updateSetting('lineNumbers', v)} />
                        </SettingGroup>

                        <SettingGroup title={t('settings.minimap')} description={t('settings.descriptions.minimap')}>
                            <Toggle checked={minimap} onChange={(v) => updateSetting('minimap', v)} />
                        </SettingGroup>

                        <SettingGroup title={t('settings.syncScroll')} description={t('settings.descriptions.syncScroll')}>
                            <Toggle checked={syncScroll} onChange={(v) => updateSetting('syncScroll', v)} />
                        </SettingGroup>
                    </>
                )}

                {/* Behavior Tab */}
                {activeTab === 'behavior' && (
                    <>
                        <SettingGroup title={t('settings.autoSave')} description={t('settings.descriptions.autoSave')}>
                            <Toggle checked={autoSave} onChange={(v) => updateSetting('autoSave', v)} />
                        </SettingGroup>

                        <SettingGroup title={t('settings.autoSaveInterval')} description={t('settings.descriptions.autoSaveInterval')}>
                            <NumberInput
                                value={autoSaveInterval}
                                onChange={(v) => updateSetting('autoSaveInterval', v)}
                                min={500}
                                max={60000}
                                step={500}
                                suffix="ms"
                                disabled={!autoSave}
                            />
                        </SettingGroup>

                        <SettingGroup title={t('settings.formatOnSave')} description={t('settings.descriptions.formatOnSave')}>
                            <Toggle checked={formatOnSave} onChange={(v) => updateSetting('formatOnSave', v)} />
                        </SettingGroup>

                        <SettingGroup title={t('settings.lintOnType')} description={t('settings.descriptions.lintOnType')}>
                            <Toggle checked={lintOnType} onChange={(v) => updateSetting('lintOnType', v)} />
                        </SettingGroup>
                    </>
                )}

                {/* Sync Tab */}
                {activeTab === 'sync' && (
                    <>
                        {/* Connected Services Section */}
                        <div className="mb-6">
                            <h3 className="text-sm font-semibold text-text-primary mb-3">{t('settings.sync.connectedServices')}</h3>
                            <div className="space-y-3">
                                {/* GitHub Connection */}
                                <div
                                    className={cn(
                                        'flex items-center justify-between p-3 rounded-lg',
                                        'bg-bg-secondary border border-border'
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={cn(
                                                'w-8 h-8 rounded-full flex items-center justify-center',
                                                githubConnected ? 'bg-[#24292e]' : 'bg-bg-tertiary'
                                            )}
                                        >
                                            <Github className="h-4 w-4 text-white" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-text-primary">GitHub</div>
                                            {githubConnected && githubUser ? (
                                                <div className="text-xs text-text-muted">@{githubUser.login}</div>
                                            ) : (
                                                <div className="text-xs text-text-muted">{t('settings.sync.notConnected')}</div>
                                            )}
                                        </div>
                                    </div>
                                    {githubLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin text-text-muted" />
                                    ) : githubConnected ? (
                                        <button
                                            type="button"
                                            onClick={disconnectGitHub}
                                            className={cn(
                                                'flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md',
                                                'text-red-500 hover:bg-red-500/10',
                                                'transition-colors'
                                            )}
                                        >
                                            <Unplug className="h-3.5 w-3.5" />
                                            {t('settings.sync.disconnect')}
                                        </button>
                                    ) : (
                                        <span className="text-xs text-text-muted px-2.5 py-1.5">{t('settings.sync.signInToConnect')}</span>
                                    )}
                                </div>

                                {/* Google Drive Connection */}
                                <div
                                    className={cn(
                                        'flex items-center justify-between p-3 rounded-lg',
                                        'bg-bg-secondary border border-border'
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={cn(
                                                'w-8 h-8 rounded-full flex items-center justify-center',
                                                gdriveConnected ? 'bg-[#4285f4]' : 'bg-bg-tertiary'
                                            )}
                                        >
                                            <HardDrive className="h-4 w-4 text-white" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-text-primary">Google Drive</div>
                                            {gdriveConnected && gdriveUser ? (
                                                <div className="text-xs text-text-muted">{gdriveUser.email}</div>
                                            ) : (
                                                <div className="text-xs text-text-muted">{t('settings.sync.notConnected')}</div>
                                            )}
                                        </div>
                                    </div>
                                    {gdriveLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin text-text-muted" />
                                    ) : gdriveConnected ? (
                                        <button
                                            type="button"
                                            onClick={disconnectGDrive}
                                            className={cn(
                                                'flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md',
                                                'text-red-500 hover:bg-red-500/10',
                                                'transition-colors'
                                            )}
                                        >
                                            <Unplug className="h-3.5 w-3.5" />
                                            {t('settings.sync.disconnect')}
                                        </button>
                                    ) : (
                                        <span className="text-xs text-text-muted px-2.5 py-1.5">{t('settings.sync.signInToConnect')}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-border my-4" />

                        {/* Cloud Sync Settings */}
                        <SettingGroup title={t('settings.sync.enabled')} description={t('settings.sync.enabledDesc')}>
                            <Toggle checked={cloudSyncEnabled} onChange={(v) => updateSetting('cloudSyncEnabled', v)} />
                        </SettingGroup>

                        <SettingGroup title={t('settings.sync.syncOnOpen')} description={t('settings.sync.syncOnOpenDesc')}>
                            <Toggle
                                checked={cloudSyncOnAppOpen}
                                onChange={(v) => updateSetting('cloudSyncOnAppOpen', v)}
                                disabled={!cloudSyncEnabled}
                            />
                        </SettingGroup>

                        <SettingGroup title={t('settings.sync.debounceTime')} description={t('settings.sync.debounceTimeDesc')}>
                            <NumberInput
                                value={cloudSyncDebounceMs}
                                onChange={(v) => updateSetting('cloudSyncDebounceMs', v)}
                                min={500}
                                max={10000}
                                step={500}
                                suffix="ms"
                                disabled={!cloudSyncEnabled}
                            />
                        </SettingGroup>

                        <SettingGroup title={t('settings.sync.conflictResolution')} description={t('settings.sync.conflictResolutionDesc')}>
                            <Select
                                value={cloudSyncConflictResolution}
                                onChange={(v) => updateSetting('cloudSyncConflictResolution', v as ConflictResolution)}
                                options={conflictResolutions.map((c) => ({ value: c.value, label: t(c.labelKey) }))}
                                disabled={!cloudSyncEnabled}
                            />
                        </SettingGroup>
                    </>
                )}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                <button
                    type="button"
                    onClick={resetSettings}
                    className={cn(
                        'px-3 py-1.5 text-sm rounded-md',
                        'text-red-500 hover:bg-red-50 dark:hover:bg-red-950',
                        'transition-colors'
                    )}
                >
                    {t('settings.reset')}
                </button>
                <button
                    type="button"
                    onClick={onClose}
                    className={cn(
                        'px-4 py-1.5 text-sm rounded-md',
                        'bg-primary-500 text-white',
                        'hover:bg-primary-600',
                        'transition-colors'
                    )}
                >
                    {t('settings.done')}
                </button>
            </div>
        </Modal>
    );
}

// Helper Components

interface SettingGroupProps {
    title: string;
    description?: string;
    children: React.ReactNode;
}

function SettingGroup({ title, description, children }: SettingGroupProps) {
    return (
        <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
                <div className="text-sm font-medium text-text-primary">{title}</div>
                {description && <div className="text-xs text-text-muted mt-0.5">{description}</div>}
            </div>
            <div className="shrink-0">{children}</div>
        </div>
    );
}

interface SelectProps {
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    disabled?: boolean;
}

function Select({ value, onChange, options, disabled }: SelectProps) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={cn(
                'px-3 py-1.5 text-sm rounded-md',
                'bg-bg-tertiary border border-border',
                'focus:outline-none focus:ring-2 focus:ring-primary-500',
                'cursor-pointer',
                disabled && 'opacity-50 cursor-not-allowed'
            )}
        >
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    );
}

interface ToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
}

function Toggle({ checked, onChange, disabled }: ToggleProps) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => !disabled && onChange(!checked)}
            disabled={disabled}
            className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full',
                'transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                checked ? 'bg-primary-500' : 'bg-secondary-300 dark:bg-secondary-600',
                disabled && 'opacity-50 cursor-not-allowed'
            )}
        >
            <span
                className={cn(
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                    checked ? 'translate-x-6' : 'translate-x-1'
                )}
            />
        </button>
    );
}

interface NumberInputProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    suffix?: string;
    disabled?: boolean;
}

function NumberInput({ value, onChange, min = 0, max = 100, step = 1, suffix, disabled }: NumberInputProps) {
    return (
        <div className="flex items-center gap-2">
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                min={min}
                max={max}
                step={step}
                disabled={disabled}
                className={cn(
                    'w-20 px-2 py-1.5 text-sm text-right rounded-md',
                    'bg-bg-tertiary border border-border',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500',
                    disabled && 'opacity-50 cursor-not-allowed'
                )}
            />
            {suffix && <span className="text-sm text-text-muted">{suffix}</span>}
        </div>
    );
}
