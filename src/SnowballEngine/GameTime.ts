import { average } from './Helpers.js';

export class GameTime {
    private _lastTime: number;
    private _deltaTime: number;
    private readonly t: number[];
    private _clampDeltatime: number;

    /**
     * 
     * Clamp the delta time at peak values.
     * 
     */
    public clampDeltatime: boolean;
    public readonly start: number;
    public constructor() {
        this._lastTime = this.now;
        this._deltaTime = 0;
        this.start = this.now;
        this._clampDeltatime = 10;
        this.clampDeltatime = true;
        this.t = [];
    }

    /**
     *
     * Returns duration of the last frame in milliseconds.
     * 
     */
    public get deltaTime(): number {
        return this._deltaTime;
    }

    /**
     * 
     * Calculates and clamps the delta time.
     * 
     */
    public update(): void {
        if (this._lastTime) {
            this._deltaTime = this.clampDeltatime ? Math.min(this.now - this._lastTime, this._clampDeltatime) : this.now - this._lastTime;
            this.t.unshift(this.now - this._lastTime);
        }
        this._lastTime = this.now;
        if (this.t.length >= 500) this.t.splice(500);
        this._clampDeltatime = average(...this.t) * 1.25;
    }

    /**
     *
     * Returns the current time in milliseconds since January 1, 1970 00:00:00 UTC.
     * 
     */
    public get now(): number {
        return performance.now();
    }

    /*
     *
     * Returns the elapsed time in milliseconds since initialisation.
     * 
     */
    public get sinceStart(): number {
        return this.now - this.start;
    }

    public measureGameTime(): () => number {
        let start = this.now;
        return () => this.now - start;
    }
}