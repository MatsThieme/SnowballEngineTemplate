import { Destroyable } from "GameObject/Destroy";
import { GameTime } from "SnowballEngine/GameTime";

/** @category Utility */
export class Stopwatch implements Destroyable {
    public static stopwatches: Stopwatch[] = [];
    private static _nextID: number = 0;

    public milliseconds: number;
    private _running: boolean;
    private _id: number;

    /**
     *
     * A Stopwatch utility using GameTime.deltaTime
     *
     */
    public constructor(start = true) {
        this.milliseconds = 0;
        this._running = false;
        this._id = Stopwatch._nextID++;

        if (start) this.start();

        Stopwatch.stopwatches.push(this);
    }

    public get seconds(): number {
        return this.milliseconds / 1000;
    }
    public set seconds(val: number) {
        this.milliseconds = val * 1000;
    }

    public get running(): boolean {
        return this._running;
    }

    public start(): void {
        this._running = true;
    }

    public stop(): void {
        this._running = false;
    }

    public reset(): void {
        this.milliseconds = 0;
    }

    public update(): void {
        if (this._running) this.milliseconds += GameTime.deltaTime;
    }

    public static update(): void {
        for (const sw of Stopwatch.stopwatches) {
            sw.update();
        }
    }

    public destroy(): void {
        Stopwatch.stopwatches.splice(
            Stopwatch.stopwatches.findIndex((sw) => sw._id === this._id),
            1
        );
    }

    public static reset(): void {
        Stopwatch.stopwatches = [];
    }
}
