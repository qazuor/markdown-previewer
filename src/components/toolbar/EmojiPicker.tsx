import { cn } from '@/utils/cn';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { Smile } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface EmojiPickerProps {
    onEmojiSelect: (emoji: string) => void;
    className?: string;
}

interface EmojiData {
    native: string;
    shortcodes?: string;
}

export function EmojiPicker({ onEmojiSelect, className }: EmojiPickerProps) {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const handleEmojiSelect = useCallback(
        (emoji: EmojiData) => {
            onEmojiSelect(emoji.native);
            setIsOpen(false);
        },
        [onEmojiSelect]
    );

    return (
        <div className={cn('relative', className)}>
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    'p-1.5 rounded-md',
                    'hover:bg-bg-hover active:bg-bg-active',
                    'transition-colors duration-150',
                    isOpen && 'bg-bg-hover'
                )}
                title={t('toolbar.emoji')}
                aria-label={t('toolbar.emoji')}
            >
                <Smile className="h-4 w-4" />
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    {/* biome-ignore lint/a11y/useKeyWithClickEvents: Backdrop is purely visual */}
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

                    {/* Picker */}
                    <div className={cn('absolute top-full right-0 mt-1 z-50', 'animate-in fade-in slide-in-from-top-2 duration-150')}>
                        <Picker
                            data={data}
                            onEmojiSelect={handleEmojiSelect}
                            theme="auto"
                            previewPosition="none"
                            skinTonePosition="none"
                            maxFrequentRows={2}
                            perLine={8}
                        />
                    </div>
                </>
            )}
        </div>
    );
}
