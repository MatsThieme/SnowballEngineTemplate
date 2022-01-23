/** @category Utility */
export class Interval extends Promise<void> {
    public static readonly intervals: readonly Interval[];
    public readonly handle: number;
    public readonly counter: number;

    /**
     * Intervals are cleared when the current scene is unloaded if clearOnUnload is not set to false.
     * Resolves when interval is cleared.
     */
    public constructor(
        cb: (interval: Interval) => unknown | Promise<unknown>,
        ms: number,
        clearOnUnload?: boolean
    );

    public clear(): void;

    public static clearAll(): void;
}
