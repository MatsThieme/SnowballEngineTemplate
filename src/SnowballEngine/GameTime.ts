import { average, clamp } from "Utility/Helpers";

/** @category Scene */
export class GameTime {
    /**
     *
     * Returns duration of the last frame in milliseconds.
     *
     */
    public static readonly deltaTime: number = 5;

    /**
     *
     * Returns duration of the previous deltaTime in milliseconds.
     *
     */
    public static readonly lastDeltaTime: number = 5;

    /**
     *
     * Returns duration of the last frame in seconds.
     *
     */
    public static readonly deltaTimeSeconds: number = 0.005;

    /**
     *
     * Returns duration of the previous deltaTime in seconds.
     *
     */
    public static readonly lastDeltaTimeSeconds: number = 0.005;

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
    public static maxDeltaTime = 50;

    /**
     *
     * The clamped(or not) deltas added since the start of the game.
     *
     */
    public static readonly gameTimeSinceStart: number = 0;

    /**
     *
     * High resolution timestamp from the beginning of the current frame.
     *
     */
    public static readonly frameStart: number = 0;

    private static readonly _deltas: number[] = [];
    private static _clampDeltatime = 10;

    private static readonly _startTime: number = performance.now();

    /**
     *
     * This is the time in milliseconds since the start of the game.
     *
     */
    public static get timeSinceStart(): number {
        return performance.now() - GameTime._startTime;
    }

    /**
     *
     * Calculates and clamps the delta time since last call.
     * @internal
     *
     */
    public static update(time: number): void {
        // calculate delta time
        const delta = time - GameTime.frameStart;

        (<Mutable<typeof GameTime>>GameTime).lastDeltaTime = GameTime.deltaTime;
        (<Mutable<typeof GameTime>>GameTime).lastDeltaTimeSeconds = GameTime.deltaTimeSeconds;

        (<Mutable<typeof GameTime>>GameTime).deltaTime = GameTime.clampDeltatime
            ? Math.min(delta, GameTime._clampDeltatime)
            : delta;
        (<Mutable<typeof GameTime>>GameTime).deltaTimeSeconds = GameTime.deltaTime / 1000;

        (<Mutable<typeof GameTime>>GameTime).gameTimeSinceStart += GameTime.deltaTime;

        // clamp delta time
        GameTime._deltas.unshift(delta);
        const avgDelta = average(...GameTime._deltas);
        GameTime._clampDeltatime = clamp(0, GameTime.maxDeltaTime, avgDelta * 1.1);
        GameTime._deltas.splice(~~(500 / avgDelta));

        (<Mutable<typeof GameTime>>GameTime).frameStart = time;
    }
}
