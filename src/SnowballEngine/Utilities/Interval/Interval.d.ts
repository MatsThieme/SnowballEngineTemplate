
/** @category Utility */
export class Interval extends Promise<void> {
    public static readonly intervals: readonly Interval[];
    public readonly handle: number;
    public readonly counter: number;

    /**
     * 
     * Intervals are cleared when the current scene is unloaded except clearOnUnload is set to false.
     * 
     */
    public constructor(cb: (interval: Interval) => unknown | Promise<unknown>, ms: number, clearOnUnload?: boolean);

    public clear(): void;

    public static clearAll(): void;
}