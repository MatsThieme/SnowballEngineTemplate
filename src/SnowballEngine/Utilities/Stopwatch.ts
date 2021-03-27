import { GameTime } from "../GameTime";

/** @category Utility */
export class Stopwatch {
    private _start?: number;
    private _stop?: number;

    public constructor(start = true) {
        if (start) this.start();
    }

    private get now(): number {
        if ((<any>window).chrome) return performance.now();

        return Math.max(performance.now(), GameTime.highresTimestamp);
    }

    public get milliseconds(): number {
        if (!this._start) return 0;

        if (this._stop) return this._stop - this._start;

        return this.now - this._start;
    }
    public set milliseconds(val: number) {
        if (this._stop !== undefined) {
            this._stop = this.now;
            this._start = this._stop - val;
        } else this._start = this.now - val;
    }

    public get seconds(): number {
        return this.milliseconds / 1000;
    }
    public set seconds(val: number) {
        this.milliseconds = val * 1000;
    }

    public get running(): boolean {
        return <boolean>(!this._stop && this._start);
    }

    public start(): void {
        if (this._stop !== undefined) this._start = this.now - (this._stop - (this._start || 0));
        else this._start = this.now;

        this._stop = undefined;
    }

    public stop(): void {
        this._stop = this.now;
    }

    public reset(): void {
        this.milliseconds = 0;
    }
}