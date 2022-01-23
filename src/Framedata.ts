import { Timeout } from "Utility/Timeout/Timeout";

/** @category Scene */
export class Framedata {
    public updateInterval: number;

    private _lastTime: number;
    private _avgFramesPerSecond: number;
    private _frames: number;
    private _totalFrames: number;

    public constructor(update = 1000) {
        this.updateInterval = update;

        this._lastTime = performance.now();
        this._avgFramesPerSecond = 0;
        this._frames = 0;
        this._totalFrames = 0;
    }

    /**
     * Calculates fps.
     */
    public update(time = performance.now()): void {
        this._frames++;
        this._totalFrames++;

        const now = time;
        const delta = now - this._lastTime;

        if (delta >= this.updateInterval) {
            const tF = this._frames / (delta / this.updateInterval);
            this._avgFramesPerSecond = Math.round(tF / (delta / 1000));
            this._frames -= tF;
            this._lastTime = now;
        }
    }

    /**
     * Returns the average frames per second
     */
    public get fps(): number {
        return this._avgFramesPerSecond;
    }

    /**
     * measure fps for milliseconds
     */
    public async measureFps(milliseconds: number): Promise<number> {
        const frames = this._totalFrames;

        await new Timeout(milliseconds);

        return ((this._totalFrames - frames) / milliseconds) * 1000;
    }
}
