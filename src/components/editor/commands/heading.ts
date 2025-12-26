import type { Command } from '@codemirror/view';
import { setHeadingLevel } from '../utils/selection';

/**
 * Create heading command for a specific level
 */
function createHeadingCommand(level: number): Command {
    return (view) => {
        setHeadingLevel(view, level);
        return true;
    };
}

export const setHeading1: Command = createHeadingCommand(1);
export const setHeading2: Command = createHeadingCommand(2);
export const setHeading3: Command = createHeadingCommand(3);
export const setHeading4: Command = createHeadingCommand(4);
export const setHeading5: Command = createHeadingCommand(5);
export const setHeading6: Command = createHeadingCommand(6);
