import { clearObject } from './Helpers';

/** @category Utility */
export class Interval {
    public static readonly intervals: readonly Interval[] = [];
    public readonly handle: number;
    public readonly counter: number;

    public constructor(cb: (interval: Interval) => unknown | Promise<unknown>, ms: number, dontClearOnUnload = false) {
        this.handle = window.setInterval(async () => {
            await cb(this);
            (<Mutable<Interval>>this).counter++;
        }, ms);

        this.counter = 0;

        if (!dontClearOnUnload) (<Mutable<Interval[]>>Interval.intervals).push(this);
    }

    public clear(): void {
        window.clearInterval(this.handle);

        (<Mutable<Interval[]>>Interval.intervals).splice(Interval.intervals.findIndex(v => v.handle === this.handle), 1);

        clearObject(this, true);
    }

    public static clearAll(): void {
        for (const i of (<Mutable<Interval[]>>Interval.intervals).splice(0)) {
            i.clear();
        }
    }
}