import { average, clamp } from './Utilities/Helpers';
import { Stopwatch } from './Utilities/Stopwatch';

/** @category Scene */
export class GameTime {
    private static _lastTime = 0;

    private static _deltaTime = 5;
    private static _deltaTimeSeconds = 0.005;

    private static readonly _t: number[] = [];
    private static _clampDeltatime = 10;

    private static readonly _startTime: number = performance.now();

    private static _time = 0;

    private static _sw = new Stopwatch();


    /**
     * 
     * Clamp the delta time at peak values.
     * 
     */
    public static clampDeltatime = true;

    /**
     * 
     * Highest clamped delta time
     * 
     */
    public static maxDeltaTime = 1000;

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

    public static readonly highresTimestamp: number = 0;

    /**
     * @internal
     * 
     * Calculates and clamps the delta time since last call.
     * 
     */
    public static update(time: number): void {
        const t = time - GameTime._startTime;
        const d = t - GameTime._lastTime;
        GameTime._deltaTime = GameTime.clampDeltatime ? Math.min(d, GameTime._clampDeltatime) : d;
        GameTime._deltaTimeSeconds = GameTime._deltaTime / 1000;
        GameTime._t.unshift(d);

        GameTime._time += GameTime.deltaTime;
        GameTime._sw = new Stopwatch();


        const avgDelta = average(...GameTime._t);

        GameTime._clampDeltatime = clamp(0, GameTime.maxDeltaTime, avgDelta * 1.1);

        GameTime._t.splice(~~(500 / avgDelta));

        GameTime._lastTime = t;

        (<any>GameTime).highresTimestamp = time;
    }
}