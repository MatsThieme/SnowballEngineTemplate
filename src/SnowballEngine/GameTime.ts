import { average } from './Helpers';

export class GameTime {
    private static _lastTime: number = performance.now();
    private static _deltaTime: number = 5;
    private static readonly t: number[] = [];
    private static _clampDeltatime: number = 10;

    /**
     * 
     * Clamp the delta time at peak values.
     * 
     */
    public static clampDeltatime: boolean = true;

    /**
     *
     * Returns duration of the last frame in milliseconds.
     * 
     */
    public static get deltaTime(): number {
        return GameTime._deltaTime;
    }

    /**
     * 
     * @internal
     * 
     * Calculates and clamps the delta time since last call.
     * 
     */
    public static update(): void {
        const d = GameTime.now - GameTime._lastTime;
        GameTime._deltaTime = GameTime.clampDeltatime ? Math.min(d, GameTime._clampDeltatime) : d;
        GameTime.t.unshift(d);

        const avgDelta = average(...GameTime.t);

        GameTime._clampDeltatime = avgDelta * 1.25;

        GameTime.t.splice(~~(1000 / avgDelta));

        GameTime._lastTime = GameTime.now;
    }

    /**
     *
     * Returns the current time in milliseconds since January 1, 1970 00:00:00 UTC.
     * 
     */
    public static get now(): number {
        return performance.now();
    }
}