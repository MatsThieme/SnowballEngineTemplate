/** @category Utility */
export class Stopwatch {
    /**
     * performance.now() when started
     */
    private _start: number;

    /**
     * time progress at pause
     */
    private _pause?: number;

    /**
     * A Stopwatch utility using performance.now().
     * The accuracy is dependent on the executing browser.
     * Firefox currently has a reduced precision of 1ms (https://developer.mozilla.org/en-US/docs/Web/API/Performance/now).
     *
     * @param {boolean} [run=true] Start the stopwatch on instantiation
     */
    public constructor(run: boolean = true) {
        this._start = 0;

        if (run) {
            this.start();
        }
    }

    public getMilliseconds(): number {
        if (this._pause) {
            return this._pause;
        }

        if (this._start === 0) {
            return 0;
        }

        return performance.now() - this._start;
    }

    public start(): void {
        if (this._pause) {
            this._start = performance.now() - this._pause;
            this._pause = undefined;
            return;
        }

        if (this._start === 0) {
            this._start = performance.now();
        }
    }

    public stop(): void {
        this._pause = this.getMilliseconds();
        this._start = 0;
    }
}
