import { average, clamp } from './Utilities/Helpers';
import { Stopwatch } from './Utilities/Stopwatch';

export class GameTime {
    private static _lastTime: number = 0;

    private static _deltaTime: number = 5;
    private static _deltaTimeSeconds: number = 0.005;

    private static readonly t: number[] = [];
    private static _clampDeltatime: number = 10;

    private static readonly _startTime: number = performance.now();

    private static _time: number = 0;

    private static _sw = new Stopwatch();


    /**
     * 
     * Clamp the delta time at peak values.
     * 
     */
    public static clampDeltatime: boolean = true;

    /**
     * 
     * Highest clamped delta time
     * 
     */
    public static maxDeltaTime: number = 1000;

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
     * Returns duration of the last frame in seconds.
     * 
     */
    public static get deltaTimeSeconds(): number {
        return GameTime._deltaTimeSeconds;
    }


    /**
    *
    * The time at the beginning of this frame. This is the time in milliseconds since the start of the game.
    *
    */
    public static get time(): number {
        return GameTime._time;
    }

    public static get now(): number {
        return GameTime._time + GameTime._sw.milliseconds;
    }

    /**
     * 
     * returns the app time in milliseconds after the last update.
     * 
     */
    public static get lastUpdate(): number {
        return GameTime._lastTime;
    }

    /**
     * @internal
     * 
     * Calculates and clamps the delta time since last call.
     * 
     */
    public static update(): void {
        const t = performance.now() - GameTime._startTime;
        const d = t - GameTime._lastTime;
        GameTime._deltaTime = GameTime.clampDeltatime ? Math.min(d, GameTime._clampDeltatime) : d;
        GameTime._deltaTimeSeconds = GameTime._deltaTime / 1000;
        GameTime.t.unshift(d);

        GameTime._time += GameTime.deltaTime;
        GameTime._sw = new Stopwatch();


        const avgDelta = average(...GameTime.t);

        GameTime._clampDeltatime = clamp(0, GameTime.maxDeltaTime, avgDelta * 1.1);

        GameTime.t.splice(~~(500 / avgDelta));

        GameTime._lastTime = t;
    }
}