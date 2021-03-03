export class Stopwatch {
    private _start: number;

    public constructor() {
        this._start = performance.now();
    }

    public get milliseconds(): number {
        return performance.now() - this._start;
    }

    public get seconds(): number {
        return this.milliseconds / 1000;
    }
}